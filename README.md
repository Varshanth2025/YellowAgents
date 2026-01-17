# Chatyellow - AI Agent Platform

A multi-tenant platform for creating and managing AI agents powered by OpenAI. Build custom AI assistants with configurable personalities, chat with them in real-time, and manage multiple agents from a single dashboard.

**[Live Demo](#)** | **[Documentation](#)** | **[Report Bug](#)**

## ✨ Features

### Core Features

- 🤖 **Create Custom AI Agents** - Define unique personalities and behaviors for each agent
- 💬 **Real-time Chat** - Interactive chat interface with conversation history
- 🔐 **Multi-tenant Architecture** - Secure user isolation with JWT authentication
- 📝 **System Prompts** - Configure AI agent behavior with custom instructions
- 💾 **Persistent Conversations** - All messages saved and retrievable
- 🎯 **Project Management** - Create, update, and delete AI agents from dashboard
- 📎 **File Uploads** - Upload documents to enhance AI responses using OpenAI Files API

### Technical Features

- ✅ RESTful API with Express.js
- ✅ MongoDB with Mongoose ODM
- ✅ OpenAI GPT-3.5/GPT-4 integration
- ✅🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **AI**: OpenAI API (GPT-3.5-turbo, GPT-4)
- **Security**: Helmet, CORS, express-rate-limit

### Frontend

- **Framework**: React 18
- \*🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/chatyellow.git
   cd chatyellow
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatyellow
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=7d
   OPENAI_API_KEY=sk-your-openai-api-key-here
   CLIENT_URL=http://localhost:5173
   ```

3. **Start MongoDB**

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Or use MongoDB Atlas (cloud)
   📖 Usage

   ```

4. **Register/Login** - Create an account or log in
5. **Create AI Agent** - Click "Create New Agent" and give it a name
6. **Set System Prompt** - Define your agent's personality and behavior
7. **Start Chatting** - Open the chat interface and start conversing
8. **Manage Agents** - View, edit, or delete agents from the dashboard

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects (AI Agents)

- `GET /api/projects` - List all user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Files (Document Upload)

- `POST /api/projects/:projectId/files` - Upload file to OpenAI
- `GET /api/projects/:projectId/files` - List project files
- `GET /api/projects/:projectId/files/:fileId` - Get file details
- `DELETE /api/projects/:projectId/files/:fileId` - Delete file

###🔐 Environment Variables

Create a `.env` file in the root directory:

| Variable         | Description               | Required | Default                 |
| ---------------- | ------------------------- | -------- | ----------------------- |
| `NODE_ENV`       | Environment mode          | No       | `development`           |
| `PORT`           | Backend server port       | No       | `5000`                  |
| `MONGODB_URI`    | MongoDB connection string | Yes      | -                       |
| `JWT_SECRET`     | Secret key for JWT tokens | Yes      | -                       |
| `JWT_EXPIRE`     | JWT token expiration time | No       | `7d`                    |
| `OPENAI_API_KEY` | OpenAI API key            | Yes      | -                       |
| `CLIENT_URL`     | Frontend URL for CORS     | No       | `http://localhost:5173` |

## 🏗️ Architecture

### Data Models

**User** - Authentication and ownership

- email, password (hashed), name

**Project** - AI Agent container

- name, description, createdBy, agentConfig (model, temperature, etc.)
  🔒 Security

- **Helmet** - Security headers
- **CORS** - Configured origin restrictions
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **JWT Authentication** - Token-based auth with expiration
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Mongoose schema validation
- **Multi-tenant Isolation** - All queries filtered by `createdBy`
- **Error Sanitization** - No sensitive data in error responses

## 🚧 Roadmap

- [ ] Add conversation sessions management
- [ ] Implement message search and filtering
- [x] Add support for file uploads (RAG) - **Completed!**
- [ ] Implement function calling for AI agents
- [ ] Add usage analytics and token tracking
- [ ] Support for multiple AI providers
- [ ] Team collaboration features
- [ ] Agent marketplace/templates
- [ ] Export conversations as PDF/markdown

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the GPT API
- [MongoDB](https://www.mongodb.com) for the database
- [Express.js](https://expressjs.com) for the backend framework
- [React](https://react.dev) for the frontend framework

## 📧 Contact

For questions or support, please open an issue or contact:

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

**Built with ❤️ using Node.js, React, and OpenAI**
Create Project (AI Agent)
↓
Set System Prompt → "You are a helpful assistant..."
↓
Send Message → Backend fetches last 10 messages
↓
Call OpenAI API → System Prompt + History + New Message
↓
Save User Message + AI Response
↓
Return to Frontend → Display in Chat UI

````

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Create project (use token from login)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Support Bot","description":"Customer support agent"}'

# Chat with AI
curl -X POST http://localhost:5000/api/chat/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!","sessionId":"session_1"}'
````

## 📝 Error Handling

All errors return consistent JSON
├── models/ # Mongoose models
├── routes/ # Route definitions
└── services/ # Business logic & external services

````

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
````

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**

   ```bash
   # Make sure MongoDB is running on your system
   ```

4. **Run the application**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Chatbots

- `GET /api/chatbots` - Get all user's chatbots
- `POST /api/chatbots` - Create new chatbot
- `GET /api/chatbots/:id` - Get single chatbot
- `PUT /api/chatbots/:id` - Update chatbot
- `DELETE /api/chatbots/:id` - Delete chatbot

### Conversations

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:id/messages` - Send message

## Environment Variables

See `.env.example` for required environment variables.

## Development

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

## Error Handling

All errors are handled by the centralized error handling middleware in `src/middleware/errorHandler.js`. The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT token authentication
- Password hashing with bcrypt
- Input validation with Mongoose schemas

## License

MIT
