const mongoose = require("mongoose");
const FileAttachmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "File must be associated with a project"],
      index: true,
    },
    openaiFileId: {
      type: String,
      required: [true, "OpenAI file ID is required"],
      unique: true,
    },
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
    purpose: {
      type: String,
      default: "assistants",
      enum: ["assistants", "fine-tune", "batch"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "File must belong to a user"],
      index: true,
    },
    status: {
      type: String,
      enum: ["uploaded", "processed", "error", "deleted"],
      default: "uploaded",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    extractedText: {
      type: String,
      maxlength: [50000, "Extracted text cannot exceed 50000 characters"],
    },
  },
  {
    timestamps: true,
  },
);
FileAttachmentSchema.index({ projectId: 1, createdBy: 1 });
FileAttachmentSchema.pre("remove", async function (next) {
  try {
    const { deleteOpenAIFile } = require("../services/openai.service");
    await deleteOpenAIFile(this.openaiFileId);
    next();
  } catch (error) {
    console.error("Error deleting file from OpenAI:", error);
    next(); 
  }
});
module.exports = mongoose.model("FileAttachment", FileAttachmentSchema);