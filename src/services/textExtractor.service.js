const fs = require("fs").promises;
const { PDFParse } = require("pdf-parse");

/**
 * Extract text content from various file types
 * @param {String} filePath - Path to the file
 * @param {String} mimeType - MIME type of the file
 * @returns {Promise<String>} - Extracted text content
 */
exports.extractTextFromFile = async (filePath, mimeType) => {
  try {
    // Handle PDF files
    if (mimeType === "application/pdf") {
      return await extractPDFText(filePath);
    }

    // Handle text-based files (txt, md, json, csv, code, etc.)
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "text/markdown"
    ) {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    }

    // Handle Word documents (basic - would need additional library for full support)
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // For now, return placeholder. Would need mammoth or similar library
      return "[Word document - text extraction not fully supported yet. Please convert to PDF or TXT]";
    }

    // Unsupported file type
    return `[Unsupported file type: ${mimeType}. Please use PDF, TXT, MD, JSON, or code files]`;
  } catch (error) {
    console.error("Error extracting text:", error.message);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};

/**
 * Extract text from PDF file
 * @param {String} filePath - Path to PDF file
 * @returns {Promise<String>} - Extracted text
 */
async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await PDFParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}
