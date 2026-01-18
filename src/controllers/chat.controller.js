const Project = require("../models/Project.model");
const Prompt = require("../models/Prompt.model");
const Message = require("../models/Message.model");
const FileAttachment = require("../models/FileAttachment.model");
const { getChatResponse } = require("../services/llm.service");
const { AppError } = require("../middleware/errorHandler");
exports.sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, sessionId } = req.body;
    if (!message) {
      return next(new AppError("Message is required", 400));
    }
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    const prompt = await Prompt.findOne({
      projectId: projectId,
      createdBy: req.user.id,
      isActive: true,
    });
    if (!prompt) {
      return next(new AppError("No active prompt found for this project", 404));
    }
    const previousMessages = await Message.find({
      projectId: projectId,
      createdBy: req.user.id,
      ...(sessionId && { sessionId }), 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("role content -_id");
    const messageHistory = previousMessages.reverse();
    const files = await FileAttachment.find({
      projectId: projectId,
      createdBy: req.user.id,
      status: "uploaded",
    })
      .select("filename extractedText")
      .limit(5); 
    let fileContext = "";
    if (files.length > 0) {
      fileContext = "\n\n=== UPLOADED FILES CONTEXT ===\n";
      for (const file of files) {
        if (file.extractedText && file.extractedText.trim()) {
          fileContext += `\n--- File: ${file.filename} ---\n${file.extractedText}\n`;
        } else {
          fileContext += `\n--- File: ${file.filename} (No content available) ---\n`;
        }
      }
      fileContext += "\n=== END OF FILES ===\n\n";
    }
    const enhancedSystemPrompt = prompt.systemPrompt + fileContext;
    const userMessage = await Message.create({
      projectId: projectId,
      role: "user",
      content: message,
      createdBy: req.user.id,
      sessionId: sessionId || undefined,
    });
    const aiResponse = await getChatResponse(
      enhancedSystemPrompt,
      [...messageHistory, { role: "user", content: message }],
      {
        model: project.agentConfig?.model || "gpt-3.5-turbo",
        temperature: project.agentConfig?.temperature || 0.7,
        maxTokens: project.agentConfig?.maxTokens || 1000,
      },
    );
    const assistantMessage = await Message.create({
      projectId: projectId,
      role: "assistant",
      content: aiResponse,
      createdBy: req.user.id,
      sessionId: sessionId || undefined,
      metadata: {
        model: project.agentConfig?.model || "gpt-3.5-turbo",
        filesUsed: files.length,
      },
    });
    res.status(200).json({
      success: true,
      data: {
        userMessage: {
          id: userMessage._id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage._id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getChatHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sessionId, limit = 50 } = req.query;
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    const messages = await Message.find({
      projectId: projectId,
      createdBy: req.user.id,
      ...(sessionId && { sessionId }),
    })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .select("role content sessionId createdAt");
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};