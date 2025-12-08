import { ChatOpenAI } from "@langchain/openai";
import { retrieveContext, type RetrievedChunk } from "./retrieval";

/**
 * Agentic RAG with Self-Reflection
 *
 * Flow: Query → Analyze → Retrieve → Reflect → (Re-search if needed) → Answer
 */

// Configuration
const MAX_ITERATIONS = 3;
const CONFIDENCE_THRESHOLD = 0.7;
const TOP_K_PER_SEARCH = 8;

// LLM for agent reasoning
const agentLLM = new ChatOpenAI({
  modelName: "gpt-4.1-mini", // Fast model for agent reasoning
  temperature: 0,
});

/**
 * Query analysis result
 */
export interface QueryAnalysis {
  originalQuery: string;
  intent: string;
  keyEntities: string[];
  subQuestions: string[];
  isMultiPart: boolean;
  searchQueries: string[];
}

/**
 * Reflection result
 */
export interface ReflectionResult {
  confidence: number; // 0-1
  isSufficient: boolean;
  answeredAspects: string[];
  missingInformation: string[];
  suggestedQueries: string[];
  reasoning: string;
}

/**
 * Agent retrieval result
 */
export interface AgentRetrievalResult {
  chunks: RetrievedChunk[];
  iterations: number;
  queryAnalysis: QueryAnalysis;
  reflections: ReflectionResult[];
  finalConfidence: number;
  searchQueries: string[];
}

/**
 * Analyze the user's query to understand intent and decompose if needed
 */
export async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  const prompt = `You are a query analyzer for a knowledge base search system.

IMPORTANT: The knowledge base contains REPORTS and DOCUMENTS from various organizations.
When a user asks about "impact of [Organization]" or "[Company] influence", they likely want
information FROM that organization's reports, not ABOUT the organization itself.

For example:
- "impact of Kantar on market" → User likely wants market insights FROM Kantar's reports
- "What does McKinsey say about AI?" → User wants AI insights from McKinsey reports
- Rewrite these to search for the actual content: "market trends", "media predictions", etc.

Analyze this user query and provide:
1. The user's TRUE intent (what information are they actually seeking?)
2. Key entities or concepts (focus on topics, not publisher names)
3. If this is a multi-part question, break it into sub-questions
4. Generate 2-4 CONTENT-FOCUSED search queries (avoid searching for publisher names)

User Query: "${query}"

Respond in JSON format:
{
  "intent": "what the user actually wants to learn about",
  "keyEntities": ["topic1", "topic2"],
  "subQuestions": ["sub-question 1"] or [],
  "isMultiPart": true/false,
  "searchQueries": ["content-focused query 1", "content-focused query 2"]
}

Only output valid JSON, no markdown or explanation.`;

  try {
    const response = await agentLLM.invoke(prompt);
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    // Parse JSON from response (handle potential markdown code blocks)
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    return {
      originalQuery: query,
      intent: analysis.intent || query,
      keyEntities: analysis.keyEntities || [],
      subQuestions: analysis.subQuestions || [],
      isMultiPart: analysis.isMultiPart || false,
      searchQueries: analysis.searchQueries || [query],
    };
  } catch (error) {
    console.warn("Query analysis failed, using original query:", error);
    return {
      originalQuery: query,
      intent: query,
      keyEntities: [],
      subQuestions: [],
      isMultiPart: false,
      searchQueries: [query],
    };
  }
}

/**
 * Evaluate if retrieved chunks sufficiently answer the query
 */
export async function reflectOnResults(
  query: string,
  analysis: QueryAnalysis,
  chunks: RetrievedChunk[],
  previousReflections: ReflectionResult[] = []
): Promise<ReflectionResult> {
  // Format chunks for evaluation
  const chunksText = chunks
    .slice(0, 10) // Limit for context window
    .map((c, i) => `[${i + 1}] ${c.docName} (Page ${c.pageNumber}): ${c.text.slice(0, 500)}...`)
    .join("\n\n");

  const previousAttempts = previousReflections.length > 0
    ? `\nPrevious search attempts:\n${previousReflections.map((r, i) =>
      `Attempt ${i + 1}: Confidence ${r.confidence}, Missing: ${r.missingInformation.join(", ")}`
    ).join("\n")}\n`
    : "";

  const prompt = `You are evaluating if retrieved documents answer a user's question.

User Query: "${query}"
Intent: ${analysis.intent}
${analysis.subQuestions.length > 0 ? `Sub-questions: ${analysis.subQuestions.join(", ")}` : ""}
${previousAttempts}

Retrieved Documents:
${chunksText}

Evaluate:
1. Does this information answer the user's question? (confidence 0-1)
2. What aspects of the question are answered?
3. What information is still missing?
4. If missing info, what search queries would help find it?

Respond in JSON:
{
  "confidence": 0.0-1.0,
  "isSufficient": true/false,
  "answeredAspects": ["aspect 1", "aspect 2"],
  "missingInformation": ["missing info 1"] or [],
  "suggestedQueries": ["refined query"] or [],
  "reasoning": "brief explanation"
}

Only output valid JSON.`;

  try {
    const response = await agentLLM.invoke(prompt);
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const reflection = JSON.parse(jsonStr);

    return {
      confidence: Math.min(1, Math.max(0, reflection.confidence || 0)),
      isSufficient: reflection.isSufficient ?? (reflection.confidence >= CONFIDENCE_THRESHOLD),
      answeredAspects: reflection.answeredAspects || [],
      missingInformation: reflection.missingInformation || [],
      suggestedQueries: reflection.suggestedQueries || [],
      reasoning: reflection.reasoning || "",
    };
  } catch (error) {
    console.warn("Reflection failed:", error);
    // Default to accepting results if reflection fails
    return {
      confidence: 0.6,
      isSufficient: true,
      answeredAspects: [],
      missingInformation: [],
      suggestedQueries: [],
      reasoning: "Reflection failed, proceeding with available results",
    };
  }
}

/**
 * Merge and deduplicate chunks from multiple searches
 */
function mergeChunks(
  existingChunks: RetrievedChunk[],
  newChunks: RetrievedChunk[]
): RetrievedChunk[] {
  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  // Add existing chunks first (they have priority)
  for (const chunk of existingChunks) {
    const key = `${chunk.docId}-${chunk.pageNumber}-${chunk.chunkIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(chunk);
    }
  }

  // Add new chunks that aren't duplicates
  for (const chunk of newChunks) {
    const key = `${chunk.docId}-${chunk.pageNumber}-${chunk.chunkIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(chunk);
    }
  }

  // Sort by score and limit
  return merged
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K_PER_SEARCH * 2); // Keep more for multi-search
}

/**
 * Main agentic retrieval function
 *
 * Performs iterative retrieval with self-reflection until sufficient
 * information is gathered or max iterations reached.
 */
export async function agenticRetrieve(
  query: string,
  options: {
    docId?: string;
    maxIterations?: number;
    confidenceThreshold?: number;
    verbose?: boolean;
  } = {}
): Promise<AgentRetrievalResult> {
  const {
    docId,
    maxIterations = MAX_ITERATIONS,
    confidenceThreshold = CONFIDENCE_THRESHOLD,
    verbose = true,
  } = options;

  const reflections: ReflectionResult[] = [];
  const allSearchQueries: string[] = [];
  let allChunks: RetrievedChunk[] = [];
  let iteration = 0;
  let finalConfidence = 0;

  // Step 1: Analyze the query
  if (verbose) console.log(`[Agent] Analyzing query: "${query}"`);
  const analysis = await analyzeQuery(query);
  if (verbose) {
    console.log(`[Agent] Intent: ${analysis.intent}`);
    console.log(`[Agent] Search queries: ${analysis.searchQueries.join(", ")}`);
  }

  // Step 2: Initial retrieval with all search queries
  for (const searchQuery of analysis.searchQueries) {
    allSearchQueries.push(searchQuery);
    if (verbose) console.log(`[Agent] Searching: "${searchQuery}"`);

    const chunks = await retrieveContext(searchQuery, {
      topK: TOP_K_PER_SEARCH,
      docId,
      diversify: true,
    });

    allChunks = mergeChunks(allChunks, chunks);
  }

  if (verbose) console.log(`[Agent] Retrieved ${allChunks.length} chunks`);

  // Step 3: Self-reflection loop
  while (iteration < maxIterations) {
    iteration++;
    if (verbose) console.log(`[Agent] Reflection iteration ${iteration}...`);

    // Reflect on current results
    const reflection = await reflectOnResults(
      query,
      analysis,
      allChunks,
      reflections
    );
    reflections.push(reflection);
    finalConfidence = reflection.confidence;

    if (verbose) {
      console.log(`[Agent] Confidence: ${reflection.confidence.toFixed(2)}`);
      console.log(`[Agent] Sufficient: ${reflection.isSufficient}`);
      if (reflection.missingInformation.length > 0) {
        console.log(`[Agent] Missing: ${reflection.missingInformation.join(", ")}`);
      }
    }

    // Check if we should stop
    if (reflection.isSufficient || reflection.confidence >= confidenceThreshold) {
      if (verbose) console.log(`[Agent] Results sufficient, stopping.`);
      break;
    }

    // Check if we have new queries to try
    if (reflection.suggestedQueries.length === 0) {
      if (verbose) console.log(`[Agent] No new queries suggested, stopping.`);
      break;
    }

    // Step 4: Re-search with suggested queries
    for (const newQuery of reflection.suggestedQueries) {
      // Avoid repeating the same query
      if (allSearchQueries.includes(newQuery)) continue;

      allSearchQueries.push(newQuery);
      if (verbose) console.log(`[Agent] Re-searching: "${newQuery}"`);

      const newChunks = await retrieveContext(newQuery, {
        topK: TOP_K_PER_SEARCH,
        docId,
        diversify: true,
      });

      allChunks = mergeChunks(allChunks, newChunks);
    }

    if (verbose) console.log(`[Agent] Total chunks: ${allChunks.length}`);
  }

  if (verbose) {
    console.log(`[Agent] Completed in ${iteration} iteration(s)`);
    console.log(`[Agent] Final confidence: ${finalConfidence.toFixed(2)}`);
    console.log(`[Agent] Total search queries: ${allSearchQueries.length}`);
  }

  return {
    chunks: allChunks,
    iterations: iteration,
    queryAnalysis: analysis,
    reflections,
    finalConfidence,
    searchQueries: allSearchQueries,
  };
}

/**
 * Format agent retrieval result for LLM context
 * Generates signed URLs for images so they can be accessed by the browser
 */
export async function formatAgentContextForLLM(result: AgentRetrievalResult): Promise<string> {
  if (result.chunks.length === 0) {
    return "No relevant documents found in the knowledge base.";
  }

  // Limit to top 8 chunks to reduce payload size
  const topChunks = result.chunks.slice(0, 8);

  // Don't include image URLs in context to reduce payload size
  // They will be fetched from citations API instead
  const contextBlocks = topChunks.map((chunk, index) => {
    // Truncate text to reduce payload size (keep first 400 chars + ellipsis if longer)
    const truncatedText = chunk.text.length > 400 
      ? chunk.text.substring(0, 400) + "..." 
      : chunk.text;
    return `[${index + 1}] Document: "${chunk.docName}", Page ${chunk.pageNumber}
${truncatedText}`;
  });

  const searchInfo = `Search conducted with ${result.iterations} iteration(s), ${result.searchQueries.length} queries, confidence ${result.finalConfidence.toFixed(2)}. Showing top ${topChunks.length} results.`;

  const finalContext = `${searchInfo}\n\n---\n\n${contextBlocks.join("\n\n---\n\n")}`;

  return finalContext;
}

/**
 * Get agent metadata for response
 */
export function getAgentMetadata(result: AgentRetrievalResult): {
  iterations: number;
  confidence: number;
  searchQueries: string[];
  intent: string;
} {
  return {
    iterations: result.iterations,
    confidence: result.finalConfidence,
    searchQueries: result.searchQueries,
    intent: result.queryAnalysis.intent,
  };
}
