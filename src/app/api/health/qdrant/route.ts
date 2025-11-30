import { NextResponse } from "next/server";
import { getClient, getCollectionName } from "@/lib/qdrant";

export async function GET(): Promise<NextResponse> {
  try {
    const client = getClient();
    const collection = getCollectionName();
    const info = await client.getCollection(collection);

    return NextResponse.json({
      ok: true,
      collection,
      vectors_count: info.points_count ?? info.indexed_vectors_count ?? 0,
      status: info.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
