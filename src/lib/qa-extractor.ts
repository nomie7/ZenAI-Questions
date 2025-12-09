import { ChatOpenAI } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";
import type { ProcessedChunk } from "./document-processor";
import type { DocumentMetadata } from "./ingest";

/**
 * Extracted Question-Answer pair from pitch content
 */
export interface ExtractedQA {
  id: string;
  questionText: string;
  answerText: string;
  sourceDocId: string;
  sourceDocName: string;
  sourcePageNumber: number;
  sourceChunkId: string;
  confidence: number;
  metadata: {
    client?: string;
    vertical?: string;
    region?: string;
    theme?: string;
    year?: number;
  };
  extractedAt: Date;
}

/**
 * Chunk with page context for extraction
 */
interface ChunkWithContext {
  chunk: ProcessedChunk;
  docId: string;
  docName: string;
  pageNumber: number;
}

// LLM for Q&A extraction - using gpt-4.1-mini for cost efficiency
const extractorLLM = new ChatOpenAI({
  modelName: "gpt-4.1-mini",
  temperature: 0,
});

/**
 * Progress callback for Q&A extraction
 */
export type ExtractionProgressCallback = (progress: {
  currentBatch: number;
  totalBatches: number;
  chunksProcessed: number;
  totalChunks: number;
  qaPairsFound: number;
}) => void;

/**
 * Extract question-answer pairs from a batch of chunks
 * Processes in batches of 10 chunks for better performance and feedback
 */
export async function extractQAPairsFromChunks(
  chunks: ChunkWithContext[],
  docMetadata: DocumentMetadata = {},
  onProgress?: ExtractionProgressCallback
): Promise<ExtractedQA[]> {
  const allExtracted: ExtractedQA[] = [];

  // Process chunks in batches of 10 for better progress feedback
  const BATCH_SIZE = 10;
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

  console.log(`[QA-Extractor] Starting extraction: ${chunks.length} chunks in ${totalBatches} batches`);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + BATCH_SIZE);

    console.log(`[QA-Extractor] Processing batch ${batchNum}/${totalBatches} (chunks ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)})`);

    const batchResults = await extractFromBatch(batch, docMetadata);
    allExtracted.push(...batchResults);

    // Report progress
    if (onProgress) {
      onProgress({
        currentBatch: batchNum,
        totalBatches,
        chunksProcessed: Math.min(i + BATCH_SIZE, chunks.length),
        totalChunks: chunks.length,
        qaPairsFound: allExtracted.length,
      });
    }

    console.log(`[QA-Extractor] Batch ${batchNum} complete: found ${batchResults.length} Q&A pairs (total: ${allExtracted.length})`);
  }

  console.log(`[QA-Extractor] Extraction complete: ${allExtracted.length} Q&A pairs from ${chunks.length} chunks`);
  return allExtracted;
}

/**
 * Extract Q&A pairs from a batch of chunks
 */
async function extractFromBatch(
  chunks: ChunkWithContext[],
  docMetadata: DocumentMetadata
): Promise<ExtractedQA[]> {
  // Format chunks for the LLM
  const chunksText = chunks
    .map((c, i) => `[Chunk ${i + 1}] (Page ${c.pageNumber})\n${c.chunk.text}`)
    .join("\n\n---\n\n");

  const prompt = `You are a specialized Q&A extractor for pitch documents and RFP responses.

Analyze the following document chunks and extract question-answer pairs. Look for:
1. Explicit RFP questions and their responses
2. Client questions (e.g., "How does your solution handle X?")
3. Challenge statements with proposed solutions
4. FAQ-style content
5. Capability questions and answers
6. Problem statements with solutions

For each Q&A pair found, provide:
- The question (explicit or implied)
- The complete answer
- A confidence score (0.0-1.0) based on how clear the Q&A pairing is
- The chunk number where it was found

Document Content:
${chunksText}

Respond in JSON format:
{
  "qa_pairs": [
    {
      "question": "The question being asked or implied",
      "answer": "The complete answer or response",
      "confidence": 0.85,
      "chunk_index": 1
    }
  ]
}

Rules:
- Only extract clear Q&A pairs, don't invent questions
- Include the full answer, not just a summary
- Set confidence based on how explicit the Q&A pairing is
- If no Q&A pairs are found, return {"qa_pairs": []}
- Confidence should be 0.9+ for explicit questions, 0.7-0.9 for implied questions

Only output valid JSON, no markdown or explanation.`;

  try {
    const response = await extractorLLM.invoke(prompt);
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    // Parse JSON from response (handle potential markdown code blocks)
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(jsonStr);

    const extractedPairs: ExtractedQA[] = [];

    for (const qa of result.qa_pairs || []) {
      // Get the source chunk
      const chunkIndex = Math.max(0, Math.min(qa.chunk_index - 1, chunks.length - 1));
      const sourceChunk = chunks[chunkIndex];

      if (!sourceChunk) continue;

      extractedPairs.push({
        id: uuidv4(),
        questionText: qa.question,
        answerText: qa.answer,
        sourceDocId: sourceChunk.docId,
        sourceDocName: sourceChunk.docName,
        sourcePageNumber: sourceChunk.pageNumber,
        sourceChunkId: sourceChunk.chunk.chunkId,
        confidence: Math.min(1, Math.max(0, qa.confidence || 0.5)),
        metadata: {
          client: docMetadata.client,
          vertical: docMetadata.vertical,
          region: docMetadata.region as string | undefined,
          theme: docMetadata.theme,
          year: docMetadata.year,
        },
        extractedAt: new Date(),
      });
    }

    return extractedPairs;
  } catch (error) {
    console.warn("[QA-Extractor] Failed to extract from batch:", error);
    return [];
  }
}

/**
 * Extract Q&A pairs from processed document pages
 * This is the main entry point called during ingestion
 */
export async function extractQAPairsFromDocument(
  pages: Array<{
    pageNumber: number;
    chunks: ProcessedChunk[];
  }>,
  docId: string,
  docName: string,
  metadata: DocumentMetadata = {},
  onProgress?: ExtractionProgressCallback
): Promise<ExtractedQA[]> {
  // Flatten all chunks with their context
  const chunksWithContext: ChunkWithContext[] = [];

  for (const page of pages) {
    for (const chunk of page.chunks) {
      chunksWithContext.push({
        chunk,
        docId,
        docName,
        pageNumber: page.pageNumber,
      });
    }
  }

  if (chunksWithContext.length === 0) {
    return [];
  }

  console.log(`[QA-Extractor] Processing ${chunksWithContext.length} chunks from ${docName}`);
  return extractQAPairsFromChunks(chunksWithContext, metadata, onProgress);
}

/**
 * Filter Q&A pairs by confidence threshold
 */
export function filterByConfidence(
  qaPairs: ExtractedQA[],
  threshold: number = 0.6
): ExtractedQA[] {
  return qaPairs.filter((qa) => qa.confidence >= threshold);
}

/**
 * Group Q&A pairs by source document
 */
export function groupByDocument(
  qaPairs: ExtractedQA[]
): Map<string, ExtractedQA[]> {
  const grouped = new Map<string, ExtractedQA[]>();

  for (const qa of qaPairs) {
    const existing = grouped.get(qa.sourceDocId) || [];
    existing.push(qa);
    grouped.set(qa.sourceDocId, existing);
  }

  return grouped;
}
