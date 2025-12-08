import { NextRequest, NextResponse } from "next/server";
import { citationImageCache } from "@/lib/citation-cache";

/**
 * Get citation image URL by docName and pageNumber
 * Called by the UI when rendering citations
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const docName = searchParams.get("docName");
  const pageNumber = searchParams.get("pageNumber");

  if (!docName || !pageNumber) {
    return NextResponse.json(
      { error: "Missing docName or pageNumber" },
      { status: 400 }
    );
  }

  const key = `${docName}|${pageNumber}`;
  const imageUrl = citationImageCache.get(key);

  if (imageUrl) {
    return NextResponse.json({ imageUrl });
  }

  return NextResponse.json({ imageUrl: null });
}
