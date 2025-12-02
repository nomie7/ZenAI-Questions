import { v4 as uuidv4 } from "uuid";
import type { ProcessedChunk } from "../document-processor";
import type { Chunker, ChunkingConfig } from "./types";

/**
 * Page-based chunker for PPT and image files
 * 
 * Creates one chunk per page/slide, preserving the entire content
 * as a coherent unit. This is ideal for presentations where each
 * slide is a self-contained piece of information.
 */
export class PageChunker implements Chunker {
    async chunk(
        text: string,
        pageNumber: number,
        config: ChunkingConfig
    ): Promise<ProcessedChunk[]> {
        if (config.verbose) {
            console.log(`[PageChunker] Chunking page ${pageNumber} (${text.length} chars)`);
        }

        // For page-based chunking, the entire page is one chunk
        const chunk: ProcessedChunk = {
            chunkId: uuidv4(),
            text: text.trim(),
            pageNumber,
            chunkIndex: 0,
            startChar: 0,
            endChar: text.length,
        };

        return [chunk];
    }
}

/**
 * Create a page-based chunker instance
 */
export function createPageChunker(): PageChunker {
    return new PageChunker();
}
