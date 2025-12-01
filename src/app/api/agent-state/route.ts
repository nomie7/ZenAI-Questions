import { NextRequest } from "next/server";

/**
 * Agent State Streaming Endpoint
 *
 * This endpoint provides Server-Sent Events (SSE) for real-time agent state updates.
 * Currently, it emits simulated state updates. When the backend is upgraded to use
 * LangGraph with CopilotKit's CoAgent pattern, this can be replaced with actual
 * copilotkit_emit_state calls.
 *
 * Frontend usage:
 * ```tsx
 * const eventSource = new EventSource('/api/agent-state');
 * eventSource.onmessage = (e) => {
 *   const state = JSON.parse(e.data);
 *   setAgentState(state);
 * };
 * ```
 */

export const runtime = "edge";

// Store for current agent state (in production, use Redis or similar)
let currentAgentState: AgentStateUpdate = {
  status: "idle",
  timestamp: Date.now(),
};

let subscribers: Set<WritableStreamDefaultWriter<Uint8Array>> = new Set();

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
 * SSE endpoint for streaming agent state
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      const data = `data: ${JSON.stringify(currentAgentState)}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Handle cleanup
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * POST endpoint to update agent state
 * Called by the backend during agent execution
 */
export async function POST(req: NextRequest) {
  try {
    const state = (await req.json()) as AgentStateUpdate;

    // Validate state
    if (!state.status) {
      return Response.json({ error: "Missing status field" }, { status: 400 });
    }

    // Update current state
    currentAgentState = {
      ...state,
      timestamp: Date.now(),
    };

    return Response.json({ success: true, state: currentAgentState });
  } catch (error) {
    return Response.json(
      { error: "Failed to update agent state" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to emit state updates
 * Can be called from the CopilotKit service adapter
 */
export function emitAgentState(state: Partial<AgentStateUpdate>) {
  currentAgentState = {
    ...currentAgentState,
    ...state,
    timestamp: Date.now(),
  };
}

/**
 * Get current agent state
 */
export function getAgentState(): AgentStateUpdate {
  return currentAgentState;
}
