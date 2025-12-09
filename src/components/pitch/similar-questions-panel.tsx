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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  HelpCircle,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SimilarQuestionCard,
  type SimilarQuestionResult,
} from "./similar-question-card";

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
] as const;

// Predefined region options
const REGION_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "local", label: "Local" },
  { value: "apac", label: "APAC" },
  { value: "emea", label: "EMEA" },
  { value: "americas", label: "Americas" },
] as const;

interface SimilarQuestionsPanelProps {
  onClose: () => void;
}

export function SimilarQuestionsPanel({ onClose }: SimilarQuestionsPanelProps) {
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
      setError("Failed to search. Please try again.");
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="font-semibold text-sm">Find Similar Questions</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your question..."
            className="flex-1 text-sm"
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !question.trim()}
            size="icon"
            className="h-9 w-9"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-muted-foreground h-7 px-2"
          >
            <Filter className="w-3 h-3 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                {selectedVerticals.length +
                  (selectedRegion ? 1 : 0) +
                  (excludeClient ? 1 : 0)}
              </Badge>
            )}
            {showFilters ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground h-7 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2">
            {/* Vertical Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">Industry Vertical</Label>
              <div className="flex flex-wrap gap-1">
                {VERTICAL_OPTIONS.map((vertical) => (
                  <Badge
                    key={vertical}
                    variant={
                      selectedVerticals.includes(vertical) ? "default" : "outline"
                    }
                    className="cursor-pointer text-xs py-0 h-5"
                    onClick={() => toggleVertical(vertical)}
                  >
                    {vertical}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Region & Exclude Client */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Region</Label>
                <Select
                  value={selectedRegion || "any"}
                  onValueChange={(val) => setSelectedRegion(val === "any" ? "" : val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Any" />
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

              <div className="space-y-1">
                <Label className="text-xs">Exclude Client</Label>
                <Input
                  value={excludeClient}
                  onChange={(e) => setExcludeClient(e.target.value)}
                  placeholder="e.g., Nike"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Area - use overflow-auto instead of ScrollArea for better flex behavior */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground text-xs">Searching...</p>
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">No results found</p>
              <p className="text-muted-foreground text-xs">
                Try rephrasing your question or adjusting filters.
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {results.length} similar question{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((result, index) => (
                <SimilarQuestionCard
                  key={result.id}
                  result={result}
                  rank={index + 1}
                />
              ))}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Search Past Pitches</p>
              <p className="text-muted-foreground text-xs">
                Enter a question to find similar ones from past pitches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
