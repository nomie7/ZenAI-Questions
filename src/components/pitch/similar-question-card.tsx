"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Globe,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";

export interface SimilarQuestionResult {
  id: string;
  questionText: string;
  answerText: string;
  similarity: number;
  confidence: number;
  metadata: {
    client: string;
    vertical: string;
    region: string;
    theme: string;
    year: number | null;
  };
  source: {
    docId: string;
    docName: string;
    pageNumber: number;
    chunkId: string;
  };
}

interface SimilarQuestionCardProps {
  result: SimilarQuestionResult;
  rank: number;
}

export function SimilarQuestionCard({ result, rank }: SimilarQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAnswer = async () => {
    await navigator.clipboard.writeText(result.answerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const similarityPercent = Math.round(result.similarity * 100);
  const confidencePercent = Math.round(result.confidence * 100);

  // Truncate answer for preview
  const previewLength = 200;
  const answerPreview = result.answerText.length > previewLength
    ? result.answerText.slice(0, previewLength) + "..."
    : result.answerText;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {rank}
              </span>
              <Badge variant="outline" className="text-xs">
                {similarityPercent}% match
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {confidencePercent}% confidence
              </Badge>
            </div>
            <CardTitle className="text-base font-medium leading-snug">
              {result.questionText}
            </CardTitle>
          </div>
        </div>

        {/* Metadata Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {result.metadata.client && (
            <Badge variant="outline" className="text-xs gap-1">
              <Building2 className="w-3 h-3" />
              {result.metadata.client}
            </Badge>
          )}
          {result.metadata.vertical && (
            <Badge variant="outline" className="text-xs gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <Tag className="w-3 h-3" />
              {result.metadata.vertical}
            </Badge>
          )}
          {result.metadata.region && (
            <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
              <Globe className="w-3 h-3" />
              {result.metadata.region}
            </Badge>
          )}
          {result.metadata.year && (
            <Badge variant="outline" className="text-xs gap-1">
              <Calendar className="w-3 h-3" />
              {result.metadata.year}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Answer Preview/Full */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground font-medium mb-1">Answer:</p>
            <p className="text-sm whitespace-pre-wrap">
              {isExpanded ? result.answerText : answerPreview}
            </p>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Source Information */}
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    Page {result.source.pageNumber} of "{result.source.docName}"
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAnswer}
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Answer
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Toggle Button */}
          {result.answerText.length > previewLength && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  View Full Answer
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
