module.exports = [
"[externals]/pdf-to-img [external] (pdf-to-img, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pdf-to-img");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/parsers/basic-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "BasicParser",
    ()=>BasicParser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pdf-to-img [external] (pdf-to-img, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class BasicParser {
    async parse(file, filename) {
        const ext = filename.toLowerCase().split(".").pop();
        if (ext !== "pdf") {
            throw new Error(`Unsupported file type: ${ext}. Only PDF is supported.`);
        }
        const pages = [];
        try {
            // Convert PDF pages to images using pdf-to-img
            const document = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$to$2d$img__$5b$external$5d$__$28$pdf$2d$to$2d$img$2c$__esm_import$29$__["pdf"])(file, {
                scale: 2.0
            });
            let pageNumber = 0;
            for await (const image of document){
                pageNumber++;
                // pdf-to-img returns PNG buffers
                const imageBuffer = Buffer.from(image);
                // For basic parser, we'll extract text from the PDF metadata if available
                // The actual text extraction is limited - use Gemini parser for better OCR
                pages.push({
                    pageNumber,
                    text: `[Page ${pageNumber} - Use Gemini parser for text extraction]`,
                    imageBuffer
                });
            }
            // Try to extract actual text using a simple approach
            // We'll enhance this with proper text extraction
            const textPages = await this.extractTextFromPdf(file);
            for(let i = 0; i < pages.length && i < textPages.length; i++){
                if (textPages[i].trim()) {
                    pages[i].text = textPages[i];
                }
            }
            return {
                pages,
                metadata: {
                    pageCount: pages.length,
                    parserUsed: "basic"
                }
            };
        } catch (error) {
            console.error("Error parsing PDF:", error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }
    /**
   * Extract text from PDF using basic string matching
   * This is a fallback - use Gemini for better extraction
   */ async extractTextFromPdf(buffer) {
        // Simple text extraction from PDF buffer
        // This looks for text streams in the PDF
        const content = buffer.toString("latin1");
        const pages = [];
        // Find text between BT (begin text) and ET (end text) markers
        const textMatches = content.match(/BT[\s\S]*?ET/g) || [];
        let currentPageText = "";
        let pageBreakCount = 0;
        for (const match of textMatches){
            // Extract text from Tj and TJ operators
            const tjMatches = match.match(/\(([^)]*)\)\s*Tj/g) || [];
            const tjArrayMatches = match.match(/\[([^\]]*)\]\s*TJ/g) || [];
            for (const tj of tjMatches){
                const text = tj.match(/\(([^)]*)\)/)?.[1] || "";
                currentPageText += this.decodeText(text) + " ";
            }
            for (const tjArray of tjArrayMatches){
                const items = tjArray.match(/\(([^)]*)\)/g) || [];
                for (const item of items){
                    const text = item.match(/\(([^)]*)\)/)?.[1] || "";
                    currentPageText += this.decodeText(text);
                }
                currentPageText += " ";
            }
            // Check for page breaks (simplified detection)
            if (match.includes("showpage") || match.includes("Page")) {
                pageBreakCount++;
                if (currentPageText.trim()) {
                    pages.push(currentPageText.trim());
                    currentPageText = "";
                }
            }
        }
        // Add remaining text as last page
        if (currentPageText.trim()) {
            pages.push(currentPageText.trim());
        }
        return pages;
    }
    /**
   * Decode PDF text encoding
   */ decodeText(text) {
        // Handle common PDF escape sequences
        return text.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/parsers/docling-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DoclingParser",
    ()=>DoclingParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$basic$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parsers/basic-parser.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$basic$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$basic$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class DoclingParser {
    async parse(file, filename) {
        const endpoint = process.env.DOCLING_SERVE_URL || process.env.DOCLING_ENDPOINT || "";
        if (!endpoint) {
            console.warn("DOCLING_SERVE_URL not set. Falling back to BasicParser for this ingest.");
            return this.fallbackToBasic(file, filename);
        }
        try {
            const formData = new FormData();
            // docling-serve expects "files" (plural)
            formData.append("files", new Blob([
                file
            ]), filename);
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Docling-serve responded with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            // docling-serve returns { document: { md_content, pages, ... } } or { documents: [...] }
            const doc = data.document || data.documents?.[0] || data;
            // Extract markdown content or text
            const mdContent = doc.md_content || doc.text || doc.content || "";
            // Try to get pages array, or create single page from markdown
            const rawPages = doc.pages || [];
            let pages;
            if (rawPages.length > 0) {
                pages = rawPages.map((p, idx)=>{
                    const page = p;
                    return {
                        pageNumber: Number(page.page_no ?? page.pageNumber ?? page.page ?? idx + 1) || idx + 1,
                        text: page.text || page.content || page.md_content || "",
                        imageBuffer: undefined
                    };
                });
            } else if (mdContent) {
                // If no pages array but we have markdown, split by page breaks or treat as single page
                const pageTexts = mdContent.split(/<!-- page-break -->|\n---\n/).filter(Boolean);
                pages = pageTexts.map((text, idx)=>({
                        pageNumber: idx + 1,
                        text: text.trim(),
                        imageBuffer: undefined
                    }));
            } else {
                pages = [];
            }
            return {
                pages,
                metadata: {
                    pageCount: pages.length,
                    parserUsed: "docling",
                    title: doc.title || undefined,
                    author: doc.author || undefined
                }
            };
        } catch (error) {
            console.warn("Docling-serve unavailable; falling back to BasicParser. Error:", error.message);
            return this.fallbackToBasic(file, filename);
        }
    }
    async fallbackToBasic(file, filename) {
        const basic = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsers$2f$basic$2d$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BasicParser"]();
        const parsed = await basic.parse(file, filename);
        return {
            ...parsed,
            metadata: {
                ...parsed.metadata,
                parserUsed: "docling"
            }
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__17838ad0._.js.map