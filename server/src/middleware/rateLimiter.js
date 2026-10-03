import rateLimit from 'express-rate-limit';

// Rate limiter for public booking creations (max 10 requests per 15 min per IP)
export const bookingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking requests from this IP. Please try again in 15 minutes.'
  }
});

// Rate limiter for login attempts (max 5 requests per 15 min per IP)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  }
});
