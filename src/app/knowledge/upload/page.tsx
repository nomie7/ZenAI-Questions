"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  FileUp,
  Building2,
  Tag,
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

// Helper component for field hints
function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5">
      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// Helper component for tooltips
function HelpTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
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
  const [themes, setThemes] = useState<string[]>([]);
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

      if (docType) formData.append("docType", docType);
      if (topic) formData.append("topic", topic);
      if (client) formData.append("client", client);
      if (vertical) formData.append("vertical", vertical);
      if (region) formData.append("region", region);
      if (themes.length > 0) formData.append("theme", themes.join(", "));
      if (year) formData.append("year", year);

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

      // Redirect after success
      setTimeout(() => {
        router.push("/knowledge");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/knowledge"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Base
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground mt-2">
            Add a new document to your knowledge base for AI-powered search and retrieval.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Select File
                  </CardTitle>
                  <CardDescription>
                    Upload your document to be processed and indexed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      file
                        ? "border-green-400 bg-green-50/50 dark:bg-green-950/20"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() => !file && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.md,.html,.htm,.png,.jpg,.jpeg,.tiff,.bmp,.heic"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isProcessing}
                    />

                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="font-semibold text-lg text-green-700 dark:text-green-400">
                            {file.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-500">
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
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Details
                  </CardTitle>
                  <CardDescription>
                    Basic information about your document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="docName" className="flex items-center gap-2">
                        Document Name <span className="text-destructive">*</span>
                        <HelpTooltip content="A clear, descriptive name helps you and your team find this document later. Use a name that reflects the content." />
                      </Label>
                      <Input
                        id="docName"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="e.g., Q4 2024 Marketing Strategy"
                        disabled={isProcessing}
                        className="h-11"
                      />
                      <FieldHint>
                        This name will appear in search results and the document list.
                      </FieldHint>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parserType" className="flex items-center gap-2">
                        Parser Type
                        <HelpTooltip content="Choose how the document should be processed. Unstructured works for most documents. Use Gemini for scanned documents or images with text." />
                      </Label>
                      <Select
                        value={parserType}
                        onValueChange={(v: "gemini" | "unstructured") =>
                          setParserType(v)
                        }
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
                      <FieldHint>
                        Gemini uses AI vision for better results on scanned PDFs and images.
                      </FieldHint>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="docType" className="flex items-center gap-2">
                        Document Type
                        <HelpTooltip content="Categorize what kind of document this is. This helps filter and organize your knowledge base." />
                      </Label>
                      <Input
                        id="docType"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        placeholder="e.g., Proposal, Case Study, SOP"
                        disabled={isProcessing}
                        className="h-11"
                      />
                      <FieldHint>
                        Examples: Proposal, Case Study, Presentation, Report, SOP
                      </FieldHint>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic" className="flex items-center gap-2">
                        Topic / Category
                        <HelpTooltip content="The main subject area or department this document relates to." />
                      </Label>
                      <Input
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Marketing, Sales, Product"
                        disabled={isProcessing}
                        className="h-11"
                      />
                      <FieldHint>
                        Helps group related documents together.
                      </FieldHint>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pitch Response Library */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Pitch Response Library
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        Tag your pitch materials for easy retrieval during RFP responses
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="client" className="flex items-center gap-2">
                        Client
                        <HelpTooltip content="The client or company this pitch was created for. Helps find similar past pitches." />
                      </Label>
                      <Input
                        id="client"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="e.g., Spotify, Adobe, Nike"
                        disabled={isProcessing}
                        className="h-11"
                      />
                      <FieldHint>
                        Search for pitches by client name later.
                      </FieldHint>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vertical" className="flex items-center gap-2">
                        Industry Vertical
                        <HelpTooltip content="The industry sector the client belongs to. Useful for finding relevant case studies." />
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
                      <FieldHint>
                        Find pitches from similar industries.
                      </FieldHint>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="region" className="flex items-center gap-2">
                        Region
                        <HelpTooltip content="Geographic scope of the pitch. Global for worldwide campaigns, or specific regions." />
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
                      <FieldHint>
                        Filter by geographic relevance.
                      </FieldHint>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year" className="flex items-center gap-2">
                        Year
                        <HelpTooltip content="When was this pitch created? Helps prioritize recent, relevant content." />
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
                      <FieldHint>
                        Recent pitches are often more relevant.
                      </FieldHint>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme" className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Themes / Tags
                      <HelpTooltip content="Add keywords that describe the pitch focus areas. These help with semantic search." />
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        onKeyDown={handleThemeKeyDown}
                        placeholder="Type a theme and press Enter"
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
                    <FieldHint>
                      Examples: Data Strategy, Audience Building, Performance Marketing, Brand Awareness
                    </FieldHint>
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

              {/* Submit Section */}
              <Card>
                <CardContent className="pt-6">
                  {/* Progress indicator */}
                  {isProcessing && (
                    <div className="space-y-3 mb-6">
                      <Progress value={progress} className="h-2.5" />
                      <p className="text-sm text-center text-muted-foreground">
                        {status === "uploading"
                          ? "Uploading document..."
                          : "Processing document... This may take a minute."}
                      </p>
                    </div>
                  )}

                  {/* Status messages */}
                  {status === "success" && (
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-900 mb-6">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">
                        Document uploaded successfully! Redirecting...
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-4 rounded-lg border border-red-200 dark:border-red-900 mb-6">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/knowledge")}
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !file}
                      size="lg"
                      className="px-8"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Help & Tips */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Tips for Best Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">📄 Document Quality</p>
                    <p className="text-muted-foreground">
                      Use native PDFs when possible. Scanned documents work too,
                      but may have lower accuracy.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">🏷️ Good Naming</p>
                    <p className="text-muted-foreground">
                      Use descriptive names like "Nike Q4 2024 Media Strategy"
                      instead of "proposal_final_v3".
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">🎯 Add Metadata</p>
                    <p className="text-muted-foreground">
                      The more metadata you add, the easier it is to find relevant
                      content during pitch responses.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Formats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>DOCX / DOC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>PPTX / PPT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>XLSX / XLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>TXT / MD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>HTML</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>PNG / JPG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>TIFF / HEIC</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
                    Images require Gemini parser for text extraction
                  </p>
                </CardContent>
              </Card>

              {/* AI Processing Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      1
                    </div>
                    <p className="text-muted-foreground">
                      Your document is parsed and split into semantic chunks
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      2
                    </div>
                    <p className="text-muted-foreground">
                      Each chunk is converted to an AI embedding vector
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      3
                    </div>
                    <p className="text-muted-foreground">
                      Vectors are stored for fast semantic search
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      4
                    </div>
                    <p className="text-muted-foreground">
                      AI can now find and cite relevant content from your doc
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
