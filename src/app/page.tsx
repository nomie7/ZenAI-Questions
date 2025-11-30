"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { AnswerPane } from "@/components/chat/answer-pane";
import type { CitationData } from "@/components/chat/citation";

function normalizeContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          return (item as { text?: string }).text || "";
        }
        return "";
      })
      .join(" ");
  }
  if (content && typeof content === "object" && "text" in content) {
    return (content as { text?: string }).text || "";
  }
  return "";
}

export default function Home() {
  const { messages, isLoading } = useCopilotChatInternal();
  const [citations, setCitations] = useState<CitationData[]>([]);
  const [isFetchingCitations, setIsFetchingCitations] = useState(false);
  const lastAnsweredRef = useRef<string | null>(null);

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages]
  );
  const lastUser = useMemo(
    () => [...messages].reverse().find((m) => m.role === "user"),
    [messages]
  );

  const answer = lastAssistant ? normalizeContent(lastAssistant.content) : null;
  const userQuery = lastUser ? normalizeContent(lastUser.content) : null;

  // Fetch citations once a new assistant answer arrives
  useEffect(() => {
    if (!lastAssistant || !userQuery || isLoading) return;

    const lastId = String((lastAssistant as { id?: string }).id || userQuery);
    if (lastAnsweredRef.current === lastId) return;
    lastAnsweredRef.current = lastId;

    setIsFetchingCitations(true);
    fetch(`/api/citations?q=${encodeURIComponent(userQuery)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load citations");
        }
        return res.json();
      })
      .then((data) => {
        setCitations(data.citations || []);
      })
      .catch((error) => {
        console.error("Citation fetch error:", error);
        setCitations([]);
      })
      .finally(() => setIsFetchingCitations(false));
  }, [isLoading, lastAssistant, userQuery]);

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white">
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

      {/* Main content area - two pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Answer + citations */}
        <div className="flex-1 bg-white border-r overflow-hidden">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="border-b">
              <CardTitle>Answer & Sources</CardTitle>
            </CardHeader>
            <AnswerPane
              answer={answer}
              citations={citations}
              isLoading={isLoading || isFetchingCitations}
            />
          </Card>
        </div>

        {/* Right pane - Chat sidebar */}
        <div className="w-[400px] border-l bg-gray-50">
          <CopilotSidebar
            defaultOpen={true}
            clickOutsideToClose={false}
            className="h-full relative"
            labels={{
              title: "Ask a Question",
              initial:
                "Hi! I'm your knowledge assistant. Ask questions about the documents in your knowledge base, and I'll provide answers with citations.",
            }}
          />
        </div>
      </div>
    </main>
  );
}
