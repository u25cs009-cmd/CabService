import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/envCheck.js';
import { initSocket } from './socket.js';
import { logger } from './utils/logger.js';

// Preserve explicitly set shell/host environment variables
const initialEnv = { ...process.env };

// Load environment variables from .env file if present
dotenv.config();

// Restore explicit environment variables passed by host/shell
Object.keys(initialEnv).forEach((key) => {
  if (initialEnv[key] !== undefined) {
    process.env[key] = initialEnv[key];
  }
});

// Validate startup environment variables (Fails hard in production if missing/weak)
validateEnv();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`[Pi-Pip-Pip API] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful Shutdown Handler
  const shutdown = async (signal) => {
    logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('[Server] HTTP and Socket.IO server closed.');
      try {
        await mongoose.connection.close();
        logger.info('[Server] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        logger.error('[Server] Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

    // Force close after 10s timeout
    setTimeout(() => {
      logger.error('[Server] Forced shutdown timeout reached. Exiting immediately.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason }, '[Server] Unhandled Promise Rejection at:', promise);
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error }, '[Server] Uncaught Exception thrown');
    shutdown('uncaughtException');
  });
}

startServer();
