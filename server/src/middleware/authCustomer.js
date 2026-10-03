import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to your customer account.'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired customer authentication token.'
      });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Customer account not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session expired or invalid token.'
    });
  }
}

export async function optionalCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Ignore errors for optional customer auth (guest fallback)
  }
  next();
}
