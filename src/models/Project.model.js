const mongoose = require("mongoose");

/**
 * Project Schema - Represents an AI Agent in the multi-tenant system
 *
 * Each project is a container for an AI agent configuration. In the context of AI agents:
 * - The project defines WHAT the agent does (name, description)
 * - It can hold agent-specific settings, prompts, and behavior configurations
 * - Links to conversations, knowledge bases, or tools the agent can use
 * - Acts as the top-level entity for organizing agent resources
 *
 * Multi-tenancy: Each project belongs to a specific user (createdBy field)
 */
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
    // Multi-tenant field - links project to owner
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must belong to a user"],
      index: true, // Index for efficient querying by user
    },
    // Agent-specific configurations (optional, can be expanded)
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
    // Status flags
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
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Compound index for efficient tenant-based queries
ProjectSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for agent identifier
ProjectSchema.virtual("agentId").get(function () {
  return `agent_${this._id}`;
});

/**
 * HOW THIS MAPS TO AN AI AGENT:
 *
 * 1. Project = AI Agent Container
 *    - name: The agent's display name ("Customer Support Bot", "Code Assistant")
 *    - description: What the agent does and its purpose
 *
 * 2. Multi-Tenancy via createdBy
 *    - Each user can create multiple AI agents (projects)
 *    - Projects are isolated by user - no cross-tenant access
 *
 * 3. Agent Configuration (agentConfig)
 *    - systemPrompt: Defines the agent's personality, role, and instructions
 *    - model: Which OpenAI model powers this agent
 *    - temperature: How creative/deterministic the responses are
 *    - maxTokens: Maximum response length
 *
 * 4. Relationships (Future Extensions)
 *    - Can link to Chatbot model for chat interfaces
 *    - Can link to Conversation model for chat history
 *    - Can link to KnowledgeBase model for RAG (Retrieval-Augmented Generation)
 *    - Can link to Tools model for function calling capabilities
 *
 * 5. Use Cases
 *    - User creates a "Customer Support" project → AI agent for support queries
 *    - User creates a "Code Review" project → AI agent for code analysis
 *    - User creates a "Content Writer" project → AI agent for blog posts
 */

module.exports = mongoose.model("Project", ProjectSchema);
