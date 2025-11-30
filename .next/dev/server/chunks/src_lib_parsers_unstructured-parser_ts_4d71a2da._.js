module.exports = [
"[project]/src/lib/parsers/unstructured-parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UnstructuredParser",
    ()=>UnstructuredParser
]);
class UnstructuredParser {
    baseUrl;
    apiKey;
    constructor(){
        this.baseUrl = process.env.UNSTRUCTURED_URL || "";
        this.apiKey = process.env.UNSTRUCTURED_API_KEY || "";
    }
    async parse(file, filename) {
        if (!this.baseUrl) {
            throw new Error("UNSTRUCTURED_URL not set. Please configure the Unstructured API endpoint.");
        }
        if (!this.apiKey) {
            throw new Error("UNSTRUCTURED_API_KEY not set. Please configure the API key.");
        }
        const ext = filename.toLowerCase().split(".").pop();
        if (ext !== "pdf") {
            throw new Error(`Unsupported file type: ${ext}. Only PDF is supported.`);
        }
        console.log(`Processing document with Unstructured API: ${filename}`);
        // Build form data
        const formData = new FormData();
        formData.append("files", new Blob([
            new Uint8Array(file)
        ]), filename);
        formData.append("strategy", "hi_res"); // High-resolution extraction
        // Make API request
        const response = await fetch(`${this.baseUrl}/general/v0/general`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "unstructured-api-key": this.apiKey
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Unstructured API error: HTTP ${response.status}: ${errorText.slice(0, 500)}`);
        }
        const elements = await response.json();
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
        // Handle edge case: no pages extracted
        if (pages.length === 0) {
            console.warn("No pages extracted from document");
            pages.push({
                pageNumber: 1,
                text: "[No text extracted from document]",
                imageBuffer: undefined
            });
        }
        console.log(`Successfully processed ${pages.length} pages`);
        return {
            pages,
            metadata: {
                pageCount: pages.length,
                parserUsed: "unstructured"
            }
        };
    }
}
}),
];

//# sourceMappingURL=src_lib_parsers_unstructured-parser_ts_4d71a2da._.js.map