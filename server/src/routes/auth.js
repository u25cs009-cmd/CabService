import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validateBody, loginSchema } from '../middleware/validate.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginRateLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    let isMatch = false;

    if (isDbConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      // Fallback admin check against environment variables
      const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@pipippip.com').toLowerCase();
      const envAdminPass = process.env.ADMIN_PASSWORD || '12345';

      if (email.toLowerCase() === envAdminEmail && password === envAdminPass) {
        user = {
          _id: 'admin_fallback_id_123',
          name: 'System Admin',
          email: envAdminEmail,
          role: 'admin'
        };
        isMatch = true;
      }
    }

    if (!user || !isMatch || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
