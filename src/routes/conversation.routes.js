const express = require("express");
const router = express.Router();
const {
  getConversations,
  createConversation,
  sendMessage,
} = require("../controllers/conversation.controller");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.route("/").get(getConversations).post(createConversation);

router.post("/:id/messages", sendMessage);

module.exports = router;
