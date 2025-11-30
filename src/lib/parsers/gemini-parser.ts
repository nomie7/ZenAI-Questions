import { GoogleGenerativeAI } from "@google/generative-ai";
import { pdf } from "pdf-to-img";
import type { DocumentParser, ParsedDocument, ParsedPage } from "./index";

/**
 * Gemini Flash parser for advanced document understanding
 *
 * Good for: Scanned PDFs, complex layouts, handwritten notes, tables
 * Uses vision capabilities to extract text from page images
 */
export class GeminiParser implements DocumentParser {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is required for Gemini parser");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 1.5 Flash for fast, cost-effective processing
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async parse(file: Buffer, filename: string): Promise<ParsedDocument> {
    const ext = filename.toLowerCase().split(".").pop();

    if (ext !== "pdf") {
      throw new Error(`Unsupported file type: ${ext}. Only PDF is supported.`);
    }

    const pages: ParsedPage[] = [];

    try {
      // Convert PDF pages to images
      const document = await pdf(file, {
        scale: 2.0, // Higher quality for better OCR
      });

      let pageNumber = 0;
      for await (const imageBuffer of document) {
        pageNumber++;

        // Extract text using Gemini Vision
        const text = await this.extractTextFromImage(
          Buffer.from(imageBuffer),
          pageNumber
        );

        pages.push({
          pageNumber,
          text,
          imageBuffer: Buffer.from(imageBuffer),
        });

        // Small delay to avoid rate limiting
        if (pageNumber > 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      return {
        pages,
        metadata: {
          pageCount: pages.length,
          parserUsed: "gemini",
        },
      };
    } catch (error) {
      console.error("Error parsing PDF with Gemini:", error);
      throw new Error(
        `Failed to parse PDF with Gemini: ${(error as Error).message}`
      );
    }
  }

  /**
   * Extract text from a page image using Gemini Vision
   */
  private async extractTextFromImage(
    imageBuffer: Buffer,
    pageNumber: number
  ): Promise<string> {
    try {
      const base64Image = imageBuffer.toString("base64");

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image,
          },
        },
        {
          text: `Extract all text content from this document page (page ${pageNumber}).

Instructions:
- Extract ALL visible text, maintaining the reading order
- Preserve paragraph structure with blank lines between sections
- For tables, format as plain text with alignment
- Include headers, footers, and any captions
- If there are bullet points or numbered lists, preserve the formatting
- Do not add any commentary, just return the extracted text
- If there is no text visible, return "[No text content on this page]"`,
        },
      ]);

      const response = await result.response;
      const text = response.text();

      return text.trim() || `[No text content on page ${pageNumber}]`;
    } catch (error) {
      console.error(`Error extracting text from page ${pageNumber}:`, error);
      return `[Error extracting text from page ${pageNumber}]`;
    }
  }
}
