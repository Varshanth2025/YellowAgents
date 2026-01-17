# Chatyellow Architecture

> A concise guide to the system design and technical decisions

## System Overview

Chatyellow is a **multi-tenant AI agent platform** built with a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  - Single Page Application (SPA)                            │
│  - React Router for navigation                              │
│  - Axios for API calls                                      │
│  - JWT stored in localStorage                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│  - RESTful API server                                       │
│  - JWT authentication middleware                            │
│  - Business logic & OpenAI integration                      │
│  - Multi-tenant data isolation                              │
└─────────────────┬───────────────────────────────────────────┘
                  │ Mongoose ODM
┌─────────────────▼───────────────────────────────────────────┐
│                      DATABASE (MongoDB)                      │
│  - Document-based storage                                   │
│  - Collections: Users, Projects, Prompts, Messages          │
│  - Indexed by userId for tenant isolation                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

**JWT-based stateless authentication** for scalability:

```
1. User Registration/Login
   ├─→ POST /api/auth/register or /login
   ├─→ Backend: Hash password (bcrypt)
   ├─→ Create/Find user in MongoDB
   ├─→ Generate JWT token with userId
   └─→ Return { token, user }

2. Frontend Storage
   ├─→ Store JWT in localStorage
   └─→ Add to AuthContext state

3. Subsequent Requests
   ├─→ Axios interceptor adds: Authorization: Bearer <token>
   ├─→ Backend middleware verifies JWT
   ├─→ Decode token → extract userId
   ├─→ Attach req.user.id to request
   └─→ All DB queries filter by createdBy: req.user.id
```

**Why JWT?**

- ✅ **Stateless** - No server-side sessions (scales horizontally)
- ✅ **Portable** - Works across multiple servers/load balancers
- ✅ **Self-contained** - All user info encoded in token

---

## AI Agent Model

**3-Layer conceptual model** for AI agents:

```
Project (Container)
    ↓
Prompt (Behavior)
    ↓
Messages (History)
```

### 1. Project = AI Agent Identity

```javascript
{
  name: "Customer Support Bot",
  description: "Handles customer inquiries",
  createdBy: userId,
  agentConfig: {
    model: "gpt-4-turbo",
    temperature: 0.7,
    maxTokens: 1000
  }
}
```

- One user can have **multiple projects** (many agents)
- Each project is **tenant-isolated** by `createdBy`

### 2. Prompt = AI Personality

```javascript
{
  projectId: projectId,
  systemPrompt: "You are a helpful support agent...",
  version: 1,
  isActive: true
}
```

- **One active prompt per project**
- Defines **how the agent behaves**
- Can be updated to change agent personality

### 3. Messages = Conversation History

```javascript
{
  projectId: projectId,
  role: "user" | "assistant",
  content: "Hello!",
  sessionId: "session_123",
  createdBy: userId
}
```

- **Chronological message log**
- Used to provide context to OpenAI
- Enables **coherent multi-turn conversations**

---

## Chat Request Lifecycle

**Complete flow from user input to AI response:**

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: User sends message in chat UI                        │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 2: POST /api/chat/:projectId                            │
│         Body: { message: "Hello", sessionId: "123" }         │
│         Headers: Authorization: Bearer <JWT>                 │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Backend validates JWT & extracts userId              │
│         Middleware: req.user.id = decoded.id                 │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 4: Verify project ownership                             │
│         Project.findOne({ _id, createdBy: userId })          │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 5: Fetch active system prompt                           │
│         Prompt.findOne({ projectId, isActive: true })        │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 6: Load last 10 messages for context                    │
│         Message.find({ projectId, sessionId })               │
│                .sort({ createdAt: -1 }).limit(10)            │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 7: Save user's message to database                      │
│         Message.create({ role: "user", content, ... })       │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 8: Build OpenAI request                                 │
│         messages = [                                         │
│           { role: "system", content: systemPrompt },         │
│           ...previousMessages,                               │
│           { role: "user", content: newMessage }              │
│         ]                                                    │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 9: Call OpenAI API                                      │
│         openai.chat.completions.create({                     │
│           model: "gpt-4-turbo",                              │
│           messages: messages,                                │
│           temperature: 0.7                                   │
│         })                                                   │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 10: Save AI response to database                        │
│          Message.create({ role: "assistant", content, ... }) │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 11: Return both messages to frontend                    │
│          { userMessage: {...}, assistantMessage: {...} }     │
└───────────┬──────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│ Step 12: Frontend updates UI                                 │
│          Display both messages in chat window                │
│          Scroll to bottom, clear input field                 │
└──────────────────────────────────────────────────────────────┘
```

**Key Points:**

- **Tenant isolation** at every step (createdBy filter)
- **Conversation memory** via last 10 messages
- **Async operations** for database and OpenAI
- **Error handling** at each step with try-catch

---

## Why This Design is Scalable & Extensible

### 1. **Horizontal Scalability**

✅ **Stateless Backend**

- JWT authentication = no session storage
- Can add more Express servers behind load balancer
- No sticky sessions required

✅ **Database Design**

- MongoDB sharding by `createdBy` (userId)
- Each tenant's data can be distributed
- Indexed queries for fast lookups

✅ **Microservice-Ready**

- Clear separation: Auth, Projects, Chat, AI Service
- Each can be extracted into separate service
- Service-to-service communication via REST/gRPC

### 2. **Vertical Scalability**

✅ **Caching Layer** (Future)

- Add Redis for:
  - Session data
  - Frequently accessed prompts
  - Recent messages cache

✅ **Background Jobs** (Future)

- Queue system (Bull/Redis) for:
  - Long-running AI requests
  - Batch processing
  - Analytics

### 3. **Extensibility**

✅ **Plugin Architecture**

```
Current: OpenAI Service
Future:  AI Provider Interface
         ├─ OpenAI
         ├─ Anthropic (Claude)
         ├─ Google (Gemini)
         └─ Custom models
```

✅ **Feature Extensions**

- **RAG (Retrieval-Augmented Generation)**
  - Add KnowledgeBase model
  - Link to Project
  - Embed documents → vector store

- **Function Calling**
  - Add Tools model
  - Define tool schemas
  - Agent can call external APIs

- **Multi-modal Support**
  - Add FileAttachment model
  - Support images, PDFs, audio
  - Process with GPT-4V or Whisper

✅ **Data Model Flexibility**

```
User ──┬─→ Project ─→ Prompt ─→ Messages
       │                ↓
       │           KnowledgeBase (Future)
       │                ↓
       │              Tools (Future)
       │                ↓
       └─→         Deployments (Future - API endpoints)
```

### 4. **Multi-Tenancy Best Practices**

✅ **Data Isolation**

- Every query filters by `createdBy: userId`
- Impossible for User A to access User B's data
- Enforced at middleware + controller level

✅ **Resource Quotas** (Future)

- Limit projects per user
- Track token usage
- Implement billing tiers

✅ **Security Layers**

```
Request → Rate Limiter
        → CORS validation
        → JWT verification
        → Role-based access (Future)
        → Data validation
        → Database query
```

---

## Key Technical Decisions

| Decision                    | Reasoning                                           |
| --------------------------- | --------------------------------------------------- |
| **JWT over Sessions**       | Stateless = better for horizontal scaling           |
| **MongoDB over SQL**        | Flexible schema, easy to add new fields to agents   |
| **React SPA**               | Better UX, client-side routing, reduced server load |
| **Separate Project/Prompt** | Allows prompt versioning & A/B testing              |
| **Session-based messages**  | Enables multiple conversations per agent            |
| **Last 10 messages**        | Balance between context and token cost              |
| **Axios interceptor**       | Centralized auth token management                   |
| **Context API over Redux**  | Simple state needs, avoid complexity                |

---

## Performance Considerations

### Database Indexes

```javascript
// Project model
{ createdBy: 1, createdAt: -1 }  // List user's projects

// Message model
{ projectId: 1, createdAt: 1 }   // Get messages chronologically
{ projectId: 1, sessionId: 1, createdAt: 1 }  // Session history

// Prompt model
{ projectId: 1, isActive: 1 }    // One active prompt per project
```

### API Response Times (Target)

- Auth endpoints: < 200ms
- List projects: < 100ms
- Get chat history: < 150ms
- Send message (with OpenAI): < 3000ms

### Optimization Strategies

1. **Database**: Connection pooling (default in Mongoose)
2. **OpenAI**: Streaming responses (future enhancement)
3. **Frontend**: Lazy loading, code splitting
4. **Caching**: Response caching for static data

---

## Interview Talking Points

**"Explain your architecture in 30 seconds"**

> "It's a 3-tier multi-tenant platform: React frontend, Express backend, MongoDB database. Users authenticate with JWT, create AI agents (Projects), define their behavior with system prompts, and chat with them. Each chat sends user message + history to OpenAI, saves both messages, and returns the response. All data is tenant-isolated by userId."

**"How does it scale?"**

> "Stateless JWT auth means we can horizontally scale Express servers. MongoDB can shard by userId. The AI service is abstracted, so we can add queues or multiple providers. Each tenant's data is completely isolated, so we can even distribute users across different database clusters."

**"What would you add next?"**

> "1) Redis caching for prompts and recent messages, 2) Message queuing for async AI processing, 3) RAG support with vector databases for knowledge bases, 4) Streaming responses for better UX, 5) Usage tracking and billing integration."

---

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB v5+
- OpenAI API key

### Installation

1. **Clone and setup environment**

   ```bash
   git clone <repo-url>
   cd Chatyellow
   cp .env.example .env
   ```

2. **Configure `.env`**

   ```env
   MONGODB_URI=mongodb://localhost:27017/chatyellow
   JWT_SECRET=your_super_secret_key_min_32_chars
   OPENAI_API_KEY=sk-your-openai-key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. **Start MongoDB**

   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

4. **Run Backend**

   ```bash
   npm install
   npm run dev
   # Runs on http://localhost:5000
   ```

5. **Run Frontend** (new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

6. **Test the application**
   - Open http://localhost:5173
   - Register a new account
   - Create an AI agent
   - Set a system prompt (e.g., "You are a helpful coding assistant")
   - Start chatting!

### Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Create project (use token from step 2)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent","description":"A test AI agent"}'

# 4. Set prompt (use project ID from step 3)
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/prompt \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"systemPrompt":"You are a helpful assistant."}'

# 5. Chat
curl -X POST http://localhost:5000/api/chat/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Who are you?","sessionId":"test_session"}'
```

---

## 🚀 Running Locally - Complete Guide

### Step-by-Step Instructions

#### 1. Install Prerequisites

```bash
# Check Node.js version (need v16+)
node --version

# Check npm version
npm --version

# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community

# Install MongoDB (Ubuntu/Debian)
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
mongosh --eval "db.version()"
```

#### 2. Clone and Setup

```bash
# Navigate to your projects folder
cd ~/Desktop

# If you're already in the Chatyellow folder, skip to step 3
# Otherwise, clone if needed
# git clone <your-repo-url>

cd Chatyellow
```

#### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file (use nano, vim, or your editor)
nano .env
```

**Required `.env` configuration:**

```env
NODE_ENV=development
PORT=5000

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/chatyellow

# JWT (generate a secure random string)
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRE=7d

# OpenAI - GET YOUR KEY FROM: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**⚠️ Important:** Replace `OPENAI_API_KEY` with your actual OpenAI API key!

#### 4. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### 5. Start the Application

**Option A: Using 2 Terminal Windows** (Recommended)

```bash
# Terminal 1 - Backend
npm run dev
# You should see: "Server running in development mode on port 5000"
# And: "MongoDB Connected: localhost"

# Terminal 2 - Frontend (open new terminal)
cd frontend
npm run dev
# You should see: "Local: http://localhost:5173/"
```

**Option B: Using Single Terminal with &** (Background process)

```bash
# Start backend in background
npm run dev &

# Start frontend
cd frontend
npm run dev
```

#### 6. Access the Application

```bash
# Open in your browser
open http://localhost:5173

# Or manually navigate to:
# http://localhost:5173
```

#### 7. Create Your First AI Agent

1. **Register**: Create an account with email/password
2. **Login**: Sign in with your credentials
3. **Create Project**: Click "Create New Agent"
   - Name: "My First Bot"
   - Description: "A helpful assistant"
4. **Set System Prompt**: Click "Edit System Prompt"
   - Example: "You are a friendly assistant who loves helping people learn to code."
5. **Start Chatting**: Type a message and press Send!

---

## 🌐 Deployment Guide

### Option 1: Deploy to Railway (Easiest - 5 minutes)

**Backend + Database on Railway**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project (from root directory)
railway init

# 4. Add MongoDB
railway add

# Select "MongoDB" from the list

# 5. Set environment variables
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set JWT_SECRET=your-super-secret-key-here
railway variables set CLIENT_URL=https://your-frontend.vercel.app

# 6. Deploy backend
railway up

# 7. Get your backend URL
railway domain
# Note this URL for frontend configuration
```

**Frontend on Vercel**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd frontend
vercel

# Follow prompts:
# - Project name: chatyellow-frontend
# - Framework: Vite

# 3. Set environment variable (if needed)
# In vite.config.js, update proxy target to your Railway backend URL

# 4. Production deployment
vercel --prod
```

### Option 2: Deploy to Render (Free Tier Available)

**Backend on Render**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: chatyellow-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     MONGODB_URI=<your-mongodb-atlas-uri>
     JWT_SECRET=<your-secret>
     OPENAI_API_KEY=<your-openai-key>
     CLIENT_URL=<your-frontend-url>
     NODE_ENV=production
     ```
5. Click "Create Web Service"

**Frontend on Render**

1. Click "New +" → "Static Site"
2. Connect repository
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Update `frontend/vite.config.js`:
   ```javascript
   proxy: {
     '/api': {
       target: 'https://your-backend.onrender.com',
       changeOrigin: true,
     }
   }
   ```

### Option 3: Deploy to Heroku

**Backend**

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create chatyellow-backend

# 3. Add MongoDB (using MongoDB Atlas recommended)
# Sign up at https://www.mongodb.com/cloud/atlas
# Get connection string

# 4. Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatyellow
heroku config:set JWT_SECRET=your-secret-key
heroku config:set OPENAI_API_KEY=sk-your-key
heroku config:set CLIENT_URL=https://your-frontend.herokuapp.com
heroku config:set NODE_ENV=production

# 5. Create Procfile
echo "web: node server.js" > Procfile

# 6. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**Frontend**

```bash
cd frontend

# 1. Create app
heroku create chatyellow-frontend

# 2. Add buildpack
heroku buildpacks:set heroku/nodejs

# 3. Create static.json
echo '{"root": "dist/"}' > static.json

# 4. Update package.json scripts
# Add: "start": "vite preview"

# 5. Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### Option 4: Docker Deployment (Advanced)

**Create Dockerfile** (in root directory)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Create docker-compose.yml**

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/chatyellow
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLIENT_URL=http://localhost:5173
    depends_on:
      - mongo

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongo-data:
```

**Run with Docker**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**2. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
```

**3. OpenAI API Error**

```
Error: Invalid API key
```

**Solution:**

- Check your `.env` file
- Verify key starts with `sk-proj-` or `sk-`
- Get new key from https://platform.openai.com/api-keys
- Make sure you have credits in your OpenAI account

**4. CORS Error in Browser**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

- Check `CLIENT_URL` in `.env` matches your frontend URL
- Restart backend server after changing `.env`

**5. Frontend Can't Connect to Backend**

```
Network Error / ERR_CONNECTION_REFUSED
```

**Solution:**

```bash
# Verify backend is running
curl http://localhost:5000/health

# Should return: {"status":"success","message":"Server is running"}

# Check frontend proxy in vite.config.js
```

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created (for production)
- [ ] OpenAI API key obtained
- [ ] Environment variables configured
- [ ] All dependencies installed (`npm install`)
- [ ] Application runs locally
- [ ] Git repository initialized
- [ ] `.env` added to `.gitignore`
- [ ] Production build tested (`npm run build`)
- [ ] Database indexes created (automatic with Mongoose)
- [ ] CORS settings updated for production domain
- [ ] Rate limiting configured appropriately

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start backend (development)
cd frontend && npm run dev     # Start frontend (development)

# Production
npm start                      # Start backend (production)
cd frontend && npm run build   # Build frontend for production
cd frontend && npm run preview # Preview production build

# Database
mongosh                        # Open MongoDB shell
mongosh --eval "show dbs"      # List databases
mongosh chatyellow             # Connect to chatyellow DB

# Testing
curl http://localhost:5000/health  # Test backend health
curl http://localhost:5173         # Test frontend

# Cleanup
rm -rf node_modules            # Remove backend dependencies
rm -rf frontend/node_modules   # Remove frontend dependencies
npm install                    # Reinstall backend
cd frontend && npm install     # Reinstall frontend
```

---

**Built with production-grade architecture principles** ✨
