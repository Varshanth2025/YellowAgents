const OpenAI = require("openai");
const fs = require("fs");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate chat completion using OpenAI
 * @param {Array} messages - Array of message objects with role and content
 * @param {String} model - OpenAI model to use
 * @returns {Promise<String>} - AI response content
 */
exports.getChatCompletion = async (messages, model = "gpt-3.5-turbo") => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw new Error("Failed to get AI response");
  }
};

/**
 * Upload file to OpenAI Files API
 * @param {String} filePath - Path to the file to upload
 * @param {String} purpose - Purpose of the file (assistants, fine-tune, etc.)
 * @returns {Promise<Object>} - OpenAI file object with id, filename, bytes, etc.
 */
exports.uploadFileToOpenAI = async (filePath, purpose = "assistants") => {
  try {
    const fileStream = fs.createReadStream(filePath);

    const file = await openai.files.create({
      file: fileStream,
      purpose: purpose,
    });

    return file;
  } catch (error) {
    console.error("OpenAI File Upload Error:", error.message);
    throw new Error(`Failed to upload file to OpenAI: ${error.message}`);
  }
};

/**
 * Delete file from OpenAI Files API
 * @param {String} fileId - OpenAI file ID to delete
 * @returns {Promise<Object>} - Deletion confirmation
 */
exports.deleteOpenAIFile = async (fileId) => {
  try {
    const result = await openai.files.del(fileId);
    return result;
  } catch (error) {
    console.error("OpenAI File Delete Error:", error.message);
    throw new Error(`Failed to delete file from OpenAI: ${error.message}`);
  }
};

/**
 * List all files from OpenAI Files API
 * @returns {Promise<Array>} - Array of file objects
 */
exports.listOpenAIFiles = async () => {
  try {
    const files = await openai.files.list();
    return files.data;
  } catch (error) {
    console.error("OpenAI File List Error:", error.message);
    throw new Error("Failed to list files from OpenAI");
  }
};

/**
 * Retrieve file info from OpenAI Files API
 * @param {String} fileId - OpenAI file ID
 * @returns {Promise<Object>} - File object
 */
exports.getOpenAIFile = async (fileId) => {
  try {
    const file = await openai.files.retrieve(fileId);
    return file;
  } catch (error) {
    console.error("OpenAI File Retrieve Error:", error.message);
    throw new Error("Failed to retrieve file from OpenAI");
  }
};
