const mongoose = require("mongoose");

/**
 * Message Schema - Stores chat history for AI agent conversations
 *
 * Each message represents either a user's input or the AI's response.
 * Messages are linked to a project (AI agent) and form the conversation history.
 *
 * This history is used to:
 * 1. Display chat conversations to users
 * 2. Send context to OpenAI for coherent responses
 * 3. Track and analyze agent interactions
 */
const MessageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Message must belong to a project"],
      index: true,
    },
    role: {
      type: String,
      required: [true, "Message role is required"],
      enum: {
        values: ["user", "assistant", "system"],
        message: "Role must be either user, assistant, or system",
      },
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [10000, "Message content cannot exceed 10000 characters"],
    },
    // Multi-tenant field for security
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message must belong to a user"],
      index: true,
    },
    // Optional: Session/conversation grouping
    sessionId: {
      type: String,
      index: true,
    },
    // Optional: Metadata
    metadata: {
      model: String, // Which OpenAI model was used
      tokens: Number, // Token count for this message
      processingTime: Number, // Response time in ms
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Compound indexes for efficient queries
MessageSchema.index({ projectId: 1, createdAt: 1 }); // Get messages chronologically
MessageSchema.index({ projectId: 1, sessionId: 1, createdAt: 1 }); // Get session messages
MessageSchema.index({ createdBy: 1, createdAt: -1 }); // Get user's recent messages

module.exports = mongoose.model("Message", MessageSchema);
