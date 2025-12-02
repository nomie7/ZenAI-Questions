import type { ProcessedChunk } from "../document-processor";

/**
 * Available chunking strategies
 */
export enum ChunkingStrategy {
    /** Page-based chunking - entire page/slide as one chunk */
    PAGE_BASED = "page_based",
    /** Agentic/semantic chunking - LLM-guided intelligent boundaries */
    AGENTIC = "agentic",
    /** Fixed-size chunking with overlap (legacy) */
    FIXED_SIZE = "fixed_size",
}

/**
 * Configuration for chunking strategies
 */
export interface ChunkingConfig {
    strategy: ChunkingStrategy;

    // For fixed-size chunking
    chunkSize?: number;
    overlap?: number;

    // For agentic chunking
    minChunkSize?: number;
    maxChunkSize?: number;
    llmModel?: string;
    embedModel?: string;

    // For all strategies
    verbose?: boolean;
}

/**
 * Default chunking configurations
 */
export const DEFAULT_CHUNKING_CONFIG: Record<ChunkingStrategy, ChunkingConfig> = {
    [ChunkingStrategy.PAGE_BASED]: {
        strategy: ChunkingStrategy.PAGE_BASED,
        verbose: false,
    },
    [ChunkingStrategy.AGENTIC]: {
        strategy: ChunkingStrategy.AGENTIC,
        minChunkSize: 200,
        maxChunkSize: 1000,
        llmModel: "gpt-4o-mini",
        embedModel: "text-embedding-3-small",
        verbose: false,
    },
    [ChunkingStrategy.FIXED_SIZE]: {
        strategy: ChunkingStrategy.FIXED_SIZE,
        chunkSize: 500,
        overlap: 50,
        verbose: false,
    },
};

/**
 * Determine the appropriate chunking strategy based on file type and parser
 */
export function getChunkingStrategy(
    filename: string,
    parserType: string
): ChunkingStrategy {
    const ext = filename.toLowerCase().split(".").pop() || "";

    // PPT files should use page-based chunking (each slide is one chunk)
    if (ext === "ppt" || ext === "pptx") {
        return ChunkingStrategy.PAGE_BASED;
    }

    // PDF and other document types use agentic chunking
    if (ext === "pdf" || ext === "doc" || ext === "docx") {
        return ChunkingStrategy.AGENTIC;
    }

    // Images and other formats can use page-based (typically single page)
    if (["png", "jpg", "jpeg", "tiff", "bmp", "heic"].includes(ext)) {
        return ChunkingStrategy.PAGE_BASED;
    }

    // Default to agentic for text-based documents
    return ChunkingStrategy.AGENTIC;
}

/**
 * Base interface for all chunkers
 */
export interface Chunker {
    chunk(text: string, pageNumber: number, config: ChunkingConfig): Promise<ProcessedChunk[]>;
}
