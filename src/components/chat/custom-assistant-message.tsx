"use client";

import {
  type AssistantMessageProps,
  type UserMessageProps,
  Markdown,
} from "@copilotkit/react-ui";
import { useCopilotChat } from "@copilotkit/react-core";
import { Sparkles, Loader2 } from "lucide-react";
import { MessageActionButtons } from "./message-action-buttons";

type RoleMessage = {
  id?: string;
  role?: string;
  content?: string;
  generativeUI?: () => React.ReactNode;
};

/**
 * Custom Assistant Message component for CopilotKit
 *
 * Features:
 * - Custom avatar with sparkles icon
 * - CopilotKit's Markdown component with markdownTagRenderers support
 * - Loading spinner during generation
 * - SubComponent/generativeUI support for tool outputs
 * - Action buttons for feedback (thumbs up/down, copy, regenerate)
 */
export function CustomAssistantMessage(props: AssistantMessageProps) {
  const { message, isLoading, subComponent, markdownTagRenderers } = props;
  const roleMessage = message as RoleMessage | undefined;
  const content = roleMessage?.content || "";
  const { visibleMessages } = useCopilotChat();

  // Find the previous user message for this assistant message
  const getPreviousUserMessage = (): string | undefined => {
    if (!roleMessage?.id || !visibleMessages) return undefined;

    const typedMessages = visibleMessages as unknown as RoleMessage[];
    const currentIndex = typedMessages.findIndex((m) => m.id === roleMessage.id);
    if (currentIndex <= 0) return undefined;

    // Look backwards for the most recent user message
    for (let i = currentIndex - 1; i >= 0; i--) {
      const msg = typedMessages[i];
      if (msg?.role === "user" && msg.content) {
        return msg.content;
      }
    }
    return undefined;
  };

  const userMessage = getPreviousUserMessage();

  // Get generativeUI if available (new way)
  const generativeUI = roleMessage?.generativeUI?.();

  // Don't render empty messages - avoids blank bubbles between tool calls and responses
  // Only render if there's actual content or UI to display
  const hasContent = content.trim().length > 0;
  const hasUI = generativeUI || subComponent;

  // Be aggressive about hiding empty messages - even if "loading", if there's no content
  // and no UI, don't render. The search action renderer already shows progress.
  if (!hasContent && !hasUI) {
    return null;
  }

  return (
    <div className="group flex items-start gap-3 py-4 px-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Render markdown content with custom tag renderers */}
        {content && (
          <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:my-2 prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-li:my-0.5 prose-pre:bg-gray-900 prose-pre:text-gray-100">
            <Markdown content={content} components={markdownTagRenderers} />
          </div>
        )}

        {/* Streaming indicator when loading with content */}
        {isLoading && content && (
          <div className="flex items-center gap-1.5 text-blue-500 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating...</span>
          </div>
        )}

        {/* GenerativeUI (new way) */}
        {generativeUI && (
          <div className="mt-3">
            {generativeUI}
          </div>
        )}

        {/* Tool output / SubComponent (deprecated but still supported) */}
        {subComponent && !generativeUI && (
          <div className="mt-3">
            {subComponent}
          </div>
        )}

        {/* Action buttons (copy, regenerate, thumbs up/down) - only show when not loading */}
        {!isLoading && roleMessage?.id && content && (
          <MessageActionButtons
            messageId={roleMessage.id}
            content={content}
            userMessage={userMessage}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Custom User Message component for CopilotKit
 */
export function CustomUserMessage(props: UserMessageProps) {
  const content = (props.message as RoleMessage | undefined)?.content || "";

  return (
    <div className="flex items-start gap-3 py-4 px-4 justify-end">
      {/* Message Content */}
      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
        <p className="text-sm whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600">You</span>
      </div>
    </div>
  );
}
