/**
 * Direct database check for image URLs
 * Run with: bun run scripts/check-db-images.ts
 */

import { QdrantClient } from "@qdrant/js-client-rest";

async function checkDatabase() {
    console.log("\n🔍 Checking Qdrant Database for Image URLs\n");
    console.log("=".repeat(60));

    const client = new QdrantClient({
        url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    const collectionName = process.env.QDRANT_COLLECTION_NAME || "knowledge_base_dev";

    try {
        // 1. Get collection info
        console.log("\n1️⃣  Checking collection info...");
        const collectionInfo = await client.getCollection(collectionName);
        console.log(`Collection: ${collectionName}`);
        console.log(`Total points: ${collectionInfo.points_count}`);
        console.log(`Vector size: ${collectionInfo.config.params.vectors?.size}`);

        if (collectionInfo.points_count === 0) {
            console.log("\n❌ Collection is empty! No documents have been ingested.");
            return;
        }

        // 2. Scroll through first 10 points to inspect data
        console.log("\n2️⃣  Inspecting first 10 points...");
        const scrollResult = await client.scroll(collectionName, {
            limit: 10,
            with_payload: true,
            with_vector: false,
        });

        console.log(`\nFound ${scrollResult.points.length} points to inspect:\n`);

        for (let i = 0; i < scrollResult.points.length; i++) {
            const point = scrollResult.points[i];
            const payload = point.payload as Record<string, unknown>;

            console.log(`\n--- Point ${i + 1} (ID: ${point.id}) ---`);
            console.log(`Doc Name: ${payload.doc_name}`);
            console.log(`Page: ${payload.page_number}`);
            console.log(`Chunk Index: ${payload.chunk_index}`);
            console.log(`Image URL: ${payload.image_url || "(empty)"}`);

            if (payload.image_url) {
                const imageUrl = String(payload.image_url);
                console.log(`  ✅ Has image URL (${imageUrl.length} chars)`);
                console.log(`  Preview: ${imageUrl.substring(0, 80)}...`);
            } else {
                console.log(`  ❌ No image URL stored`);
            }

            console.log(`Text preview: ${String(payload.text).substring(0, 100)}...`);
        }

        // 3. Count how many points have image URLs
        console.log("\n3️⃣  Analyzing image URL coverage...");
        let totalPoints = 0;
        let pointsWithImages = 0;
        let pointsWithoutImages = 0;

        const allPoints = await client.scroll(collectionName, {
            limit: 100,
            with_payload: true,
            with_vector: false,
        });

        for (const point of allPoints.points) {
            totalPoints++;
            const payload = point.payload as Record<string, unknown>;
            if (payload.image_url && String(payload.image_url).length > 0) {
                pointsWithImages++;
            } else {
                pointsWithoutImages++;
            }
        }

        console.log(`\nTotal points checked: ${totalPoints}`);
        console.log(`Points with image URLs: ${pointsWithImages} (${((pointsWithImages / totalPoints) * 100).toFixed(1)}%)`);
        console.log(`Points without image URLs: ${pointsWithoutImages} (${((pointsWithoutImages / totalPoints) * 100).toFixed(1)}%)`);

        // 4. Try to generate a signed URL
        if (pointsWithImages > 0) {
            console.log("\n4️⃣  Testing signed URL generation...");
            const samplePoint = allPoints.points.find(p => (p.payload as Record<string, unknown>).image_url);
            if (samplePoint) {
                const imageUrl = String((samplePoint.payload as Record<string, unknown>).image_url);
                console.log(`Sample MinIO path: ${imageUrl}`);

                try {
                    const { getSignedUrl } = await import("../src/lib/storage");
                    const signedUrl = await getSignedUrl(imageUrl, 3600);
                    console.log(`✅ Successfully generated signed URL`);
                    console.log(`Signed URL length: ${signedUrl.length} chars`);
                    console.log(`URL preview: ${signedUrl.substring(0, 100)}...`);

                    // Test if it's a valid URL
                    try {
                        const urlObj = new URL(signedUrl);
                        console.log(`✅ Valid URL format`);
                        console.log(`Protocol: ${urlObj.protocol}`);
                        console.log(`Host: ${urlObj.host}`);
                    } catch {
                        console.log(`❌ Invalid URL format`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to generate signed URL:`, error);
                }
            }
        }

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log("\n📊 SUMMARY\n");

        if (pointsWithImages === 0) {
            console.log("❌ PROBLEM: No image URLs in database");
            console.log("\n🔧 SOLUTION:");
            console.log("   Documents were ingested without images.");
            console.log("   You need to re-ingest your documents to get images.");
            console.log("   The parser should generate images during ingestion.");
        } else if (pointsWithImages < totalPoints) {
            console.log("⚠️  PARTIAL: Some chunks have images, some don't");
            console.log(`   ${pointsWithImages}/${totalPoints} chunks have image URLs`);
        } else {
            console.log("✅ SUCCESS: All chunks have image URLs");
        }

        console.log("\n" + "=".repeat(60) + "\n");

    } catch (error) {
        console.error("\n❌ Error accessing database:", error);
        console.log("\nPossible issues:");
        console.log("- Qdrant is not running (check docker-compose)");
        console.log("- Wrong QDRANT_URL in .env file");
        console.log("- Collection doesn't exist yet");
    }
}

checkDatabase()
    .then(() => {
        console.log("✅ Check completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Check failed:", error);
        process.exit(1);
    });
