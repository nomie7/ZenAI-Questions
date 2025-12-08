#!/usr/bin/env bun
/**
 * Migration script to recreate Qdrant collection with BM25 inference support
 * 
 * This script will:
 * 1. Check if the old collection exists
 * 2. Optionally backup collection info
 * 3. Delete the old collection
 * 4. Create new collection with BM25 inference configuration
 * 
 * Usage:
 *   bun run scripts/migrate-to-bm25.ts [--backup]
 */

import { getClient, getCollectionName } from "../src/lib/qdrant";

const BACKUP_COLLECTION = process.argv.includes("--backup");

async function migrateCollection() {
  const qdrant = getClient();
  const collectionName = getCollectionName();

  console.log(`\n🔍 Checking collection: ${collectionName}`);

  try {
    // Check if collection exists
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`✅ Collection does not exist. Will be created on next ingest.`);
      process.exit(0);
    }

    // Get collection info
    const collectionInfo = await qdrant.getCollection(collectionName);
    console.log(`\n📊 Current collection info:`, JSON.stringify(collectionInfo, null, 2));

    // Check if it already has the new schema
    const config = collectionInfo.config as any;
    const hasSparseModifier = config?.params?.sparse_vectors?.text?.modifier;
    
    if (hasSparseModifier) {
      console.log(`\n✅ Collection already configured with BM25 modifier.`);
      console.log(`No migration needed!`);
      process.exit(0);
    }

    console.log(`\n⚠️  Collection needs migration to BM25 inference schema.`);
    console.log(`\nThis will:`);
    console.log(`  1. Delete the current collection and ALL data`);
    console.log(`  2. Next ingest will auto-create with new schema`);
    console.log(`  3. You'll need to re-ingest all documents`);

    if (BACKUP_COLLECTION) {
      console.log(`\n💾 Backup requested, but automatic backup not implemented.`);
      console.log(`To backup manually, use the Qdrant API to scroll and export points.`);
    }

    // Prompt for confirmation
    console.log(`\n⚠️  DESTRUCTIVE OPERATION: Delete collection "${collectionName}"?`);
    console.log(`Type 'yes' to continue, or Ctrl+C to cancel:`);

    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    const confirmation = await new Promise<string>((resolve) => {
      let input = "";
      process.stdin.on("data", (key) => {
        const char = key.toString();
        if (char === "\r" || char === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          resolve(input);
        } else if (char === "\u0003") {
          // Ctrl+C
          console.log(`\n\n❌ Cancelled.`);
          process.exit(0);
        } else {
          input += char;
          process.stdout.write(char);
        }
      });
    });

    if (confirmation.trim().toLowerCase() !== "yes") {
      console.log(`\n❌ Migration cancelled.`);
      process.exit(0);
    }

    // Delete collection
    console.log(`\n🗑️  Deleting collection...`);
    await qdrant.deleteCollection(collectionName);
    console.log(`✅ Collection deleted successfully.`);

    console.log(`\n✅ Migration complete!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run: bun run scripts/ingest-pdf.ts <your-pdf-file>`);
    console.log(`  2. Collection will be auto-created with BM25 inference`);
    console.log(`  3. Re-ingest all your documents`);
    console.log(`\nSee docs/BM25_IMPLEMENTATION.md for details.`);

  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  }
}

// Run migration
migrateCollection();
