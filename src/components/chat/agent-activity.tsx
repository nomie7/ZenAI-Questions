"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Brain,
  RefreshCw,
  Sparkles,
  CheckCircle2,
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

const stages = [
  { key: "analyzing", icon: Brain, label: "Analyzing" },
  { key: "searching", icon: Search, label: "Searching" },
  { key: "reflecting", icon: Sparkles, label: "Reflecting" },
  { key: "refining", icon: RefreshCw, label: "Refining" },
  { key: "generating", icon: FileText, label: "Generating" },
] as const;

type StageKey = typeof stages[number]["key"];

function getStageStatus(
  currentStatus: AgentState["status"],
  stageKey: StageKey
): "complete" | "active" | "pending" {
  if (currentStatus === "idle") return "pending";

  const currentIndex = stages.findIndex(s => s.key === currentStatus);
  const stageIndex = stages.findIndex(s => s.key === stageKey);

  if (stageIndex < currentIndex) return "complete";
  if (stageIndex === currentIndex) return "active";
  return "pending";
}

interface StageItemProps {
  stage: typeof stages[number];
  status: "complete" | "active" | "pending";
  isLast: boolean;
}

function StageItem({ stage, status, isLast }: StageItemProps) {
  const Icon = stage.icon;

  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center flex-1">
        {/* Stage circle */}
        <div
          className={cn(
            "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
            status === "complete" && "bg-gray-100 border-gray-300",
            status === "active" && "bg-blue-50 border-blue-600 shadow-sm",
            status === "pending" && "bg-white border-gray-200"
          )}
        >
          {status === "complete" && (
            <CheckCircle2 className="w-4 h-4 text-gray-600" />
          )}
          {status === "active" && (
            <>
              <Icon className="w-4 h-4 text-blue-600" />
              <span className="absolute inset-0 rounded-full bg-blue-600/20 animate-pulse" />
            </>
          )}
          {status === "pending" && (
            <Icon className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Stage label */}
        <div className="mt-2 text-center">
          <div
            className={cn(
              "text-xs font-medium transition-colors duration-300",
              status === "active" && "text-blue-600",
              status === "complete" && "text-gray-600",
              status === "pending" && "text-gray-400"
            )}
          >
            {stage.label}
          </div>
        </div>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="flex-1 h-0.5 mx-2 -mt-4">
          <div
            className={cn(
              "h-full transition-all duration-300",
              status === "complete" ? "bg-gray-300" : "bg-gray-200"
            )}
          />
        </div>
      )}
    </div>
  );
}

function StageTimeline({ currentStatus }: { currentStatus: AgentState["status"] }) {
  return (
    <div className="flex items-start px-2 py-4">
      {stages.map((stage, index) => (
        <StageItem
          key={stage.key}
          stage={stage}
          status={getStageStatus(currentStatus, stage.key)}
          isLast={index === stages.length - 1}
        />
      ))}
    </div>
  );
}

function DetailsPanel({ state }: { state: AgentState }) {
  const hasDetails =
    state.currentQuery ||
    state.intent ||
    (state.searches && state.searches.length > 0) ||
    (state.confidence !== undefined && state.confidence > 0) ||
    (state.missingInfo && state.missingInfo.length > 0);

  if (!hasDetails) return null;

  return (
    <div className="border-t border-gray-200 pt-3 space-y-3">
      {/* Current query */}
      {state.currentQuery && state.status === "searching" && (
        <div className="text-xs">
          <div className="text-gray-500 mb-1 font-medium">Current Query</div>
          <div className="text-gray-700 bg-gray-50 rounded px-2 py-1.5 font-mono border border-gray-200">
            "{state.currentQuery}"
          </div>
        </div>
      )}

      {/* Intent */}
      {state.intent && state.status === "analyzing" && (
        <div className="text-xs">
          <div className="text-gray-500 mb-1 font-medium">Understanding</div>
          <div className="text-gray-700">{state.intent}</div>
        </div>
      )}

      {/* Search history */}
      {state.searches && state.searches.length > 0 && (
        <div className="text-xs">
          <div className="text-gray-500 mb-1.5 font-medium">Search Progress</div>
          <div className="space-y-1">
            {state.searches.map((search, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 py-1",
                  search.done ? "text-gray-500" : "text-gray-700"
                )}
              >
                {search.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0" />
                )}
                <span className="truncate">{search.query}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence meter */}
      {state.confidence !== undefined && state.confidence > 0 && (
        <div className="text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Confidence</span>
            <span className="text-gray-700 font-medium">
              {Math.round(state.confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 transition-all duration-500 rounded-full"
              style={{ width: `${state.confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Missing information */}
      {state.missingInfo && state.missingInfo.length > 0 && state.status === "refining" && (
        <div className="text-xs">
          <div className="text-gray-500 mb-1 font-medium">Looking for</div>
          <div className="text-gray-700 bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
            {state.missingInfo.join(", ")}
          </div>
        </div>
      )}

      {/* Iteration info */}
      {state.iteration && state.maxIterations && (
        <div className="text-xs text-gray-500">
          Iteration {state.iteration} of {state.maxIterations}
        </div>
      )}
    </div>
  );
}

export function AgentActivityIndicator({ state, className }: AgentActivityProps) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="p-4">
        <StageTimeline currentStatus={state.status} />
        <DetailsPanel state={state} />
      </div>
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
      {
        time: 800, state: {
          status: "searching",
          currentQuery: "initial search",
          iteration: 1,
          maxIterations: 3,
          searches: [{ query: "Searching knowledge base...", done: false }]
        }
      },
      {
        time: 2500, state: {
          status: "reflecting",
          confidence: 0.5,
          searches: [{ query: "Initial search", done: true }]
        }
      },
      {
        time: 3500, state: {
          status: "refining",
          iteration: 2,
          maxIterations: 3,
          confidence: 0.6,
          searches: [
            { query: "Initial search", done: true },
            { query: "Refining with related terms...", done: false }
          ]
        }
      },
      {
        time: 5000, state: {
          status: "generating",
          confidence: 0.85,
          searches: [
            { query: "Initial search", done: true },
            { query: "Related terms search", done: true }
          ]
        }
      },
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
  const stageLabels: Record<AgentState["status"], string> = {
    idle: "Ready",
    analyzing: "Analyzing question...",
    searching: "Searching knowledge base...",
    reflecting: "Evaluating results...",
    refining: "Refining search...",
    generating: "Generating response...",
  };

  if (state.status === "idle") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className="text-gray-700">{stageLabels[state.status]}</span>
      {state.currentQuery && (
        <span className="text-gray-400 text-xs truncate max-w-[200px]">
          "{state.currentQuery}"
        </span>
      )}
    </div>
  );
}
