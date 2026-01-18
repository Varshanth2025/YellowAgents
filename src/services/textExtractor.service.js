const fs = require("fs").promises;
const { PDFParse } = require("pdf-parse");
exports.extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === "application/pdf") {
      return await extractPDFText(filePath);
    }
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      mimeType === "text/markdown"
    ) {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    }
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "[Word document - text extraction not fully supported yet. Please convert to PDF or TXT]";
    }
    return `[Unsupported file type: ${mimeType}. Please use PDF, TXT, MD, JSON, or code files]`;
  } catch (error) {
    console.error("Error extracting text:", error.message);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};
async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}