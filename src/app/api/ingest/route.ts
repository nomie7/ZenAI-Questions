import { NextRequest, NextResponse } from "next/server";
import {
  ingestDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  type IngestResult,
  initializeRegistry,
} from "@/lib/ingest";
import type { ParserType } from "@/lib/parsers";

/**
 * POST /api/ingest - Upload and ingest a document
 *
 * Form data:
 * - file: PDF file to ingest
 * - docName: Human-readable document name
 * - parserType: "gemini" | "unstructured" (optional, default: "unstructured")
 * - replaceDocId: Document ID to replace (optional)
 * - docType: Document type for metadata (optional)
 * - topic: Topic/category for filtering (optional)
 * - client: Client name (optional, for pitch response library)
 * - vertical: Industry vertical (optional)
 * - region: Geographic scope - global/local/etc (optional)
 * - theme: Theme/topic tags (optional)
 * - year: Year of pitch (optional)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    // Get file
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Get document name
    const docName = (formData.get("docName") as string) || file.name;

    // Get parser type
    const parserType =
      (formData.get("parserType") as ParserType) || "unstructured";
    if (!["gemini", "unstructured"].includes(parserType)) {
      return NextResponse.json(
        { error: "Invalid parser type. Use 'gemini' or 'unstructured'" },
        { status: 400 }
      );
    }

    // Get optional parameters
    const replaceDocId = formData.get("replaceDocId") as string | null;
    const docType = formData.get("docType") as string | null;
    const topic = formData.get("topic") as string | null;

    // Pitch response library metadata
    const client = formData.get("client") as string | null;
    const vertical = formData.get("vertical") as string | null;
    const region = formData.get("region") as string | null;
    const theme = formData.get("theme") as string | null;
    const yearStr = formData.get("year") as string | null;
    const year = yearStr ? parseInt(yearStr, 10) : undefined;

    // Validate file type
    const allowedExtensions = [
      ".pdf", ".ppt", ".pptx", ".doc", ".docx",
      ".xls", ".xlsx", ".txt", ".md", ".html", ".htm",
      ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".heic"
    ];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileExt}. Allowed: ${allowedExtensions.join(", ")}` },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ingest the document
    const result: IngestResult = await ingestDocument(
      buffer,
      file.name,
      docName,
      {
        parserType,
        replaceDocId: replaceDocId || undefined,
        metadata: {
          docType: docType || undefined,
          topic: topic || undefined,
          status: "ready",
          // Pitch response library metadata
          client: client || undefined,
          vertical: vertical || undefined,
          region: region || undefined,
          theme: theme || undefined,
          year: year || undefined,
        },
      }
    );

    if (result.status === "failed") {
      return NextResponse.json(
        { error: result.error || "Ingestion failed", result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: replaceDocId
        ? `Document replaced successfully`
        : `Document ingested successfully`,
      result,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest - List all documents or get a specific document
 *
 * Query params:
 * - docId: Get specific document (optional)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");

    if (docId) {
      let doc = getDocument(docId);
      if (!doc) {
        // Try to rebuild registry from Qdrant in case of restart
        await initializeRegistry();
        doc = getDocument(docId);
      }
      if (!doc) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ document: doc });
    }

    const documents = await listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ingest - Delete a document
 *
 * Query params:
 * - docId: Document ID to delete (required)
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json(
        { error: "docId is required" },
        { status: 400 }
      );
    }

    await deleteDocument(docId);

    return NextResponse.json({
      success: true,
      message: `Document ${docId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
