import express, { Express, Request, Response, NextFunction } from 'express';
import sosRoutes from './routes/sos.routes';
import categoriesRoutes from './routes/categories.routes';
import newsRoutes from './routes/news.routes';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';

const app: Express = express();

// ========================
// Global Middleware
// ========================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (basic)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ========================
// Feature Routes
// ========================

// Public auth routes
app.use('/api/auth', authRoutes);

// Public routes (no authentication required)
app.use('/api/sos', sosRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/news', newsRoutes);

// Protected routes (authentication required)
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
      '/api/sos',
      '/api/categories',
      '/api/news',
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
