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
"[project]/src/lib/parsers/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Document parser interface and factory
 */ __turbopack_context__.s([
    "getParser",
    ()=>getParser,
    "suggestParser",
    ()=>suggestParser
]);
async function getParser(type) {
    switch(type){
        case "gemini":
            {
                const { GeminiParser } = await __turbopack_context__.A("[project]/src/lib/parsers/gemini-parser.ts [app-route] (ecmascript, async loader)");
                return new GeminiParser();
            }
        case "unstructured":
        default:
            {
                const { UnstructuredParser } = await __turbopack_context__.A("[project]/src/lib/parsers/unstructured-parser.ts [app-route] (ecmascript, async loader)");
                return new UnstructuredParser();
            }
    }
}
function suggestParser(filename) {
    const ext = filename.toLowerCase().split(".").pop();
    if (ext === "pdf") {
        // Default to unstructured for all PDFs
        return "unstructured";
    }
    return "unstructured";
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
"[project]/src/lib/document-processor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "chunkText",
    ()=>chunkText,
    "getDocumentStats",
    ()=>getDocumentStats,
    "getPageImageUrl",
    ()=>getPageImageUrl,
    "processDocument",
    ()=>processDocument
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parsers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Chunking configuration
const CHUNK_SIZE = 500; // characters
const CHUNK_OVERLAP = 50; // characters
async function processDocument(file, filename, docName, parserType = "unstructured", existingDocId) {
    // Generate or use existing doc ID
    const docId = existingDocId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    console.log(`Processing document: ${docName} (${filename}) with ${parserType} parser`);
    // 1. Parse the document
    const parser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getParser"])(parserType);
    const parsed = await parser.parse(file, filename);
    console.log(`Parsed ${parsed.metadata.pageCount} pages`);
    // 2. Upload original file
    const originalPath = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadDocument"])(docId, file, filename);
    // 3. Process each page
    const pages = [];
    let totalChunks = 0;
    for (const page of parsed.pages){
        // Upload page image if available
        let imageUrl = "";
        if (page.imageBuffer) {
            imageUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadPageImage"])(docId, page.pageNumber, page.imageBuffer);
        }
        // Chunk the page text
        const chunks = chunkText(page.text, page.pageNumber);
        totalChunks += chunks.length;
        pages.push({
            pageNumber: page.pageNumber,
            text: page.text,
            imageUrl,
            chunks
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
        processedAt: new Date()
    };
}
function chunkText(text, pageNumber, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    // Skip if text is too short
    if (text.length <= chunkSize) {
        chunks.push({
            chunkId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            text: text.trim(),
            pageNumber,
            chunkIndex: 0,
            startChar: 0,
            endChar: text.length
        });
        return chunks;
    }
    // Create chunks with overlap
    let startIndex = 0;
    let chunkIndex = 0;
    while(startIndex < text.length){
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
                chunkId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                text: chunkText,
                pageNumber,
                chunkIndex,
                startChar: startIndex,
                endChar: endIndex
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
async function getPageImageUrl(imageUrl, expirySeconds = 3600) {
    if (!imageUrl) return "";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSignedUrl"])(imageUrl, expirySeconds);
}
function getDocumentStats(doc) {
    const totalCharacters = doc.pages.reduce((sum, p)=>sum + p.text.length, 0);
    const avgChunkSize = doc.totalChunks > 0 ? Math.round(doc.pages.reduce((sum, p)=>sum + p.chunks.reduce((cs, c)=>cs + c.text.length, 0), 0) / doc.totalChunks) : 0;
    return {
        pageCount: doc.pages.length,
        chunkCount: doc.totalChunks,
        avgChunkSize,
        totalCharacters
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/src/lib/ingest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "archiveDocument",
    ()=>archiveDocument,
    "deleteDocument",
    ()=>deleteDocument,
    "getDocument",
    ()=>getDocument,
    "ingestDocument",
    ()=>ingestDocument,
    "initializeRegistry",
    ()=>initializeRegistry,
    "listDocuments",
    ()=>listDocuments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$processor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/document-processor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/qdrant.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$processor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$processor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
// In-memory document registry (in production, use a database)
const documentRegistry = new Map();
const SKIP_REGISTRY_SYNC = process.env.QDRANT_SKIP_REGISTRY_SYNC === "true" || process.env.SKIP_REGISTRY_SYNC === "true";
async function ingestDocument(file, filename, docName, options = {}) {
    const { parserType = "unstructured", replaceDocId, metadata = {} } = options;
    const docId = replaceDocId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    try {
        // Ensure infrastructure is ready
        await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureCollection"])(),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureBucket"])()
        ]);
        // Update registry to show processing
        documentRegistry.set(docId, {
            docId,
            docName,
            originalPath: "",
            pageCount: 0,
            chunkCount: 0,
            parserUsed: parserType,
            status: "processing",
            createdAt: replaceDocId ? documentRegistry.get(docId)?.createdAt || new Date() : new Date(),
            updatedAt: new Date(),
            metadata
        });
        // If replacing, clean up old data
        if (replaceDocId) {
            console.log(`Replacing document: ${replaceDocId}`);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteVectorsByFilter"])({
                must: [
                    {
                        key: "doc_id",
                        match: {
                            value: replaceDocId
                        }
                    }
                ]
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteDocumentFiles"])(replaceDocId);
        }
        // Process the document
        const processed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$document$2d$processor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processDocument"])(file, filename, docName, parserType, docId);
        // Collect all chunks for embedding
        const allChunks = [];
        for (const page of processed.pages){
            for (const chunk of page.chunks){
                allChunks.push({
                    chunkId: chunk.chunkId,
                    text: chunk.text,
                    pageNumber: page.pageNumber,
                    chunkIndex: chunk.chunkIndex,
                    imageUrl: page.imageUrl
                });
            }
        }
        console.log(`Generating embeddings for ${allChunks.length} chunks...`);
        // Generate embeddings in batches
        const BATCH_SIZE = 100;
        const points = [];
        for(let i = 0; i < allChunks.length; i += BATCH_SIZE){
            const batch = allChunks.slice(i, i + BATCH_SIZE);
            const texts = batch.map((c)=>c.text);
            const embeddings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["embedTexts"])(texts);
            for(let j = 0; j < batch.length; j++){
                const chunk = batch[j];
                points.push({
                    id: chunk.chunkId,
                    vector: embeddings[j],
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
                        created_at: new Date().toISOString()
                    }
                });
            }
        }
        // Store vectors in Qdrant
        console.log(`Storing ${points.length} vectors in Qdrant...`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertVectors"])(points);
        // Update registry with final state
        const record = {
            docId,
            docName,
            originalPath: processed.originalPath,
            pageCount: processed.pages.length,
            chunkCount: processed.totalChunks,
            parserUsed: parserType,
            status: "ready",
            createdAt: replaceDocId ? documentRegistry.get(docId)?.createdAt || new Date() : new Date(),
            updatedAt: new Date(),
            metadata
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
            processedAt: new Date()
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
            error: error.message,
            parserUsed: parserType,
            processedAt: new Date()
        };
    }
}
async function archiveDocument(docId) {
    const record = documentRegistry.get(docId);
    if (record) {
        record.status = "archived";
        record.updatedAt = new Date();
    }
// Update vectors to archived status
// Note: Qdrant doesn't support bulk updates, so we'd need to re-upsert
// For now, we just update the registry
}
async function deleteDocument(docId) {
    // Delete from Qdrant
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteVectorsByFilter"])({
        must: [
            {
                key: "doc_id",
                match: {
                    value: docId
                }
            }
        ]
    });
    // Delete from MinIO
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteDocumentFiles"])(docId);
    // Remove from registry
    documentRegistry.delete(docId);
    console.log(`Deleted document: ${docId}`);
}
async function listDocuments() {
    if (!SKIP_REGISTRY_SYNC && documentRegistry.size === 0) {
        await syncRegistryFromQdrant();
    }
    return Array.from(documentRegistry.values()).sort((a, b)=>b.updatedAt.getTime() - a.updatedAt.getTime());
}
function getDocument(docId) {
    const record = documentRegistry.get(docId);
    return record;
}
async function initializeRegistry() {
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
 */ async function syncRegistryFromQdrant() {
    try {
        const qdrant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClient"])();
        const collection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$qdrant$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCollectionName"])();
        let offset = undefined;
        const aggregated = new Map();
        // Scroll through all points (chunks) and aggregate by doc_id
        // Assumes small doc counts typical for Phase 1; adjust limit if needed
        do {
            const { points, next_page_offset } = await qdrant.scroll(collection, {
                limit: 200,
                with_payload: true,
                with_vector: false,
                offset
            });
            for (const point of points){
                const payload = point.payload || {};
                const docId = payload.doc_id || "";
                if (!docId) continue;
                const docName = payload.doc_name || "Untitled";
                const pageNumber = Number(payload.page_number ?? 0);
                const parserUsed = payload.parser_used || "unstructured";
                const status = payload.status || "ready";
                const createdAtRaw = payload.created_at || undefined;
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
                        metadata: payload
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
            offset = next_page_offset || undefined;
        }while (offset !== undefined)
        // Replace in-memory registry
        documentRegistry.clear();
        for (const [docId, record] of aggregated.entries()){
            documentRegistry.set(docId, record);
        }
    } catch (error) {
        console.warn("Unable to sync registry from Qdrant, using in-memory only:", error.message);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/ingest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ingest.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function POST(req) {
    try {
        const formData = await req.formData();
        // Get file
        const file = formData.get("file");
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No file provided"
            }, {
                status: 400
            });
        }
        // Get document name
        const docName = formData.get("docName") || file.name;
        // Get parser type
        const parserType = formData.get("parserType") || "unstructured";
        if (![
            "gemini",
            "unstructured"
        ].includes(parserType)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid parser type. Use 'gemini' or 'unstructured'"
            }, {
                status: 400
            });
        }
        // Get optional parameters
        const replaceDocId = formData.get("replaceDocId");
        const docType = formData.get("docType");
        const topic = formData.get("topic");
        // Validate file type
        const allowedExtensions = [
            ".pdf",
            ".ppt",
            ".pptx",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
            ".md",
            ".html",
            ".htm",
            ".png",
            ".jpg",
            ".jpeg",
            ".tiff",
            ".bmp",
            ".heic"
        ];
        const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
        if (!allowedExtensions.includes(fileExt)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Unsupported file type: ${fileExt}. Allowed: ${allowedExtensions.join(", ")}`
            }, {
                status: 400
            });
        }
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Ingest the document
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestDocument"])(buffer, file.name, docName, {
            parserType,
            replaceDocId: replaceDocId || undefined,
            metadata: {
                docType: docType || undefined,
                topic: topic || undefined,
                status: "ready"
            }
        });
        if (result.status === "failed") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: result.error || "Ingestion failed",
                result
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: replaceDocId ? `Document replaced successfully` : `Document ingested successfully`,
            result
        });
    } catch (error) {
        console.error("Ingestion error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("docId");
        if (docId) {
            let doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDocument"])(docId);
            if (!doc) {
                // Try to rebuild registry from Qdrant in case of restart
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeRegistry"])();
                doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDocument"])(docId);
            }
            if (!doc) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Document not found"
                }, {
                    status: 404
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                document: doc
            });
        }
        const documents = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listDocuments"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            documents
        });
    } catch (error) {
        console.error("Error listing documents:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("docId");
        if (!docId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "docId is required"
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteDocument"])(docId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Document ${docId} deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting document:", error);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__eaf6f117._.js.map