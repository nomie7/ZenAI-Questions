import { GoogleGenerativeAI } from "@google/generative-ai";
import { pdf } from "pdf-to-img";
import type { DocumentParser, ParsedDocument, ParsedPage } from "./index";
import { convertDocToPdf, convertPptToPdf } from "./convert-utils";

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
    // Use Gemini 2.5 Flash for fast, cost-effective processing
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async parse(file: Buffer, filename: string): Promise<ParsedDocument> {
    const ext = filename.toLowerCase().split(".").pop();

    let pdfBuffer = file;

    // Convert PPTX/PPT to PDF first
    if (ext === "pptx" || ext === "ppt") {
      console.log("[Gemini] Converting PPT/PPTX to PDF...");
      pdfBuffer = await convertPptToPdf(file, filename);
      console.log("[Gemini] PPT/PPTX converted to PDF successfully");
    } else if (ext === "doc" || ext === "docx") {
      console.log("[Gemini] Converting DOC/DOCX to PDF for image extraction...");
      pdfBuffer = await convertDocToPdf(file, filename);
      console.log("[Gemini] DOC/DOCX converted to PDF successfully");
    } else if (ext !== "pdf") {
      throw new Error(
        `Unsupported file type: ${ext}. Supported: pdf, ppt, pptx, doc, docx`
      );
    }

    const pages: ParsedPage[] = [];
    const BATCH_SIZE = 15;

    try {
      // Convert PDF pages to images first
      console.log("[Gemini] Converting PDF pages to images...");
      const document = await pdf(pdfBuffer, {
        scale: 2.0, // Higher quality for better OCR
      });

      // Collect all page images first
      const pageImages: { pageNumber: number; imageBuffer: Buffer }[] = [];
      let pageNumber = 0;
      for await (const imageBuffer of document) {
        pageNumber++;
        pageImages.push({
          pageNumber,
          imageBuffer: Buffer.from(imageBuffer),
        });
      }
      console.log(`[Gemini] Converted ${pageImages.length} pages to images`);

      // Process pages in batches of BATCH_SIZE
      for (let i = 0; i < pageImages.length; i += BATCH_SIZE) {
        const batch = pageImages.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(pageImages.length / BATCH_SIZE);

        console.log(`[Gemini] Processing batch ${batchNum}/${totalBatches} (pages ${i + 1}-${Math.min(i + BATCH_SIZE, pageImages.length)})...`);

        // Process all pages in this batch in parallel
        const batchResults = await Promise.all(
          batch.map(async ({ pageNumber, imageBuffer }) => {
            const text = await this.extractTextFromImage(imageBuffer, pageNumber);
            return { pageNumber, text, imageBuffer };
          })
        );

        // Add results to pages array
        for (const result of batchResults) {
          const textPreview = result.text.substring(0, 80).replace(/\n/g, " ");
          console.log(`[Gemini] Page ${result.pageNumber} extracted (${result.text.length} chars): "${textPreview}..."`);

          pages.push({
            pageNumber: result.pageNumber,
            text: result.text,
            imageBuffer: result.imageBuffer,
          });
        }

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < pageImages.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Sort pages by page number (in case parallel processing returned out of order)
      pages.sort((a, b) => a.pageNumber - b.pageNumber);

      console.log(`[Gemini] Completed parsing ${pages.length} pages`);

      return {
        pages,
        metadata: {
          pageCount: pages.length,
          parserUsed: "gemini",
        },
      };
    } catch (error) {
      console.error("Error parsing document with Gemini:", error);
      throw new Error(
        `Failed to parse document with Gemini: ${(error as Error).message}`
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
