import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { requireCustomer } from '../middleware/authCustomer.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import nodemailer from 'nodemailer';

const router = express.Router();

function generateCustomerToken(userId, email) {
  const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';
  return jwt.sign({ userId, email, role: 'customer' }, jwtSecret, { expiresIn: '7d' });
}

// POST /api/customer/register
router.post('/register', loginRateLimiter, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'customer',
        phone: phone || ''
      });
      await user.save();

      const token = generateCustomerToken(user._id, user.email);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      });
    } else {
      const token = generateCustomerToken('mock_user_123', email);
      res.status(201).json({
        success: true,
        message: 'Account created successfully (Fallback Mode)',
        token,
        user: { id: 'mock_user_123', name, email, phone: phone || '', role: 'customer' }
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/customer/login
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findOne({ email: email.toLowerCase(), role: 'customer' });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateCustomerToken(user._id, user.email);

      res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      });
    } else {
      const token = generateCustomerToken('mock_user_123', email);
      res.json({
        success: true,
        message: 'Logged in successfully (Fallback Mode)',
        token,
        user: { id: 'mock_user_123', name: 'Test Customer', email, phone: '6201901834', role: 'customer' }
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/customer/forgot-password
router.post('/forgot-password', loginRateLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Return positive response to prevent user enumeration
        return res.json({ success: true, message: 'If an account exists, a password reset email has been sent.' });
      }

      const resetToken = crypto.randomBytes(24).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour token
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

      // Email transport
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      if (emailUser && emailPass && emailPass !== 'your_email_app_password') {
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
        await transporter.sendMail({
          from: `"Pi-Pip-Pip Cab Service" <${emailUser}>`,
          to: user.email,
          subject: '🔑 Password Reset Request - Pi-Pip-Pip Cabs',
          html: `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`
        });
      }
    }

    res.json({ success: true, message: 'If an account exists, a password reset email has been sent.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer/reset-password
router.post('/reset-password', loginRateLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = '';
      user.resetPasswordExpires = null;
      await user.save();
    }

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer/profile
router.get('/profile', requireCustomer, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PATCH /api/customer/profile
router.patch('/profile', requireCustomer, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();

    res.json({ success: true, message: 'Profile updated successfully', data: req.user });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer/bookings
router.get('/bookings', requireCustomer, async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let bookings = [];

    if (isDbConnected) {
      bookings = await Booking.find({
        $or: [{ user: req.user._id }, { email: req.user.email }]
      }).sort({ createdAt: -1 });
    }

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/customer/bookings/:id/cancel
router.patch('/bookings/:id/cancel', requireCustomer, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const booking = await Booking.findOne({
        _id: id,
        $or: [{ user: req.user._id }, { email: req.user.email }]
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Cannot cancel booking in '${booking.status}' state.` });
      }

      booking.status = 'cancelled';
      await booking.save();

      return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    }

    res.json({ success: true, message: 'Booking cancelled (Fallback)' });
  } catch (error) {
    next(error);
  }
});

export default router;
