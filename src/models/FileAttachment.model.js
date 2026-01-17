const mongoose = require("mongoose");

/**
 * FileAttachment Schema - Files uploaded to OpenAI for RAG
 *
 * This model tracks files uploaded to projects/agents for enhanced AI responses.
 * Files are stored in OpenAI's storage and linked to projects for context.
 *
 * Use case:
 * - Upload documents, PDFs, code files to enhance agent knowledge
 * - Associate files with specific projects/agents
 * - Track uploaded files for deletion/management
 */
const FileAttachmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "File must be associated with a project"],
      index: true,
    },
    // OpenAI file ID returned from Files API
    openaiFileId: {
      type: String,
      required: [true, "OpenAI file ID is required"],
      unique: true,
    },
    // Original filename
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    // File size in bytes
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    // MIME type
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
    // File purpose (assistants, fine-tune, etc.)
    purpose: {
      type: String,
      default: "assistants",
      enum: ["assistants", "fine-tune", "batch"],
    },
    // Multi-tenant field for security
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "File must belong to a user"],
      index: true,
    },
    // OpenAI file status
    status: {
      type: String,
      enum: ["uploaded", "processed", "error", "deleted"],
      default: "uploaded",
    },
    // Optional description
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
FileAttachmentSchema.index({ projectId: 1, createdBy: 1 });

// Delete file from OpenAI when document is deleted
FileAttachmentSchema.pre("remove", async function (next) {
  try {
    const { deleteOpenAIFile } = require("../services/openai.service");
    await deleteOpenAIFile(this.openaiFileId);
    next();
  } catch (error) {
    console.error("Error deleting file from OpenAI:", error);
    next(); // Continue deletion even if OpenAI delete fails
  }
});

module.exports = mongoose.model("FileAttachment", FileAttachmentSchema);
