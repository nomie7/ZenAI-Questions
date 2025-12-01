"use client";

import { useRenderToolCall } from "@copilotkit/react-core";
import { Search, CheckCircle2, Loader2, FileText, Brain, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  success: boolean;
  confidence?: number;
  iterations?: number;
  searchQueries?: string[];
  intent?: string;
  error?: string;
}

/**
 * Component that renders the searchKnowledgeBase tool call in the chat
 * Shows progress while searching and results when complete
 */
export function SearchActionRenderer() {
  useRenderToolCall({
    name: "searchKnowledgeBase",
    render: ({ status, args, result }) => {
      const searchResult = result as SearchResult | undefined;
      const query = args?.query as string;

      // In progress state - show searching animation
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="my-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-800">
                    Searching Knowledge Base
                  </span>
                </div>
                {query && (
                  <p className="text-sm text-blue-600 italic truncate">
                    "{query}"
                  </p>
                )}
                <div className="mt-3 space-y-2">
                  <SearchStep icon={Brain} label="Analyzing question" status="complete" />
                  <SearchStep icon={Search} label="Searching documents" status="active" />
                  <SearchStep icon={FileText} label="Processing results" status="pending" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Complete state - show results summary
      if (status === "complete" && searchResult) {
        if (!searchResult.success) {
          return (
            <div className="my-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-800">
                  Search failed
                </span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {searchResult.error || "Unable to search the knowledge base. Please try again."}
              </p>
            </div>
          );
        }

        return (
          <div className="my-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-green-800">
                    Search Complete
                  </span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                    (searchResult.confidence || 0) >= 0.7 ? "bg-green-100 text-green-700" :
                    (searchResult.confidence || 0) >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  )}>
                    {Math.round((searchResult.confidence || 0) * 100)}% confidence
                  </span>
                </div>

                {/* Show iterations and queries in compact form */}
                <div className="text-xs text-gray-600 mb-2">
                  {searchResult.iterations || 1} iteration{(searchResult.iterations || 1) > 1 ? 's' : ''} · {searchResult.searchQueries?.length || 1} quer{(searchResult.searchQueries?.length || 1) > 1 ? 'ies' : 'y'}
                </div>

                {/* Show actual search queries used */}
                {searchResult.searchQueries && searchResult.searchQueries.length > 0 && (
                  <div className="space-y-1">
                    {searchResult.searchQueries.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Search className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      return <></>;
    },
  });

  // This component doesn't render anything directly - it registers the tool renderer
  return null;
}

/**
 * Individual search step indicator
 */
function SearchStep({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: "pending" | "active" | "complete";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        status === "pending" && "text-gray-400",
        status === "active" && "text-blue-600",
        status === "complete" && "text-green-600"
      )}
    >
      {status === "complete" ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : status === "active" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-current opacity-50" />
      )}
      <Icon className={cn("w-4 h-4", status === "pending" && "opacity-50")} />
      <span className={status === "complete" ? "line-through opacity-70" : ""}>
        {label}
      </span>
    </div>
  );
}
