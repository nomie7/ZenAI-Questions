module.exports = [
"[externals]/pdf-to-img [external] (pdf-to-img, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pdf-to-img");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/parsers/unstructured-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "UnstructuredParser",
    ()=>UnstructuredParser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pdf-to-img [external] (pdf-to-img, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
/**
 * Supported file types for Unstructured API
 */ const SUPPORTED_EXTENSIONS = [
    "pdf",
    "ppt",
    "pptx",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
    "md",
    "html",
    "htm",
    "png",
    "jpg",
    "jpeg",
    "tiff",
    "bmp",
    "heic"
];
class UnstructuredParser {
    baseUrl;
    apiKey;
    timeout;
    constructor(){
        this.baseUrl = process.env.UNSTRUCTURED_URL || "";
        this.apiKey = process.env.UNSTRUCTURED_API_KEY || "";
        // Timeout in ms (default 5 minutes for large documents)
        this.timeout = Number(process.env.UNSTRUCTURED_TIMEOUT) || 300000;
    }
    async parse(file, filename) {
        if (!this.baseUrl) {
            throw new Error("UNSTRUCTURED_URL not set. Please configure the Unstructured API endpoint.");
        }
        if (!this.apiKey) {
            throw new Error("UNSTRUCTURED_API_KEY not set. Please configure the API key.");
        }
        const ext = filename.toLowerCase().split(".").pop() || "";
        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
            throw new Error(`Unsupported file type: ${ext}. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`);
        }
        const isPdf = ext === "pdf";
        console.log(`Processing ${ext.toUpperCase()} with Unstructured API: ${filename}`);
        // For PDFs, process page-by-page (avoids timeout on large docs)
        if (isPdf) {
            return this.processPdfPageByPage(file, filename);
        }
        // For other formats, process whole document
        return this.processWholeDocument(file, filename);
    }
    /**
   * Process PDF page-by-page to avoid timeouts on large documents
   */ async processPdfPageByPage(file, filename) {
        const pages = [];
        const errors = [];
        // Extract page images
        const pageImages = await this.extractPdfPageImages(file);
        console.log(`Extracted ${pageImages.size} page images`);
        if (pageImages.size === 0) {
            throw new Error("Failed to extract any pages from PDF");
        }
        // Process each page image through Unstructured
        for (const [pageNum, imageBuffer] of pageImages){
            try {
                console.log(`Processing page ${pageNum}/${pageImages.size}...`);
                const elements = await this.callUnstructuredApi(imageBuffer, `page_${pageNum}.png`);
                const texts = elements.filter((el)=>el.text && el.text.trim()).map((el)=>el.text.trim());
                pages.push({
                    pageNumber: pageNum,
                    text: texts.join("\n\n") || `[No text extracted from page ${pageNum}]`,
                    imageBuffer
                });
            } catch (error) {
                const errorMsg = `Page ${pageNum}: ${error.message}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                // Add page with error note but keep the image
                pages.push({
                    pageNumber: pageNum,
                    text: `[Error processing page ${pageNum}]`,
                    imageBuffer
                });
            }
        }
        // Log summary
        if (errors.length > 0) {
            console.warn(`Completed with ${errors.length}/${pageImages.size} errors`);
        } else {
            console.log(`Successfully processed all ${pageImages.size} pages`);
        }
        return {
            pages,
            metadata: {
                pageCount: pages.length,
                parserUsed: "unstructured"
            }
        };
    }
    /**
   * Process non-PDF documents as a whole
   */ async processWholeDocument(file, filename) {
        const elements = await this.callUnstructuredApi(file, filename);
        console.log(`Received ${elements.length} elements from Unstructured API`);
        // Group elements by page number
        const pageMap = new Map();
        for (const element of elements){
            const pageNum = element.metadata?.page_number ?? 1;
            if (!pageMap.has(pageNum)) {
                pageMap.set(pageNum, []);
            }
            if (element.text && element.text.trim()) {
                pageMap.get(pageNum).push(element.text.trim());
            }
        }
        // Convert to pages array
        const pages = [];
        const sortedPageNums = Array.from(pageMap.keys()).sort((a, b)=>a - b);
        for (const pageNum of sortedPageNums){
            const texts = pageMap.get(pageNum) || [];
            pages.push({
                pageNumber: pageNum,
                text: texts.join("\n\n"),
                imageBuffer: undefined
            });
        }
        // Handle edge case
        if (pages.length === 0) {
            console.warn("No pages extracted from document");
            pages.push({
                pageNumber: 1,
                text: "[No text extracted from document]",
                imageBuffer: undefined
            });
        }
        console.log(`Successfully processed ${pages.length} pages/slides`);
        return {
            pages,
            metadata: {
                pageCount: pages.length,
                parserUsed: "unstructured"
            }
        };
    }
    /**
   * Extract page images from PDF using pdf-to-img
   */ async extractPdfPageImages(file) {
        const pageImages = new Map();
        try {
            const document = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__["pdf"])(file, {
                scale: 1.5
            }); // Good balance of quality/size
            let pageNumber = 0;
            for await (const imageBuffer of document){
                pageNumber++;
                pageImages.set(pageNumber, Buffer.from(imageBuffer));
            }
        } catch (error) {
            console.warn("Failed to extract PDF page images:", error.message);
        // Continue without images - text extraction will still work
        }
        return pageImages;
    }
    /**
   * Call Unstructured API with timeout handling
   */ async callUnstructuredApi(file, filename) {
        // Build form data
        const formData = new FormData();
        formData.append("files", new Blob([
            new Uint8Array(file)
        ]), filename);
        formData.append("strategy", "hi_res"); // High-resolution extraction
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), this.timeout);
        try {
            const response = await fetch(`${this.baseUrl}/general/v0/general`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "unstructured-api-key": this.apiKey
                },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                // Handle Cloudflare timeout specifically
                if (response.status === 524) {
                    throw new Error(`Document processing timed out (Cloudflare 524). The document may be too large. ` + `Try a smaller document or increase server timeout.`);
                }
                throw new Error(`Unstructured API error: HTTP ${response.status}: ${errorText.slice(0, 300)}`);
            }
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
                throw new Error(`Document processing timed out after ${this.timeout / 1000}s. ` + `Try a smaller document or increase UNSTRUCTURED_TIMEOUT.`);
            }
            throw error;
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__83448503._.js.map