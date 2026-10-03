import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';

    const decoded = jwt.verify(token, jwtSecret);
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    if (isDbConnected) {
      user = await User.findById(decoded.userId).select('-passwordHash');
    }

    if (!user && decoded.role === 'admin') {
      user = {
        _id: decoded.userId,
        name: 'System Admin',
        email: decoded.email,
        role: 'admin'
      };
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }
}
