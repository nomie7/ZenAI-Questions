/**
 * Chunking strategies for document processing
 * 
 * This module provides different chunking strategies:
 * - Page-based: Entire page/slide as one chunk (for PPT, images)
 * - Agentic: Semantic chunking using embeddings and LLM (for PDF, docs)
 * - Fixed-size: Legacy approach with fixed character counts
 */

export * from "./types";
export * from "./page-chunker";
export * from "./agentic-chunker";
export { chunkText as fixedSizeChunker } from "../document-processor";
