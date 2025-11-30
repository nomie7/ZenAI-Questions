#!/usr/bin/env bun

/**
 * CLI script to ingest PDF documents into the knowledge base
 *
 * Usage:
 *   bun run scripts/ingest-pdf.ts ./path/to/doc.pdf "Document Name" --parser=basic
 *   bun run scripts/ingest-pdf.ts ./path/to/doc.pdf "Document Name" --parser=gemini
 *   bun run scripts/ingest-pdf.ts ./path/to/doc.pdf "Document Name" --parser=docling
 *   bun run scripts/ingest-pdf.ts ./path/to/doc.pdf "Document Name" --parser=basic --type=SOP --topic=HR
 *
 * Options:
 *   --parser    Parser type: "basic" (default), "gemini", or "docling"
 *   --type      Document type (e.g., SOP, FAQ, Manual)
 *   --topic     Topic/category for filtering
 *   --replace   Document ID to replace
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { basename } from "path";
import { ingestDocument, type IngestOptions } from "../src/lib/ingest";
import type { ParserType } from "../src/lib/parsers";

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printUsage() {
  log("\nUsage:", "cyan");
  log(
    '  bun run scripts/ingest-pdf.ts <file-path> "Document Name" [options]\n'
  );
  log("Arguments:", "cyan");
  log("  file-path       Path to the PDF file to ingest");
  log('  Document Name   Human-readable name for the document\n');
  log("Options:", "cyan");
  log('  --parser=TYPE   Parser type: "basic" (default), "gemini", or "docling"');
  log("  --type=TYPE     Document type (e.g., SOP, FAQ, Manual)");
  log("  --topic=TOPIC   Topic/category for filtering");
  log("  --replace=ID    Document ID to replace\n");
  log("Examples:", "cyan");
  log(
    '  bun run scripts/ingest-pdf.ts ./docs/manual.pdf "Employee Manual" --parser=basic'
  );
  log(
    '  bun run scripts/ingest-pdf.ts ./scanned.pdf "Scanned Doc" --parser=gemini'
  );
  log(
    '  bun run scripts/ingest-pdf.ts ./hr.pdf "HR Policy" --type=SOP --topic=HR\n'
  );
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const positionalArgs: string[] = [];
  const options: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      options[key] = value || "true";
    } else if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else {
      positionalArgs.push(arg);
    }
  }

  // Validate required arguments
  if (positionalArgs.length < 2) {
    log("Error: Missing required arguments", "red");
    printUsage();
    process.exit(1);
  }

  const [filePath, docName] = positionalArgs;
  const parserType = (options.parser || "basic") as ParserType;
  const docType = options.type;
  const topic = options.topic;
  const replaceDocId = options.replace;

  // Validate parser type
  if (!["basic", "gemini", "docling"].includes(parserType)) {
    log(`Error: Invalid parser type "${parserType}"`, "red");
    log('Use "basic", "gemini", or "docling"', "yellow");
    process.exit(1);
  }

  // Validate file exists
  if (!existsSync(filePath)) {
    log(`Error: File not found: ${filePath}`, "red");
    process.exit(1);
  }

  // Validate file extension
  if (!filePath.toLowerCase().endsWith(".pdf")) {
    log("Error: Only PDF files are supported", "red");
    process.exit(1);
  }

  log("\n========================================", "cyan");
  log("   PDF Document Ingestion", "cyan");
  log("========================================\n", "cyan");

  log(`File: ${filePath}`, "blue");
  log(`Name: ${docName}`, "blue");
  log(`Parser: ${parserType}`, "blue");
  if (docType) log(`Type: ${docType}`, "blue");
  if (topic) log(`Topic: ${topic}`, "blue");
  if (replaceDocId) log(`Replacing: ${replaceDocId}`, "yellow");
  log("");

  try {
    // Read file
    log("Reading file...", "yellow");
    const fileBuffer = await readFile(filePath);
    const filename = basename(filePath);

    // Prepare options
    const ingestOptions: IngestOptions = {
      parserType,
      replaceDocId,
      metadata: {
        docType,
        topic,
        status: "ready",
      },
    };

    // Ingest document
    log(`Processing with ${parserType} parser...`, "yellow");
    const result = await ingestDocument(
      fileBuffer,
      filename,
      docName,
      ingestOptions
    );

    // Print results
    log("\n========================================", "cyan");
    if (result.status === "ready") {
      log("   SUCCESS!", "green");
      log("========================================\n", "cyan");
      log(`Document ID: ${result.docId}`, "green");
      log(`Pages: ${result.pageCount}`, "green");
      log(`Chunks: ${result.chunkCount}`, "green");
      log(`Parser: ${result.parserUsed}`, "green");
      log(`Processed at: ${result.processedAt.toISOString()}`, "green");
    } else {
      log("   FAILED!", "red");
      log("========================================\n", "cyan");
      log(`Error: ${result.error}`, "red");
      process.exit(1);
    }
  } catch (error) {
    log(`\nError: ${(error as Error).message}`, "red");
    process.exit(1);
  }
}

main();
