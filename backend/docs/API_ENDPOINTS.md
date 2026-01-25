# Legal AI Assistant Backend - API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication

All protected routes require Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Required Supabase Setup

Before testing auth endpoints, you must configure your Supabase project:

### 1. Enable Email Authentication in Supabase Console
- Go to your [Supabase Console](https://supabase.com/dashboard)
- Navigate to **Authentication** → **Providers** → **Email**
- Ensure **Email** provider is **Enabled**
- Select **Confirm email** or **Double confirm email** based on your needs

### 2. Configure Email Template (if required)
- Go to **Authentication** → **Email Templates**
- Ensure confirmation email template is properly configured
- Or use the default template

### 3. Create profiles Table in Supabase
Run this SQL in your Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Verify Environment Variables
Your `.env` file should have:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Quick Test Commands

### Authentication APIs

#### 1. Signup (Create Account with Profile)
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 24,
    "gender": "male",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Request Data:**
- `name` (string, required) - User full name, min 2 characters
- `age` (number, required) - User age, minimum 13
- `gender` (string, required) - One of: "male", "female", "other"
- `email` (string, required) - Valid email address
- `password` (string, required) - Min 8 characters

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "user_metadata": { "name": "John Doe" }
    },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "token...",
      "expires_in": 3600
    }
  }
}
```

---

#### 2. Login (Email/Password)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Request Data:**
- `email` (string, required) - User email
- `password` (string, required) - User password

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "user_metadata": { "name": "John Doe" }
    },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "token...",
      "expires_in": 3600
    }
  }
}
```

---

#### 3. Get Current User Info
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

**Headers Required:**
- `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "User information retrieved",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "user_metadata": { "name": "John Doe" }
    }
  }
}
```

---

#### 4. Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

**Headers Required:**
- `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Public APIs

#### 5. Health Check
```bash
curl http://localhost:3001/api/health
```

#### 6. SOS Legal Help
```bash
curl http://localhost:3001/api/sos
```

#### 7. Legal Categories
```bash
curl http://localhost:3001/api/categories
```

#### 8. Legal News
```bash
curl http://localhost:3001/api/news
```

---

### Protected APIs (Require Authentication)

#### 9. AI Chat
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"message":"What are my legal rights?"}'
```

**Headers Required:**
- `Authorization: Bearer <access_token>`

**Request Data:**
- `message` (string, required) - User query

#### 10. AI Voice
```bash
curl -X POST http://localhost:3001/api/ai/voice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"audioData":"..."}'
```

**Headers Required:**
- `Authorization: Bearer <access_token>`

**Request Data:**
- `audioData` (string, required) - Base64 encoded audio

#### 11. AI Document
```bash
curl -X POST http://localhost:3001/api/ai/document \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"documentName":"document.pdf"}'
```

**Headers Required:**
- `Authorization: Bearer <access_token>`

**Request Data:**
- `documentName` (string, required) - Document file name

---

## All Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/signup` | POST | No | Register new user with profile |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/me` | GET | Yes | Get current user info |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/health` | GET | No | Server health check |
| `/api/sos` | GET | No | Emergency legal help |
| `/api/categories` | GET | No | Legal practice categories |
| `/api/news` | GET | No | Crime-related legal news |
| `/api/ai/chat` | POST | Yes | Text-based AI chat |
| `/api/ai/voice` | POST | Yes | Voice input processing |
| `/api/ai/document` | POST | Yes | Document upload & processing |

---

## Response Format

All endpoints return standardized JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Description"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

---

## Authentication Error Codes

| Error Code | HTTP Status | Description |
|-----------|----------|-------------|
| `INVALID_INPUT` | 400 | Missing required fields |
| `VALIDATION_ERROR` | 400 | Invalid field values |
| `INVALID_EMAIL` | 400 | Email format invalid |
| `WEAK_PASSWORD` | 400 | Password less than 8 characters |
| `invalid_credentials` | 401 | Email/password mismatch |
| `SIGNUP_ERROR` | 400 | User already exists |
| `NO_AUTH_HEADER` | 401 | Missing Authorization header |
| `INVALID_AUTH_FORMAT` | 401 | Invalid Bearer token format |
| `INVALID_TOKEN` | 401 | Token expired or invalid |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Authentication Flow

### Step 1: Signup
```
POST /api/auth/signup
→ User created in Supabase Auth
→ Profile created in profiles table
→ Returns session tokens
```

### Step 2: Login
```
POST /api/auth/login
→ Email/password verified
→ Returns session tokens
```

### Step 3: Access Protected Routes
```
POST /api/ai/chat (with Bearer token in Authorization header)
→ Token validated by authMiddleware
→ req.user populated with user info
→ Route handler executes
```

### Step 4: Logout
```
POST /api/auth/logout (with Bearer token)
→ Session invalidated
→ User logged out
```

---

## Profile Data Structure

When user signs up, the following profile data is stored:

```json
{
  "id": "uuid",
  "name": "John Doe",
  "age": 24,
  "gender": "male",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:00:00Z"
}
```

---

## Session Token

The access token is valid for **3600 seconds (1 hour)**.

Include token in Authorization header for all protected routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If token expires, user must login again to get a new token.

---

## Notes

- All requests should include `Content-Type: application/json` header
- Protected routes require `Authorization: Bearer <token>` header
- Email verification is sent to user after signup
- Passwords are never returned in responses
- Timestamps are in ISO 8601 format

---

## Troubleshooting

### Error: "Email address is invalid"
**Cause:** Email authentication is not enabled in your Supabase project

**Solution:**
1. Go to Supabase Console → Authentication → Providers
2. Enable the Email provider
3. Configure email template if needed
4. Restart your backend server

### Error: "Missing required Supabase environment variables"
**Cause:** `.env` file is missing Supabase configuration

**Solution:**
1. Copy `.env.example` to `.env`
2. Add your Supabase URL and keys from your Supabase project settings
3. Restart your backend server with `npm run dev`

### Error: "No Authorization header provided"
**Cause:** Missing Bearer token for protected routes

**Solution:**
1. Complete a login or signup request first
2. Extract the `access_token` from the response
3. Include it in the Authorization header: `Authorization: Bearer <access_token>`

### Error: "Invalid token"
**Cause:** Token has expired (valid for 1 hour) or is malformed

**Solution:**
1. Login again to get a fresh token
2. Ensure the Bearer token format is correct: `Bearer <token>` (with space)
3. Ensure no extra quotes or formatting in the header

