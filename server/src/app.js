import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import fareRoutes from './routes/fare.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import customerRoutes from './routes/customer.js';
import couponRoutes from './routes/coupons.js';
import reviewRoutes from './routes/reviews.js';
import driverRoutes from './routes/driver.js';
import companyRoutes from './routes/company.js';
import invoiceRoutes from './routes/invoice.js';
import analyticsRoutes from './routes/analytics.js';
import { startDispatchCron } from './services/dispatchService.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Trust reverse proxy (Render, Railway, Vercel, Nginx, etc.)
app.set('trust proxy', 1);

// Gzip Compression
app.use(compression());

// Structured HTTP Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health' || req.url === '/api/health'
    }
  })
);

// Start background driver dispatch offer expiry checker
startDispatchCron();

// Helmet Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false // Disabled for API server flexibility with Socket.IO & client builds
  })
);

// CORS configuration (strictly limited to CLIENT_URL and custom domains)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [process.env.CLIENT_URL, process.env.CUSTOM_DOMAIN].filter(Boolean);

      if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }

      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // If allowedOrigins is not explicitly configured in dev, permit request or warn
      if (!process.env.CLIENT_URL && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS Policy: Origin ${origin} not allowed`));
    },
    credentials: true
  })
);

// Global General Rate Limiter (1000 requests per 15 minutes window)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

// Body parsing with request body size limit (1MB max) and rawBody capture for Razorpay webhooks
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Endpoint (Validates MongoDB connection status)
app.get(['/health', '/api/health'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  if (!isDbConnected) {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      dbState,
      service: 'Pi-Pip-Pip Cab Service API',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'ok',
    database: 'connected',
    service: 'Pi-Pip-Pip Cab Service API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fare', fareRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin/companies', companyRoutes);
app.use('/api/customer/company-status', companyRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

export default app;
