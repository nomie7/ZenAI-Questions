"use client";

import { useState, type ReactNode } from "react";
import { type ComponentsMap } from "@copilotkit/react-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the props that the citation tag accepts (all optional for ComponentsMap compatibility)
interface CitationTagProps {
  docName?: string;
  pageNumber?: string;
  imageUrl?: string;
  snippet?: string;
}

interface CitationProps {
  docName?: string;
  pageNumber?: string | number;
  imageUrl?: string;
  snippet?: string;
  children?: ReactNode;
}

/**
 * Inline Citation Badge Component
 *
 * Renders a clickable citation badge that opens a modal
 * with the page image and snippet.
 */
function CitationBadge({
  docName = "Document",
  pageNumber = "?",
  imageUrl,
  snippet,
  children,
}: CitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Inline badge button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 mx-0.5 px-2 py-0.5",
          "text-xs font-medium rounded-md cursor-pointer",
          "bg-blue-50 text-blue-700 border border-blue-200",
          "hover:bg-blue-100 hover:border-blue-300",
          "transition-colors duration-150"
        )}
      >
        <FileText className="w-3 h-3" />
        <span>{children || `${docName}, p.${pageNumber}`}</span>
      </button>

      {/* Citation Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              {docName} — Page {pageNumber}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-4">
              {/* Page Image */}
              {imageUrl && (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden border">
                  {/* Loading skeleton */}
                  {!imageLoaded && !imageError && (
                    <Skeleton className="w-full aspect-[8.5/11]" />
                  )}

                  {/* Error state */}
                  {imageError && (
                    <div className="w-full aspect-[8.5/11] flex items-center justify-center bg-gray-100 text-gray-400">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Page image unavailable</p>
                      </div>
                    </div>
                  )}

                  {/* Actual image */}
                  {!imageError && (
                    <img
                      src={imageUrl}
                      alt={`Page ${pageNumber} of ${docName}`}
                      className={cn(
                        "w-full object-contain",
                        !imageLoaded && "hidden"
                      )}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  )}

                  {/* Zoom button overlay */}
                  {imageLoaded && !imageError && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-3 right-3 shadow-lg"
                      onClick={() => setIsZoomed(true)}
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      Zoom
                    </Button>
                  )}
                </div>
              )}

              {/* Text Snippet */}
              {snippet && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{snippet}"
                  </p>
                </div>
              )}

              {/* No content fallback */}
              {!imageUrl && !snippet && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No preview available</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer with actions */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-screen zoom modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white shadow-lg"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <ScrollArea className="w-full h-[90vh]">
              <img
                src={imageUrl}
                alt={`Page ${pageNumber} of ${docName}`}
                className="w-full object-contain"
              />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Create markdown tag renderers for CopilotKit
 *
 * This creates custom renderers for <citation> tags in the LLM output.
 * Usage in LLM instructions:
 *   <citation docName="Report.pdf" pageNumber="5" snippet="text...">1</citation>
 */
export function createCitationTagRenderers(): ComponentsMap<{
  citation: CitationTagProps;
}> {
  return {
    citation: ({ children, docName, pageNumber, imageUrl, snippet }) => (
      <CitationBadge
        docName={docName}
        pageNumber={pageNumber}
        imageUrl={imageUrl}
        snippet={snippet}
      >
        {children}
      </CitationBadge>
    ),
  };
}

/**
 * Simple citation list component for displaying sources at the end
 */
interface CitationListItem {
  id: number;
  docName: string;
  pageNumber: number;
  imageUrl?: string;
  snippet: string;
}

export function CitationSourceList({
  citations,
  className,
}: {
  citations: CitationListItem[];
  className?: string;
}) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-200", className)}>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Sources
      </h4>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation) => (
          <CitationBadge
            key={citation.id}
            docName={citation.docName}
            pageNumber={citation.pageNumber}
            imageUrl={citation.imageUrl}
            snippet={citation.snippet}
          >
            [{citation.id}] {citation.docName}, p.{citation.pageNumber}
          </CitationBadge>
        ))}
      </div>
    </div>
  );
}

// Export the badge component for direct use
export { CitationBadge };
