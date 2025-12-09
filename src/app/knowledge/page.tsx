"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, RefreshCw, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { UploadForm } from "@/components/knowledge/upload-form";
import {
  DocumentTable,
  type Document,
} from "@/components/knowledge/document-table";
import { FeedbackTable } from "@/components/knowledge/feedback-table";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [replaceDoc, setReplaceDoc] = useState<{
    docId: string;
    docName: string;
  } | null>(null);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/ingest");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleReplace = (docId: string, docName: string) => {
    setReplaceDoc({ docId, docName });
  };

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    setReplaceDoc(null);
    fetchDocuments();
  };

  const handleDelete = () => {
    fetchDocuments();
  };

  // Calculate stats
  const stats = {
    total: documents.length,
    ready: documents.filter((d) => d.status === "ready").length,
    processing: documents.filter((d) => d.status === "processing").length,
    totalChunks: documents.reduce((sum, d) => sum + d.chunkCount, 0),
    totalPages: documents.reduce((sum, d) => sum + d.pageCount, 0),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Knowledge Base</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDocuments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowUploadDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Tabs for Documents and Feedback */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documents">
              <BookOpen className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardDescription>Total Documents</CardDescription>
                  <CardTitle className="text-2xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardDescription>Ready</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {stats.ready}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardDescription>Total Pages</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalPages}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardDescription>Total Chunks</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalChunks}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Document table */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Manage your knowledge base documents. Upload, replace, or delete
                  documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentTable
                  documents={documents}
                  isLoading={isLoading}
                  onReplace={handleReplace}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
                <CardDescription>
                  View all user feedback (thumbs up/down) for assistant responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Role/Auth placeholder */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Authentication and role-based access control
            will be added in a future phase. Currently, all users can access
            this page.
          </p>
        </div>
      </div>

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <UploadForm
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Replace dialog */}
      <Dialog open={!!replaceDoc} onOpenChange={() => setReplaceDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace Document</DialogTitle>
          </DialogHeader>
          {replaceDoc && (
            <UploadForm
              replaceDocId={replaceDoc.docId}
              replaceDocName={replaceDoc.docName}
              onSuccess={handleUploadSuccess}
              onCancel={() => setReplaceDoc(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
