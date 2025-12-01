"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { AgentActivityIndicator, useSimulatedAgentActivity, type AgentState } from "./agent-activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  /** Agent state for activity indicator - pass from useCoAgentStateRender when available */
  agentState?: AgentState;
  /** Custom className for the container */
  className?: string;
  /** Chat instructions */
  instructions?: string;
  /** Initial greeting message */
  initialMessage?: string;
  /** Chat title */
  title?: string;
}

/**
 * Embedded chat layout with real-time agent activity display
 *
 * Features:
 * - CopilotChat embedded (not popup/sidebar)
 * - Agent activity indicator showing LLM status
 * - Customizable instructions and labels
 */
export function ChatLayout({
  agentState,
  className,
  instructions = "You are a knowledge assistant. Answer questions using the knowledge base with citations.",
  initialMessage = "Hi! I'm your knowledge assistant. Ask me questions about the documents in your knowledge base, and I'll provide answers with citations.",
  title = "Ask a Question",
}: ChatLayoutProps) {
  const { isLoading } = useCopilotChatInternal();

  // Use simulated activity if no real agent state provided
  const simulatedState = useSimulatedAgentActivity(isLoading);
  const currentState = agentState || simulatedState;

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Agent Activity Section - shows what LLM is doing */}
      <div className="flex-shrink-0 p-3 border-b bg-white">
        {isLoading ? (
          <AgentActivityIndicator state={currentState} />
        ) : (
          <div className="text-sm text-gray-500 text-center py-2">
            Ready to help with your questions
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <CopilotChat
          instructions={instructions}
          labels={{
            title,
            initial: initialMessage,
          }}
          className="h-full"
        />
      </div>
    </div>
  );
}

/**
 * Minimal chat with just activity indicator inline
 */
export function ChatWithActivity({
  agentState,
  className,
}: {
  agentState?: AgentState;
  className?: string;
}) {
  const { isLoading, messages } = useCopilotChatInternal();
  const simulatedState = useSimulatedAgentActivity(isLoading);
  const currentState = agentState || simulatedState;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages and activity */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "p-3 rounded-lg max-w-[85%]",
                message.role === "user"
                  ? "bg-blue-100 ml-auto"
                  : "bg-gray-100"
              )}
            >
              <div className="text-sm whitespace-pre-wrap">
                {typeof message.content === "string"
                  ? message.content
                  : JSON.stringify(message.content)}
              </div>
            </div>
          ))}

          {/* Activity indicator while loading */}
          {isLoading && (
            <div className="bg-gray-50 rounded-lg p-3">
              <AgentActivityIndicator state={currentState} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input handled by CopilotChat */}
      <div className="border-t bg-white p-3">
        <CopilotChat
          className="[&>*:not(:last-child)]:hidden" // Only show input area
          labels={{ title: "" }}
        />
      </div>
    </div>
  );
}
