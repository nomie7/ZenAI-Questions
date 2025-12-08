import { embedText } from "./embeddings";
import { searchVectors, queryHybrid } from "./qdrant";
import { getSignedUrl } from "./storage";

export interface RetrievedChunk {
  chunkId: string;
  docId: string;
  docName: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  imageUrl: string;
  score: number;
  parserUsed: string;
}

export interface RetrievalOptions {
  topK?: number;
  docId?: string; // Filter by specific document
  status?: string; // Filter by status (default: "ready")
  diversify?: boolean; // Apply MMR diversification
  diversityWeight?: number; // MMR lambda (0-1, higher = more diverse)
}

export interface CitationInfo {
  docName: string;
  pageNumber: number;
  imageUrl?: string; // Signed URL for page image
  snippet: string;
}

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const {
    topK = 10,
    docId,
    status = "ready",
    diversify = true,
    diversityWeight = 0.7,
  } = options;

  // Generate dense query embedding
  const queryDense = await embedText(query);

  // Build filter
  const filter: Record<string, unknown> = {
    must: [{ key: "status", match: { value: status } }],
  };

  if (docId) {
    (filter.must as Array<unknown>).push({
      key: "doc_id",
      match: { value: docId },
    });
  }

  // Retrieve more candidates if we're going to diversify
  const candidateCount = diversify ? topK * 3 : topK;

  // Hybrid search with BM25 inference (Qdrant generates sparse vectors server-side)
  let chunks: RetrievedChunk[] = [];
  try {
    const hybridResults = await queryHybrid({
      denseVector: queryDense,
      queryText: query, // Qdrant will generate BM25 sparse vector from this
      limit: candidateCount,
      filter,
    });

    chunks = hybridResults.map((r) => ({
      chunkId: r.id,
      docId: (r.payload.doc_id as string) || "",
      docName: (r.payload.doc_name as string) || "",
      pageNumber: (r.payload.page_number as number) || 0,
      chunkIndex: (r.payload.chunk_index as number) || 0,
      text: (r.payload.text as string) || "",
      imageUrl: (r.payload.image_url as string) || "",
      score: r.score,
      parserUsed: (r.payload.parser_used as string) || "",
    }));
  } catch (err) {
    console.warn("Hybrid query failed, falling back to dense-only", err);
    const denseResults = await searchVectors(queryDense, candidateCount, filter);
    chunks = denseResults.map((r) => ({
      chunkId: r.id,
      docId: (r.payload.doc_id as string) || "",
      docName: (r.payload.doc_name as string) || "",
      pageNumber: (r.payload.page_number as number) || 0,
      chunkIndex: (r.payload.chunk_index as number) || 0,
      text: (r.payload.text as string) || "",
      imageUrl: (r.payload.image_url as string) || "",
      score: r.score,
      parserUsed: (r.payload.parser_used as string) || "",
    }));
  }

  // Apply MMR diversification if enabled
  if (diversify && chunks.length > topK) {
    chunks = applyMMR(chunks, topK, diversityWeight);
  }

  // Deduplicate by page (keep highest scoring chunk per page)
  chunks = deduplicateByPage(chunks);

  return chunks.slice(0, topK);
}

/**
 * Apply Maximal Marginal Relevance (MMR) to diversify results
 * This balances relevance (score) with diversity (avoid redundant chunks)
 */
function applyMMR(
  chunks: RetrievedChunk[],
  topK: number,
  lambda: number
): RetrievedChunk[] {
  if (chunks.length <= topK) return chunks;

  const selected: RetrievedChunk[] = [];
  const remaining = new Set(chunks.map((_, i) => i));

  // Start with the highest scoring chunk
  const firstIdx = 0;
  selected.push(chunks[firstIdx]);
  remaining.delete(firstIdx);

  while (selected.length < topK && remaining.size > 0) {
    let bestIdx = -1;
    let bestScore = -Infinity;

    for (const idx of remaining) {
      const candidate = chunks[idx];

      // Calculate relevance score (normalized)
      const relevance = candidate.score;

      // Calculate max similarity to already selected chunks
      let maxSimilarity = 0;
      for (const sel of selected) {
        const sim = textSimilarity(candidate.text, sel.text);
        maxSimilarity = Math.max(maxSimilarity, sim);
      }

      // MMR score: λ * relevance - (1-λ) * max_similarity
      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarity;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = idx;
      }
    }

    if (bestIdx !== -1) {
      selected.push(chunks[bestIdx]);
      remaining.delete(bestIdx);
    } else {
      break;
    }
  }

  return selected;
}

/**
 * Simple text similarity based on Jaccard coefficient of words
 */
function textSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Deduplicate chunks by page, keeping the highest scoring chunk per page
 */
function deduplicateByPage(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const pageMap = new Map<string, RetrievedChunk>();

  for (const chunk of chunks) {
    const key = `${chunk.docId}:${chunk.pageNumber}`;
    const existing = pageMap.get(key);

    if (!existing || chunk.score > existing.score) {
      pageMap.set(key, chunk);
    }
  }

  // Sort by original score descending
  return Array.from(pageMap.values()).sort((a, b) => b.score - a.score);
}

/**
 * Format retrieved chunks for use in LLM context
 */
export function formatContextForLLM(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context found in the knowledge base.";
  }

  const formattedChunks = chunks.map((chunk, index) => {
    return `[${index + 1}] Document: "${chunk.docName}", Page ${chunk.pageNumber}
${chunk.text}`;
  });

  return formattedChunks.join("\n\n---\n\n");
}

/**
 * Extract citation information from retrieved chunks
 */
export async function extractCitations(
  chunks: RetrievedChunk[]
): Promise<CitationInfo[]> {
  const citations: CitationInfo[] = [];

  for (const chunk of chunks) {
    // Get signed URL for page image
    let signedImageUrl: string | undefined;
    if (chunk.imageUrl) {
      try {
        signedImageUrl = await getSignedUrl(chunk.imageUrl);
      } catch {
        // Image URL generation failed, continue without it
      }
    }

    citations.push({
      docName: chunk.docName,
      pageNumber: chunk.pageNumber,
      imageUrl: signedImageUrl,
      snippet:
        chunk.text.length > 200
          ? chunk.text.substring(0, 200) + "..."
          : chunk.text,
    });
  }

  return citations;
}

/**
 * Check if query can be answered from the knowledge base
 */
export async function hasRelevantContext(
  query: string,
  threshold: number = 0.6
): Promise<boolean> {
  const chunks = await retrieveContext(query, { topK: 3 });
  return chunks.length > 0 && chunks[0].score >= threshold;
}
