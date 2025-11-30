import { v4 as uuidv4 } from "uuid";
import { getParser, type ParserType, type ParsedDocument } from "./parsers";
import { uploadDocument, uploadPageImage, getSignedUrl } from "./storage";

export interface ProcessedChunk {
  chunkId: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
  startChar: number;
  endChar: number;
}

export interface ProcessedPage {
  pageNumber: number;
  text: string;
  imageUrl: string; // MinIO object path
  chunks: ProcessedChunk[];
}

export interface ProcessedDocument {
  docId: string;
  docName: string;
  originalPath: string;
  pages: ProcessedPage[];
  parserUsed: ParserType;
  totalChunks: number;
  processedAt: Date;
}

// Chunking configuration
const CHUNK_SIZE = 500; // characters
const CHUNK_OVERLAP = 50; // characters

/**
 * Process a document file through the full pipeline:
 * 1. Parse the document (extract text and images)
 * 2. Upload original file to MinIO
 * 3. Upload page images to MinIO
 * 4. Chunk the text with overlap
 */
export async function processDocument(
  file: Buffer,
  filename: string,
  docName: string,
  parserType: ParserType = "unstructured",
  existingDocId?: string
): Promise<ProcessedDocument> {
  // Generate or use existing doc ID
  const docId = existingDocId || uuidv4();

  console.log(
    `Processing document: ${docName} (${filename}) with ${parserType} parser`
  );

  // 1. Parse the document
  const parser = await getParser(parserType);
  const parsed: ParsedDocument = await parser.parse(file, filename);

  console.log(`Parsed ${parsed.metadata.pageCount} pages`);

  // 2. Upload original file
  const originalPath = await uploadDocument(docId, file, filename);

  // 3. Process each page
  const pages: ProcessedPage[] = [];
  let totalChunks = 0;

  for (const page of parsed.pages) {
    // Upload page image if available
    let imageUrl = "";
    if (page.imageBuffer) {
      imageUrl = await uploadPageImage(docId, page.pageNumber, page.imageBuffer);
    }

    // Chunk the page text
    const chunks = chunkText(page.text, page.pageNumber);
    totalChunks += chunks.length;

    pages.push({
      pageNumber: page.pageNumber,
      text: page.text,
      imageUrl,
      chunks,
    });
  }

  console.log(`Created ${totalChunks} chunks across ${pages.length} pages`);

  return {
    docId,
    docName,
    originalPath,
    pages,
    parserUsed: parserType,
    totalChunks,
    processedAt: new Date(),
  };
}

/**
 * Chunk text with overlap for better context preservation
 */
export function chunkText(
  text: string,
  pageNumber: number,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): ProcessedChunk[] {
  const chunks: ProcessedChunk[] = [];

  // Skip if text is too short
  if (text.length <= chunkSize) {
    chunks.push({
      chunkId: uuidv4(),
      text: text.trim(),
      pageNumber,
      chunkIndex: 0,
      startChar: 0,
      endChar: text.length,
    });
    return chunks;
  }

  // Create chunks with overlap
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    // Try to end at a sentence or word boundary
    if (endIndex < text.length) {
      // Look for sentence ending within the last 50 characters
      const searchStart = Math.max(endIndex - 50, startIndex);
      const searchText = text.slice(searchStart, endIndex);
      const sentenceEnd = searchText.search(/[.!?]\s/);

      if (sentenceEnd !== -1) {
        endIndex = searchStart + sentenceEnd + 1;
      } else {
        // Fall back to word boundary
        const wordEnd = searchText.lastIndexOf(" ");
        if (wordEnd !== -1) {
          endIndex = searchStart + wordEnd;
        }
      }
    } else {
      endIndex = text.length;
    }

    const chunkText = text.slice(startIndex, endIndex).trim();

    if (chunkText.length > 0) {
      chunks.push({
        chunkId: uuidv4(),
        text: chunkText,
        pageNumber,
        chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
      });
      chunkIndex++;
    }

    // Move to next chunk with overlap
    // Ensure we advance by at least (chunkSize - overlap) to avoid creating too many chunks
    const minAdvance = Math.max(chunkSize - overlap, 1);
    startIndex = Math.max(endIndex - overlap, startIndex + minAdvance);

    // Prevent infinite loop
    if (startIndex >= text.length) break;
  }

  return chunks;
}

/**
 * Get a signed URL for a page image
 */
export async function getPageImageUrl(
  imageUrl: string,
  expirySeconds: number = 3600
): Promise<string> {
  if (!imageUrl) return "";
  return getSignedUrl(imageUrl, expirySeconds);
}

/**
 * Calculate document statistics
 */
export function getDocumentStats(doc: ProcessedDocument): {
  pageCount: number;
  chunkCount: number;
  avgChunkSize: number;
  totalCharacters: number;
} {
  const totalCharacters = doc.pages.reduce((sum, p) => sum + p.text.length, 0);
  const avgChunkSize =
    doc.totalChunks > 0
      ? Math.round(
          doc.pages.reduce(
            (sum, p) =>
              sum + p.chunks.reduce((cs, c) => cs + c.text.length, 0),
            0
          ) / doc.totalChunks
        )
      : 0;

  return {
    pageCount: doc.pages.length,
    chunkCount: doc.totalChunks,
    avgChunkSize,
    totalCharacters,
  };
}
