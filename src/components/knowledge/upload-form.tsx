"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface UploadFormProps {
  replaceDocId?: string;
  replaceDocName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function UploadForm({
  replaceDocId,
  replaceDocName,
  onSuccess,
  onCancel,
}: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState(replaceDocName || "");
  const [parserType, setParserType] = useState<"gemini" | "unstructured">(
    "unstructured"
  );
  const [docType, setDocType] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!docName) {
        // Auto-fill document name from filename
        setDocName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!docName.trim()) {
      setError("Please enter a document name");
      return;
    }

    setStatus("uploading");
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docName", docName.trim());
      formData.append("parserType", parserType);

      if (replaceDocId) {
        formData.append("replaceDocId", replaceDocId);
      }
      if (docType) {
        formData.append("docType", docType);
      }
      if (topic) {
        formData.append("topic", topic);
      }

      setProgress(30);
      setStatus("processing");

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setStatus("success");

      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setDocName("");
        setDocType("");
        setTopic("");
        setStatus("idle");
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {replaceDocId ? "Replace Document" : "Upload Document"}
        </CardTitle>
        <CardDescription>
          {replaceDocId
            ? `Replace "${replaceDocName}" with a new version`
            : "Upload a document to add to the knowledge base"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.md,.html,.htm,.png,.jpg,.jpeg,.tiff,.bmp,.heic"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-green-600">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Click to select a document</p>
                  <p className="text-sm mt-1">PDF, PPT, DOCX, images, and more</p>
                </div>
              )}
            </div>
          </div>

          {/* Document name */}
          <div className="space-y-2">
            <Label htmlFor="docName">Document Name</Label>
            <Input
              id="docName"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Enter a descriptive name"
              disabled={isProcessing}
            />
          </div>

          {/* Parser type */}
          <div className="space-y-2">
            <Label htmlFor="parserType">Parser Type</Label>
            <Select
              value={parserType}
              onValueChange={(v: "gemini" | "unstructured") => setParserType(v)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unstructured">
                  Unstructured (Default - structured docs, tables)
                </SelectItem>
                <SelectItem value="gemini">
                  Gemini (OCR, scanned PDFs, complex layouts)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Unstructured handles most documents well. Use Gemini for scanned
              documents or handwritten content.
            </p>
          </div>

          {/* Optional metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type (optional)</Label>
              <Input
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="e.g., SOP, FAQ, Manual"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., HR, Engineering"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Progress indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {status === "uploading" ? "Uploading..." : "Processing..."}
              </p>
            </div>
          )}

          {/* Status messages */}
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="w-5 h-5" />
              <span>Document uploaded successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isProcessing || !file}>
              {isProcessing
                ? "Processing..."
                : replaceDocId
                  ? "Replace Document"
                  : "Upload Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
