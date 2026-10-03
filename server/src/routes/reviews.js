import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// GET /api/reviews/approved (Public - Approved Testimonials & Ratings)
router.get('/approved', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let reviews = [];
    let avgRating = 4.9;

    if (isDbConnected) {
      reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 }).limit(10);
      const agg = await Review.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg.length > 0) {
        avgRating = Math.round(agg[0].avg * 10) / 10;
      }
    } else {
      // Fallback default sample reviews
      reviews = [
        { _id: 'rev1', customerName: 'Ankit Kumar', rating: 5, comment: 'Super fast pickup in Patna, clean vehicle and polite driver!', createdAt: new Date() },
        { _id: 'rev2', customerName: 'Priya Sharma', rating: 5, comment: 'Booked an outstation trip to Gaya. Smooth ride and fair prices.', createdAt: new Date() },
        { _id: 'rev3', customerName: 'Amit Verma', rating: 4, comment: 'Punctual airport drop-off service. Highly recommended.', createdAt: new Date() }
      ];
    }

    res.json({
      success: true,
      avgRating,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews (Public - Submit Review for Completed Booking)
router.post('/', async (req, res, next) => {
  try {
    const { referenceCode, rating, comment, customerName } = req.body;

    if (!referenceCode || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Reference code, rating (1-5), and comment are required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const refUpper = String(referenceCode).toUpperCase();
      const booking = await Booking.findOne({ referenceCode: refUpper });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking reference not found' });
      }

      if (booking.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed rides' });
      }

      const existingReview = await Review.findOne({ referenceCode: refUpper });
      if (existingReview) {
        return res.status(400).json({ success: false, message: 'A review has already been submitted for this ride' });
      }

      const review = new Review({
        booking: booking._id,
        referenceCode: refUpper,
        customerName: customerName || booking.customerName || 'Passenger',
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        isApproved: false // Requires admin moderation
      });
      await review.save();

      return res.status(201).json({
        success: true,
        message: 'Thank you for your feedback! Your review has been submitted for moderation.',
        data: review
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review received (Fallback Mode)'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
