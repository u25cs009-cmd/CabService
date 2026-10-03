import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error({
    err: {
      message: err.message,
      name: err.name,
      stack: err.stack
    },
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  }, `[Error] ${err.name || 'API Error'}: ${err.message}`);

  const rawStatusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const statusCode = err.statusCode || rawStatusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

