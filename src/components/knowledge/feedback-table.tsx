"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface FeedbackRecord {
  id: number;
  message_id: string;
  conversation_id?: string;
  user_message?: string;
  assistant_response: string;
  feedback_type: "thumbs_up" | "thumbs_down";
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface FeedbackStats {
  total: number;
  thumbs_up: number;
  thumbs_down: number;
  satisfaction_rate: number;
}

export function FeedbackTable() {
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(50);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const [feedbackRes, statsRes] = await Promise.all([
        fetch(`/api/feedback?limit=${limit}`),
        fetch("/api/feedback?action=stats"),
      ]);

      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedback(data.feedback || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Total Feedback</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Thumbs Up</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.thumbs_up}
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Thumbs Down</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.thumbs_down}
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
            <div className="text-2xl font-bold">
              {stats.satisfaction_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Feedback Records</h3>
        <Button variant="outline" size="sm" onClick={fetchFeedback}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User Message</TableHead>
              <TableHead>Assistant Response</TableHead>
              <TableHead className="w-32">Message ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No feedback records yet
                </TableCell>
              </TableRow>
            ) : (
              feedback.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedFeedback(record)}
                >
                  <TableCell>
                    {record.feedback_type === "thumbs_up" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Up
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Down
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(record.created_at)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm truncate" title={record.user_message || "N/A"}>
                      {truncateText(record.user_message || "N/A", 80)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm truncate" title={record.assistant_response}>
                      {truncateText(record.assistant_response, 120)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {record.message_id.substring(0, 8)}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Feedback Detail Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFeedback?.feedback_type === "thumbs_up" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-base px-3 py-1">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Thumbs Up
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-base px-3 py-1">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Thumbs Down
                  </Badge>
                )}
                <DialogTitle className="text-xl">Feedback Details</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Submitted on {selectedFeedback && formatDate(selectedFeedback.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6 mt-4">
              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-600 mb-1">Feedback ID</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {selectedFeedback.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedFeedback.id.toString(), "id")}
                    >
                      {copiedField === "id" ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600 mb-1">Message ID</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                      {selectedFeedback.message_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedFeedback.message_id, "message_id")}
                    >
                      {copiedField === "message_id" ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                {selectedFeedback.conversation_id && (
                  <div>
                    <div className="font-semibold text-gray-600 mb-1">Conversation ID</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                        {selectedFeedback.conversation_id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(selectedFeedback.conversation_id!, "conversation_id")}
                      >
                        {copiedField === "conversation_id" ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* User Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">User Message</div>
                  {selectedFeedback.user_message && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedFeedback.user_message!, "user_message")}
                    >
                      {copiedField === "user_message" ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {selectedFeedback.user_message ? (
                    <p className="text-sm whitespace-pre-wrap text-gray-800">
                      {selectedFeedback.user_message}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No user message available</p>
                  )}
                </div>
              </div>

              {/* Assistant Response */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">Assistant Response</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedFeedback.assistant_response, "assistant_response")}
                  >
                    {copiedField === "assistant_response" ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm whitespace-pre-wrap text-gray-800">
                      {selectedFeedback.assistant_response}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {selectedFeedback.metadata && Object.keys(selectedFeedback.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Additional Metadata</div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedFeedback.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
