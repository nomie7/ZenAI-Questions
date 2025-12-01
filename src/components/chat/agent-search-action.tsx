"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  Brain,
  Sparkles,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchStep {
  id: string;
  label: string;
  query?: string;
  done: boolean;
}

interface AgentSearchState {
  status: "analyzing" | "searching" | "reflecting" | "refining" | "generating" | "complete";
  steps: SearchStep[];
  confidence?: number;
  currentQuery?: string;
  iteration?: number;
  maxIterations?: number;
}

const statusIcons = {
  analyzing: Brain,
  searching: Search,
  reflecting: Sparkles,
  refining: RefreshCw,
  generating: FileText,
  complete: CheckCircle2,
};

const statusLabels = {
  analyzing: "Analyzing your question...",
  searching: "Searching knowledge base...",
  reflecting: "Evaluating results...",
  refining: "Refining search...",
  generating: "Generating response...",
  complete: "Complete",
};

const statusColors = {
  analyzing: "text-purple-600 bg-purple-50 border-purple-200",
  searching: "text-blue-600 bg-blue-50 border-blue-200",
  reflecting: "text-amber-600 bg-amber-50 border-amber-200",
  refining: "text-orange-600 bg-orange-50 border-orange-200",
  generating: "text-green-600 bg-green-50 border-green-200",
  complete: "text-green-600 bg-green-50 border-green-200",
};

/**
 * Agent Search Progress Card
 *
 * Displays the current state of the agentic search process
 * with a checklist of completed and pending steps.
 */
export function AgentSearchProgress({ state }: { state: AgentSearchState }) {
  const StatusIcon = statusIcons[state.status] || Search;
  const colorClasses = statusColors[state.status] || statusColors.searching;

  return (
    <div className={cn("rounded-lg border p-4 my-3", colorClasses)}>
      {/* Header with current status */}
      <div className="flex items-center gap-2 mb-3">
        {state.status === "complete" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}
        <span className="font-medium text-sm">{statusLabels[state.status]}</span>
        {state.iteration && state.maxIterations && (
          <span className="ml-auto text-xs opacity-70">
            Iteration {state.iteration}/{state.maxIterations}
          </span>
        )}
      </div>

      {/* Current query being searched */}
      {state.currentQuery && state.status === "searching" && (
        <div className="text-xs bg-white/60 rounded px-2 py-1.5 mb-3 font-mono border border-current/10">
          "{state.currentQuery}"
        </div>
      )}

      {/* Step checklist */}
      {state.steps && state.steps.length > 0 && (
        <div className="space-y-2">
          {state.steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-sm",
                step.done ? "text-gray-600" : "text-gray-800"
              )}
            >
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : state.status !== "complete" ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={cn(step.done && "line-through opacity-60")}>
                {step.label}
              </span>
              {step.query && (
                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                  "{step.query}"
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confidence meter */}
      {state.confidence !== undefined && state.confidence > 0 && (
        <div className="mt-4 pt-3 border-t border-current/10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="opacity-70">Confidence</span>
            <span
              className={cn(
                "font-medium",
                state.confidence >= 0.7
                  ? "text-green-600"
                  : state.confidence >= 0.5
                  ? "text-amber-600"
                  : "text-red-500"
              )}
            >
              {Math.round(state.confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                state.confidence >= 0.7
                  ? "bg-green-500"
                  : state.confidence >= 0.5
                  ? "bg-amber-500"
                  : "bg-red-400"
              )}
              style={{ width: `${state.confidence * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to register the search action with CopilotKit
 *
 * This creates a tool that the LLM can call to show search progress.
 * The render function displays the AgentSearchProgress component.
 */
export function useAgentSearchAction() {
  useCopilotAction({
    name: "show_search_progress",
    description: "Display the current search progress and agent activity",
    parameters: [
      {
        name: "status",
        type: "string",
        description: "Current status: analyzing, searching, reflecting, refining, generating, complete",
        required: true,
      },
      {
        name: "steps",
        type: "object[]",
        description: "Array of search steps with id, label, query (optional), and done boolean",
        required: false,
      },
      {
        name: "confidence",
        type: "number",
        description: "Confidence score from 0 to 1",
        required: false,
      },
      {
        name: "currentQuery",
        type: "string",
        description: "The current search query being executed",
        required: false,
      },
      {
        name: "iteration",
        type: "number",
        description: "Current iteration number",
        required: false,
      },
      {
        name: "maxIterations",
        type: "number",
        description: "Maximum number of iterations",
        required: false,
      },
    ],
    render: ({ status: actionStatus, args }) => {
      const state: AgentSearchState = {
        status: (args.status as AgentSearchState["status"]) || "searching",
        steps: (args.steps as SearchStep[]) || [],
        confidence: args.confidence as number | undefined,
        currentQuery: args.currentQuery as string | undefined,
        iteration: args.iteration as number | undefined,
        maxIterations: args.maxIterations as number | undefined,
      };

      return <AgentSearchProgress state={state} />;
    },
  });
}

/**
 * Simpler inline activity indicator for use during streaming
 */
export function InlineSearchIndicator({
  query,
  isSearching,
}: {
  query?: string;
  isSearching: boolean;
}) {
  if (!isSearching) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 py-2 px-3 bg-gray-50 rounded-lg my-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span>Searching</span>
      {query && (
        <span className="text-gray-400 text-xs truncate max-w-[200px]">
          "{query}"
        </span>
      )}
    </div>
  );
}
