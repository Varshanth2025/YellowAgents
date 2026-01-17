const mongoose = require("mongoose");

const ChatbotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a chatbot name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    systemPrompt: {
      type: String,
      required: [true, "Please add a system prompt"],
      maxlength: [1000, "System prompt cannot be more than 1000 characters"],
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
      enum: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying by user
ChatbotSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Chatbot", ChatbotSchema);
