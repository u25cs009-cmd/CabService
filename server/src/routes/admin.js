import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import FareRule from '../models/FareRule.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendCustomerBookingUpdate } from '../services/emailService.js';

const router = express.Router();

router.use(requireAdmin);

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'completed', 'cancelled'],
  assigned: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      return res.json({
        success: true,
        data: {
          todayBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          monthlyRevenue: 0,
          upcomingTrips: []
        }
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const todayCount = await Booking.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingCount = await Booking.countDocuments({ status: 'pending' });
    const confirmedCount = await Booking.countDocuments({ status: { $in: ['confirmed', 'assigned'] } });
    const completedCount = await Booking.countDocuments({ status: 'completed' });

    const revenueAggregation = await Booking.aggregate([
      { $match: { status: 'completed', updatedAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$estimatedFare' } } }
    ]);
    const monthlyRevenue = revenueAggregation[0]?.total || 0;

    const paidRevenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalPaidRevenue = paidRevenueAggregation[0]?.total || 0;

    const upcomingTrips = await Booking.find({
      pickupDateTime: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    })
      .sort({ pickupDateTime: 1 })
      .limit(5)
      .populate('driver', 'name phone vehicleNumber');

    res.json({
      success: true,
      data: {
        todayBookings: todayCount,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        completedBookings: completedCount,
        monthlyRevenue,
        totalPaidRevenue,
        upcomingTrips
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/bookings/export
router.get('/bookings/export', async (req, res, next) => {
  try {
    const { status, paymentStatus, search, startDate, endDate } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let bookings = [];
    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (search) {
        query.$or = [
          { referenceCode: new RegExp(search, 'i') },
          { customerName: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ];
      }
      if (startDate || endDate) {
        query.pickupDateTime = {};
        if (startDate) query.pickupDateTime.$gte = new Date(startDate);
        if (endDate) query.pickupDateTime.$lte = new Date(endDate);
      }

      bookings = await Booking.find(query)
        .populate('driver', 'name phone vehicleNumber')
        .sort({ createdAt: -1 });
    }

    let csvHeader = 'Reference Code,Customer Name,Phone,Email,Pickup,Drop,Pickup Date/Time,Trip Type,Vehicle,Passengers,Distance (KM),Fare (INR),Payment Status,Payment Mode,Amount Paid (INR),Status,Driver Name,Driver Phone\n';
    let csvRows = bookings.map((b) => {
      const dateStr = new Date(b.pickupDateTime).toLocaleString().replace(/,/g, '');
      const driverName = b.driver?.name || 'Unassigned';
      const driverPhone = b.driver?.phone || '';

      return `"${b.referenceCode}","${b.customerName}","${b.phone}","${b.email || ''}","${b.pickupLocation.replace(/"/g, '""')}","${b.dropLocation.replace(/"/g, '""')}","${dateStr}","${b.tripType}","${b.vehicleName}",${b.passengers},${b.distanceKm},${b.estimatedFare},"${b.paymentStatus || 'unpaid'}","${b.paymentMode || 'pay_to_driver'}",${b.amountPaid || 0},"${b.status}","${driverName}","${driverPhone}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pipippip_bookings_${Date.now()}.csv`);
    res.status(200).send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, paymentStatus, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let bookings = [];
    let totalCount = 0;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (search) {
        query.$or = [
          { referenceCode: new RegExp(search, 'i') },
          { customerName: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ];
      }
      if (startDate || endDate) {
        query.pickupDateTime = {};
        if (startDate) query.pickupDateTime.$gte = new Date(startDate);
        if (endDate) query.pickupDateTime.$lte = new Date(endDate);
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

// PATCH /api/admin/bookings/:id
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
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (status && status !== booking.status) {
      const allowedNextStatuses = VALID_TRANSITIONS[booking.status] || [];
      if (!allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${booking.status}' to '${status}'. Allowed transitions: [${allowedNextStatuses.join(', ')}]`
        });
      }
      booking.status = status;
    }

    if (notes !== undefined) {
      booking.notes = notes;
    }

    let assignedDriver = null;
    if (driverId) {
      assignedDriver = await Driver.findById(driverId);
      if (assignedDriver) {
        booking.driver = assignedDriver._id;
        booking.status = 'assigned';
        assignedDriver.status = 'on_trip';
        await assignedDriver.save();
      }
    }

    await booking.save();

    sendCustomerBookingUpdate(booking, assignedDriver).catch((err) => {
      console.error(`Background customer email task failed: ${err.message}`);
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// FARE RULES ENDPOINTS
// GET /api/admin/fare-rules
router.get('/fare-rules', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let rules = [];
    if (isDbConnected) {
      rules = await FareRule.find();
    }
    res.json({ success: true, count: rules.length, data: rules });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/fare-rules/:id
router.patch('/fare-rules/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await FareRule.findByIdAndUpdate(id, req.body, { new: true });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Fare rule not found' });
    }
    res.json({ success: true, message: 'Fare rule updated successfully', data: rule });
  } catch (error) {
    next(error);
  }
});

// VEHICLE MANAGEMENT ENDPOINTS
router.get('/vehicles', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let vehicles = [];
    if (isDbConnected) {
      vehicles = await Vehicle.find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
});

router.post('/vehicles', async (req, res, next) => {
  try {
    const { vehicleId, name, type, models, seats, luggageCapacity, ratePerKm, baseFare, badge, description } = req.body;
    const vehicle = new Vehicle({
      vehicleId: vehicleId || type,
      name,
      type,
      models,
      seats,
      luggageCapacity,
      ratePerKm,
      baseFare,
      badge,
      description,
      isActive: true
    });
    await vehicle.save();
    res.status(201).json({ success: true, message: 'Vehicle created successfully', data: vehicle });
  } catch (error) {
    next(error);
  }
});

router.patch('/vehicles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle updated successfully', data: vehicle });
  } catch (error) {
    next(error);
  }
});

// DRIVER MANAGEMENT ENDPOINTS
router.get('/drivers', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let drivers = [];
    if (isDbConnected) {
      drivers = await Driver.find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
});

router.post('/drivers', async (req, res, next) => {
  try {
    const { name, phone, licenseNo, vehicleNumber, status } = req.body;
    const driver = new Driver({
      name,
      phone,
      licenseNo,
      vehicleNumber,
      status: status || 'available'
    });
    await driver.save();
    res.status(201).json({ success: true, message: 'Driver created successfully', data: driver });
  } catch (error) {
    next(error);
  }
});

router.patch('/drivers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByIdAndUpdate(id, req.body, { new: true });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver updated successfully', data: driver });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/bookings/:id/refund (Admin Refund)
router.post('/bookings/:id/refund', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    let booking = null;
    if (isDbConnected) {
      booking = await Booking.findById(id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    const currentPaid = Number(booking.amountPaid) || 0;
    if (currentPaid <= 0) {
      return res.status(400).json({ success: false, message: 'No online payment found on this booking to refund' });
    }

    const refundAmount = amount ? Number(amount) : currentPaid;
    if (refundAmount <= 0 || refundAmount > currentPaid) {
      return res.status(400).json({
        success: false,
        message: `Refund amount must be positive and cannot exceed total amount paid (₹${currentPaid})`
      });
    }

    let refundId = `rfnd_${Date.now()}`;
    
    // Attempt Razorpay API refund if razorpayPaymentId exists
    if (booking.razorpayPaymentId && !booking.razorpayPaymentId.startsWith('pay_mock')) {
      try {
        const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey123';
        const key_secret = process.env.RAZORPAY_KEY_SECRET || 'sample_razorpay_secret_456';
        
        // Dynamically import razorpay
        const { default: Razorpay } = await import('razorpay');
        const instance = new Razorpay({ key_id, key_secret });

        const razorpayRefund = await instance.payments.refund(booking.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100),
          notes: {
            reason: reason || 'Admin initiated refund',
            referenceCode: booking.referenceCode
          }
        });
        if (razorpayRefund?.id) {
          refundId = razorpayRefund.id;
        }
      } catch (err) {
        console.warn(`[Admin Refund] Razorpay refund API warning: ${err.message}. Defaulting to manual refund log.`);
      }
    }

    const isFullRefund = refundAmount >= currentPaid;
    booking.paymentStatus = isFullRefund ? 'refunded' : 'partial';
    if (!booking.refunds) booking.refunds = [];
    
    booking.refunds.push({
      refundId,
      amount: refundAmount,
      status: 'processed',
      reason: reason || 'Admin initiated refund',
      createdAt: new Date()
    });

    await booking.save();

    res.json({
      success: true,
      message: `Refund of ₹${refundAmount} processed successfully`,
      data: {
        bookingId: booking._id,
        referenceCode: booking.referenceCode,
        paymentStatus: booking.paymentStatus,
        refundId,
        refundAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

// ADMIN COUPONS ENDPOINTS
router.get('/coupons', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let coupons = [];
    if (isDbConnected) {
      const { default: Coupon } = await import('../models/Coupon.js');
      coupons = await Coupon.find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.post('/coupons', async (req, res, next) => {
  try {
    const { default: Coupon } = await import('../models/Coupon.js');
    const { code, discountType, discountValue, maxDiscount, minFare, validTo, usageLimit, perUserLimit } = req.body;

    const coupon = new Coupon({
      code: String(code).toUpperCase().trim(),
      discountType: discountType || 'percent',
      discountValue: Number(discountValue) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      minFare: Number(minFare) || 0,
      validTo: validTo ? new Date(validTo) : undefined,
      usageLimit: Number(usageLimit) || 100,
      perUserLimit: Number(perUserLimit) || 1
    });
    await coupon.save();

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    next(error);
  }
});

router.patch('/coupons/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { default: Coupon } = await import('../models/Coupon.js');
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    next(error);
  }
});

// ADMIN REVIEWS ENDPOINTS
router.get('/reviews', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let reviews = [];
    if (isDbConnected) {
      const { default: Review } = await import('../models/Review.js');
      reviews = await Review.find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
});

router.patch('/reviews/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { default: Review } = await import('../models/Review.js');
    const review = await Review.findByIdAndUpdate(id, req.body, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review status updated successfully', data: review });
  } catch (error) {
    next(error);
  }
});

export default router;


