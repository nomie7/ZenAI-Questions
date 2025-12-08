# Hybrid Dense+Sparse Retrieval Implementation

## STATUS: ✅ IMPLEMENTED

This document described the original implementation plan. **The system now uses Qdrant's built-in BM25 inference** instead of client-side sparse embedding generation.

See **[BM25_IMPLEMENTATION.md](./BM25_IMPLEMENTATION.md)** for current architecture.

---

## Original Plan vs. Actual Implementation

### ❌ Original Approach (Not Used):
- Use `@qdrant/fastembed` to generate sparse vectors client-side
- Store pre-computed sparse vectors in Qdrant
- Query with pre-computed sparse embeddings

**Issues:** Complex dependency management, redundant computation, silent failures

### ✅ Actual Implementation:
- Use Qdrant's built-in `qdrant/bm25` model for server-side BM25 generation
- Store raw text in vector payload with `model: "qdrant/bm25"`
- Qdrant generates sparse vectors on-the-fly during ingestion and queries
- No external sparse embedding dependencies needed

## Key Differences

| Aspect | Original Plan | Actual Implementation |
|--------|--------------|----------------------|
| **Dependencies** | `@qdrant/fastembed` | None (Qdrant built-in) |
| **Sparse Generation** | Client-side | Server-side |
| **Complexity** | High | Low |
| **Collection Config** | `sparse_vectors: { text: {} }` | `sparse_vectors: { text: { modifier: "idf" } }` |
| **Vector Storage** | `{ indices, values }` | `{ text, model: "qdrant/bm25" }` |
| **Query Method** | Pre-computed embeddings | Inference at query time |

## Migration Status

✅ **Completed Changes:**
1. Removed `fastembed` dependency
2. Updated collection configuration with BM25 modifier
3. Simplified ingestion to use inference API
4. Updated retrieval to pass raw query text
5. Removed `ENABLE_SPARSE` environment variable
6. Updated documentation

---

## Original Implementation Notes (Historical)

Below is the original plan for reference. The actual implementation is simpler and more efficient.


  - `vector: { dense: <denseVector>, text: { indices, values } }`
- Ensure `ensureCollection` creates the new collection with named vectors + sparse config (guarded by an env like `QDRANT_COLLECTION_NAME` set to the new collection).
- Re-ingest documents into the new collection (recommended) or backfill sparse vectors if reprocessing is expensive.

## Retrieval Flow Changes
- Add `hybridRetrieve(query, opts)` in `retrieval.ts`:
  - Compute dense embedding + sparse embedding for the query.
  - Call Qdrant Query API with `prefetch`:
    - Prefetch 1: sparse `{ indices, values }` using vector name `text`, apply same filters (`status=ready`, optional `doc_id`).
    - Prefetch 2: dense vector using `dense`, same filters.
  - Main query: `{ fusion: "rrf" }` (or `dbsf`), `limit = topK`.
  - Post-process with existing page dedupe; optionally keep MMR if helpful.
- Keep `retrieveContext` as the public entry; internally route to hybrid by default and fall back to dense-only on error.

## Agentic Flow Impact
- No structural changes; analysis/reflection/re-search remain the same.
- Expect higher recall → fewer refinement iterations; monitor latency.

## Configuration
- `.env`: set `QDRANT_COLLECTION_NAME=knowledge_base_hybrid` on cutover.
- Optional: `ENABLE_HYBRID=true` (default on) to allow quick rollback to dense-only if needed.

## Migration Plan (dev simplification)
- Create the new collection (named dense + sparse) in dev.
- Re-ingest documents into the new collection.
- Point `QDRANT_COLLECTION_NAME` at the new collection; keep `ENABLE_HYBRID=true`.

## Testing
- Unit: shape of sparse embeddings; Qdrant request construction (prefetch + fusion); fallback to dense-only when sparse fails.
- Integration: compare hit rate vs dense-only on a sample of queries; verify citations/page URLs still map correctly.
- Load: measure p95 latency with hybrid vs dense-only; tune prefetch limits and RRF `k` if needed.

## Monitoring & Logging
- Log retrieval mode (hybrid vs fallback), dense/sparse embedding latency, Qdrant query latency, and candidate counts.
- Track "no-context" rate and agent iterations count to confirm quality gains.

## Rollback
- Set `ENABLE_HYBRID=false` to use dense-only retrieval with the same code path.
- If needed, switch `QDRANT_COLLECTION_NAME` back to the prior collection.

## Out of Scope for now
- Freshness boosts (not desired), user-facing toggles, advanced rerankers (can be added later if needed).
