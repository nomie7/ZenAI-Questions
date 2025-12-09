"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { CustomAssistantMessage, CustomUserMessage } from "@/components/chat/custom-assistant-message";
import { createCitationTagRenderers } from "@/components/chat/citation-renderer";
import { SearchActionRenderer } from "@/components/chat/search-action-renderer";
import { CHAT_INSTRUCTIONS, CHAT_LABELS } from "@/lib/chat-instructions";

/**
 * Main chat page with full-width CopilotKit integration
 *
 * Features:
 * - Custom message components with avatars
 * - Markdown rendering with custom citation tags
 * - Search action rendering showing backend activity
 * - Clean, modern chat interface
 */
export default function Home() {
  const citationRenderers = createCitationTagRenderers();

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Knowledge Assistant</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/knowledge">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Knowledge Base
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {/* Register the search action renderer - must be inside CopilotKit context */}
        <SearchActionRenderer />

        <CopilotChat
          instructions={CHAT_INSTRUCTIONS}
          labels={CHAT_LABELS}
          className="h-full"
          UserMessage={CustomUserMessage}
          AssistantMessage={CustomAssistantMessage}
          markdownTagRenderers={citationRenderers}
          onThumbsUp={(message) => {
            console.log("Positive feedback for message:", message.id);
            // TODO: Track positive feedback in analytics/database
          }}
          onThumbsDown={(message) => {
            console.log("Negative feedback for message:", message.id);
            // TODO: Track negative feedback in analytics/database
          }}
          onSubmitMessage={() => {
            console.log("Message submitted");
            // TODO: Track message submission analytics
          }}
          observabilityHooks={{
            onMessageSent: (message) => {
              console.log("Message sent:", message);
              // TODO: Track message in analytics
            },
          }}
        />
      </div>
    </main>
  );
}
