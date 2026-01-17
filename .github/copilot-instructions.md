# Chatyellow - Multi-Tenant AI Chatbot Platform

## Project Overview

Production-ready backend for a multi-tenant platform where users can create AI chatbots powered by OpenAI.

**Stack**: Node.js + Express + MongoDB + Mongoose + OpenAI API  
**Auth**: JWT with bcrypt password hashing

## Architecture

### Backend Structure (Production-Style)

```
src/
├── config/          # Database connection, external service configs
├── controllers/     # Request handlers (auth, chatbot, conversation)
├── middleware/      # Auth (JWT), error handling, 404 handler
├── models/          # Mongoose schemas (User, Chatbot)
├── routes/          # Express route definitions
├── services/        # Business logic & external APIs (OpenAI)
├── app.js           # Express app setup with middleware
server.js            # Entry point - starts server & connects DB
```

### Key Files

- [server.js](server.js) - Entry point with process handlers
- [src/app.js](src/app.js) - Express configuration, middleware stack, route mounting
- [src/config/database.js](src/config/database.js) - MongoDB connection with event handling
- [src/middleware/errorHandler.js](src/middleware/errorHandler.js) - Centralized error handling & custom AppError class
- [src/middleware/auth.js](src/middleware/auth.js) - JWT verification middleware

## Key Patterns

### Multi-Tenancy

- Every chatbot/conversation belongs to a user (createdBy field)
- Middleware enforces tenant isolation: `req.user.id` from JWT
- **Critical**: Always filter DB queries by user: `{ createdBy: req.user.id }`

### OpenAI Integration

- Use OpenAI Responses API (not deprecated Completions)
- Store conversation history per chat session
- Format messages as `[{ role: 'user'|'assistant', content: '...' }]`

### Auth Flow

1. POST `/auth/register` → bcrypt password → save user → return JWT
2. POST `/auth/login` → verify password → return JWT
3. Frontend stores JWT in localStorage
4. Protected routes use `Authorization: Bearer <token>` header

## Development Workflow

````bash
# Initial setup
npm install
cp .env.example .env  # Then configure your environment

# Development (auto-reload with nodemon)
npm run dev

# Production
npm start

# Required environment variables (see .env.example)
MONGODB_URI=mongodb://localhost:27017/chatyellow
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
PORT=5000
NODE_ENV=development
CLIEController Pattern (Always Use)
Controllers handle request/response logic; route files only define endpoints:
```javascript
// ❌ Don't put logic in routes
router.post('/chatbots', protect, async (req, res) => { /* logic here */ });

// ✅ Do: routes define endpoints, controllers have logic
router.post('/chatbots', protect, createChatbot);
````

### Multi-Tenancy (Critical)

Every protected resource MUST filter by `createdBy`:

```javascript
// ✅ Correct - prevent cross-tenant access
const chatbot = await Chatbot.findOne({
  _id: req.params.id,
  createdBy: req.user.id, // From JWT via protect middleware
});

// ❌ Wrong - security vulnerability!
const chatbot = await Chatbot.findById(req.params.id);
```

###Security & Middleware Stack

Middleware execution order in [src/app.js](src/app.js):

1. `helmet()` - Security headers
2. `cors()` - CORS with configured origin
3. `rateLimit()` - 100 req/15min per IP on /api routes
4. `express.json()` - Body parsing
5. `morgan()` - Request logging (dev/combined)
6. Route handlers
7. `notFound` - 404 handler
8. `errorHandler` - Centralized error handling (MUST BE LAST)

## OpenAI Integration

Service pattern for external APIs (see [src/services/openai.service.js](src/services/openai.service.js)):

````jPI Response Standards

Successful responses:
```javascript
res.status(200).json({
  success: true,
  data: result,
  count: array.length  // For list endpoints
});
````

Error responses (handled by middleware):

```javascript
{
  success: false,
  error: "Error message",
  stack: "..."  // Only in development
}
```

## Anti-Patterns to Avoid

- ❌ Logic in route files - use controllers
- ❌ Querying resources without `createdBy` filter
- ❌ Manual password hashing - User model handles it
- ❌ Storing JWT in code - use environment variables
- ❌ Nested callbacks - use async/await everywhere
- ❌ Generic error messages - be specific for debugging

## Adding New Features

### New Resource Checklist

1. Create model in `src/models/` with `createdBy` field
2. Create controller in `src/controllers/` with CRUD operations
3. Create routes in `src/routes/` with `protect` middleware
4. Mount routes in `src/app.js`
5. Add tenant filtering: `{ createdBy: req.user.id }`
6. Use try-catch with `next(error)` in all async functions

### Example: Adding a new endpoint

```javascript
// 1. Controller (src/controllers/resource.controller.js)
exports.getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ createdBy: req.user.id });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

// 2. Route (src/routes/resource.routes.js)
router.get("/", protect, getResources);

// 3. Mount in app.js
app.use("/api/resources", resourceRoutes);
```

]

```

## Data Models

### Implemented
- **User** ([src/models/User.model.js](src/models/User.model.js)): email (unique), password (hashed), name, timestamps
- **Chatbot** ([src/models/Chatbot.model.js](src/models/Chatbot.model.js)): name, systemPrompt, model, createdBy, isActive

### To Implement
- **Conversation**: chatbotId, createdBy, messages[], lastMessageAt
- **Message**: conversationId, rolerors: `new AppError(message, statusCode)`
- Mongoose validation errors auto-converted by error middleware
- Response format: `{ success: true/false, data/error, count? }`

### Authentication Flow
1. User model auto-hashes password in `pre('save')` hook
2. JWT generated via model method: `user.getSignedJwtToken()`
3. Protected routes use `protect` middleware from [src/middleware/auth.js](src/middleware/auth.js)
4. Middleware extracts token from `Authorization: Bearer <token>` header
5. Decoded user ID attached as `req.user.id`

### Error Handling
- Use try-catch in async routes
- Return consistent JSON: `{ success, data/error, message }`
- Backend validates input before DB operations

## AI-Specific Notes

### OpenAI Message Flow
1. User sends message → frontend POST `/conversations/:id/messages`
2. Backend appends to conversation history
3. Call OpenAI with full history array
4. Save assistant response to DB
5. Return to frontend for display

### Data Models Priority
1. **User**: email, passwordHash, name
2. **Chatbot**: name, systemPrompt (AI personality), createdBy
3. **Conversation**: chatbotId, createdBy, messages[]
4. **Message**: role ('user'/'assistant'), content, timestamp

## Anti-Patterns (Avoid)
- ❌ Complex abstractions (repositories, factories)
- ❌ Nested callbacks (use async/await)
- ❌ Exposing chatbots across tenants
- ❌ Storing OpenAI key on frontend
- ✅ Keep it simple, readable, beginner-friendly

## Quick Start for New Agents
1. Check `.env.example` for required environment variables
2. Models define the database schema - start there
3. Routes are organized by resource (/auth, /chatbots, etc.)
4. Auth middleware (middleware/auth.js) is used on all protected routes
5. Frontend API calls go through services/api.js for consistency
```
