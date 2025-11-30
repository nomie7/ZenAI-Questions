import {
  CopilotRuntime,
  LangChainAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { NextRequest } from "next/server";
import { extractCitations } from "@/lib/retrieval";
import {
  agenticRetrieve,
  formatAgentContextForLLM,
  getAgentMetadata,
  type AgentRetrievalResult,
} from "@/lib/agentic-retrieval";

// Create the LangChain model
const model = new ChatOpenAI({
  modelName: "gpt-4.1",
  temperature: 0.3, // Lower temperature for more factual responses
});

// RAG System Prompt
const RAG_SYSTEM_PROMPT = `You are an internal knowledge assistant. Answer questions ONLY using the provided context from our knowledge base.

SEARCH INFO: {searchInfo}

RULES:
1. Only answer from the context provided below - do not use external knowledge
2. Cite your sources using this format: [Doc: {document name}, Page: {page number}]
3. Include citations inline with your response for every piece of information
4. If the answer is NOT in the context or confidence is low, say: "I don't have sufficient information about that in my knowledge base."
5. Be concise, accurate, and helpful
6. If multiple documents discuss the same topic, synthesize the information and cite all relevant sources
7. Do not make up or infer information not explicitly stated in the context
8. Consider the search confidence when formulating your response

CONTEXT FROM KNOWLEDGE BASE:
{context}

Remember: Only use information from the context above. Always cite your sources.`;

// Store citations and agent metadata for the current response (used by the UI)
let lastCitations: Array<{
  docName: string;
  pageNumber: number;
  imageUrl?: string;
  snippet: string;
}> = [];

let lastAgentMetadata: {
  iterations: number;
  confidence: number;
  searchQueries: string[];
  intent: string;
} | null = null;

// Create the service adapter using LangChain with RAG
const serviceAdapter = new LangChainAdapter({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainFn: async ({ messages, tools }): Promise<any> => {
    // Extract the last user message for retrieval
    const lastMessage = messages[messages.length - 1];
    const userQuery =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : Array.isArray(lastMessage.content)
          ? lastMessage.content
              .filter((c): c is { type: "text"; text: string } => c.type === "text")
              .map((c) => c.text)
              .join(" ")
          : "";

    // Retrieve relevant context using agentic retrieval
    let agentResult: AgentRetrievalResult | null = null;
    let contextText = "";
    let searchInfo = "No search performed";

    if (userQuery.trim()) {
      try {
        console.log(`[RAG] Starting agentic retrieval for: "${userQuery}"`);

        // Use agentic retrieval with self-reflection
        agentResult = await agenticRetrieve(userQuery, {
          maxIterations: 3,
          confidenceThreshold: 0.7,
          verbose: true,
        });

        contextText = formatAgentContextForLLM(agentResult);
        lastAgentMetadata = getAgentMetadata(agentResult);

        // Create search info summary
        searchInfo = `Searched with ${agentResult.iterations} iteration(s), ${agentResult.searchQueries.length} queries. Confidence: ${(agentResult.finalConfidence * 100).toFixed(0)}%. Intent: ${agentResult.queryAnalysis.intent}`;

        // Extract citations for the UI
        lastCitations = await extractCitations(agentResult.chunks);

        console.log(`[RAG] Agentic retrieval complete. Confidence: ${agentResult.finalConfidence.toFixed(2)}, Chunks: ${agentResult.chunks.length}`);
      } catch (error) {
        console.error("Error in agentic retrieval:", error);
        contextText =
          "Error retrieving from knowledge base. Please try again.";
        searchInfo = "Search failed";
        lastCitations = [];
        lastAgentMetadata = null;
      }
    }

    // Build the system prompt with context and search info
    const systemPrompt = RAG_SYSTEM_PROMPT
      .replace("{context}", contextText)
      .replace("{searchInfo}", searchInfo);

    // Prepend system message and transform messages
    const langChainMessages = [
      new SystemMessage(systemPrompt),
      ...messages.slice(0, -1).map((msg) => {
        const content =
          typeof msg.content === "string"
            ? msg.content
            : Array.isArray(msg.content)
              ? msg.content
                  .filter((c): c is { type: "text"; text: string } => c.type === "text")
                  .map((c) => c.text)
                  .join(" ")
              : "";

        // Check message type using getType() method or _getType()
        const msgType = String(msg.getType?.() || (msg as unknown as { _getType?: () => string })._getType?.() || "human");
        if (msgType === "human") {
          return new HumanMessage(content);
        } else if (msgType === "ai") {
          return new AIMessage(content);
        }
        return new HumanMessage(content);
      }),
      new HumanMessage(userQuery),
    ];

    // Bind tools if available
    const modelWithTools = tools?.length ? model.bindTools(tools) : model;
    return modelWithTools.stream(langChainMessages);
  },
});

// Create the CopilotKit runtime
const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

// Export citations and agent metadata endpoint for UI to fetch
export const GET = async () => {
  return Response.json({
    citations: lastCitations,
    agentMetadata: lastAgentMetadata,
  });
};
