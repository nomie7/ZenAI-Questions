"use client";

import { useEffect, useState, useCallback } from "react";
import { useCopilotChat } from "@copilotkit/react-core";
import type { AgentState } from "@/components/chat/agent-activity";

/**
 * Real-time agent state tracking hook
 *
 * This hook provides agent state updates during LLM operations.
 * Currently uses polling to fetch agent metadata from the backend.
 *
 * TODO: When migrating to full CoAgent pattern with LangGraph,
 * replace with useCoAgentStateRender for true streaming state:
 *
 * ```tsx
 * import { useCoAgentStateRender } from "@copilotkit/react-core";
 *
 * useCoAgentStateRender<AgentState>({
 *   name: "rag_agent",
 *   render: ({ state, status }) => {
 *     setAgentState(state);
 *     return null; // or return UI element
 *   },
 * });
 * ```
 */
export function useAgentState(): {
  agentState: AgentState;
  agentMetadata: AgentMetadata | null;
  isLoading: boolean;
} {
  const { isLoading } = useCopilotChat();
  const [agentState, setAgentState] = useState<AgentState>({ status: "idle" });
  const [agentMetadata, setAgentMetadata] = useState<AgentMetadata | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);

  // Start polling when loading starts
  useEffect(() => {
    if (isLoading) {
      setPollingEnabled(true);
      setAgentState({ status: "analyzing", intent: "Understanding your question..." });
    } else {
      setPollingEnabled(false);
    }
  }, [isLoading]);

  // Poll for agent metadata during loading
  useEffect(() => {
    if (!pollingEnabled) return;

    let cancelled = false;
    let phaseIndex = 0;

    // Simulated phases while we poll for real data
    const phases: AgentState[] = [
      { status: "analyzing", intent: "Understanding your question..." },
      { status: "searching", currentQuery: "Searching knowledge base...", iteration: 1, maxIterations: 3 },
      { status: "reflecting", confidence: 0.5 },
      { status: "refining", iteration: 2, maxIterations: 3, confidence: 0.6 },
      { status: "generating", confidence: 0.8 },
    ];

    // Progress through phases
    const phaseInterval = setInterval(() => {
      if (cancelled) return;
      phaseIndex = Math.min(phaseIndex + 1, phases.length - 1);
      setAgentState(phases[phaseIndex]);
    }, 1500);

    // Poll for real metadata
    const pollInterval = setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch("/api/copilotkit");
        const data = await res.json();
        if (data.agentMetadata) {
          setAgentMetadata(data.agentMetadata);
          // Update state with real data if available
          setAgentState(prev => ({
            ...prev,
            confidence: data.agentMetadata.confidence,
            iteration: data.agentMetadata.iterations,
            searches: data.agentMetadata.searchQueries.map((q: string) => ({
              query: q,
              done: true,
            })),
            intent: data.agentMetadata.intent,
          }));
        }
      } catch (error) {
        // Ignore polling errors
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(phaseInterval);
      clearInterval(pollInterval);
    };
  }, [pollingEnabled]);

  // Reset state when loading completes
  useEffect(() => {
    if (!isLoading && agentMetadata) {
      setAgentState({
        status: "idle",
        confidence: agentMetadata.confidence,
        searches: agentMetadata.searchQueries.map(q => ({ query: q, done: true })),
        intent: agentMetadata.intent,
        iteration: agentMetadata.iterations,
        maxIterations: 3,
      });
    } else if (!isLoading) {
      setAgentState({ status: "idle" });
    }
  }, [isLoading, agentMetadata]);

  return { agentState, agentMetadata, isLoading };
}

export interface AgentMetadata {
  iterations: number;
  confidence: number;
  searchQueries: string[];
  intent: string;
}

/**
 * Server-Sent Events based agent state streaming
 *
 * This is a placeholder for future SSE-based real-time streaming.
 * When the backend supports SSE, this hook can be used:
 *
 * ```tsx
 * const { state, error } = useAgentStateSSE("/api/agent/stream");
 * ```
 */
export function useAgentStateSSE(endpoint: string): {
  state: AgentState;
  error: Error | null;
  connected: boolean;
} {
  const [state, setState] = useState<AgentState>({ status: "idle" });
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // SSE connection placeholder
    // When backend supports SSE:
    //
    // const eventSource = new EventSource(endpoint);
    //
    // eventSource.onopen = () => setConnected(true);
    // eventSource.onerror = (e) => setError(new Error("Connection failed"));
    // eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setState(data);
    // };
    //
    // return () => eventSource.close();

    return () => {};
  }, [endpoint]);

  return { state, error, connected };
}

/**
 * Hook for future CoAgent integration
 *
 * When migrating to full LangGraph + CopilotKit CoAgent:
 *
 * 1. Update backend to use copilotkit_emit_state
 * 2. Replace useAgentState with this implementation
 * 3. Remove polling logic
 */
export function useCoAgentIntegration() {
  // Placeholder for future CoAgent integration
  // This will use useCoAgentStateRender when LangGraph backend is ready

  const renderAgentState = useCallback((render: (state: AgentState) => React.ReactNode) => {
    // Will be implemented when backend supports CoAgent pattern
    console.log("CoAgent integration ready - waiting for backend support");
    return null;
  }, []);

  return { renderAgentState };
}
