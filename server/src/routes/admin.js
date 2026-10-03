import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin authentication middleware to all admin routes
router.use(requireAdmin);

// GET /api/admin/bookings (Protected Admin Only)
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let bookings = [];
    let totalCount = 0;

    if (isDbConnected) {
      const query = {};
      if (status) {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { referenceCode: new RegExp(search, 'i') },
          { customerName: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      totalCount = await Booking.countDocuments(query);
      bookings = await Booking.find(query)
        .populate('driver', 'name phone vehicleNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10));
    }

    res.json({
      success: true,
      count: bookings.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: parseInt(page, 10),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/bookings/:id (Protected Admin Only - Update Status / Assign Driver)
router.patch('/bookings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, driverId, notes } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      return res.json({
        success: true,
        message: 'Booking status update acknowledged (Fallback Mode)',
        data: { id, status, driverId, notes }
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found'
      });
    }

    if (status) {
      booking.status = status;
    }
    if (notes) {
      booking.notes = notes;
    }

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (driver) {
        booking.driver = driver._id;
        booking.status = 'assigned';
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

export default router;
