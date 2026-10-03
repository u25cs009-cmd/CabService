import express from 'express';
import Coupon from '../models/Coupon.js';
import { validateAndApplyCoupon } from '../services/couponService.js';
import { requireAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/coupons/validate (Public - Check coupon code validity)
router.post('/validate', async (req, res, next) => {
  try {
    const { couponCode, estimatedFare } = req.body;
    const fare = Number(estimatedFare) || 0;

    const result = await validateAndApplyCoupon({ couponCode, estimatedFare: fare });
    res.json({
      success: result.isValid,
      message: result.message || result.reason,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
