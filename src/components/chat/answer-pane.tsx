"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CitationList, type CitationData } from "./citation";
import { CitationPanel } from "./citation-panel";
import { AnswerPaneSkeleton } from "./thinking-indicator";

interface AnswerPaneProps {
  answer: string | null;
  citations: CitationData[];
  isLoading: boolean;
}

export function AnswerPane({ answer, citations, isLoading }: AnswerPaneProps) {
  const [selectedCitation, setSelectedCitation] = useState<CitationData | null>(
    null
  );

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
                    {/* Rendered answer with markdown */}
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          // Style code blocks
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                                {children}
                              </code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          },
                          // Style links
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {answer}
                      </ReactMarkdown>
                    </div>

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
