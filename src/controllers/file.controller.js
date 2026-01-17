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

/**
 * @desc    Upload file to project (stores in OpenAI)
 * @route   POST /api/projects/:projectId/files
 * @access  Private
 */
exports.uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { description, purpose = "assistants" } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return next(new AppError("Please upload a file", 400));
    }

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });

    if (!project) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return next(new AppError("Project not found", 404));
    }

    // Upload file to OpenAI
    const openaiFile = await uploadFileToOpenAI(req.file.path, purpose);

    // Extract text content from file for local storage
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(
        req.file.path,
        req.file.mimetype,
      );
      // Limit to 50000 characters to avoid token limits
      if (extractedText.length > 50000) {
        extractedText =
          extractedText.substring(0, 50000) + "\n\n[Content truncated...]";
      }
    } catch (error) {
      console.error("Error extracting text:", error.message);
      extractedText = `[Unable to extract text from ${req.file.originalname}]`;
    }

    // Save file metadata to database
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

    // Clean up temporary file
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
    // Clean up file if upload failed
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/**
 * @desc    Get all files for a project
 * @route   GET /api/projects/:projectId/files
 * @access  Private
 */
exports.getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // Get all files for this project
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

/**
 * @desc    Get single file details
 * @route   GET /api/projects/:projectId/files/:fileId
 * @access  Private
 */
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

    // Optionally fetch latest info from OpenAI
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

/**
 * @desc    Delete file from project and OpenAI
 * @route   DELETE /api/projects/:projectId/files/:fileId
 * @access  Private
 */
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

    // Delete from OpenAI
    try {
      await deleteOpenAIFile(file.openaiFileId);
    } catch (error) {
      console.error("Error deleting from OpenAI:", error);
      // Continue with database deletion even if OpenAI delete fails
    }

    // Delete from database
    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
