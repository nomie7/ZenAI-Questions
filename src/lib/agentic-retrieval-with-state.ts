import {
  agenticRetrieve,
  analyzeQuery,
  reflectOnResults,
  formatAgentContextForLLM,
  getAgentMetadata,
  type AgentRetrievalResult,
  type QueryAnalysis,
  type ReflectionResult,
} from "./agentic-retrieval";
import { retrieveContext, type RetrievedChunk } from "./retrieval";

/**
 * Agent state that can be emitted during retrieval
 */
export interface AgentStateUpdate {
  status: "idle" | "analyzing" | "searching" | "reflecting" | "refining" | "generating";
  currentQuery?: string;
  iteration?: number;
  maxIterations?: number;
  confidence?: number;
  searches?: { query: string; done: boolean }[];
  intent?: string;
  missingInfo?: string[];
  timestamp: number;
}

/**
 * Callback function type for state updates
 */
export type StateEmitter = (state: AgentStateUpdate) => void | Promise<void>;

/**
 * Agentic retrieval with state emission for real-time UI updates
 *
 * This function wraps the standard agenticRetrieve and emits state updates
 * at each phase of the retrieval process.
 *
 * @param query - User's question
 * @param options - Retrieval options
 * @param onStateUpdate - Callback for state updates (can be async)
 */
export async function agenticRetrieveWithState(
  query: string,
  options: {
    docId?: string;
    maxIterations?: number;
    confidenceThreshold?: number;
    verbose?: boolean;
  } = {},
  onStateUpdate?: StateEmitter
): Promise<AgentRetrievalResult> {
  const {
    docId,
    maxIterations = 3,
    confidenceThreshold = 0.7,
    verbose = true,
  } = options;

  const TOP_K_PER_SEARCH = 8;
  const reflections: ReflectionResult[] = [];
  const allSearchQueries: string[] = [];
  let allChunks: RetrievedChunk[] = [];
  let iteration = 0;
  let finalConfidence = 0;

  // Helper to emit state
  const emit = async (state: Partial<AgentStateUpdate>) => {
    if (onStateUpdate) {
      await onStateUpdate({
        status: "idle",
        timestamp: Date.now(),
        ...state,
      } as AgentStateUpdate);
    }
  };

  // Step 1: Analyze the query
  await emit({
    status: "analyzing",
    intent: "Understanding your question...",
    maxIterations,
  });

  if (verbose) console.log(`[Agent] Analyzing query: "${query}"`);
  const analysis = await analyzeQuery(query);

  await emit({
    status: "analyzing",
    intent: analysis.intent,
    maxIterations,
  });

  if (verbose) {
    console.log(`[Agent] Intent: ${analysis.intent}`);
    console.log(`[Agent] Search queries: ${analysis.searchQueries.join(", ")}`);
  }

  // Step 2: Initial retrieval with all search queries
  const searchHistory: { query: string; done: boolean }[] = [];

  for (const searchQuery of analysis.searchQueries) {
    allSearchQueries.push(searchQuery);
    searchHistory.push({ query: searchQuery, done: false });

    await emit({
      status: "searching",
      currentQuery: searchQuery,
      iteration: 1,
      maxIterations,
      searches: [...searchHistory],
    });

    if (verbose) console.log(`[Agent] Searching: "${searchQuery}"`);

    const chunks = await retrieveContext(searchQuery, {
      topK: TOP_K_PER_SEARCH,
      docId,
      diversify: true,
    });

    allChunks = mergeChunks(allChunks, chunks);

    // Mark search as done
    searchHistory[searchHistory.length - 1].done = true;
  }

  await emit({
    status: "reflecting",
    searches: searchHistory,
    iteration: 1,
    maxIterations,
  });

  if (verbose) console.log(`[Agent] Retrieved ${allChunks.length} chunks`);

  // Step 3: Self-reflection loop
  while (iteration < maxIterations) {
    iteration++;

    await emit({
      status: "reflecting",
      iteration,
      maxIterations,
      searches: searchHistory,
    });

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

    await emit({
      status: "reflecting",
      iteration,
      maxIterations,
      confidence: reflection.confidence,
      searches: searchHistory,
      missingInfo: reflection.missingInformation,
    });

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
    await emit({
      status: "refining",
      iteration,
      maxIterations,
      confidence: reflection.confidence,
      searches: searchHistory,
      missingInfo: reflection.missingInformation,
    });

    for (const newQuery of reflection.suggestedQueries) {
      // Avoid repeating the same query
      if (allSearchQueries.includes(newQuery)) continue;

      allSearchQueries.push(newQuery);
      searchHistory.push({ query: newQuery, done: false });

      await emit({
        status: "searching",
        currentQuery: newQuery,
        iteration,
        maxIterations,
        confidence: reflection.confidence,
        searches: [...searchHistory],
      });

      if (verbose) console.log(`[Agent] Re-searching: "${newQuery}"`);

      const newChunks = await retrieveContext(newQuery, {
        topK: TOP_K_PER_SEARCH,
        docId,
        diversify: true,
      });

      allChunks = mergeChunks(allChunks, newChunks);

      // Mark search as done
      searchHistory[searchHistory.length - 1].done = true;
    }

    if (verbose) console.log(`[Agent] Total chunks: ${allChunks.length}`);
  }

  // Final state: generating
  await emit({
    status: "generating",
    confidence: finalConfidence,
    searches: searchHistory,
    iteration,
    maxIterations,
  });

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
 * Merge and deduplicate chunks from multiple searches
 */
function mergeChunks(
  existingChunks: RetrievedChunk[],
  newChunks: RetrievedChunk[]
): RetrievedChunk[] {
  const TOP_K_PER_SEARCH = 8;
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

// Re-export utilities
export { formatAgentContextForLLM, getAgentMetadata };
