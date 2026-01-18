const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
} = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth");
router.use(protect);
router.post("/:projectId", sendMessage);
router.get("/:projectId/history", getChatHistory);
module.exports = router;