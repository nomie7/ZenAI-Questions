/**
 * Document parser interface and factory
 */

export interface ParsedPage {
  pageNumber: number;
  text: string;
  imageBuffer?: Buffer;
}

export interface ParsedDocument {
  pages: ParsedPage[];
  metadata: {
    title?: string;
    author?: string;
    pageCount: number;
    parserUsed: ParserType;
  };
}

export type ParserType = "gemini" | "unstructured";

export interface DocumentParser {
  parse(file: Buffer, filename: string): Promise<ParsedDocument>;
}

// Lazy load parsers to avoid importing heavy dependencies
export async function getParser(type: ParserType): Promise<DocumentParser> {
  switch (type) {
    case "gemini": {
      const { GeminiParser } = await import("./gemini-parser");
      return new GeminiParser();
    }
    case "unstructured":
    default: {
      const { UnstructuredParser } = await import("./unstructured-parser");
      return new UnstructuredParser();
    }
  }
}

/**
 * Detect the best parser for a given file
 */
export function suggestParser(filename: string): ParserType {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    // Default to unstructured for all PDFs
    return "unstructured";
  }

  return "unstructured";
}
