import { v4 as uuidv4 } from "uuid";
import {
  processDocument,
  type ProcessedDocument,
} from "./document-processor";
import { embedTexts } from "./embeddings";
import {
  ensureCollection,
  upsertVectors,
  deleteVectorsByFilter,
  getClient,
  getCollectionName,
} from "./qdrant";
import { ensureBucket, deleteDocumentFiles } from "./storage";
import type { ParserType } from "./parsers";

export interface IngestOptions {
  parserType?: ParserType;
  replaceDocId?: string; // If set, will replace existing document
  metadata?: {
    docType?: string;
    topic?: string;
    category?: string;
    status?: "ready" | "processing" | "archived";
  };
}

export interface IngestResult {
  docId: string;
  docName: string;
  pageCount: number;
  chunkCount: number;
  status: "ready" | "failed";
  error?: string;
  parserUsed: ParserType;
  processedAt: Date;
}

export interface DocumentRecord {
  docId: string;
  docName: string;
  originalPath: string;
  pageCount: number;
  chunkCount: number;
  parserUsed: ParserType;
  status: "processing" | "ready" | "failed" | "archived";
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// In-memory document registry (in production, use a database)
const documentRegistry = new Map<string, DocumentRecord>();
const SKIP_REGISTRY_SYNC =
  process.env.QDRANT_SKIP_REGISTRY_SYNC === "true" ||
  process.env.SKIP_REGISTRY_SYNC === "true";

/**
 * Ingest a document into the RAG system
 * 1. Process the document (parse, chunk, upload to MinIO)
 * 2. Generate embeddings for chunks
 * 3. Store vectors in Qdrant with metadata
 */
export async function ingestDocument(
  file: Buffer,
  filename: string,
  docName: string,
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { parserType = "unstructured", replaceDocId, metadata = {} } = options;
  const docId = replaceDocId || uuidv4();

  try {
    // Ensure infrastructure is ready
    console.log("[ingest] Ensuring Qdrant collection...");
    await ensureCollection();
    console.log("[ingest] Qdrant collection ready");

    console.log("[ingest] Ensuring MinIO bucket...");
    await ensureBucket();
    console.log("[ingest] MinIO bucket ready");

    // Update registry to show processing
    documentRegistry.set(docId, {
      docId,
      docName,
      originalPath: "",
      pageCount: 0,
      chunkCount: 0,
      parserUsed: parserType,
      status: "processing",
      createdAt: replaceDocId
        ? (documentRegistry.get(docId)?.createdAt || new Date())
        : new Date(),
      updatedAt: new Date(),
      metadata,
    });

    // If replacing, clean up old data
    if (replaceDocId) {
      console.log(`Replacing document: ${replaceDocId}`);
      await deleteVectorsByFilter({
        must: [{ key: "doc_id", match: { value: replaceDocId } }],
      });
      await deleteDocumentFiles(replaceDocId);
    }

    // Process the document
    console.log("[ingest] Processing document with parser:", parserType);
    const processed: ProcessedDocument = await processDocument(
      file,
      filename,
      docName,
      parserType,
      docId
    );

    // Collect all chunks for embedding
    const allChunks: Array<{
      chunkId: string;
      text: string;
      pageNumber: number;
      chunkIndex: number;
      imageUrl: string;
    }> = [];

    for (const page of processed.pages) {
      for (const chunk of page.chunks) {
        allChunks.push({
          chunkId: chunk.chunkId,
          text: chunk.text,
          pageNumber: page.pageNumber,
          chunkIndex: chunk.chunkIndex,
          imageUrl: page.imageUrl,
        });
      }
    }

    console.log("[ingest] Document processed, generating embeddings for", allChunks.length, "chunks...");

    // Generate embeddings in batches
    const BATCH_SIZE = 100;
    const points: Array<{
      id: string;
      vector: {
        dense: number[];
        text: { text: string; model: string }; // BM25 inference
      };
      payload: Record<string, unknown>;
    }> = [];

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.text);
      const denseEmbeddings = await embedTexts(texts);

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        points.push({
          id: chunk.chunkId,
          vector: {
            dense: denseEmbeddings[j],
            // Qdrant will generate BM25 sparse vector from this text
            text: {
              text: chunk.text,
              model: "qdrant/bm25",
            },
          },
          payload: {
            doc_id: docId,
            doc_name: docName,
            page_number: chunk.pageNumber,
            chunk_index: chunk.chunkIndex,
            text: chunk.text,
            image_url: chunk.imageUrl,
            parser_used: parserType,
            status: "ready",
            doc_type: metadata.docType || "unknown",
            topic: metadata.topic || "",
            category: metadata.category || "",
            created_at: new Date().toISOString(),
          },
        });
      }
    }

    // Store vectors in Qdrant
    console.log(`Storing ${points.length} vectors in Qdrant...`);
    await upsertVectors(points);

    // Update registry with final state
    const record: DocumentRecord = {
      docId,
      docName,
      originalPath: processed.originalPath,
      pageCount: processed.pages.length,
      chunkCount: processed.totalChunks,
      parserUsed: parserType,
      status: "ready",
      createdAt: replaceDocId
        ? (documentRegistry.get(docId)?.createdAt || new Date())
        : new Date(),
      updatedAt: new Date(),
      metadata,
    };
    documentRegistry.set(docId, record);

    console.log(`Successfully ingested document: ${docName} (${docId})`);

    return {
      docId,
      docName,
      pageCount: processed.pages.length,
      chunkCount: processed.totalChunks,
      status: "ready",
      parserUsed: parserType,
      processedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error ingesting document:`, error);

    // Update registry with failed state
    const existingRecord = documentRegistry.get(docId);
    if (existingRecord) {
      existingRecord.status = "failed";
      existingRecord.updatedAt = new Date();
    }

    return {
      docId,
      docName,
      pageCount: 0,
      chunkCount: 0,
      status: "failed",
      error: (error as Error).message,
      parserUsed: parserType,
      processedAt: new Date(),
    };
  }
}

/**
 * Archive a document (mark as archived but keep data)
 */
export async function archiveDocument(docId: string): Promise<void> {
  const record = documentRegistry.get(docId);
  if (record) {
    record.status = "archived";
    record.updatedAt = new Date();
  }

  // Update vectors to archived status
  // Note: Qdrant doesn't support bulk updates, so we'd need to re-upsert
  // For now, we just update the registry
}

/**
 * Delete a document completely
 */
export async function deleteDocument(docId: string): Promise<void> {
  // Delete from Qdrant
  await deleteVectorsByFilter({
    must: [{ key: "doc_id", match: { value: docId } }],
  });

  // Delete from MinIO
  await deleteDocumentFiles(docId);

  // Remove from registry
  documentRegistry.delete(docId);

  console.log(`Deleted document: ${docId}`);
}

/**
 * Get all documents in the registry
 */
export async function listDocuments(): Promise<DocumentRecord[]> {
  // Always sync from Qdrant to ensure we have the latest data
  if (!SKIP_REGISTRY_SYNC) {
    await syncRegistryFromQdrant();
  }

  console.log(`[listDocuments] Returning ${documentRegistry.size} documents`);
  return Array.from(documentRegistry.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Get a specific document
 */
export function getDocument(docId: string): DocumentRecord | undefined {
  const record = documentRegistry.get(docId);
  return record;
}

/**
 * Initialize the document registry from Qdrant
 * Call this on startup to sync state
 */
export async function initializeRegistry(): Promise<void> {
  if (SKIP_REGISTRY_SYNC) {
    console.log("Document registry init skipped (QDRANT_SKIP_REGISTRY_SYNC=true)");
    return;
  }
  await syncRegistryFromQdrant();
  console.log("Document registry initialized from Qdrant (in-memory cache)");
}

/**
 * Rebuild the in-memory registry from Qdrant payloads
 * Useful after a restart so the Knowledge UI isn't empty
 */
async function syncRegistryFromQdrant(): Promise<void> {
  try {
    const qdrant = getClient();
    const collection = getCollectionName();
    console.log(`[syncRegistry] Syncing from Qdrant collection: ${collection}`);

    let offset: number | string | undefined = undefined;
    const aggregated = new Map<string, DocumentRecord>();

    // Scroll through all points (chunks) and aggregate by doc_id
    // Assumes small doc counts typical for Phase 1; adjust limit if needed
    do {
      const { points, next_page_offset } = await qdrant.scroll(collection, {
        limit: 200,
        with_payload: true,
        with_vector: false,
        offset,
      });

      for (const point of points) {
        const payload = (point.payload as Record<string, unknown>) || {};
        const docId = (payload.doc_id as string) || "";
        if (!docId) continue;

        const docName = (payload.doc_name as string) || "Untitled";
        const pageNumber = Number(payload.page_number ?? 0);
        const parserUsed = (payload.parser_used as ParserType) || "unstructured";
        const status =
          (payload.status as DocumentRecord["status"]) || "ready";
        const createdAtRaw = (payload.created_at as string) || undefined;
        const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date();
        const updatedAt = createdAt;

        let record = aggregated.get(docId);
        if (!record) {
          record = {
            docId,
            docName,
            originalPath: "",
            pageCount: 0,
            chunkCount: 0,
            parserUsed,
            status,
            createdAt,
            updatedAt,
            metadata: payload,
          };
          aggregated.set(docId, record);
        }

        record.chunkCount += 1;
        record.pageCount = Math.max(record.pageCount, pageNumber);
        if (createdAt < record.createdAt) {
          record.createdAt = createdAt;
        }
        if (updatedAt > record.updatedAt) {
          record.updatedAt = updatedAt;
        }
      }

      offset = (next_page_offset as number | string | undefined) || undefined;
    } while (offset !== undefined);

    // Replace in-memory registry
    documentRegistry.clear();
    for (const [docId, record] of aggregated.entries()) {
      documentRegistry.set(docId, record);
    }
    console.log(`[syncRegistry] Synced ${aggregated.size} documents from Qdrant`);
  } catch (error) {
    console.warn(
      "[syncRegistry] Unable to sync registry from Qdrant, using in-memory only:",
      (error as Error).message
    );
  }
}
