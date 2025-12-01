"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Brain,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  FileText
} from "lucide-react";

export interface AgentState {
  status: "idle" | "analyzing" | "searching" | "reflecting" | "refining" | "generating";
  currentQuery?: string;
  iteration?: number;
  maxIterations?: number;
  confidence?: number;
  searches?: { query: string; done: boolean }[];
  intent?: string;
  missingInfo?: string[];
}

interface AgentActivityProps {
  state: AgentState;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: Circle,
    label: "Ready",
    color: "text-gray-400",
    bgColor: "bg-gray-50",
  },
  analyzing: {
    icon: Brain,
    label: "Analyzing question...",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  searching: {
    icon: Search,
    label: "Searching knowledge base...",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  reflecting: {
    icon: Sparkles,
    label: "Evaluating results...",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  refining: {
    icon: RefreshCw,
    label: "Refining search...",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  generating: {
    icon: FileText,
    label: "Generating response...",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

export function AgentActivityIndicator({ state, className }: AgentActivityProps) {
  const config = statusConfig[state.status] || statusConfig.idle;
  const Icon = config.icon;

  if (state.status === "idle") {
    return null;
  }

  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-3",
      config.bgColor,
      className
    )}>
      {/* Current status */}
      <div className="flex items-center gap-2">
        <Loader2 className={cn("w-4 h-4 animate-spin", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
        {state.iteration && state.maxIterations && (
          <span className="text-xs text-gray-500 ml-auto">
            Iteration {state.iteration}/{state.maxIterations}
          </span>
        )}
      </div>

      {/* Current query being searched */}
      {state.currentQuery && state.status === "searching" && (
        <div className="text-xs text-gray-600 bg-white/60 rounded px-2 py-1.5 font-mono">
          "{state.currentQuery}"
        </div>
      )}

      {/* Intent display */}
      {state.intent && state.status === "analyzing" && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Understanding: </span>
          {state.intent}
        </div>
      )}

      {/* Search history */}
      {state.searches && state.searches.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Search Progress
          </div>
          {state.searches.map((search, i) => (
            <div
              key={i}
              className={cn(
                "text-xs flex items-center gap-1.5 py-0.5",
                search.done ? "text-gray-500" : "text-gray-700"
              )}
            >
              {search.done ? (
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              ) : (
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin flex-shrink-0" />
              )}
              <span className="truncate">{search.query}</span>
            </div>
          ))}
        </div>
      )}

      {/* Confidence meter */}
      {state.confidence !== undefined && state.confidence > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confidence</span>
            <span className={cn(
              "font-medium",
              state.confidence >= 0.7 ? "text-green-600" :
              state.confidence >= 0.5 ? "text-amber-600" : "text-red-500"
            )}>
              {Math.round(state.confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                state.confidence >= 0.7 ? "bg-green-500" :
                state.confidence >= 0.5 ? "bg-amber-500" : "bg-red-400"
              )}
              style={{ width: `${state.confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Missing information (during refining) */}
      {state.missingInfo && state.missingInfo.length > 0 && state.status === "refining" && (
        <div className="text-xs text-orange-700 bg-orange-100/50 rounded p-2">
          <span className="font-medium">Looking for: </span>
          {state.missingInfo.join(", ")}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to simulate agent activity based on loading state
 * Use this when actual CoAgent state streaming is not available
 */
export function useSimulatedAgentActivity(isLoading: boolean): AgentState {
  const [state, setState] = useState<AgentState>({ status: "idle" });

  useEffect(() => {
    if (!isLoading) {
      setState({ status: "idle" });
      return;
    }

    // Simulate activity phases
    const phases: { time: number; state: AgentState }[] = [
      { time: 0, state: { status: "analyzing", intent: "Understanding your question..." } },
      { time: 800, state: {
        status: "searching",
        currentQuery: "initial search",
        iteration: 1,
        maxIterations: 3,
        searches: [{ query: "Searching knowledge base...", done: false }]
      }},
      { time: 2500, state: {
        status: "reflecting",
        confidence: 0.5,
        searches: [{ query: "Initial search", done: true }]
      }},
      { time: 3500, state: {
        status: "refining",
        iteration: 2,
        maxIterations: 3,
        confidence: 0.6,
        searches: [
          { query: "Initial search", done: true },
          { query: "Refining with related terms...", done: false }
        ]
      }},
      { time: 5000, state: {
        status: "generating",
        confidence: 0.85,
        searches: [
          { query: "Initial search", done: true },
          { query: "Related terms search", done: true }
        ]
      }},
    ];

    const timeouts = phases.map(({ time, state: newState }) =>
      setTimeout(() => setState(newState), time)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isLoading]);

  return state;
}

/**
 * Compact inline version for chat messages
 */
export function AgentActivityInline({ state }: { state: AgentState }) {
  const config = statusConfig[state.status] || statusConfig.idle;

  if (state.status === "idle") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className={config.color}>{config.label}</span>
      {state.currentQuery && (
        <span className="text-gray-400 text-xs truncate max-w-[200px]">
          "{state.currentQuery}"
        </span>
      )}
    </div>
  );
}
