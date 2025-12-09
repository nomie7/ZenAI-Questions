"use client";

import { useState } from "react";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { useCopilotChat } from "@copilotkit/react-core";

interface MessageActionButtonsProps {
  messageId: string;
  content: string;
  userMessage?: string;
  conversationId?: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}

/**
 * Action buttons for assistant messages
 * Provides copy, regenerate, thumbs up/down functionality
 */
export function MessageActionButtons({
  messageId,
  content,
  userMessage,
  conversationId,
  onThumbsUp,
  onThumbsDown,
}: MessageActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reloadMessages } = useCopilotChat();

  const copyToClipboard = async () => {
    try {
      // Strip HTML/markdown tags for plain text copy
      const plainText = content
        .replace(/<citation>.*?<\/citation>/g, "") // Remove citation tags
        .replace(/<[^>]*>/g, "") // Remove other HTML tags
        .trim();

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRegenerate = async () => {
    try {
      await reloadMessages(messageId);
    } catch (err) {
      console.error("Failed to regenerate:", err);
    }
  };

  const saveFeedback = async (type: "thumbs_up" | "thumbs_down") => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          conversationId,
          userMessage,
          assistantResponse: content,
          feedbackType: type,
          metadata: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to save feedback:", error);
      } else {
        console.log(`Feedback ${type} saved successfully`);
      }
    } catch (err) {
      console.error("Error saving feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbsUp = async () => {
    setFeedback("up");
    onThumbsUp?.();
    await saveFeedback("thumbs_up");
  };

  const handleThumbsDown = async () => {
    setFeedback("down");
    onThumbsDown?.();
    await saveFeedback("thumbs_down");
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Copy button */}
      <button
        onClick={copyToClipboard}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        )}
      </button>

      {/* Regenerate button */}
      <button
        onClick={handleRegenerate}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title="Regenerate response"
      >
        <RefreshCw className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>

      {/* Thumbs up button */}
      <button
        onClick={handleThumbsUp}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${feedback === "up" ? "bg-green-50" : ""
          }`}
        title="Good response"
        disabled={feedback !== null}
      >
        <ThumbsUp
          className={`w-4 h-4 ${feedback === "up"
            ? "text-green-500 fill-green-500"
            : "text-gray-400 hover:text-green-600"
            }`}
        />
      </button>

      {/* Thumbs down button */}
      <button
        onClick={handleThumbsDown}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${feedback === "down" ? "bg-red-50" : ""
          }`}
        title="Bad response"
        disabled={feedback !== null}
      >
        <ThumbsDown
          className={`w-4 h-4 ${feedback === "down"
            ? "text-red-500 fill-red-500"
            : "text-gray-400 hover:text-red-600"
            }`}
        />
      </button>
    </div>
  );
}
