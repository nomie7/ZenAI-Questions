import { NextRequest, NextResponse } from "next/server";
import { extractCitations } from "@/lib/retrieval";
import { agenticRetrieve, getAgentMetadata } from "@/lib/agentic-retrieval";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || searchParams.get("query");

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: "Missing query (use ?q=...)" },
      { status: 400 }
    );
  }

  try {
    // Use agentic retrieval for smarter context gathering
    const agentResult = await agenticRetrieve(query, {
      maxIterations: 3,
      confidenceThreshold: 0.7,
      verbose: false,
    });

    const citations = await extractCitations(agentResult.chunks);
    const agentMetadata = getAgentMetadata(agentResult);

    return NextResponse.json({
      citations,
      agentMetadata,
    });
  } catch (error) {
    console.error("Error generating citations:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
