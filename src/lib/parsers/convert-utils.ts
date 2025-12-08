import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

/**
 * Convert PPT/PPTX to PDF using LibreOffice
 *
 * Requires LibreOffice to be installed on the system.
 * The `soffice` command must be available in PATH.
 */
export async function convertPptToPdf(
  file: Buffer,
  filename: string
): Promise<Buffer> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ppt-conversion-"));
  // Replace spaces with underscores to avoid command line issues
  const safeFilename = filename.replace(/ /g, "_");
  const inputPath = path.join(tempDir, safeFilename);
  const outputPath = path.join(
    tempDir,
    safeFilename.replace(/\.(ppt|pptx)$/i, ".pdf")
  );

  try {
    // Write input file
    await fs.writeFile(inputPath, file);

    // Run LibreOffice conversion
    // --headless: no UI
    // --convert-to pdf: output format
    // --outdir: output directory
    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`;
    await execAsync(command);

    // Read resulting PDF
    const pdfBuffer = await fs.readFile(outputPath);
    return pdfBuffer;
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error("Failed to cleanup temp dir:", e);
    }
  }
}
