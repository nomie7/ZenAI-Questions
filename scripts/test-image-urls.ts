/**
 * Test script to diagnose image URL issues in citations
 * Run with: bun run scripts/test-image-urls.ts
 */

import { retrieveContext } from "../src/lib/retrieval";
import { getSignedUrl } from "../src/lib/storage";
import { formatAgentContextForLLM } from "../src/lib/agentic-retrieval";
import type { AgentRetrievalResult } from "../src/lib/agentic-retrieval";

async function testImageURLs() {
    console.log("\n🔍 Testing Image URL Flow\n");
    console.log("=".repeat(60));

    // Step 1: Test retrieval
    console.log("\n1️⃣  Testing retrieval from database...");
    const testQuery = "test"; // Simple query
    const chunks = await retrieveContext(testQuery, { topK: 3 });

    if (chunks.length === 0) {
        console.log("❌ No chunks retrieved. Please ingest some documents first.");
        return;
    }

    console.log(`✅ Retrieved ${chunks.length} chunks`);

    // Step 2: Inspect chunk data
    console.log("\n2️⃣  Inspecting first chunk data...");
    const firstChunk = chunks[0];
    console.log({
        docId: firstChunk.docId,
        docName: firstChunk.docName,
        pageNumber: firstChunk.pageNumber,
        imageUrl: firstChunk.imageUrl,
        imageUrlLength: firstChunk.imageUrl?.length || 0,
        textPreview: firstChunk.text.substring(0, 100) + "...",
    });

    // Step 3: Test signed URL generation
    console.log("\n3️⃣  Testing signed URL generation...");

    for (let i = 0; i < Math.min(3, chunks.length); i++) {
        const chunk = chunks[i];
        console.log(`\nChunk ${i + 1}:`);
        console.log(`  S3 Path: ${chunk.imageUrl || "(empty)"}`);

        if (chunk.imageUrl) {
            try {
                const signedUrl = await getSignedUrl(chunk.imageUrl, 3600);
                console.log(`  ✅ Signed URL generated: ${signedUrl.substring(0, 80)}...`);
                console.log(`  Length: ${signedUrl.length} chars`);

                // Check if it's a valid URL
                try {
                    new URL(signedUrl);
                    console.log(`  ✅ Valid URL format`);
                } catch {
                    console.log(`  ❌ Invalid URL format`);
                }
            } catch (error) {
                console.log(`  ❌ Failed to generate signed URL:`, error);
            }
        } else {
            console.log(`  ⚠️  No imageUrl in database`);
        }
    }

    // Step 4: Test formatAgentContextForLLM
    console.log("\n4️⃣  Testing context formatting for LLM...");

    const mockAgentResult: AgentRetrievalResult = {
        chunks: chunks.slice(0, 2),
        iterations: 1,
        queryAnalysis: {
            originalQuery: testQuery,
            intent: "test",
            keyEntities: [],
            subQuestions: [],
            isMultiPart: false,
            searchQueries: [testQuery],
        },
        reflections: [],
        finalConfidence: 0.9,
        searchQueries: [testQuery],
    };

    try {
        const contextText = await formatAgentContextForLLM(mockAgentResult);
        console.log("\n✅ Context formatted successfully");
        console.log("\nContext preview (first 500 chars):");
        console.log(contextText.substring(0, 500));

        // Check if Image URL appears in context
        if (contextText.includes("Image URL:")) {
            console.log("\n✅ Image URLs found in context");

            // Extract and display Image URLs
            const imageUrlMatches = contextText.match(/Image URL: (https?:\/\/[^\n]+)/g);
            if (imageUrlMatches) {
                console.log(`\n📸 Found ${imageUrlMatches.length} image URL(s) in context:`);
                imageUrlMatches.forEach((match, i) => {
                    const url = match.replace("Image URL: ", "");
                    console.log(`  ${i + 1}. ${url.substring(0, 80)}...`);
                });
            }
        } else {
            console.log("\n⚠️  No Image URLs found in context");
        }
    } catch (error) {
        console.log("\n❌ Context formatting failed:", error);
    }

    // Step 5: Summary and recommendations
    console.log("\n" + "=".repeat(60));
    console.log("\n📋 DIAGNOSIS SUMMARY\n");

    const hasImageUrls = chunks.some(c => c.imageUrl);
    const canGenerateSignedUrls = chunks.some(async c => {
        if (!c.imageUrl) return false;
        try {
            await getSignedUrl(c.imageUrl, 3600);
            return true;
        } catch {
            return false;
        }
    });

    if (!hasImageUrls) {
        console.log("❌ ISSUE: No image URLs in database");
        console.log("   → Check if documents were ingested with images");
        console.log("   → Verify uploadPageImage is being called during ingestion");
    } else {
        console.log("✅ Image URLs exist in database");
    }

    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Check browser console for 'ImageViewer - Image URL:' logs");
    console.log("2. Verify the URL in the log is a valid https:// URL");
    console.log("3. Try accessing the URL directly in the browser");
    console.log("4. Check S3 credentials and CORS settings");

    console.log("\n" + "=".repeat(60) + "\n");
}

// Run the test
testImageURLs()
    .then(() => {
        console.log("✅ Test completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
