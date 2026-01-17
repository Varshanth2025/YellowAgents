const Chatbot = require("../models/Chatbot.model");
const { AppError } = require("../middleware/errorHandler");

/**
 * @desc    Get all chatbots for logged in user
 * @route   GET /api/chatbots
 * @access  Private
 */
exports.getChatbots = async (req, res, next) => {
  try {
    const chatbots = await Chatbot.find({ createdBy: req.user.id });

    res.status(200).json({
      success: true,
      count: chatbots.length,
      data: chatbots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single chatbot
 * @route   GET /api/chatbots/:id
 * @access  Private
 */
exports.getChatbot = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!chatbot) {
      return next(new AppError("Chatbot not found", 404));
    }

    res.status(200).json({
      success: true,
      data: chatbot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new chatbot
 * @route   POST /api/chatbots
 * @access  Private
 */
exports.createChatbot = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const chatbot = await Chatbot.create(req.body);

    res.status(201).json({
      success: true,
      data: chatbot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update chatbot
 * @route   PUT /api/chatbots/:id
 * @access  Private
 */
exports.updateChatbot = async (req, res, next) => {
  try {
    let chatbot = await Chatbot.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!chatbot) {
      return next(new AppError("Chatbot not found", 404));
    }

    chatbot = await Chatbot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: chatbot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete chatbot
 * @route   DELETE /api/chatbots/:id
 * @access  Private
 */
exports.deleteChatbot = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!chatbot) {
      return next(new AppError("Chatbot not found", 404));
    }

    await chatbot.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
