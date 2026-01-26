import dotenv from 'dotenv';

// Load environment variables from .env file FIRST, before any other imports
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   Legal AI Assistant Backend Server Started  ║
╠══════════════════════════════════════════════╣
║ Server running on port: ${PORT}                    ║
║ Environment: ${process.env.NODE_ENV || 'production'}                     ║
║ Health Check: GET /api/health                ║
╚══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
