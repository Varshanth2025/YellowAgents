const FileAttachment = require("../models/FileAttachment.model");
const Project = require("../models/Project.model");
const {
  uploadFileToOpenAI,
  deleteOpenAIFile,
  getOpenAIFile,
} = require("../services/openai.service");
const { extractTextFromFile } = require("../services/textExtractor.service");
const { AppError } = require("../middleware/errorHandler");
const fs = require("fs").promises;
exports.uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { description, purpose = "assistants" } = req.body;
    if (!req.file) {
      return next(new AppError("Please upload a file", 400));
    }
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      await fs.unlink(req.file.path);
      return next(new AppError("Project not found", 404));
    }
    const openaiFile = await uploadFileToOpenAI(req.file.path, purpose);
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(
        req.file.path,
        req.file.mimetype,
      );
      if (extractedText.length > 50000) {
        extractedText =
          extractedText.substring(0, 50000) + "\n\n[Content truncated...]";
      }
    } catch (error) {
      console.error("Error extracting text:", error.message);
      extractedText = `[Unable to extract text from ${req.file.originalname}]`;
    }
    const fileAttachment = await FileAttachment.create({
      projectId: projectId,
      openaiFileId: openaiFile.id,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      purpose: purpose,
      createdBy: req.user.id,
      description: description,
      status: "uploaded",
      extractedText: extractedText,
    });
    await fs.unlink(req.file.path);
    res.status(201).json({
      success: true,
      data: fileAttachment,
      openaiFile: {
        id: openaiFile.id,
        filename: openaiFile.filename,
        bytes: openaiFile.bytes,
        purpose: openaiFile.purpose,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};
exports.getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    const files = await FileAttachment.find({
      projectId: projectId,
      createdBy: req.user.id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};
exports.getFile = async (req, res, next) => {
  try {
    const { projectId, fileId } = req.params;
    const file = await FileAttachment.findOne({
      _id: fileId,
      projectId: projectId,
      createdBy: req.user.id,
    });
    if (!file) {
      return next(new AppError("File not found", 404));
    }
    try {
      const openaiFile = await getOpenAIFile(file.openaiFileId);
      file.status = openaiFile.status || file.status;
    } catch (error) {
      console.error("Could not fetch OpenAI file status:", error);
    }
    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteFile = async (req, res, next) => {
  try {
    const { projectId, fileId } = req.params;
    const file = await FileAttachment.findOne({
      _id: fileId,
      projectId: projectId,
      createdBy: req.user.id,
    });
    if (!file) {
      return next(new AppError("File not found", 404));
    }
    try {
      await deleteOpenAIFile(file.openaiFileId);
    } catch (error) {
      console.error("Error deleting from OpenAI:", error);
    }
    await file.deleteOne();
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};