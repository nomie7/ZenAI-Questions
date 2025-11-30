module.exports = [
"[externals]/pdf-to-img [external] (pdf-to-img, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pdf-to-img");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/parsers/docling-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DoclingParser",
    ()=>DoclingParser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pdf-to-img [external] (pdf-to-img, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class DoclingParser {
    baseUrl;
    pageTimeout;
    pollInterval;
    constructor(){
        // Extract base URL (remove any path like /v1/convert/file)
        const configuredUrl = process.env.DOCLING_SERVE_URL || process.env.DOCLING_ENDPOINT || "";
        this.baseUrl = configuredUrl.replace(/\/v1\/convert\/file\/?$/, "");
        // Timeout per page in seconds (default 120s for async)
        this.pageTimeout = Number(process.env.DOCLING_PAGE_TIMEOUT) || 120;
        // Poll interval in ms (default 2s)
        this.pollInterval = Number(process.env.DOCLING_POLL_INTERVAL) || 2000;
    }
    async parse(file, filename) {
        if (!this.baseUrl) {
            throw new Error("DOCLING_SERVE_URL not set. Please configure the docling-serve endpoint.");
        }
        const ext = filename.toLowerCase().split(".").pop();
        if (ext !== "pdf") {
            throw new Error(`Unsupported file type: ${ext}. Only PDF is supported.`);
        }
        // First, get the total page count using pdf-to-img
        const pageCount = await this.getPageCount(file);
        console.log(`Document has ${pageCount} pages. Processing page-by-page...`);
        const pages = [];
        const errors = [];
        // Process each page individually
        for(let pageNum = 1; pageNum <= pageCount; pageNum++){
            try {
                console.log(`Processing page ${pageNum}/${pageCount}...`);
                const pageText = await this.processPage(file, filename, pageNum);
                pages.push({
                    pageNumber: pageNum,
                    text: pageText,
                    imageBuffer: undefined
                });
            } catch (error) {
                const errorMsg = `Page ${pageNum}: ${error.message}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                // Add empty page with error note
                pages.push({
                    pageNumber: pageNum,
                    text: `[Error processing page ${pageNum}]`,
                    imageBuffer: undefined
                });
            }
        }
        // If all pages failed, throw an error
        if (errors.length === pageCount) {
            throw new Error(`Failed to process all ${pageCount} pages. Errors: ${errors.join("; ")}`);
        }
        // Log summary
        if (errors.length > 0) {
            console.warn(`Completed with ${errors.length}/${pageCount} page errors: ${errors.join("; ")}`);
        } else {
            console.log(`Successfully processed all ${pageCount} pages.`);
        }
        return {
            pages,
            metadata: {
                pageCount: pages.length,
                parserUsed: "docling"
            }
        };
    }
    /**
   * Get the total page count using pdf-to-img
   */ async getPageCount(file) {
        let count = 0;
        const document = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__["pdf"])(file, {
            scale: 0.5
        }); // Low scale for speed
        for await (const _ of document){
            count++;
        }
        return count;
    }
    /**
   * Process a single page using docling-serve (async mode with polling)
   */ async processPage(file, filename, pageNum) {
        // Step 1: Submit async task
        const taskId = await this.submitTask(file, filename, pageNum);
        console.log(`  Page ${pageNum}: Task submitted (${taskId})`);
        // Step 2: Poll for completion
        await this.waitForCompletion(taskId, pageNum);
        // Step 3: Get result
        const result = await this.getResult(taskId);
        return this.extractText(result, pageNum);
    }
    /**
   * Submit async conversion task
   */ async submitTask(file, filename, pageNum) {
        const formData = new FormData();
        // Add the file
        formData.append("files", new Blob([
            new Uint8Array(file)
        ]), filename);
        // Request only this page
        formData.append("page_range", String(pageNum));
        formData.append("page_range", String(pageNum));
        // Request markdown output
        formData.append("to_formats", "md");
        // Set timeout
        formData.append("document_timeout", String(this.pageTimeout));
        const response = await fetch(`${this.baseUrl}/v1/convert/file/async`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Submit failed: HTTP ${response.status}: ${errorText.slice(0, 200)}`);
        }
        const data = await response.json();
        const taskId = data.task_id;
        if (!taskId) {
            throw new Error(`No task_id in response: ${JSON.stringify(data).slice(0, 200)}`);
        }
        return taskId;
    }
    /**
   * Poll until task is complete
   */ async waitForCompletion(taskId, pageNum) {
        const startTime = Date.now();
        const timeoutMs = this.pageTimeout * 1000;
        while(true){
            // Check timeout
            if (Date.now() - startTime > timeoutMs) {
                throw new Error(`Timeout waiting for task ${taskId}`);
            }
            const response = await fetch(`${this.baseUrl}/v1/status/poll/${taskId}`);
            if (!response.ok) {
                // 404 might mean task is still processing
                if (response.status === 404) {
                    await this.sleep(this.pollInterval);
                    continue;
                }
                throw new Error(`Poll failed: HTTP ${response.status}`);
            }
            const data = await response.json();
            const status = data.status;
            if (status === "completed" || status === "success") {
                console.log(`  Page ${pageNum}: Completed`);
                return;
            }
            if (status === "failed" || status === "error") {
                const error = data.error || data.message || "Unknown error";
                throw new Error(`Task failed: ${error}`);
            }
            // Still processing, wait and poll again
            await this.sleep(this.pollInterval);
        }
    }
    /**
   * Get task result
   */ async getResult(taskId) {
        const response = await fetch(`${this.baseUrl}/v1/result/${taskId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Get result failed: HTTP ${response.status}: ${errorText.slice(0, 200)}`);
        }
        return await response.json();
    }
    /**
   * Sleep helper
   */ sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    /**
   * Extract text from docling-serve response
   */ extractText(data, pageNum) {
        // Try multiple paths to find the content
        // Path 1: { document: { md_content: "..." } }
        const doc = data.document;
        if (doc?.md_content) {
            return doc.md_content.trim();
        }
        // Path 2: { documents: [{ md_content: "..." }] }
        const docs = data.documents;
        if (docs?.[0]?.md_content) {
            return docs[0].md_content.trim();
        }
        // Path 3: Direct md_content at root
        if (data.md_content) {
            return data.md_content.trim();
        }
        // Path 4: Check for text or content fields
        if (doc?.text) {
            return doc.text.trim();
        }
        if (doc?.content) {
            return doc.content.trim();
        }
        // Path 5: Look for output field
        if (data.output) {
            const output = data.output;
            if (output.md) return output.md.trim();
            if (output.text) return output.text.trim();
        }
        console.warn(`Unexpected response structure for page ${pageNum}:`, JSON.stringify(data).slice(0, 500));
        return `[No text extracted from page ${pageNum}]`;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__670ec7ed._.js.map