const OpenAI = require("openai");
const fs = require("fs");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
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
exports.deleteOpenAIFile = async (fileId) => {
  try {
    const result = await openai.files.del(fileId);
    return result;
  } catch (error) {
    console.error("OpenAI File Delete Error:", error.message);
    throw new Error(`Failed to delete file from OpenAI: ${error.message}`);
  }
};
exports.listOpenAIFiles = async () => {
  try {
    const files = await openai.files.list();
    return files.data;
  } catch (error) {
    console.error("OpenAI File List Error:", error.message);
    throw new Error("Failed to list files from OpenAI");
  }
};
exports.getOpenAIFile = async (fileId) => {
  try {
    const file = await openai.files.retrieve(fileId);
    return file;
  } catch (error) {
    console.error("OpenAI File Retrieve Error:", error.message);
    throw new Error("Failed to retrieve file from OpenAI");
  }
};
exports.getOpenAIFileContent = async (fileId) => {
  try {
    const content = await openai.files.content(fileId);
    const text = await content.text();
    return text;
  } catch (error) {
    console.error("OpenAI File Content Error:", error.message);
    throw new Error(
      `Failed to retrieve file content from OpenAI: ${error.message}`,
    );
  }
};