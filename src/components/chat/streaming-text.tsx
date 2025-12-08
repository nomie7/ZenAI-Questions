"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
  /** Animation speed in ms per character */
  speed?: number;
  /** Show cursor while streaming */
  showCursor?: boolean;
}

/**
 * Perplexity-style streaming text with smooth character reveal
 */
export function StreamingText({
  text,
  isStreaming = false,
  className,
  speed = 15,
  showCursor = true,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTextRef = useRef("");

  useEffect(() => {
    // If text is shorter or same, just display it
    if (text.length <= displayedText.length && !isStreaming) {
      setDisplayedText(text);
      setIsAnimating(false);
      return;
    }

    // Calculate new characters to animate
    const newChars = text.slice(displayedText.length);
    if (!newChars) return;

    setIsAnimating(true);

    // Animate new characters one by one
    let currentIndex = displayedText.length;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  // Track previous text for comparison
  useEffect(() => {
    prevTextRef.current = text;
  }, [text]);

  return (
    <div className={cn("relative", className)}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Style code blocks
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ) : (
                <code className={cn("block bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto", className)}>
                  {children}
                </code>
              );
            },
            // Style links
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            // Style paragraphs for smoother animation
            p: ({ children }) => (
              <p className="mb-3 last:mb-0 leading-relaxed">
                {children}
              </p>
            ),
            // Style tables
            table: ({ children }) => (
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
                {children}
              </table>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr>
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                {children}
              </td>
            ),
          }}
        >
          {displayedText}
        </ReactMarkdown>
      </div>

      {/* Animated cursor */}
      {showCursor && (isStreaming || isAnimating) && (
        <span
          className="inline-block w-0.5 h-5 bg-blue-500 ml-0.5 animate-pulse"
          style={{ verticalAlign: "text-bottom" }}
        />
      )}
    </div>
  );
}

/**
 * Word-by-word fade-in animation (alternative style)
 */
export function FadeInText({
  text,
  isComplete = false,
  className,
}: {
  text: string;
  isComplete?: boolean;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={cn(
            "inline-block transition-opacity duration-300",
            isComplete ? "opacity-100" : "animate-fadeIn"
          )}
          style={{
            animationDelay: isComplete ? "0ms" : `${i * 30}ms`,
            animationFillMode: "both",
          }}
        >
          {word}{" "}
        </span>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for streaming content
 */
export function StreamingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 rounded",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Typing dots indicator
 */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
