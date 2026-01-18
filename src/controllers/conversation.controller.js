const { AppError } = require("../middleware/errorHandler");
exports.getConversations = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};
exports.createConversation = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
exports.sendMessage = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};