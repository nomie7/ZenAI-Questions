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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle, X, FileUp, Building2, Tag } from "lucide-react";

// Predefined vertical options
const VERTICAL_OPTIONS = [
  "CPG",
  "Entertainment",
  "B2B",
  "Retail",
  "Financial Services",
  "Healthcare",
  "Technology",
  "Automotive",
  "Travel & Hospitality",
  "Media & Publishing",
  "Telecommunications",
  "Other",
] as const;

// Predefined region options
const REGION_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "local", label: "Local" },
  { value: "apac", label: "APAC" },
  { value: "emea", label: "EMEA" },
  { value: "americas", label: "Americas" },
] as const;

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
  // Pitch response library metadata
  const [client, setClient] = useState("");
  const [vertical, setVertical] = useState("");
  const [region, setRegion] = useState("");
  const [theme, setTheme] = useState("");
  const [themes, setThemes] = useState<string[]>([]); // For multiple themes
  const [year, setYear] = useState<string>("");

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle adding a theme tag
  const addTheme = () => {
    if (theme.trim() && !themes.includes(theme.trim())) {
      setThemes([...themes, theme.trim()]);
      setTheme("");
    }
  };

  // Handle removing a theme tag
  const removeTheme = (themeToRemove: string) => {
    setThemes(themes.filter((t) => t !== themeToRemove));
  };

  // Handle Enter key in theme input
  const handleThemeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTheme();
    }
  };

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

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      // Pitch response library metadata
      if (client) {
        formData.append("client", client);
      }
      if (vertical) {
        formData.append("vertical", vertical);
      }
      if (region) {
        formData.append("region", region);
      }
      if (themes.length > 0) {
        formData.append("theme", themes.join(", "));
      }
      if (year) {
        formData.append("year", year);
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
        // Reset pitch response library fields
        setClient("");
        setVertical("");
        setRegion("");
        setTheme("");
        setThemes([]);
        setYear("");
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero File Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center ${
            file
              ? "border-green-400 bg-green-50/50"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
          }`}
          onClick={() => !file && fileInputRef.current?.click()}
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-1 text-center">
                <p className="font-semibold text-lg text-green-700">{file.name}</p>
                <p className="text-sm text-green-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="mt-2"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" />
                Remove file
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FileUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium">
                  Drop your file here, or{" "}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOCX, PPTX, XLSX, TXT, MD, HTML, and images
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document Details Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Document Name and Parser */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="docName" className="text-sm font-medium">
                  Document Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="docName"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Enter a descriptive name"
                  disabled={isProcessing}
                  className="h-11"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="parserType" className="text-sm font-medium">
                  Parser Type
                </Label>
                <Select
                  value={parserType}
                  onValueChange={(v: "gemini" | "unstructured") => setParserType(v)}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unstructured">
                      Unstructured (Default)
                    </SelectItem>
                    <SelectItem value="gemini">
                      Gemini (OCR, scanned docs)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Document Type and Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="docType" className="text-sm font-medium">
                  Document Type
                </Label>
                <Input
                  id="docType"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  placeholder="e.g., SOP, FAQ, Proposal"
                  disabled={isProcessing}
                  className="h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., HR, Engineering, Sales"
                  disabled={isProcessing}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pitch Response Library Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Pitch Response Library
              </CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                Optional
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Client and Vertical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="client" className="text-sm font-medium">
                  Client
                </Label>
                <Input
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g., Spotify, Adobe, Nike"
                  disabled={isProcessing}
                  className="h-11"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="vertical" className="text-sm font-medium">
                  Vertical
                </Label>
                <Select
                  value={vertical}
                  onValueChange={setVertical}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERTICAL_OPTIONS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Region and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="region" className="text-sm font-medium">
                  Region
                </Label>
                <Select
                  value={region}
                  onValueChange={setRegion}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="year" className="text-sm font-medium">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="2000"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={new Date().getFullYear().toString()}
                  disabled={isProcessing}
                  className="h-11"
                />
              </div>
            </div>

            {/* Themes/Tags */}
            <div className="space-y-2.5">
              <Label htmlFor="theme" className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Themes / Tags
              </Label>
              <div className="flex gap-3">
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  onKeyDown={handleThemeKeyDown}
                  placeholder="e.g., Data Strategy, Audience Building, Performance"
                  disabled={isProcessing}
                  className="h-11 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTheme}
                  disabled={isProcessing || !theme.trim()}
                  className="h-11 px-5"
                >
                  Add
                </Button>
              </div>
              {themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {themes.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTheme(t)}
                        className="hover:text-destructive ml-1"
                        disabled={isProcessing}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress and Actions Footer */}
        <div className="space-y-4 pt-2">
          {/* Progress indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2.5" />
              <p className="text-sm text-center text-muted-foreground">
                {status === "uploading" ? "Uploading document..." : "Processing document..."}
              </p>
            </div>
          )}

          {/* Status messages */}
          {status === "success" && (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Document uploaded successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="h-11 px-6"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isProcessing || !file}
              className="h-11 px-6"
            >
              {isProcessing
                ? "Processing..."
                : replaceDocId
                  ? "Replace Document"
                  : "Upload Document"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
