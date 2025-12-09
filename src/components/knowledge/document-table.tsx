"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, FileQuestion, Building2, Globe, Tag, Calendar } from "lucide-react";
import { DocumentActions } from "./document-actions";

export interface DocumentMetadata {
  client?: string;
  vertical?: string;
  region?: string;
  theme?: string;
  year?: number;
  docType?: string;
  topic?: string;
  [key: string]: unknown;
}

export interface Document {
  docId: string;
  docName: string;
  pageCount: number;
  chunkCount: number;
  parserUsed: string;
  status: "processing" | "ready" | "failed" | "archived";
  createdAt: string;
  updatedAt: string;
  metadata?: DocumentMetadata;
}

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onReplace?: (docId: string, docName: string) => void;
  onDelete?: (docId: string) => void;
  onArchive?: (docId: string) => void;
}

export function DocumentTable({
  documents,
  isLoading,
  onReplace,
  onDelete,
  onArchive,
}: DocumentTableProps) {
  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "ready":
        return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render metadata badges for pitch response library fields
  const renderMetadataBadges = (metadata?: DocumentMetadata) => {
    if (!metadata) return null;

    const badges: React.ReactNode[] = [];

    if (metadata.client) {
      badges.push(
        <TooltipProvider key="client">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <Building2 className="w-3 h-3" />
                {metadata.client}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Client</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (metadata.vertical) {
      badges.push(
        <TooltipProvider key="vertical">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {metadata.vertical}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Vertical / Industry</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (metadata.region) {
      badges.push(
        <TooltipProvider key="region">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                <Globe className="w-3 h-3" />
                {metadata.region}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Region</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (metadata.theme) {
      // Theme can be comma-separated, show first one with count
      const themes = metadata.theme.split(",").map((t) => t.trim());
      badges.push(
        <TooltipProvider key="theme">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                <Tag className="w-3 h-3" />
                {themes[0]}
                {themes.length > 1 && <span className="text-xs">+{themes.length - 1}</span>}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <span>Themes: {themes.join(", ")}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (metadata.year) {
      badges.push(
        <TooltipProvider key="year">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 gap-1">
                <Calendar className="w-3 h-3" />
                {metadata.year}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Year</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {badges}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <FileQuestion className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No documents yet</p>
        <p className="text-sm mt-2">
          Upload a PDF to start building your knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Document</TableHead>
            <TableHead>Pages</TableHead>
            <TableHead>Chunks</TableHead>
            <TableHead>Parser</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.docId}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium truncate max-w-[350px]">
                      {doc.docName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.docId.slice(0, 8)}...
                    </p>
                    {renderMetadataBadges(doc.metadata)}
                  </div>
                </div>
              </TableCell>
              <TableCell>{doc.pageCount}</TableCell>
              <TableCell>{doc.chunkCount}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {doc.parserUsed}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(doc.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(doc.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <DocumentActions
                  docId={doc.docId}
                  docName={doc.docName}
                  status={doc.status}
                  onReplace={() => onReplace?.(doc.docId, doc.docName)}
                  onDelete={() => onDelete?.(doc.docId)}
                  onArchive={() => onArchive?.(doc.docId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
