"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowLeft,
  Loader2,
  HelpCircle,
  Filter,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  SimilarQuestionCard,
  type SimilarQuestionResult,
} from "@/components/pitch/similar-question-card";

// Predefined vertical options (same as upload form)
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
] as const;

// Predefined region options
const REGION_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "local", label: "Local" },
  { value: "apac", label: "APAC" },
  { value: "emea", label: "EMEA" },
  { value: "americas", label: "Americas" },
] as const;

export default function PitchSearchPage() {
  const [question, setQuestion] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SimilarQuestionResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [excludeClient, setExcludeClient] = useState("");

  const handleSearch = async () => {
    if (!question.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const filters: Record<string, unknown> = {};

      if (selectedVerticals.length > 0) {
        filters.vertical = selectedVerticals;
      }
      if (selectedRegion) {
        filters.region = selectedRegion;
      }
      if (excludeClient.trim()) {
        filters.excludeClient = excludeClient.trim();
      }

      const response = await fetch("/api/similar-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          topK: 10,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to search for similar questions. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleVertical = (vertical: string) => {
    setSelectedVerticals((prev) =>
      prev.includes(vertical)
        ? prev.filter((v) => v !== vertical)
        : [...prev, vertical]
    );
  };

  const clearFilters = () => {
    setSelectedVerticals([]);
    setSelectedRegion("");
    setExcludeClient("");
  };

  const hasActiveFilters =
    selectedVerticals.length > 0 || selectedRegion || excludeClient;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold">Find Similar Questions</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/knowledge">
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Knowledge Base
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Past Pitch Questions
            </CardTitle>
            <CardDescription>
              Enter a question from your RFP or pitch, and we'll find similar
              questions from past pitches with their answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <div className="flex gap-2">
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., How do you handle data in low-match markets?"
                  className="flex-1"
                  disabled={isSearching}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !question.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-muted-foreground"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedVerticals.length +
                      (selectedRegion ? 1 : 0) +
                      (excludeClient ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                {/* Vertical Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Filter by Industry Vertical</Label>
                  <div className="flex flex-wrap gap-2">
                    {VERTICAL_OPTIONS.map((vertical) => (
                      <Badge
                        key={vertical}
                        variant={
                          selectedVerticals.includes(vertical)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleVertical(vertical)}
                      >
                        {vertical}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={selectedRegion || "any"}
                      onValueChange={(val) => setSelectedRegion(val === "any" ? "" : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any region</SelectItem>
                        {REGION_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exclude Client */}
                  <div className="space-y-2">
                    <Label htmlFor="excludeClient">Exclude Client</Label>
                    <Input
                      id="excludeClient"
                      value={excludeClient}
                      onChange={(e) => setExcludeClient(e.target.value)}
                      placeholder="e.g., Nike"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Searching for similar questions...
            </p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No similar questions found</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Try rephrasing your question or adjusting the filters. Make sure
                you have uploaded pitch documents with Q&A content.
              </p>
            </CardContent>
          </Card>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Found {results.length} Similar Question{results.length !== 1 ? "s" : ""}
              </h2>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <SimilarQuestionCard
                  key={result.id}
                  result={result}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Search Yet */}
        {!hasSearched && (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Find Answers from Past Pitches
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Enter a question you need to answer for an RFP or pitch. We'll
                search through your uploaded pitch documents to find similar
                questions that have been answered before.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">RFP Questions</Badge>
                <Badge variant="outline">Client Questions</Badge>
                <Badge variant="outline">Capability Questions</Badge>
                <Badge variant="outline">Solution Proposals</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
