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
import { FileText, FileQuestion } from "lucide-react";
import { DocumentActions } from "./document-actions";

export interface Document {
  docId: string;
  docName: string;
  pageCount: number;
  chunkCount: number;
  parserUsed: string;
  status: "processing" | "ready" | "failed" | "archived";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
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
            <TableHead className="w-[300px]">Document</TableHead>
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
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium truncate max-w-[250px]">
                      {doc.docName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.docId.slice(0, 8)}...
                    </p>
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
