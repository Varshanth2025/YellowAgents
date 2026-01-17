# Project Model - AI Agent Representation

## Overview

The `Project` model serves as the foundational container for AI agents in the multi-tenant system. Each project represents a distinct AI agent with its own configuration, behavior, and purpose.

## Schema Structure

```javascript
{
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  createdBy: ObjectId (required, ref: User, indexed),
  agentConfig: {
    systemPrompt: String (max 2000 chars),
    model: String (enum: gpt-3.5-turbo, gpt-4, gpt-4-turbo, gpt-4o),
    temperature: Number (0-2, default: 0.7),
    maxTokens: Number (1-4096, default: 1000)
  },
  isActive: Boolean (default: true),
  isPublic: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## How Project Maps to AI Agent

### 1. **Identity & Purpose**

```
Project.name → Agent Display Name
Project.description → Agent Purpose & Capabilities
```

**Example**:

```javascript
{
  name: "Customer Support Agent",
  description: "Handles customer inquiries about products, orders, and returns"
}
```

### 2. **Multi-Tenancy**

```
Project.createdBy → Owner/Tenant Isolation
```

Each user can create multiple projects (AI agents), and they are completely isolated:

```javascript
// User A's agents
Project { name: "Support Bot", createdBy: "user_a_id" }
Project { name: "Sales Bot", createdBy: "user_a_id" }

// User B's agents (completely separate)
Project { name: "Support Bot", createdBy: "user_b_id" }
```

### 3. **Agent Behavior Configuration**

```
Project.agentConfig.systemPrompt → Agent Personality & Instructions
Project.agentConfig.model → AI Model Selection
Project.agentConfig.temperature → Response Creativity
Project.agentConfig.maxTokens → Response Length Limit
```

**Example Configuration**:

```javascript
agentConfig: {
  systemPrompt: "You are a friendly customer support agent. Always be polite and helpful.",
  model: "gpt-4-turbo",
  temperature: 0.7,
  maxTokens: 1000
}
```

### 4. **Agent States**

```
Project.isActive → Agent Enabled/Disabled
Project.isPublic → Agent Visibility (private or shareable)
```

## Usage Examples

### Creating an AI Agent

```javascript
const Project = require("../models/Project.model");

// Create a code review agent
const codeReviewAgent = await Project.create({
  name: "Code Review Assistant",
  description: "Reviews code for best practices, bugs, and improvements",
  createdBy: req.user.id,
  agentConfig: {
    systemPrompt:
      "You are an expert code reviewer. Analyze code for quality, security, and performance.",
    model: "gpt-4-turbo",
    temperature: 0.3, // Lower for more deterministic responses
    maxTokens: 2000,
  },
});
```

### Querying User's Agents

```javascript
// Get all projects (AI agents) for a user
const userAgents = await Project.find({
  createdBy: req.user.id,
  isActive: true,
}).sort({ createdAt: -1 });
```

### Using the Agent Configuration

```javascript
const project = await Project.findById(projectId);

// Use the agent's configuration for OpenAI call
const response = await openai.chat.completions.create({
  model: project.agentConfig.model,
  messages: [
    { role: "system", content: project.agentConfig.systemPrompt },
    { role: "user", content: userMessage },
  ],
  temperature: project.agentConfig.temperature,
  max_tokens: project.agentConfig.maxTokens,
});
```

## Relationships with Other Models

### Current Integration

```
User → has many → Projects (AI Agents)
```

### Future Extensions

```
Project → has many → Conversations (chat sessions)
Project → has many → Tools (function calling capabilities)
Project → belongs to → KnowledgeBase (RAG for context)
Project → has many → Deployments (API endpoints)
```

## Real-World Agent Examples

### 1. Customer Support Agent

```javascript
{
  name: "24/7 Support Assistant",
  description: "Handles product questions, order tracking, and returns",
  agentConfig: {
    systemPrompt: "You are a customer support agent for an e-commerce platform...",
    model: "gpt-4",
    temperature: 0.7
  }
}
```

### 2. Code Assistant Agent

```javascript
{
  name: "Python Code Helper",
  description: "Helps write, debug, and explain Python code",
  agentConfig: {
    systemPrompt: "You are an expert Python developer. Help users write clean code...",
    model: "gpt-4-turbo",
    temperature: 0.4
  }
}
```

### 3. Content Writer Agent

```javascript
{
  name: "Blog Post Writer",
  description: "Creates SEO-optimized blog posts on tech topics",
  agentConfig: {
    systemPrompt: "You are a technical content writer. Write engaging, SEO-friendly posts...",
    model: "gpt-4",
    temperature: 0.9
  }
}
```

## Multi-Tenancy Best Practices

### ✅ Always Filter by createdBy

```javascript
// Correct - prevent cross-tenant access
const project = await Project.findOne({
  _id: projectId,
  createdBy: req.user.id,
});

// Wrong - security vulnerability!
const project = await Project.findById(projectId);
```

### ✅ Use Indexes for Performance

The model includes indexes on:

- `createdBy` (single index)
- `createdBy + createdAt` (compound index)

This optimizes queries like:

```javascript
Project.find({ createdBy: userId }).sort({ createdAt: -1 });
```

## API Endpoint Examples

Suggested routes for Project CRUD:

```javascript
GET    /api/projects          # List all user's agents
POST   /api/projects          # Create new agent
GET    /api/projects/:id      # Get single agent
PUT    /api/projects/:id      # Update agent config
DELETE /api/projects/:id      # Delete agent
POST   /api/projects/:id/chat # Chat with agent
```

## Migration Path

If you have existing Chatbot model, you can:

1. **Keep both models** for different purposes:
   - `Project` = AI Agent configuration
   - `Chatbot` = Chat interface implementation

2. **Merge into Project** by migrating data:

```javascript
// Migrate existing chatbots to projects
const chatbots = await Chatbot.find({});
for (const bot of chatbots) {
  await Project.create({
    name: bot.name,
    createdBy: bot.createdBy,
    agentConfig: {
      systemPrompt: bot.systemPrompt,
      model: bot.model,
    },
  });
}
```

## Security Considerations

- ✅ Always validate `createdBy` matches authenticated user
- ✅ Sanitize systemPrompt to prevent prompt injection
- ✅ Rate limit project creation per user
- ✅ Validate model names against allowed list
- ✅ Restrict maxTokens to prevent abuse

## Next Steps

1. Create ProjectController with CRUD operations
2. Create ProjectRoutes with protect middleware
3. Add validation for agentConfig fields
4. Implement project-to-conversation linking
5. Add usage tracking per project/agent
