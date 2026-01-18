const express = require("express");
const router = express.Router();
const {
  getChatbots,
  getChatbot,
  createChatbot,
  updateChatbot,
  deleteChatbot,
} = require("../controllers/chatbot.controller");
const { protect } = require("../middleware/auth");
router.use(protect);
router.route("/").get(getChatbots).post(createChatbot);
router.route("/:id").get(getChatbot).put(updateChatbot).delete(deleteChatbot);
module.exports = router;