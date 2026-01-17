# Authentication System Documentation

## Overview

Your Express backend has a complete JWT-based authentication system with bcrypt password hashing.

## Files Structure

### 1. User Model

**Location**: [src/models/User.model.js](src/models/User.model.js)

**Schema**:

```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, auto-hashed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Features**:

- ✅ Auto-hashes password with bcrypt (10 salt rounds) before saving
- ✅ Password field excluded from queries by default (`select: false`)
- ✅ Email validation with regex pattern
- ✅ Built-in methods:
  - `user.comparePassword(password)` - Verify password
  - `user.getSignedJwtToken()` - Generate JWT token

### 2. Auth Controller

**Location**: [src/controllers/auth.controller.js](src/controllers/auth.controller.js)

**Endpoints**:

#### POST /api/auth/register

Register a new user.

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /api/auth/login

Login existing user.

**Request**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### GET /api/auth/me

Get current user info (protected route).

**Headers**:

```
Authorization: Bearer <token>
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-17T10:30:00.000Z",
    "updatedAt": "2026-01-17T10:30:00.000Z"
  }
}
```

### 3. Auth Routes

**Location**: [src/routes/auth.routes.js](src/routes/auth.routes.js)

Routes are mounted at `/api/auth` in [src/app.js](src/app.js).

### 4. JWT Protection Middleware

**Location**: [src/middleware/auth.js](src/middleware/auth.js)

**Usage**:

```javascript
const { protect } = require("../middleware/auth");

// Protect a route
router.get("/protected", protect, controller);

// Access user ID in controller
req.user.id; // User's MongoDB _id from JWT payload
```

**How it works**:

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token with `process.env.JWT_SECRET`
3. Decodes user ID and attaches to `req.user.id`
4. Returns 401 error if token is invalid/missing

## Environment Variables

Required in `.env`:

```bash
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=7d  # Token expiration time
```

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Security Features

✅ **Password Hashing**: Bcrypt with 10 salt rounds  
✅ **JWT Expiration**: Configurable (default 7 days)  
✅ **Password Hiding**: Never returned in API responses  
✅ **Email Validation**: Regex pattern matching  
✅ **Error Handling**: Centralized with consistent responses  
✅ **Input Validation**: Mongoose schema validation

## Error Responses

### Invalid Credentials (401)

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Missing Fields (400)

```json
{
  "success": false,
  "error": "Please provide email and password"
}
```

### Duplicate Email (400)

```json
{
  "success": false,
  "error": "Duplicate field value: email. Please use another value."
}
```

### Unauthorized Access (401)

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

## Testing the Auth System

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Test registration**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

3. **Copy the token from response**

4. **Test protected route**:
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Integration with Other Routes

To protect any route:

```javascript
const { protect } = require("../middleware/auth");

// In your route file
router.get("/my-resource", protect, myController);

// In your controller
exports.myController = async (req, res, next) => {
  const userId = req.user.id; // Available after protect middleware
  // Use userId to filter resources by owner
};
```

## Next Steps

- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add refresh token mechanism
- [ ] Add role-based access control (RBAC)
- [ ] Add rate limiting per user
- [ ] Add account lockout after failed attempts
