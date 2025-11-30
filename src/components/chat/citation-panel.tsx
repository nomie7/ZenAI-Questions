"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { X, FileText, ExternalLink, ZoomIn } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CitationData } from "./citation";

interface CitationPanelProps {
  citation: CitationData | null;
  onClose: () => void;
}

export function CitationPanel({ citation, onClose }: CitationPanelProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!citation) return null;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium truncate">
              {citation.docName}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Page info */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {citation.pageNumber}
                </span>
                {citation.imageUrl && !imageError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsZoomed(true)}
                    className="text-xs"
                  >
                    <ZoomIn className="w-3 h-3 mr-1" />
                    Enlarge
                  </Button>
                )}
              </div>

              {/* Page image */}
              {citation.imageUrl && (
                <div className="relative rounded-lg border bg-gray-50 overflow-hidden">
                  {imageLoading && !imageError && (
                    <Skeleton className="w-full h-48" />
                  )}
                  {imageError ? (
                    <div className="w-full h-32 flex items-center justify-center text-muted-foreground text-sm">
                      Page image unavailable
                    </div>
                  ) : (
                    <img
                      src={citation.imageUrl}
                      alt={`Page ${citation.pageNumber} of ${citation.docName}`}
                      className={`w-full object-contain cursor-pointer hover:opacity-90 transition-opacity ${
                        imageLoading ? "hidden" : ""
                      }`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      onClick={() => setIsZoomed(true)}
                    />
                  )}
                </div>
              )}

              {/* Text snippet */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Relevant Text
                </h4>
                <div className="text-sm bg-gray-50 p-3 rounded-md border">
                  {citation.snippet}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zoom dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {citation.docName} - Page {citation.pageNumber}
            </DialogTitle>
          </DialogHeader>
          {citation.imageUrl && (
            <img
              src={citation.imageUrl}
              alt={`Page ${citation.pageNumber} of ${citation.docName}`}
              className="w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
