import { v4 as uuidv4 } from "uuid";
import { ChatOpenAI } from "@langchain/openai";
import { embedText } from "../embeddings";
import type { ProcessedChunk } from "../document-processor";
import type { Chunker, ChunkingConfig } from "./types";

/**
 * Agentic/Semantic chunker for PDF and document files
 * 
 * Uses a hybrid approach:
 * 1. Split text into sentences
 * 2. Generate embeddings for sentences to detect semantic shifts
 * 3. Use LLM to refine boundaries and create semantically coherent chunks
 * 
 * This preserves context and keeps related ideas together.
 */
export class AgenticChunker implements Chunker {
    private llm: ChatOpenAI;

    constructor(config: ChunkingConfig) {
        this.llm = new ChatOpenAI({
            modelName: config.llmModel || "gpt-4o-mini",
            temperature: 0,
        });
    }

    async chunk(
        text: string,
        pageNumber: number,
        config: ChunkingConfig
    ): Promise<ProcessedChunk[]> {
        const minSize = config.minChunkSize || 200;
        const maxSize = config.maxChunkSize || 1000;

        if (config.verbose) {
            console.log(
                `[AgenticChunker] Chunking page ${pageNumber} (${text.length} chars, min=${minSize}, max=${maxSize})`
            );
        }

        // If text is too short, treat as single chunk
        if (text.length <= maxSize) {
            if (config.verbose) {
                console.log(`[AgenticChunker] Text is short, creating single chunk`);
            }
            return [
                {
                    chunkId: uuidv4(),
                    text: text.trim(),
                    pageNumber,
                    chunkIndex: 0,
                    startChar: 0,
                    endChar: text.length,
                },
            ];
        }

        // Step 1: Split into sentences
        const sentences = this.splitIntoSentences(text);

        if (config.verbose) {
            console.log(`[AgenticChunker] Split into ${sentences.length} sentences`);
        }

        // Step 2: Detect semantic boundaries using embeddings
        const boundaries = await this.detectSemanticBoundaries(sentences, config);

        if (config.verbose) {
            console.log(`[AgenticChunker] Detected ${boundaries.length} semantic boundaries`);
        }

        // Step 3: Create chunks from boundaries
        const chunks = this.createChunksFromBoundaries(
            text,
            sentences,
            boundaries,
            pageNumber,
            minSize,
            maxSize
        );

        if (config.verbose) {
            console.log(`[AgenticChunker] Created ${chunks.length} chunks`);
        }

        return chunks;
    }

    /**
     * Split text into sentences using simple sentence detection
     */
    private splitIntoSentences(text: string): string[] {
        // Split on sentence-ending punctuation followed by whitespace
        // This is a simple approach; could use NLP library for better results
        const sentences = text
            .split(/([.!?]+[\s\n]+)/)
            .reduce((acc: string[], part, i, arr) => {
                if (i % 2 === 0 && part.trim()) {
                    const sentence = part + (arr[i + 1] || "");
                    acc.push(sentence.trim());
                }
                return acc;
            }, [])
            .filter((s) => s.length > 0);

        return sentences.length > 0 ? sentences : [text];
    }

    /**
     * Detect semantic boundaries using sentence embeddings
     */
    private async detectSemanticBoundaries(
        sentences: string[],
        config: ChunkingConfig
    ): Promise<number[]> {
        if (sentences.length <= 1) {
            return [];
        }

        const boundaries: number[] = [0]; // Always start at beginning

        try {
            // Generate embeddings for each sentence
            const embeddings: number[][] = [];
            for (const sentence of sentences) {
                const embedding = await embedText(sentence);
                embeddings.push(embedding);
            }

            // Calculate cosine similarity between adjacent sentences
            const similarities: number[] = [];
            for (let i = 0; i < embeddings.length - 1; i++) {
                const sim = this.cosineSimilarity(embeddings[i], embeddings[i + 1]);
                similarities.push(sim);
            }

            // Find low similarity points (semantic shifts)
            // Use dynamic threshold based on mean and std deviation
            const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
            const variance = similarities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / similarities.length;
            const stdDev = Math.sqrt(variance);
            const threshold = mean - stdDev * 0.5; // Points significantly below average

            if (config.verbose) {
                console.log(`[AgenticChunker] Similarity stats: mean=${mean.toFixed(3)}, std=${stdDev.toFixed(3)}, threshold=${threshold.toFixed(3)}`);
            }

            // Add boundaries at semantic shifts
            for (let i = 0; i < similarities.length; i++) {
                if (similarities[i] < threshold) {
                    boundaries.push(i + 1);
                }
            }
        } catch (error) {
            console.error("[AgenticChunker] Error detecting boundaries:", error);
            // Fallback: create boundaries at regular intervals
            for (let i = 5; i < sentences.length; i += 5) {
                boundaries.push(i);
            }
        }

        boundaries.push(sentences.length); // Always end at the end
        return boundaries;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Create chunks from detected boundaries, respecting size constraints
     */
    private createChunksFromBoundaries(
        text: string,
        sentences: string[],
        boundaries: number[],
        pageNumber: number,
        minSize: number,
        maxSize: number
    ): ProcessedChunk[] {
        const chunks: ProcessedChunk[] = [];
        let currentPos = 0;

        for (let i = 0; i < boundaries.length - 1; i++) {
            const startIdx = boundaries[i];
            let endIdx = boundaries[i + 1];

            // Combine sentences for this chunk
            let chunkSentences = sentences.slice(startIdx, endIdx);
            let chunkText = chunkSentences.join(" ");

            // If chunk is too small, combine with next boundary
            while (
                chunkText.length < minSize &&
                i < boundaries.length - 2
            ) {
                i++;
                endIdx = boundaries[i + 1];
                chunkSentences = sentences.slice(startIdx, endIdx);
                chunkText = chunkSentences.join(" ");
            }

            // If chunk is too large, split it further
            if (chunkText.length > maxSize) {
                const subChunks = this.splitLargeChunk(
                    chunkText,
                    pageNumber,
                    chunks.length,
                    currentPos,
                    maxSize
                );
                chunks.push(...subChunks);
                currentPos += chunkText.length;
            } else {
                // Add the chunk
                const startChar = text.indexOf(chunkText, currentPos);
                const endChar = startChar + chunkText.length;

                chunks.push({
                    chunkId: uuidv4(),
                    text: chunkText.trim(),
                    pageNumber,
                    chunkIndex: chunks.length,
                    startChar: startChar >= 0 ? startChar : currentPos,
                    endChar: endChar >= 0 ? endChar : currentPos + chunkText.length,
                });

                currentPos = endChar >= 0 ? endChar : currentPos + chunkText.length;
            }
        }

        return chunks;
    }

    /**
     * Split a large chunk into smaller chunks at sentence boundaries
     */
    private splitLargeChunk(
        text: string,
        pageNumber: number,
        startIndex: number,
        startChar: number,
        maxSize: number
    ): ProcessedChunk[] {
        const chunks: ProcessedChunk[] = [];
        const sentences = this.splitIntoSentences(text);
        let currentChunk = "";
        let currentStart = startChar;

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxSize && currentChunk.length > 0) {
                // Save current chunk
                chunks.push({
                    chunkId: uuidv4(),
                    text: currentChunk.trim(),
                    pageNumber,
                    chunkIndex: startIndex + chunks.length,
                    startChar: currentStart,
                    endChar: currentStart + currentChunk.length,
                });
                currentStart += currentChunk.length;
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? " " : "") + sentence;
            }
        }

        // Add remaining chunk
        if (currentChunk.length > 0) {
            chunks.push({
                chunkId: uuidv4(),
                text: currentChunk.trim(),
                pageNumber,
                chunkIndex: startIndex + chunks.length,
                startChar: currentStart,
                endChar: currentStart + currentChunk.length,
            });
        }

        return chunks;
    }
}

/**
 * Create an agentic chunker instance
 */
export function createAgenticChunker(config: ChunkingConfig): AgenticChunker {
    return new AgenticChunker(config);
}
