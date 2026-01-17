const Project = require("../models/Project.model");
const Prompt = require("../models/Prompt.model");
const Message = require("../models/Message.model");
const { getChatResponse } = require("../services/llm.service");
const { AppError } = require("../middleware/errorHandler");

/**
 * @desc    Send message to AI agent and get response
 * @route   POST /api/chat/:projectId
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, sessionId } = req.body;

    // Validate input
    if (!message) {
      return next(new AppError("Message is required", 400));
    }

    // 1. Fetch and validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // 2. Fetch active prompt for the project
    const prompt = await Prompt.findOne({
      projectId: projectId,
      createdBy: req.user.id,
      isActive: true,
    });

    if (!prompt) {
      return next(new AppError("No active prompt found for this project", 404));
    }

    // 3. Fetch last 10 messages for conversation history
    const previousMessages = await Message.find({
      projectId: projectId,
      createdBy: req.user.id,
      ...(sessionId && { sessionId }), // Filter by session if provided
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("role content -_id");

    // Reverse to get chronological order (oldest to newest)
    const messageHistory = previousMessages.reverse();

    // 4. Save user's message
    const userMessage = await Message.create({
      projectId: projectId,
      role: "user",
      content: message,
      createdBy: req.user.id,
      sessionId: sessionId || undefined,
    });

    // 5. Call OpenAI with system prompt + history + new message
    const aiResponse = await getChatResponse(
      prompt.systemPrompt,
      [...messageHistory, { role: "user", content: message }],
      {
        model: project.agentConfig?.model || "gpt-3.5-turbo",
        temperature: project.agentConfig?.temperature || 0.7,
        maxTokens: project.agentConfig?.maxTokens || 1000,
      },
    );

    // 6. Save assistant's response
    const assistantMessage = await Message.create({
      projectId: projectId,
      role: "assistant",
      content: aiResponse,
      createdBy: req.user.id,
      sessionId: sessionId || undefined,
      metadata: {
        model: project.agentConfig?.model || "gpt-3.5-turbo",
      },
    });

    // 7. Return response
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

/**
 * @desc    Get chat history for a project
 * @route   GET /api/chat/:projectId/history
 * @access  Private
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sessionId, limit = 50 } = req.query;

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // Fetch messages
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
