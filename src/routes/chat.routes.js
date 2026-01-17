const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
} = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Send message to AI agent
router.post("/:projectId", sendMessage);

// Get chat history
router.get("/:projectId/history", getChatHistory);

module.exports = router;
