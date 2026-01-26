import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import { authMiddleware } from './middlewares/auth.middleware';

const app: Express = express();

// ========================
// Global Middleware
// ========================

// Body parser middleware with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout: 45 seconds for Claude API calls
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(45000);
  res.setTimeout(45000);
  next();
});

// Request logging middleware (basic)
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// CORS Configuration - Production-safe, allows only deployed frontend
const allowedOrigins = [
  'https://junior-lawyer-8jvovk2fv-shibadityadeb-adypueduins-projects.vercel.app',
  'https://junior-lawyer-lgga9gjji-shibadityadeb-adypueduins-projects.vercel.app',
  'https://junior-lawyer.vercel.app',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  })
);

// Preflight requests handler
app.options('*', cors());

// ========================
// Feature Routes
// ========================

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected AI routes (authentication required)
app.use('/api/ai', authMiddleware, aiRoutes);

// Protected Document routes (authentication required)
app.use('/api/documents', documentRoutes);

// ========================
// Health Check Endpoint
// ========================

const serverStartTime = Date.now();

app.get('/api/health', (req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'healthy',
    uptime: `${uptime}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ========================
// Root Endpoint
// ========================

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Legal AI Assistant Backend API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/signup',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/ai/chat',
      '/api/ai/voice',
      '/api/ai/document',
    ],
  });
});

// ========================
// 404 Handler
// ========================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ========================
// Error Handler Middleware (MUST be last)
// ========================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    status: err.statusCode || 500,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    error: isDevelopment ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

export default app;
