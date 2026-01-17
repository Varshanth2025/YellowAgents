const mongoose = require("mongoose");

/**
 * Prompt Schema - System prompt for AI agent (linked to Project)
 *
 * This model stores the system prompt that defines the AI agent's behavior.
 * Each project can have one active prompt that configures how the agent responds.
 *
 * Use case:
 * - Project defines WHAT the agent is (name, description)
 * - Prompt defines HOW the agent behaves (personality, instructions, rules)
 */
const PromptSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Prompt must be associated with a project"],
      index: true,
    },
    systemPrompt: {
      type: String,
      required: [true, "System prompt is required"],
      trim: true,
      maxlength: [5000, "System prompt cannot exceed 5000 characters"],
    },
    // Multi-tenant field for security
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Prompt must belong to a user"],
      index: true,
    },
    // Optional metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
PromptSchema.index({ projectId: 1, createdBy: 1 });
PromptSchema.index({ projectId: 1, isActive: 1 });

// Ensure one active prompt per project
PromptSchema.index(
  { projectId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

module.exports = mongoose.model("Prompt", PromptSchema);
