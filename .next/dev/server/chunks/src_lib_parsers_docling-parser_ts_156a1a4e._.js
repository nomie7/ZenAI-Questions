module.exports = [
"[project]/src/lib/parsers/docling-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DoclingParser",
    ()=>DoclingParser
]);
class DoclingParser {
    async parse(file, filename) {
        const endpoint = process.env.DOCLING_SERVE_URL || process.env.DOCLING_ENDPOINT || "";
        if (!endpoint) {
            throw new Error("DOCLING_SERVE_URL not set. Please configure the docling-serve endpoint.");
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
            throw new Error(`Docling-serve failed: ${error.message}`);
        }
    }
}
}),
];

//# sourceMappingURL=src_lib_parsers_docling-parser_ts_156a1a4e._.js.map