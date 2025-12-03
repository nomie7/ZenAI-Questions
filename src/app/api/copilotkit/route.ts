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
  temperature: 0.3,
});

// System prompt that instructs the LLM to use the search tool
const SYSTEM_PROMPT = `You are an internal knowledge assistant. You help users find information from their document knowledge base.

IMPORTANT: When a user asks a question that requires searching the knowledge base, you MUST use the searchKnowledgeBase tool first. Do not answer questions about documents without searching first.

For greetings and casual conversation (like "hi", "hello", "how are you"), respond naturally without searching.

After receiving search results, synthesize the information and cite your sources using the citation format provided in the results.`;

// Detect if the message is a greeting or small talk
function isGreetingOrSmallTalk(message: string): boolean {
  const normalized = message.toLowerCase().trim();
  const greetingPatterns = [
    /^(hi|hello|hey|howdy|hiya|yo)[\s!.,?]*$/i,
    /^(good\s*(morning|afternoon|evening|day))[\s!.,?]*$/i,
    /^(what'?s?\s*up|sup|wassup)[\s!.,?]*$/i,
    /^(how\s*(are\s*you|r\s*u|is\s*it\s*going))[\s!.,?]*$/i,
    /^(thanks?|thank\s*you|thx|ty)[\s!.,?]*$/i,
    /^(ok|okay|sure|alright|cool|great|nice|awesome)[\s!.,?]*$/i,
    /^(bye|goodbye|see\s*ya|later|cya)[\s!.,?]*$/i,
    /^(help|help\s*me|can\s*you\s*help)[\s!.,?]*$/i,
    /^(who\s*are\s*you|what\s*(are|can)\s*you)[\s!.,?]*$/i,
  ];
  return greetingPatterns.some(pattern => pattern.test(normalized));
}

// Store citations for the UI
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

// Create the service adapter
const serviceAdapter = new LangChainAdapter({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainFn: async ({ messages, tools }): Promise<any> => {
    // Prepend system message
    const langChainMessages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...messages.map((msg) => {
        const content =
          typeof msg.content === "string"
            ? msg.content
            : Array.isArray(msg.content)
              ? msg.content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join(" ")
              : "";

        const msgType = String(msg.getType?.() || (msg as unknown as { _getType?: () => string })._getType?.() || "human");
        if (msgType === "human") {
          return new HumanMessage(content);
        } else if (msgType === "ai") {
          return new AIMessage(content);
        }
        return new HumanMessage(content);
      }),
    ];

    // Bind tools if available
    const modelWithTools = tools?.length ? model.bindTools(tools) : model;
    return modelWithTools.stream(langChainMessages);
  },
});

// Create the CopilotKit runtime with the search action
const runtime = new CopilotRuntime({
  actions: () => {
    return [
      {
        name: "searchKnowledgeBase",
        description: "Search the knowledge base for information about documents. Use this tool when the user asks questions that require finding information from the document library. Returns relevant context with citations.",
        parameters: [
          {
            name: "query",
            type: "string",
            description: "The search query - what the user wants to know about",
            required: true,
          },
        ],
        handler: async ({ query }: { query: string }) => {
          console.log(`[RAG Action] Searching knowledge base for: "${query}"`);

          try {
            // Use agentic retrieval
            const agentResult: AgentRetrievalResult = await agenticRetrieve(query, {
              maxIterations: 3,
              confidenceThreshold: 0.7,
              verbose: true,
            });

            const contextText = await formatAgentContextForLLM(agentResult);
            lastAgentMetadata = getAgentMetadata(agentResult);
            lastCitations = await extractCitations(agentResult.chunks);

            console.log(`[RAG Action] Search complete. Confidence: ${agentResult.finalConfidence.toFixed(2)}, Chunks: ${agentResult.chunks.length}`);

            // Return structured result for the LLM
            return {
              success: true,
              confidence: agentResult.finalConfidence,
              iterations: agentResult.iterations,
              searchQueries: agentResult.searchQueries,
              intent: agentResult.queryAnalysis.intent,
              context: contextText,
              citationInstructions: `When citing information, use this format: <citation docName="DocumentName.pdf" pageNumber="X" snippet="relevant text...">N</citation> where N is a sequential number.`,
            };
          } catch (error) {
            console.error("[RAG Action] Search failed:", error);
            lastCitations = [];
            lastAgentMetadata = null;
            return {
              success: false,
              error: "Failed to search knowledge base. Please try again.",
            };
          }
        },
      },
    ];
  },
});

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
