import dotenv from 'dotenv';
import app from './app';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   Legal AI Assistant Backend Server Started  ║
╠══════════════════════════════════════════════╣
║ Server running at: http://localhost:${PORT}         ║
║ Environment: ${process.env.NODE_ENV || 'development'}                     ║
║ Health Check: http://localhost:${PORT}/api/health  ║
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
