import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Booking from '../models/Booking.js';

export async function validateAndApplyCoupon({ couponCode, estimatedFare, userId = null }) {
  if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: '' };
  }

  const codeUpper = couponCode.trim().toUpperCase();
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    // Development fallback coupons
    if (codeUpper === 'WELCOME10') {
      const discount = Math.round(estimatedFare * 0.1);
      return {
        isValid: true,
        couponCode: codeUpper,
        discountAmount: discount,
        finalFare: Math.max(0, estimatedFare - discount),
        message: '10% Welcome Discount applied!'
      };
    }
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: 'Invalid or inactive coupon code' };
  }

  const coupon = await Coupon.findOne({ code: codeUpper, isActive: true });
  if (!coupon) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: 'Coupon code not found or inactive' };
  }

  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: 'Coupon is not valid yet' };
  }
  if (coupon.validTo && now > new Date(coupon.validTo)) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: 'Coupon has expired' };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: 'Coupon total usage limit reached' };
  }

  if (coupon.minFare > 0 && estimatedFare < coupon.minFare) {
    return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: `Minimum fare of ₹${coupon.minFare} required for this coupon` };
  }

  // Per user usage check
  if (userId && coupon.perUserLimit > 0) {
    const userUsage = await Booking.countDocuments({ user: userId, couponCode: codeUpper });
    if (userUsage >= coupon.perUserLimit) {
      return { isValid: false, discountAmount: 0, finalFare: estimatedFare, reason: `You have already used this coupon code maximum times` };
    }
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round((estimatedFare * coupon.discountValue) / 100);
    if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'flat') {
    discountAmount = Math.min(coupon.discountValue, estimatedFare);
  }

  const finalFare = Math.max(0, estimatedFare - discountAmount);

  return {
    isValid: true,
    couponCode: codeUpper,
    discountAmount,
    finalFare,
    message: `${coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} Discount Applied!`
  };
}
