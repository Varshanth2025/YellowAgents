# Chatyellow

AI chatbot platform where you can create custom agents with different personalities and chat with them. Built this to learn full-stack development with React, Node.js, and OpenAI's API.

## What it does

Create multiple AI chatbots, give them custom personalities through system prompts, and have conversations with them. All your chats are saved so you can pick up where you left off. You can also upload documents (PDFs, text files, code) and the AI can read them and answer questions about the content.

## Tech I used

Backend: Node.js, Express, MongoDB  
Frontend: React, Vite, Axios  
AI: OpenAI GPT-3.5/GPT-4  
Auth: JWT tokens with bcrypt

## Running it locally

You'll need Node.js, MongoDB, and an OpenAI API key.

```bash
git clone <your-repo>
cd chatyellow
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/chatyellow
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
PORT=5001
CLIENT_URL=http://localhost:5173
```

Install dependencies and run:

```bash
npm install
cd frontend && npm install
cd ..

npm run dev
```

Backend runs on http://localhost:5001  
Frontend runs on http://localhost:5173

## How to use

Sign up, create a new agent, set its personality in the prompts section, then start chatting. You can upload files and ask questions about them too.

## API Routes

**Auth:**

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

**Projects:**

- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

**Chat:**

- POST /api/projects/:id/chat
- GET /api/projects/:id/conversations

**Files:**

- POST /api/projects/:id/files
- GET /api/projects/:id/files
- DELETE /api/projects/:id/files/:fileId

## Database Models

User: email, password, name  
Project: name, description, owner  
Prompt: system prompt text, project reference  
Message: conversation history  
FileAttachment: uploaded files metadata

## Issues I ran into

- Had to switch from OpenAI Files API download to local text extraction because their API doesn't let you download file content for "assistants" purpose
- PDF parsing took a while to figure out - pdf-parse v2 has different API than v1
- CORS was annoying during development, had to configure it properly
- Rate limiting was needed to prevent API abuse

## Things to improve

- Better error messages on frontend
- File size limits and validation
- Streaming chat responses for better UX
- Dark mode
- Better mobile responsiveness

## License

MIT
