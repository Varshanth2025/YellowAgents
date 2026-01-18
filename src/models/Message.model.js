const mongoose = require("mongoose");
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message must belong to a user"],
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    metadata: {
      model: String, 
      tokens: Number, 
      processingTime: Number, 
    },
  },
  {
    timestamps: true, 
  },
);
MessageSchema.index({ projectId: 1, createdAt: 1 }); 
MessageSchema.index({ projectId: 1, sessionId: 1, createdAt: 1 }); 
MessageSchema.index({ createdBy: 1, createdAt: -1 }); 
module.exports = mongoose.model("Message", MessageSchema);