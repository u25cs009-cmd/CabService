import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import { requireDriver } from '../middleware/authDriver.js';
import { findAndOfferNextDriver } from '../services/dispatchService.js';

const router = express.Router();

/**
 * POST /api/driver/login
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // email or phone
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide login identifier and password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: identifier.trim() }],
      role: 'driver'
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or non-driver account.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const driver = await Driver.findById(user.driver);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver record not associated with this account.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';
    const token = jwt.sign(
      { userId: user._id, role: 'driver', driverId: driver._id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        licenseNo: driver.licenseNo,
        vehicleNumber: driver.vehicleNumber,
        vehicleType: driver.vehicleType,
        status: driver.status,
        isOnline: driver.isOnline,
        isMustChangePassword: driver.isMustChangePassword,
        location: driver.location
      }
    });
  } catch (error) {
    console.error('Driver login error:', error);
    res.status(500).json({ success: false, message: 'Server error during driver login.' });
  }
});

/**
 * POST /api/driver/change-password
 */
router.post('/change-password', requireDriver, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    req.user.passwordHash = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    req.driver.isMustChangePassword = false;
    await req.driver.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Driver change password error:', error);
    res.status(500).json({ success: false, message: 'Error changing password.' });
  }
});

/**
 * GET /api/driver/me
 */
router.get('/me', requireDriver, async (req, res) => {
  res.json({
    success: true,
    driver: {
      _id: req.driver._id,
      name: req.driver.name,
      phone: req.driver.phone,
      licenseNo: req.driver.licenseNo,
      vehicleNumber: req.driver.vehicleNumber,
      vehicleType: req.driver.vehicleType,
      status: req.driver.status,
      isOnline: req.driver.isOnline,
      isMustChangePassword: req.driver.isMustChangePassword,
      location: req.driver.location
    }
  });
});

/**
 * PUT /api/driver/toggle-online
 */
router.put('/toggle-online', requireDriver, async (req, res) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isOnline boolean is required.' });
    }

    req.driver.isOnline = isOnline;
    if (req.driver.status !== 'on_trip') {
      req.driver.status = isOnline ? 'available' : 'inactive';
    }

    await req.driver.save();
    res.json({ success: true, driver: req.driver });
  } catch (error) {
    console.error('Error toggling online status:', error);
    res.status(500).json({ success: false, message: 'Failed to update online status.' });
  }
});

/**
 * PUT /api/driver/location
 */
router.put('/location', requireDriver, async (req, res) => {
  try {
    const { lng, lat } = req.body;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({ success: false, message: 'Valid lng and lat numeric coordinates required.' });
    }

    req.driver.location = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    await req.driver.save();

    res.json({ success: true, location: req.driver.location });
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ success: false, message: 'Failed to update location.' });
  }
});

/**
 * GET /api/driver/offers
 */
router.get('/offers', requireDriver, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      status: 'offered',
      'assignedDriverOffer.driver': req.driver._id,
      'assignedDriverOffer.offerExpiresAt': { $gt: new Date() }
    });

    if (!booking) {
      return res.json({ success: true, offer: null });
    }

    const expiresAt = new Date(booking.assignedDriverOffer.offerExpiresAt).getTime();
    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

    // Mask customer name (First name only)
    const firstName = booking.customerName.split(' ')[0] || 'Customer';

    res.json({
      success: true,
      offer: {
        bookingId: booking._id,
        referenceCode: booking.referenceCode,
        customerFirstName: firstName,
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.dropLocation,
        pickupDateTime: booking.pickupDateTime,
        distanceKm: booking.distanceKm,
        estimatedFare: booking.estimatedFare,
        tripType: booking.tripType,
        secondsRemaining,
        offerExpiresAt: booking.assignedDriverOffer.offerExpiresAt
      }
    });
  } catch (error) {
    console.error('Error fetching driver offers:', error);
    res.status(500).json({ success: false, message: 'Error fetching trip offers.' });
  }
});

/**
 * POST /api/driver/offers/:bookingId/respond
 */
router.post('/offers/:bookingId/respond', requireDriver, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (
      booking.status !== 'offered' ||
      !booking.assignedDriverOffer?.driver?.equals(req.driver._id)
    ) {
      return res.status(400).json({ success: false, message: 'This offer is no longer valid or assigned to another driver.' });
    }

    if (action === 'decline') {
      booking.assignedDriverOffer.declinedDrivers.push(req.driver._id);
      booking.assignedDriverOffer.driver = null;
      booking.assignedDriverOffer.offerExpiresAt = null;
      booking.statusHistory.push({
        status: 'offered',
        changedBy: `driver:${req.driver.name}`,
        note: 'Driver declined trip offer.'
      });
      await booking.save();

      // Dispatch to next candidate driver asynchronously
      findAndOfferNextDriver(booking._id);

      return res.json({ success: true, message: 'Offer declined successfully.' });
    }

    if (action === 'accept') {
      // Confirm offer has not expired
      if (new Date() > new Date(booking.assignedDriverOffer.offerExpiresAt)) {
        return res.status(400).json({ success: false, message: 'Trip offer has expired.' });
      }

      booking.status = 'assigned';
      booking.driver = req.driver._id;
      booking.assignedDriverOffer.driver = req.driver._id;
      booking.statusHistory.push({
        status: 'assigned',
        changedBy: `driver:${req.driver.name}`,
        note: `Driver ${req.driver.name} accepted trip.`
      });

      req.driver.status = 'on_trip';

      await booking.save();
      await req.driver.save();

      return res.json({
        success: true,
        message: 'Trip accepted successfully!',
        booking,
        otpCode: booking.otpCode
      });
    }

    res.status(400).json({ success: false, message: 'Invalid action.' });
  } catch (error) {
    console.error('Error responding to offer:', error);
    res.status(500).json({ success: false, message: 'Failed to process offer response.' });
  }
});

/**
 * GET /api/driver/current-trip
 */
router.get('/current-trip', requireDriver, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      driver: req.driver._id,
      status: { $in: ['assigned', 'on_the_way', 'arrived', 'in_progress'] }
    });

    res.json({ success: true, booking: booking || null });
  } catch (error) {
    console.error('Error fetching current trip:', error);
    res.status(500).json({ success: false, message: 'Error loading current trip.' });
  }
});

/**
 * PUT /api/driver/trip-status/:bookingId
 */
router.put('/trip-status/:bookingId', requireDriver, async (req, res) => {
  try {
    const { status, otpCode } = req.body;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      driver: req.driver._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Active trip not found for driver.' });
    }

    // Strict state machine validation:
    // assigned -> on_the_way
    // on_the_way -> arrived
    // arrived -> in_progress (requires OTP verification)
    // in_progress -> completed
    const validTransitions = {
      assigned: ['on_the_way'],
      on_the_way: ['arrived'],
      arrived: ['in_progress'],
      in_progress: ['completed']
    };

    const allowedNextStatuses = validTransitions[booking.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid trip status transition from '${booking.status}' to '${status}'.`
      });
    }

    if (status === 'in_progress') {
      if (!otpCode || otpCode.trim() !== booking.otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 4-digit OTP provided. Ask customer for the trip start code.'
        });
      }
    }

    if (status === 'completed') {
      req.driver.status = 'available';
      await req.driver.save();

      // If customer was paying driver, mark payment as complete
      if (booking.paymentMode === 'pay_to_driver' && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
        booking.amountPaid = booking.estimatedFare;
      }
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      changedBy: `driver:${req.driver.name}`,
      note: `Trip status updated to ${status}`
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ success: false, message: 'Failed to update trip status.' });
  }
});

/**
 * GET /api/driver/history
 */
router.get('/history', requireDriver, async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateQuery = {};
    const now = new Date();

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfDay } };
    } else if (period === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      dateQuery = { createdAt: { $gte: startOfWeek } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateQuery = { createdAt: { $gte: startOfMonth } };
    }

    const bookings = await Booking.find({
      driver: req.driver._id,
      status: 'completed',
      ...dateQuery
    }).sort({ updatedAt: -1 });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);

    res.json({
      success: true,
      summary: {
        totalTrips: bookings.length,
        totalEarnings
      },
      trips: bookings
    });
  } catch (error) {
    console.error('Error fetching driver history:', error);
    res.status(500).json({ success: false, message: 'Failed to load driver trip history.' });
  }
});

export default router;
