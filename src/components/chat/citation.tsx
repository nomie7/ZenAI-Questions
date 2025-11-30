"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export interface CitationData {
  docName: string;
  pageNumber: number;
  imageUrl?: string;
  snippet: string;
}

interface CitationProps {
  citation: CitationData;
  index: number;
  onClick?: (citation: CitationData) => void;
}

export function Citation({ citation, index, onClick }: CitationProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-blue-100 transition-colors inline-flex items-center gap-1 mx-0.5"
            onClick={() => onClick?.(citation)}
          >
            <FileText className="w-3 h-3" />
            <span className="text-xs">
              [{index + 1}] {citation.docName}, p.{citation.pageNumber}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-sm font-medium mb-1">
            {citation.docName} - Page {citation.pageNumber}
          </p>
          <p className="text-xs text-muted-foreground">{citation.snippet}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CitationListProps {
  citations: CitationData[];
  onCitationClick?: (citation: CitationData) => void;
}

export function CitationList({ citations, onCitationClick }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
      <span className="text-xs text-muted-foreground mr-1">Sources:</span>
      {citations.map((citation, index) => (
        <Citation
          key={`${citation.docName}-${citation.pageNumber}-${index}`}
          citation={citation}
          index={index}
          onClick={onCitationClick}
        />
      ))}
    </div>
  );
}
