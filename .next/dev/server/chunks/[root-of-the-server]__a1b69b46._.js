module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/lib/embeddings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "embedText",
    ()=>embedText,
    "embedTexts",
    ()=>embedTexts,
    "getEmbeddingDimension",
    ()=>getEmbeddingDimension
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/embeddings.js [app-route] (ecmascript)");
;
// Use OpenAI's text-embedding-3-small model (1536 dimensions)
const embeddings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$embeddings$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAIEmbeddings"]({
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY
});
async function embedText(text) {
    const result = await embeddings.embedQuery(text);
    return result;
}
async function embedTexts(texts) {
    const results = await embeddings.embedDocuments(texts);
    return results;
}
function getEmbeddingDimension() {
    return 1536;
}
}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[project]/src/lib/qdrant.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteVectorsByFilter",
    ()=>deleteVectorsByFilter,
    "ensureCollection",
    ()=>ensureCollection,
    "getClient",
    ()=>getClient,
    "getCollectionInfo",
    ()=>getCollectionInfo,
    "getCollectionName",
    ()=>getCollectionName,
    "searchVectors",
    ()=>searchVectors,
    "upsertVectors",
    ()=>upsertVectors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$qdrant$2f$js$2d$client$2d$rest$2f$dist$2f$esm$2f$qdrant$2d$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@qdrant/js-client-rest/dist/esm/qdrant-client.js [app-route] (ecmascript)");
;
// Qdrant configuration
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "knowledge_base";
// OpenAI embedding dimension (text-embedding-3-small)
const EMBEDDING_DIMENSION = 1536;
let client = null;
function getClient() {
    if (!client) {
        client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$qdrant$2f$js$2d$client$2d$rest$2f$dist$2f$esm$2f$qdrant$2d$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["QdrantClient"]({
            url: QDRANT_URL,
            apiKey: QDRANT_API_KEY,
            // Skip version compatibility check (can fail behind reverse proxies)
            checkCompatibility: false,
            // Add headers for Cloudflare compatibility (undici/fetch needs these)
            headers: {
                "User-Agent": "qdrant-js-client/1.16.1"
            }
        });
    }
    return client;
}
function getCollectionName() {
    return COLLECTION_NAME;
}
async function ensureCollection() {
    const qdrant = getClient();
    try {
        // Check if collection exists
        const collections = await qdrant.getCollections();
        const exists = collections.collections.some((c)=>c.name === COLLECTION_NAME);
        if (!exists) {
            // Create collection with cosine similarity for OpenAI embeddings
            await qdrant.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: EMBEDDING_DIMENSION,
                    distance: "Cosine"
                },
                // Enable payload indexing for common filter fields
                optimizers_config: {
                    indexing_threshold: 0
                }
            });
            // Create payload indexes for efficient filtering
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: "doc_id",
                field_schema: "keyword"
            });
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: "status",
                field_schema: "keyword"
            });
            await qdrant.createPayloadIndex(COLLECTION_NAME, {
                field_name: "doc_type",
                field_schema: "keyword"
            });
            console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
        }
    } catch (error) {
        console.error("Error ensuring Qdrant collection:", error);
        throw error;
    }
}
async function upsertVectors(points) {
    const qdrant = getClient();
    await qdrant.upsert(COLLECTION_NAME, {
        points: points.map((p)=>({
                id: p.id,
                vector: p.vector,
                payload: p.payload
            }))
    });
}
async function searchVectors(vector, limit = 10, filter) {
    const qdrant = getClient();
    const results = await qdrant.search(COLLECTION_NAME, {
        vector,
        limit,
        filter: filter,
        with_payload: true,
        score_threshold: 0.5
    });
    return results.map((r)=>({
            id: String(r.id),
            score: r.score,
            payload: r.payload || {}
        }));
}
async function deleteVectorsByFilter(filter) {
    const qdrant = getClient();
    await qdrant.delete(COLLECTION_NAME, {
        filter: filter
    });
}
async function getCollectionInfo() {
    const qdrant = getClient();
    return qdrant.getCollection(COLLECTION_NAME);
}
}),
"[externals]/minio [external] (minio, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("minio");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "deleteDocumentFiles",
    ()=>deleteDocumentFiles,
    "deleteFile",
    ()=>deleteFile,
    "ensureBucket",
    ()=>ensureBucket,
    "fileExists",
    ()=>fileExists,
    "getBucketName",
    ()=>getBucketName,
    "getFile",
    ()=>getFile,
    "getSignedUrl",
    ()=>getSignedUrl,
    "getStorageClient",
    ()=>getStorageClient,
    "uploadDocument",
    ()=>uploadDocument,
    "uploadFile",
    ()=>uploadFile,
    "uploadPageImage",
    ()=>uploadPageImage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$minio__$5b$external$5d$__$28$minio$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/minio [external] (minio, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$minio__$5b$external$5d$__$28$minio$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$minio__$5b$external$5d$__$28$minio$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// MinIO configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
// Support both typical MinIO env names and username/password aliases
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || process.env.MINIO_USERNAME || // alias for username
"";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || process.env.MINIO_PASSWORD || // alias for password
"";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "knowledge-docs";
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
let client = null;
function getStorageClient() {
    if (!client) {
        const { endPoint, port, useSSL } = resolveMinioEndpoint();
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$minio__$5b$external$5d$__$28$minio$2c$__esm_import$29$__["Client"]({
            endPoint,
            port,
            useSSL,
            accessKey: MINIO_ACCESS_KEY,
            secretKey: MINIO_SECRET_KEY
        });
    }
    return client;
}
function resolveMinioEndpoint() {
    // If MINIO_ENDPOINT includes scheme, parse it; otherwise use raw values.
    if (MINIO_ENDPOINT.startsWith("http://") || MINIO_ENDPOINT.startsWith("https://")) {
        try {
            const url = new URL(MINIO_ENDPOINT);
            const endPoint = url.hostname;
            const useSSL = url.protocol === "https:";
            const port = url.port && Number(url.port) > 0 ? Number(url.port) : useSSL ? 443 : 80;
            return {
                endPoint,
                port,
                useSSL
            };
        } catch  {
        // Fall through to defaults
        }
    }
    return {
        endPoint: MINIO_ENDPOINT,
        port: MINIO_PORT,
        useSSL: MINIO_USE_SSL
    };
}
function getBucketName() {
    return MINIO_BUCKET;
}
async function ensureBucket() {
    const minio = getStorageClient();
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) {
        await minio.makeBucket(MINIO_BUCKET);
        console.log(`Created MinIO bucket: ${MINIO_BUCKET}`);
    }
}
async function uploadFile(objectName, buffer, contentType = "application/octet-stream") {
    const minio = getStorageClient();
    await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
        "Content-Type": contentType
    });
    return objectName;
}
async function uploadDocument(docId, buffer, originalFilename) {
    const ext = originalFilename.split(".").pop() || "pdf";
    const objectName = `documents/${docId}/original.${ext}`;
    await uploadFile(objectName, buffer, getMimeType(ext));
    return objectName;
}
async function uploadPageImage(docId, pageNumber, buffer) {
    const objectName = `documents/${docId}/pages/page-${pageNumber}.png`;
    await uploadFile(objectName, buffer, "image/png");
    return objectName;
}
async function getSignedUrl(objectName, expirySeconds = 3600) {
    const minio = getStorageClient();
    const url = await minio.presignedGetObject(MINIO_BUCKET, objectName, expirySeconds);
    return url;
}
async function deleteFile(objectName) {
    const minio = getStorageClient();
    await minio.removeObject(MINIO_BUCKET, objectName);
}
async function deleteDocumentFiles(docId) {
    const minio = getStorageClient();
    const prefix = `documents/${docId}/`;
    const objectsList = [];
    const stream = minio.listObjects(MINIO_BUCKET, prefix, true);
    for await (const obj of stream){
        if (obj.name) {
            objectsList.push(obj.name);
        }
    }
    if (objectsList.length > 0) {
        await minio.removeObjects(MINIO_BUCKET, objectsList);
    }
}
async function fileExists(objectName) {
    const minio = getStorageClient();
    try {
        await minio.statObject(MINIO_BUCKET, objectName);
        return true;
    } catch  {
        return false;
    }
}
async function getFile(objectName) {
    const minio = getStorageClient();
    const stream = await minio.getObject(MINIO_BUCKET, objectName);
    const chunks = [];
    for await (const chunk of stream){
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
/**
 * Get MIME type from file extension
 */ function getMimeType(ext) {
    const mimeTypes = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        txt: "text/plain",
        json: "application/json"
    };
    return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/retrieval.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractCitations",
    ()=>extractCitations,
    "formatContextForLLM",
    ()=>formatContextForLLM,
    "hasRelevantContext",
    ()=>hasRelevantContext,
    "retrieveContext",
    ()=>retrieveContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function retrieveContext(query, options = {}) {
    const { topK = 10, docId, status = "ready", diversify = true, diversityWeight = 0.7 } = options;
    // Generate query embedding
    const queryEmbedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedText"])(query);
    // Build filter
    const filter = {
        must: [
            {
                key: "status",
                match: {
                    value: status
                }
            }
        ]
    };
    if (docId) {
        filter.must.push({
            key: "doc_id",
            match: {
                value: docId
            }
        });
    }
    // Retrieve more candidates if we're going to diversify
    const candidateCount = diversify ? topK * 3 : topK;
    // Search Qdrant
    const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchVectors"])(queryEmbedding, candidateCount, filter);
    // Map results to chunks
    let chunks = results.map((r)=>({
            chunkId: r.id,
            docId: r.payload.doc_id || "",
            docName: r.payload.doc_name || "",
            pageNumber: r.payload.page_number || 0,
            chunkIndex: r.payload.chunk_index || 0,
            text: r.payload.text || "",
            imageUrl: r.payload.image_url || "",
            score: r.score,
            parserUsed: r.payload.parser_used || ""
        }));
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
 */ function applyMMR(chunks, topK, lambda) {
    if (chunks.length <= topK) return chunks;
    const selected = [];
    const remaining = new Set(chunks.map((_, i)=>i));
    // Start with the highest scoring chunk
    const firstIdx = 0;
    selected.push(chunks[firstIdx]);
    remaining.delete(firstIdx);
    while(selected.length < topK && remaining.size > 0){
        let bestIdx = -1;
        let bestScore = -Infinity;
        for (const idx of remaining){
            const candidate = chunks[idx];
            // Calculate relevance score (normalized)
            const relevance = candidate.score;
            // Calculate max similarity to already selected chunks
            let maxSimilarity = 0;
            for (const sel of selected){
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
 */ function textSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([
        ...words1
    ].filter((w)=>words2.has(w)));
    const union = new Set([
        ...words1,
        ...words2
    ]);
    return intersection.size / union.size;
}
/**
 * Deduplicate chunks by page, keeping the highest scoring chunk per page
 */ function deduplicateByPage(chunks) {
    const pageMap = new Map();
    for (const chunk of chunks){
        const key = `${chunk.docId}:${chunk.pageNumber}`;
        const existing = pageMap.get(key);
        if (!existing || chunk.score > existing.score) {
            pageMap.set(key, chunk);
        }
    }
    // Sort by original score descending
    return Array.from(pageMap.values()).sort((a, b)=>b.score - a.score);
}
function formatContextForLLM(chunks) {
    if (chunks.length === 0) {
        return "No relevant context found in the knowledge base.";
    }
    const formattedChunks = chunks.map((chunk, index)=>{
        return `[${index + 1}] Document: "${chunk.docName}", Page ${chunk.pageNumber}
${chunk.text}`;
    });
    return formattedChunks.join("\n\n---\n\n");
}
async function extractCitations(chunks) {
    const citations = [];
    for (const chunk of chunks){
        // Get signed URL for page image
        let signedImageUrl;
        if (chunk.imageUrl) {
            try {
                signedImageUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSignedUrl"])(chunk.imageUrl);
            } catch  {
            // Image URL generation failed, continue without it
            }
        }
        citations.push({
            docName: chunk.docName,
            pageNumber: chunk.pageNumber,
            imageUrl: signedImageUrl,
            snippet: chunk.text.length > 200 ? chunk.text.substring(0, 200) + "..." : chunk.text
        });
    }
    return citations;
}
async function hasRelevantContext(query, threshold = 0.6) {
    const chunks = await retrieveContext(query, {
        topK: 3
    });
    return chunks.length > 0 && chunks[0].score >= threshold;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/agentic-retrieval.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "agenticRetrieve",
    ()=>agenticRetrieve,
    "analyzeQuery",
    ()=>analyzeQuery,
    "formatAgentContextForLLM",
    ()=>formatAgentContextForLLM,
    "getAgentMetadata",
    ()=>getAgentMetadata,
    "reflectOnResults",
    ()=>reflectOnResults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/chat_models/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/retrieval.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
/**
 * Agentic RAG with Self-Reflection
 *
 * Flow: Query → Analyze → Retrieve → Reflect → (Re-search if needed) → Answer
 */ // Configuration
const MAX_ITERATIONS = 3;
const CONFIDENCE_THRESHOLD = 0.7;
const TOP_K_PER_SEARCH = 8;
// LLM for agent reasoning
const agentLLM = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
    modelName: "gpt-4.1-mini",
    temperature: 0
});
async function analyzeQuery(query) {
    const prompt = `You are a query analyzer for a knowledge base search system.

IMPORTANT: The knowledge base contains REPORTS and DOCUMENTS from various organizations.
When a user asks about "impact of [Organization]" or "[Company] influence", they likely want
information FROM that organization's reports, not ABOUT the organization itself.

For example:
- "impact of Kantar on market" → User likely wants market insights FROM Kantar's reports
- "What does McKinsey say about AI?" → User wants AI insights from McKinsey reports
- Rewrite these to search for the actual content: "market trends", "media predictions", etc.

Analyze this user query and provide:
1. The user's TRUE intent (what information are they actually seeking?)
2. Key entities or concepts (focus on topics, not publisher names)
3. If this is a multi-part question, break it into sub-questions
4. Generate 2-4 CONTENT-FOCUSED search queries (avoid searching for publisher names)

User Query: "${query}"

Respond in JSON format:
{
  "intent": "what the user actually wants to learn about",
  "keyEntities": ["topic1", "topic2"],
  "subQuestions": ["sub-question 1"] or [],
  "isMultiPart": true/false,
  "searchQueries": ["content-focused query 1", "content-focused query 2"]
}

Only output valid JSON, no markdown or explanation.`;
    try {
        const response = await agentLLM.invoke(prompt);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        // Parse JSON from response (handle potential markdown code blocks)
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        const analysis = JSON.parse(jsonStr);
        return {
            originalQuery: query,
            intent: analysis.intent || query,
            keyEntities: analysis.keyEntities || [],
            subQuestions: analysis.subQuestions || [],
            isMultiPart: analysis.isMultiPart || false,
            searchQueries: analysis.searchQueries || [
                query
            ]
        };
    } catch (error) {
        console.warn("Query analysis failed, using original query:", error);
        return {
            originalQuery: query,
            intent: query,
            keyEntities: [],
            subQuestions: [],
            isMultiPart: false,
            searchQueries: [
                query
            ]
        };
    }
}
async function reflectOnResults(query, analysis, chunks, previousReflections = []) {
    // Format chunks for evaluation
    const chunksText = chunks.slice(0, 10) // Limit for context window
    .map((c, i)=>`[${i + 1}] ${c.docName} (Page ${c.pageNumber}): ${c.text.slice(0, 500)}...`).join("\n\n");
    const previousAttempts = previousReflections.length > 0 ? `\nPrevious search attempts:\n${previousReflections.map((r, i)=>`Attempt ${i + 1}: Confidence ${r.confidence}, Missing: ${r.missingInformation.join(", ")}`).join("\n")}\n` : "";
    const prompt = `You are evaluating if retrieved documents answer a user's question.

User Query: "${query}"
Intent: ${analysis.intent}
${analysis.subQuestions.length > 0 ? `Sub-questions: ${analysis.subQuestions.join(", ")}` : ""}
${previousAttempts}

Retrieved Documents:
${chunksText}

Evaluate:
1. Does this information answer the user's question? (confidence 0-1)
2. What aspects of the question are answered?
3. What information is still missing?
4. If missing info, what search queries would help find it?

Respond in JSON:
{
  "confidence": 0.0-1.0,
  "isSufficient": true/false,
  "answeredAspects": ["aspect 1", "aspect 2"],
  "missingInformation": ["missing info 1"] or [],
  "suggestedQueries": ["refined query"] or [],
  "reasoning": "brief explanation"
}

Only output valid JSON.`;
    try {
        const response = await agentLLM.invoke(prompt);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        const reflection = JSON.parse(jsonStr);
        return {
            confidence: Math.min(1, Math.max(0, reflection.confidence || 0)),
            isSufficient: reflection.isSufficient ?? reflection.confidence >= CONFIDENCE_THRESHOLD,
            answeredAspects: reflection.answeredAspects || [],
            missingInformation: reflection.missingInformation || [],
            suggestedQueries: reflection.suggestedQueries || [],
            reasoning: reflection.reasoning || ""
        };
    } catch (error) {
        console.warn("Reflection failed:", error);
        // Default to accepting results if reflection fails
        return {
            confidence: 0.6,
            isSufficient: true,
            answeredAspects: [],
            missingInformation: [],
            suggestedQueries: [],
            reasoning: "Reflection failed, proceeding with available results"
        };
    }
}
/**
 * Merge and deduplicate chunks from multiple searches
 */ function mergeChunks(existingChunks, newChunks) {
    const seen = new Set();
    const merged = [];
    // Add existing chunks first (they have priority)
    for (const chunk of existingChunks){
        const key = `${chunk.docId}-${chunk.pageNumber}-${chunk.chunkIndex}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(chunk);
        }
    }
    // Add new chunks that aren't duplicates
    for (const chunk of newChunks){
        const key = `${chunk.docId}-${chunk.pageNumber}-${chunk.chunkIndex}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(chunk);
        }
    }
    // Sort by score and limit
    return merged.sort((a, b)=>b.score - a.score).slice(0, TOP_K_PER_SEARCH * 2); // Keep more for multi-search
}
async function agenticRetrieve(query, options = {}) {
    const { docId, maxIterations = MAX_ITERATIONS, confidenceThreshold = CONFIDENCE_THRESHOLD, verbose = true } = options;
    const reflections = [];
    const allSearchQueries = [];
    let allChunks = [];
    let iteration = 0;
    let finalConfidence = 0;
    // Step 1: Analyze the query
    if (verbose) console.log(`[Agent] Analyzing query: "${query}"`);
    const analysis = await analyzeQuery(query);
    if (verbose) {
        console.log(`[Agent] Intent: ${analysis.intent}`);
        console.log(`[Agent] Search queries: ${analysis.searchQueries.join(", ")}`);
    }
    // Step 2: Initial retrieval with all search queries
    for (const searchQuery of analysis.searchQueries){
        allSearchQueries.push(searchQuery);
        if (verbose) console.log(`[Agent] Searching: "${searchQuery}"`);
        const chunks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveContext"])(searchQuery, {
            topK: TOP_K_PER_SEARCH,
            docId,
            diversify: true
        });
        allChunks = mergeChunks(allChunks, chunks);
    }
    if (verbose) console.log(`[Agent] Retrieved ${allChunks.length} chunks`);
    // Step 3: Self-reflection loop
    while(iteration < maxIterations){
        iteration++;
        if (verbose) console.log(`[Agent] Reflection iteration ${iteration}...`);
        // Reflect on current results
        const reflection = await reflectOnResults(query, analysis, allChunks, reflections);
        reflections.push(reflection);
        finalConfidence = reflection.confidence;
        if (verbose) {
            console.log(`[Agent] Confidence: ${reflection.confidence.toFixed(2)}`);
            console.log(`[Agent] Sufficient: ${reflection.isSufficient}`);
            if (reflection.missingInformation.length > 0) {
                console.log(`[Agent] Missing: ${reflection.missingInformation.join(", ")}`);
            }
        }
        // Check if we should stop
        if (reflection.isSufficient || reflection.confidence >= confidenceThreshold) {
            if (verbose) console.log(`[Agent] Results sufficient, stopping.`);
            break;
        }
        // Check if we have new queries to try
        if (reflection.suggestedQueries.length === 0) {
            if (verbose) console.log(`[Agent] No new queries suggested, stopping.`);
            break;
        }
        // Step 4: Re-search with suggested queries
        for (const newQuery of reflection.suggestedQueries){
            // Avoid repeating the same query
            if (allSearchQueries.includes(newQuery)) continue;
            allSearchQueries.push(newQuery);
            if (verbose) console.log(`[Agent] Re-searching: "${newQuery}"`);
            const newChunks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveContext"])(newQuery, {
                topK: TOP_K_PER_SEARCH,
                docId,
                diversify: true
            });
            allChunks = mergeChunks(allChunks, newChunks);
        }
        if (verbose) console.log(`[Agent] Total chunks: ${allChunks.length}`);
    }
    if (verbose) {
        console.log(`[Agent] Completed in ${iteration} iteration(s)`);
        console.log(`[Agent] Final confidence: ${finalConfidence.toFixed(2)}`);
        console.log(`[Agent] Total search queries: ${allSearchQueries.length}`);
    }
    return {
        chunks: allChunks,
        iterations: iteration,
        queryAnalysis: analysis,
        reflections,
        finalConfidence,
        searchQueries: allSearchQueries
    };
}
function formatAgentContextForLLM(result) {
    if (result.chunks.length === 0) {
        return "No relevant documents found in the knowledge base.";
    }
    const contextBlocks = result.chunks.map((chunk, index)=>{
        return `[${index + 1}] Document: "${chunk.docName}", Page ${chunk.pageNumber}
${chunk.text}`;
    });
    const searchInfo = `Search conducted with ${result.iterations} iteration(s), ${result.searchQueries.length} queries, confidence ${result.finalConfidence.toFixed(2)}`;
    return `${searchInfo}\n\n---\n\n${contextBlocks.join("\n\n---\n\n")}`;
}
function getAgentMetadata(result) {
    return {
        iterations: result.iterations,
        confidence: result.finalConfidence,
        searchQueries: result.searchQueries,
        intent: result.queryAnalysis.intent
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/citations/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/retrieval.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentic$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/agentic-retrieval.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentic$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentic$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query");
    if (!query || !query.trim()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing query (use ?q=...)"
        }, {
            status: 400
        });
    }
    try {
        // Use agentic retrieval for smarter context gathering
        const agentResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentic$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["agenticRetrieve"])(query, {
            maxIterations: 3,
            confidenceThreshold: 0.7,
            verbose: false
        });
        const citations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCitations"])(agentResult.chunks);
        const agentMetadata = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$agentic$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAgentMetadata"])(agentResult);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            citations,
            agentMetadata
        });
    } catch (error) {
        console.error("Error generating citations:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a1b69b46._.js.map