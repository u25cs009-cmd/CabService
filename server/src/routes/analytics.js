import express from 'express';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Company from '../models/Company.js';
import Review from '../models/Review.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAdmin);

/**
 * GET /api/admin/analytics
 */
router.get('/', async (req, res, next) => {
  try {
    const { period = '30d', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate || endDate) {
      dateFilter.pickupDateTime = {};
      if (startDate) dateFilter.pickupDateTime.$gte = new Date(startDate);
      if (endDate) dateFilter.pickupDateTime.$lte = new Date(endDate);
    } else if (period === '7d') {
      dateFilter.pickupDateTime = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === '30d') {
      dateFilter.pickupDateTime = { $gte: new Date(now.setDate(now.getDate() - 30)) };
    }

    // 1. Overall Summary Aggregation
    const summaryAgg = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$estimatedFare', 0] }
          },
          totalDistance: { $sum: '$distanceKm' },
          avgFare: { $avg: '$estimatedFare' }
        }
      }
    ]);

    const summary = summaryAgg[0] || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      totalDistance: 0,
      avgFare: 0
    };

    // 2. Bookings & Revenue Over Time (Daily)
    const bookingsOverTime = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$estimatedFare', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Peak Pickup Hours
    const busiestHours = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$pickupDateTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Trip Type Mix
    const tripTypeMix = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$tripType',
          count: { $sum: 1 },
          revenue: { $sum: '$estimatedFare' }
        }
      }
    ]);

    // 5. Payment Mode Breakdown
    const paymentMix = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          revenue: { $sum: '$estimatedFare' }
        }
      }
    ]);

    // 6. Popular Top Routes
    const topRoutes = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { pickup: '$pickupLocation', drop: '$dropLocation' },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$estimatedFare' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 7. Driver Performance Roster
    const driverPerformance = await Booking.aggregate([
      { $match: { ...dateFilter, status: 'completed', driver: { $ne: null } } },
      {
        $group: {
          _id: '$driver',
          tripsCompleted: { $sum: 1 },
          totalEarnings: { $sum: '$estimatedFare' },
          avgDistance: { $avg: '$distanceKm' }
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: '_id',
          foreignField: '_id',
          as: 'driverInfo'
        }
      },
      { $unwind: '$driverInfo' },
      {
        $project: {
          driverId: '$_id',
          name: '$driverInfo.name',
          vehicleNumber: '$driverInfo.vehicleNumber',
          vehicleType: '$driverInfo.vehicleType',
          tripsCompleted: 1,
          totalEarnings: 1,
          avgDistance: 1
        }
      },
      { $sort: { tripsCompleted: -1 } }
    ]);

    // 8. Top Corporate Spenders
    const topCorporateAccounts = await Booking.aggregate([
      { $match: { ...dateFilter, isCorporateBooking: true, company: { $ne: null } } },
      {
        $group: {
          _id: '$company',
          totalTrips: { $sum: 1 },
          totalSpend: { $sum: '$estimatedFare' }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' },
      {
        $project: {
          companyName: '$companyInfo.name',
          gstNumber: '$companyInfo.gstNumber',
          totalTrips: 1,
          totalSpend: 1
        }
      },
      { $sort: { totalSpend: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          avgFare: Math.round(summary.avgFare || 0),
          avgDistance: Math.round((summary.totalDistance || 0) / (summary.totalBookings || 1))
        },
        bookingsOverTime,
        busiestHours,
        tripTypeMix,
        paymentMix,
        topRoutes,
        driverPerformance,
        topCorporateAccounts
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
