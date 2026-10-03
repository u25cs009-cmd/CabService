import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

export async function requireDriver(req, res, next) {
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

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user || user.role !== 'driver' || !user.driver) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Driver access required.'
      });
    }

    const driver = await Driver.findById(user.driver);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.'
      });
    }

    req.user = user;
    req.driver = driver;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }
}
