"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, FileText } from "lucide-react";
import { CitationList, type CitationData } from "./citation";
import { CitationPanel } from "./citation-panel";
import { AnswerPaneSkeleton } from "./thinking-indicator";
import { StreamingText } from "./streaming-text";

interface AnswerPaneProps {
  answer: string | null;
  citations: CitationData[];
  isLoading: boolean;
  /** Enable streaming text animation */
  enableStreaming?: boolean;
}

export function AnswerPane({ answer, citations, isLoading, enableStreaming = true }: AnswerPaneProps) {
  const [selectedCitation, setSelectedCitation] = useState<CitationData | null>(
    null
  );
  const [prevAnswer, setPrevAnswer] = useState<string | null>(null);
  const [isNewAnswer, setIsNewAnswer] = useState(false);

  // Track when we get a new answer to trigger streaming animation
  useEffect(() => {
    if (answer && answer !== prevAnswer) {
      setIsNewAnswer(true);
      setPrevAnswer(answer);
      // Reset streaming state after animation completes
      const timeout = setTimeout(() => setIsNewAnswer(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [answer, prevAnswer]);

  // Reset selected citation when answer changes
  useEffect(() => {
    setSelectedCitation(null);
  }, [answer]);

  return (
    <div className="h-full flex">
      {/* Main answer area */}
      <div
        className={`flex-1 flex flex-col ${
          selectedCitation ? "w-2/3" : "w-full"
        } transition-all duration-300`}
      >
        <Card className="h-full flex flex-col border-0 rounded-none">
          <CardHeader className="border-b py-3 px-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg">Answer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {isLoading ? (
                  <AnswerPaneSkeleton />
                ) : answer ? (
                  <div className="space-y-4">
                    {/* Rendered answer with streaming animation */}
                    {enableStreaming && isNewAnswer ? (
                      <StreamingText
                        text={answer}
                        isStreaming={isNewAnswer}
                        showCursor={isNewAnswer}
                      />
                    ) : (
                      <StreamingText
                        text={answer}
                        isStreaming={false}
                        showCursor={false}
                      />
                    )}

                    {/* Citations section */}
                    {citations.length > 0 && (
                      <>
                        <Separator />
                        <CitationList
                          citations={citations}
                          onCitationClick={setSelectedCitation}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Ask a question to get started
                    </p>
                    <p className="text-sm mt-2">
                      Your answer will appear here with citations from the
                      knowledge base
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Citation preview panel */}
      {selectedCitation && (
        <div className="w-1/3 border-l">
          <CitationPanel
            citation={selectedCitation}
            onClose={() => setSelectedCitation(null)}
          />
        </div>
      )}
    </div>
  );
}
