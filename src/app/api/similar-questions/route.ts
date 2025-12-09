import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/embeddings";
import {
  searchSimilarQuestions,
  ensureQuestionsCollection,
  getQuestionsCollectionInfo,
} from "@/lib/qdrant";
import { getSignedUrl } from "@/lib/storage";

/**
 * Similar Question Search Result
 */
interface SimilarQuestionResult {
  id: string;
  questionText: string;
  answerText: string;
  similarity: number;
  confidence: number;
  metadata: {
    client: string;
    vertical: string;
    region: string;
    theme: string;
    year: number | null;
  };
  source: {
    docId: string;
    docName: string;
    pageNumber: number;
    chunkId: string;
  };
}

/**
 * POST /api/similar-questions
 * Search for similar questions in the pitch questions collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      filters,
      topK = 10,
    } = body;

    // Validate required fields
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "question is required and must be a string" },
        { status: 400 }
      );
    }

    // Ensure collection exists
    await ensureQuestionsCollection();

    // Generate embedding for the search question
    const questionEmbedding = await embedText(question);

    // Build Qdrant filter from provided filters
    const qdrantFilter = buildQdrantFilter(filters);

    // Search for similar questions
    const results = await searchSimilarQuestions({
      denseVector: questionEmbedding,
      queryText: question,
      limit: topK,
      filter: qdrantFilter,
    });

    // Transform results to response format
    const similarQuestions: SimilarQuestionResult[] = results.map((r) => ({
      id: r.id,
      questionText: r.payload.question_text as string,
      answerText: r.payload.answer_text as string,
      similarity: r.score,
      confidence: r.payload.confidence as number,
      metadata: {
        client: r.payload.client as string,
        vertical: r.payload.vertical as string,
        region: r.payload.region as string,
        theme: r.payload.theme as string,
        year: r.payload.year as number | null,
      },
      source: {
        docId: r.payload.source_doc_id as string,
        docName: r.payload.source_doc_name as string,
        pageNumber: r.payload.source_page as number,
        chunkId: r.payload.source_chunk_id as string,
      },
    }));

    return NextResponse.json({
      results: similarQuestions,
      count: similarQuestions.length,
      query: question,
    });
  } catch (error) {
    console.error("[Similar Questions] Error searching:", error);
    return NextResponse.json(
      { error: "Failed to search for similar questions" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/similar-questions
 * Get stats about the questions collection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      try {
        await ensureQuestionsCollection();
        const info = (await getQuestionsCollectionInfo()) as {
          points_count?: number;
          vectors_count?: number;
          status?: string;
        };

        return NextResponse.json({
          collection: "pitch_questions",
          pointsCount: info.points_count || 0,
          vectorsCount: info.vectors_count || 0,
          status: info.status || "unknown",
        });
      } catch {
        return NextResponse.json({
          collection: "pitch_questions",
          pointsCount: 0,
          vectorsCount: 0,
          status: "not_initialized",
        });
      }
    }

    return NextResponse.json({
      message: "Use POST to search for similar questions, or GET with action=stats for collection info",
    });
  } catch (error) {
    console.error("[Similar Questions] Error:", error);
    return NextResponse.json(
      { error: "Failed to get questions info" },
      { status: 500 }
    );
  }
}

/**
 * Build Qdrant filter from request filters
 */
function buildQdrantFilter(filters?: {
  vertical?: string[];
  excludeClient?: string;
  client?: string;
  region?: string;
  yearMin?: number;
  yearMax?: number;
}): Record<string, unknown> | undefined {
  if (!filters) return undefined;

  const mustConditions: Array<Record<string, unknown>> = [];
  const mustNotConditions: Array<Record<string, unknown>> = [];

  // Filter by vertical (any of the provided values)
  if (filters.vertical && filters.vertical.length > 0) {
    mustConditions.push({
      key: "vertical",
      match: { any: filters.vertical },
    });
  }

  // Filter by specific client
  if (filters.client) {
    mustConditions.push({
      key: "client",
      match: { value: filters.client },
    });
  }

  // Exclude results from a specific client
  if (filters.excludeClient) {
    mustNotConditions.push({
      key: "client",
      match: { value: filters.excludeClient },
    });
  }

  // Filter by region
  if (filters.region) {
    mustConditions.push({
      key: "region",
      match: { value: filters.region },
    });
  }

  // Filter by year range
  if (filters.yearMin !== undefined || filters.yearMax !== undefined) {
    const yearCondition: Record<string, unknown> = { key: "year" };
    const range: Record<string, number> = {};

    if (filters.yearMin !== undefined) {
      range.gte = filters.yearMin;
    }
    if (filters.yearMax !== undefined) {
      range.lte = filters.yearMax;
    }

    yearCondition.range = range;
    mustConditions.push(yearCondition);
  }

  // Build final filter
  if (mustConditions.length === 0 && mustNotConditions.length === 0) {
    return undefined;
  }

  const filter: Record<string, unknown> = {};
  if (mustConditions.length > 0) {
    filter.must = mustConditions;
  }
  if (mustNotConditions.length > 0) {
    filter.must_not = mustNotConditions;
  }

  return filter;
}
