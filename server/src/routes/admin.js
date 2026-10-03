import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendCustomerBookingUpdate } from '../services/emailService.js';

const router = express.Router();

// Enforce Admin Authentication Middleware
router.use(requireAdmin);

// Valid status transitions map
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'completed', 'cancelled'],
  assigned: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

// GET /api/admin/stats (Dashboard Overview & Stats)
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

    // Sum monthly revenue for completed bookings
    const revenueAggregation = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$estimatedFare' }
        }
      }
    ]);
    const monthlyRevenue = revenueAggregation[0]?.total || 0;

    // Upcoming 5 trips
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
        upcomingTrips
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/bookings/export (CSV Download)
router.get('/bookings/export', async (req, res, next) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let bookings = [];
    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
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

    // Generate CSV Content
    let csvHeader = 'Reference Code,Customer Name,Phone,Email,Pickup,Drop,Pickup Date/Time,Trip Type,Vehicle,Passengers,Distance (KM),Fare (INR),Status,Driver Name,Driver Phone\n';
    let csvRows = bookings.map((b) => {
      const dateStr = new Date(b.pickupDateTime).toLocaleString().replace(/,/g, '');
      const driverName = b.driver?.name || 'Unassigned';
      const driverPhone = b.driver?.phone || '';

      return `"${b.referenceCode}","${b.customerName}","${b.phone}","${b.email || ''}","${b.pickupLocation.replace(/"/g, '""')}","${b.dropLocation.replace(/"/g, '""')}","${dateStr}","${b.tripType}","${b.vehicleName}",${b.passengers},${b.distanceKm},${b.estimatedFare},"${b.status}","${driverName}","${driverPhone}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pipippip_bookings_${Date.now()}.csv`);
    res.status(200).send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/bookings (Paginated Bookings List)
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let bookings = [];
    let totalCount = 0;

    if (isDbConnected) {
      const query = {};
      if (status) query.status = status;
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

// PATCH /api/admin/bookings/:id (Update status / Assign driver / Notes)
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

    // Validate Status Transition Logic
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
        // Mark driver status as on_trip
        assignedDriver.status = 'on_trip';
        await assignedDriver.save();
      }
    }

    await booking.save();

    // Trigger Customer Email Update Notification asynchronously
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

// VEHICLE MANAGEMENT ENDPOINTS
// GET /api/admin/vehicles
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

// POST /api/admin/vehicles
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

// PATCH /api/admin/vehicles/:id
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
// GET /api/admin/drivers
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

// POST /api/admin/drivers
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

// PATCH /api/admin/drivers/:id
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

export default router;
