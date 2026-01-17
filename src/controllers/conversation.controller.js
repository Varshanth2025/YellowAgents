const { AppError } = require("../middleware/errorHandler");

/**
 * @desc    Get all conversations for logged in user
 * @route   GET /api/conversations
 * @access  Private
 */
exports.getConversations = async (req, res, next) => {
  try {
    // TODO: Implement Conversation model and query
    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new conversation
 * @route   POST /api/conversations
 * @access  Private
 */
exports.createConversation = async (req, res, next) => {
  try {
    // TODO: Implement conversation creation
    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message in conversation
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    // TODO: Implement message sending with OpenAI integration
    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
