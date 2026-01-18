const mongoose = require("mongoose");
const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a project name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must belong to a user"],
      index: true, 
    },
    agentConfig: {
      systemPrompt: {
        type: String,
        maxlength: [2000, "System prompt cannot exceed 2000 characters"],
      },
      model: {
        type: String,
        enum: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o"],
        default: "gpt-3.5-turbo",
      },
      temperature: {
        type: Number,
        min: 0,
        max: 2,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        min: 1,
        max: 4096,
        default: 1000,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  },
);
ProjectSchema.index({ createdBy: 1, createdAt: -1 });
ProjectSchema.virtual("agentId").get(function () {
  return `agent_${this._id}`;
});
module.exports = mongoose.model("Project", ProjectSchema);