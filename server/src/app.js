import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import fareRoutes from './routes/fare.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (limited to CLIENT_URL)
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy: Origin not allowed'));
      }
    },
    credentials: true
  })
);

// Body parsing with rawBody capture for webhook HMAC signatures
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// Health Check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
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
