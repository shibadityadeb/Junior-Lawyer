# Legal AI Assistant 🤖⚖️

A production-grade AI-powered legal information assistant that provides personalized legal guidance using advanced AI. Built with React, TypeScript, and Anthropic's Claude AI, this application helps users understand their legal situations through intelligent conversation and document analysis.

## 🌟 Features

### Core Capabilities
- **🤖 AI-Powered Legal Consultation** - Intelligent legal guidance using Anthropic's Claude AI with a lawyer-like approach
- **📄 Document Analysis** - Upload and analyze legal documents (PDF, DOCX, images with OCR)
- **💬 Context-Aware Conversations** - Maintains conversation history for personalized guidance
- **📊 Flowchart Visualization** - Generates visual flowcharts for legal pathways using Mermaid
- **🎤 Speech-to-Text** - Voice input for hands-free interaction
- **🔊 Text-to-Speech** - Audio playback of AI responses
- **🌐 Multi-Language Support** - Legal guidance in multiple languages
- **📋 Document Templates** - Pre-built templates for various legal documents

### User Experience
- **Modern, Responsive Design** - Mobile-first approach with Tailwind CSS
- **Secure Authentication** - Powered by Clerk for robust user management
- **Dark/Light Mode** - User-preferred theme support
- **Accessibility** - WCAG-compliant for inclusive access
- **Real-time Updates** - Instant AI responses with streaming support

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router v6
- **State Management**: React Context API
- **Authentication**: Clerk React
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Visualization**: Mermaid (flowcharts)
- **Document Processing**: Mammoth (DOCX)

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **AI Provider**: Anthropic Claude API
- **Authentication**: Clerk SDK
- **Database**: Supabase (PostgreSQL)
- **File Upload**: Multer
- **Document Processing**: 
  - PDF: pdf-parse
  - DOCX: Mammoth
  - OCR: Tesseract.js
- **Validation**: Zod
- **Security**: CORS, Rate Limiting

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
- **Clerk Account** - [Sign up here](https://clerk.com/)
- **Supabase Project** - [Create one here](https://supabase.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/legal-ai-assistant.git
cd legal-ai-assistant
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Set up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

Start the backend server:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The backend will be running at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 📁 Project Structure

```
legal-ai-assistant/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   │   ├── ai.controller.ts
│   │   │   └── auth.controller.ts
│   │   ├── middlewares/       # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   └── rateLimit.ts
│   │   ├── routes/            # API routes
│   │   │   ├── ai.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── document.routes.ts
│   │   ├── services/          # Business logic
│   │   │   ├── anthropic.service.ts
│   │   │   ├── document.service.ts
│   │   │   └── profile.service.ts
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── app.ts             # Express app setup
│   │   └── index.ts           # Entry point
│   ├── docs/                  # API documentation
│   └── package.json
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── FlowchartRenderer.tsx
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AIZonePage.tsx
│   │   │   ├── Templates.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Contact.tsx
│   │   ├── context/           # React Context
│   │   │   └── ChatContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useSpeechToText.ts
│   │   │   └── useTextToSpeech.ts
│   │   ├── services/          # API services
│   │   │   └── api.ts
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   │   ├── Finance_Agreements/
│   │   ├── NDA/
│   │   ├── policy_and_compliance/
│   │   └── ...
│   └── package.json
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account with profile
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### AI Assistant

- `POST /api/ai/chat` - Send message to AI assistant
- `POST /api/ai/analyze-document` - Upload and analyze documents
- `GET /api/ai/conversation-history` - Retrieve chat history

For detailed API documentation, see [API_ENDPOINTS.md](backend/docs/API_ENDPOINTS.md)

## 🎯 Usage

### Basic Chat Interaction

1. **Sign up** or **log in** to your account
2. Navigate to the **AI Zone** page
3. Type your legal question in the chat input
4. The AI will ask clarifying questions if needed
5. Receive personalized legal guidance with flowcharts

### Document Upload & Analysis

1. Click the document upload icon
2. Select a PDF, DOCX, or image file
3. The AI will analyze the document content
4. Ask questions about the document
5. Get relevant insights and guidance

### Voice Interaction

1. Click the microphone icon to start recording
2. Speak your question
3. The system converts speech to text automatically
4. Listen to AI responses with text-to-speech

## 🛡️ Security Features

- **Authentication & Authorization** - Clerk-based secure authentication
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configured for secure cross-origin requests
- **Input Validation** - Zod schema validation on all inputs
- **Environment Variables** - Sensitive data stored securely
- **Row Level Security** - Supabase RLS for data protection

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend
npm run lint

# Frontend tests
cd frontend
npm run lint
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Code Quality

Both frontend and backend use:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (recommended)

## 🚀 Deployment

### Backend Deployment

The backend can be deployed to:
- **Railway**
- **Render**
- **Heroku**
- **AWS EC2/ECS**
- **DigitalOcean**

Make sure to set all environment variables in your deployment platform.

### Frontend Deployment

The frontend is optimized for deployment to:
- **Vercel** (recommended - see [vercel.json](frontend/vercel.json))
- **Netlify**
- **AWS Amplify**
- **Cloudflare Pages**

Build command: `npm run build`
Output directory: `dist`

## 🔧 Configuration

### Environment Variables

#### Backend
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `CLERK_SECRET_KEY` - Clerk secret key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `FRONTEND_URL` - Frontend URL for CORS

#### Frontend
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass before submitting PR

## 🐛 Known Issues & Limitations

- Voice input currently only works in Chrome/Edge browsers
- Large documents (>10MB) may take longer to process
- OCR accuracy depends on image quality

## 📞 Support

For support, please:
- Open an issue on GitHub
- Contact the maintainers
- Check the [FAQ page](frontend/src/pages/FAQ.tsx)

## 🙏 Acknowledgments

- **Anthropic** for providing the Claude AI API
- **Clerk** for authentication services
- **Supabase** for database and auth infrastructure
- **shadcn/ui** for beautiful UI components
- **Vercel** for hosting and deployment tools

## 📊 Project Stats

- **Languages**: TypeScript, JavaScript
- **Frameworks**: React, Express
- **Total Dependencies**: 40+
- **Code Quality**: ESLint enabled
- **Type Safety**: 100% TypeScript

---

**Built with ❤️ for accessible legal information**

*Disclaimer: This is an AI-powered legal information assistant and should not replace professional legal advice. Always consult with a qualified attorney for specific legal matters.*
