import { QdrantClient } from "@qdrant/js-client-rest";

// Qdrant configuration
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "knowledge_base";

// OpenAI embedding dimension (text-embedding-3-small)
const EMBEDDING_DIMENSION = 1536;

let client: QdrantClient | null = null;

/**
 * Get or create the Qdrant client singleton
 */
export function getClient(): QdrantClient {
  if (!client) {
    client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
      // Skip version compatibility check (can fail behind reverse proxies)
      checkCompatibility: false,
      // Add headers for Cloudflare compatibility (undici/fetch needs these)
      headers: {
        "User-Agent": "qdrant-js-client/1.16.1",
      },
    });
  }
  return client;
}

/**
 * Get the collection name
 */
export function getCollectionName(): string {
  return COLLECTION_NAME;
}

/**
 * Ensure the knowledge base collection exists with proper configuration
 */
export async function ensureCollection(): Promise<void> {
  const qdrant = getClient();

  try {
    // Check if collection exists
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (!exists) {
      // Create collection with cosine similarity for OpenAI embeddings
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: "Cosine",
        },
        // Enable payload indexing for common filter fields
        optimizers_config: {
          indexing_threshold: 0,
        },
      });

      // Create payload indexes for efficient filtering
      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "doc_id",
        field_schema: "keyword",
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "status",
        field_schema: "keyword",
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "doc_type",
        field_schema: "keyword",
      });

      console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
    }
  } catch (error) {
    console.error("Error ensuring Qdrant collection:", error);
    throw error;
  }
}

/**
 * Upsert vectors into the collection
 */
export async function upsertVectors(
  points: Array<{
    id: string;
    vector: number[];
    payload: Record<string, unknown>;
  }>
): Promise<void> {
  const qdrant = getClient();

  await qdrant.upsert(COLLECTION_NAME, {
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    })),
  });
}

/**
 * Search for similar vectors with retry logic for connection errors
 */
export async function searchVectors(
  vector: number[],
  limit: number = 10,
  filter?: Record<string, unknown>
): Promise<
  Array<{
    id: string;
    score: number;
    payload: Record<string, unknown>;
  }>
> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const qdrant = getClient();

      const results = await qdrant.search(COLLECTION_NAME, {
        vector,
        limit,
        filter: filter as never,
        with_payload: true,
        score_threshold: 0.5, // Only return relevant results
      });

      return results.map((r) => ({
        id: String(r.id),
        score: r.score,
        payload: (r.payload as Record<string, unknown>) || {},
      }));
    } catch (error) {
      lastError = error as Error;
      const errorMessage = (error as Error).message || String(error);

      // Check if it's a socket/connection error
      if (
        errorMessage.includes("socket") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("closed") ||
        (error as any).code === "UND_ERR_SOCKET"
      ) {
        console.warn(
          `[Qdrant] Connection error on attempt ${attempt}/${maxRetries}, resetting client...`
        );

        // Reset the client singleton to force new connection
        client = null;

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
          continue;
        }
      }

      // If it's not a connection error or we've exhausted retries, throw
      throw error;
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error("Search failed after retries");
}

/**
 * Delete vectors by filter (e.g., by doc_id)
 */
export async function deleteVectorsByFilter(
  filter: Record<string, unknown>
): Promise<void> {
  const qdrant = getClient();

  await qdrant.delete(COLLECTION_NAME, {
    filter: filter as never,
  });
}

/**
 * Get collection info for debugging
 */
export async function getCollectionInfo(): Promise<unknown> {
  const qdrant = getClient();
  return qdrant.getCollection(COLLECTION_NAME);
}
