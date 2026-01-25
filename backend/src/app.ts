import express, { Express, Request, Response, NextFunction } from 'express';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ========================
// Feature Routes
// ========================

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected AI routes (authentication required)
app.use('/api/ai', authMiddleware, aiRoutes);

// ========================
// Health Check Endpoint
// ========================

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
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
// Error Handler Middleware
// ========================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
