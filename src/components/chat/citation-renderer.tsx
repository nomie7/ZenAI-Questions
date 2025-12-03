"use client";

import { useState, type ReactNode } from "react";
import { type ComponentsMap } from "@copilotkit/react-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./image-viewer";

// Define the props that the citation tag accepts (all optional for ComponentsMap compatibility)
interface CitationTagProps {
  docName?: string;
  pageNumber?: string;
  imageUrl?: string;
  snippet?: string;
  fullText?: string; // Full chunk text for detailed view
  index?: string;
}

interface CitationProps {
  docName?: string;
  pageNumber?: string | number;
  imageUrl?: string;
  snippet?: string;
  fullText?: string; // Full chunk text for detailed view
  children?: ReactNode;
}

/**
 * Inline Citation Badge Component
 *
 * Renders a clickable citation badge that opens a modal
 * with tabbed views: Text, Image, and Both.
 */
function CitationBadge({
  docName = "Document",
  pageNumber = "?",
  imageUrl,
  snippet,
  fullText,
  children,
}: CitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Debug: Log props to see what LLM is passing
  console.log('[CitationBadge] Props:', { docName, pageNumber, imageUrl: imageUrl || '(empty)', hasFullText: !!fullText });

  // Use fullText if available, otherwise fall back to snippet
  const displayText = fullText || snippet;

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

      {/* Citation Detail Modal with Tabs */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              {docName} — Page {pageNumber}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Citation details showing text chunk and page image from {docName}, page {pageNumber}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="both" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-4 shrink-0">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="both">Both</TabsTrigger>
            </TabsList>

            {/* Text Tab */}
            <TabsContent value="text" className="flex-1 px-6 pb-6 mt-2 overflow-auto">
              {displayText ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {displayText}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(displayText);
                    }}
                  >
                    Copy Text
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No text available</p>
                </div>
              )}
            </TabsContent>

            {/* Image Tab */}
            <TabsContent value="image" className="flex-1 px-6 pb-6 mt-2 overflow-auto">
              {imageUrl ? (
                <ImageViewer
                  imageUrl={imageUrl}
                  alt={`Page ${pageNumber} of ${docName}`}
                  docName={docName}
                  pageNumber={pageNumber}
                  showControls={true}
                  enableZoom={true}
                  enableDownload={true}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </TabsContent>

            {/* Both Tab */}
            <TabsContent value="both" className="flex-1 px-6 pb-6 mt-2 overflow-auto">
              <div className="space-y-6">
                {/* Text Section */}
                {displayText && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Chunk Text
                    </h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {displayText}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(displayText);
                      }}
                    >
                      Copy Text
                    </Button>
                  </div>
                )}

                {/* Image Section */}
                {imageUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Page Image
                    </h3>
                    <ImageViewer
                      imageUrl={imageUrl}
                      alt={`Page ${pageNumber} of ${docName}`}
                      docName={docName}
                      pageNumber={pageNumber}
                      showControls={true}
                      enableZoom={true}
                      enableDownload={true}
                    />
                  </div>
                )}

                {/* No content fallback */}
                {!displayText && !imageUrl && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No content available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            {imageUrl && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsFullScreen(true)}
              >
                <ZoomIn className="w-4 h-4 mr-1" />
                Full Screen
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-screen image modal */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 overflow-hidden">
          <DialogDescription className="sr-only">
            Full screen view of page {pageNumber} from {docName}
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white shadow-lg"
            onClick={() => setIsFullScreen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          <ScrollArea className="w-full h-[90vh]">
            <ImageViewer
              imageUrl={imageUrl || ""}
              alt={`Page ${pageNumber} of ${docName}`}
              docName={docName}
              pageNumber={pageNumber}
              showControls={true}
              enableZoom={true}
              enableDownload={true}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Create markdown tag renderers for CopilotKit
 *
 * This creates custom renderers for <citation> tags in the LLM output.
 * 
 * NEW FORMAT (JSON-encoded to work around react-markdown stripping attributes):
 *   <citation>{"index":1,"docName":"Report.pdf","pageNumber":"5","imageUrl":"https://...","text":"full text"}</citation>
 */
export function createCitationTagRenderers(): ComponentsMap<{
  citation: CitationTagProps;
}> {
  return {
    citation: ({ children }) => {
      // Debug: Log what we receive
      console.log('[Citation Parser] Raw children:', children, typeof children);

      let citationData: {
        index?: string | number;
        docName?: string;
        pageNumber?: string | number;
        imageUrl?: string;
        text?: string;
      } = {};

      // Extract text from children (which may be an array with React elements)
      let jsonString = '';

      if (typeof children === 'string') {
        jsonString = children;
      } else if (Array.isArray(children)) {
        // react-markdown converts URLs in the JSON to React <a> elements
        // We need to extract text from all parts and reconstruct the JSON
        jsonString = children.map(child => {
          if (typeof child === 'string') {
            return child;
          } else if (child && typeof child === 'object' && 'props' in child) {
            // It's a React element - extract its children (the URL text)
            return child.props?.children || '';
          }
          return '';
        }).join('');
      } else if (children) {
        jsonString = String(children);
      }

      console.log('[Citation Parser] Reconstructed JSON string:', jsonString);

      // Try to parse JSON
      if (jsonString) {
        try {
          citationData = JSON.parse(jsonString);
          console.log('[Citation Parser] Parsed JSON:', citationData);
        } catch (error) {
          console.warn('[Citation Parser] Failed to parse JSON:', error);
          console.warn('[Citation Parser] JSON string was:', jsonString);
          // Fallback: treat as plain text
          citationData = { text: jsonString };
        }
      }

      const {
        index = '?',
        docName = 'Document',
        pageNumber = '?',
        imageUrl,
        text,
      } = citationData;

      return (
        <CitationBadge
          docName={docName}
          pageNumber={pageNumber}
          imageUrl={imageUrl}
          fullText={text}
        >
          [{index}]
        </CitationBadge>
      );
    },
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
  fullText?: string; // Full chunk text for detailed view
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
            fullText={citation.fullText}
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
