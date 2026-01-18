const mongoose = require("mongoose");
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Prompt must belong to a user"],
      index: true,
    },
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
PromptSchema.index({ projectId: 1, createdBy: 1 });
PromptSchema.index({ projectId: 1, isActive: 1 });
PromptSchema.index(
  { projectId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
module.exports = mongoose.model("Prompt", PromptSchema);