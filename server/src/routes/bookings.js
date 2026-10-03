import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { validateBody, createBookingSchema } from '../middleware/validate.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';
import { getRouteDetails } from '../services/mapsService.js';
import { calculateAdvancedFare } from '../services/fareService.js';
import { sendOwnerBookingNotification } from '../services/emailService.js';

const router = express.Router();

function generateReferenceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'PPP-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
}

const inMemoryBookings = new Map();

// POST /api/bookings (Public - Create Cab Booking)
router.post('/', bookingRateLimiter, validateBody(createBookingSchema), async (req, res, next) => {
  try {
    const data = req.validatedData;
    const isDbConnected = mongoose.connection.readyState === 1;

    let vehicleDoc = null;
    if (isDbConnected) {
      vehicleDoc = await Vehicle.findOne({
        $or: [
          { vehicleId: data.vehicleType },
          { type: data.vehicleType }
        ],
        isActive: true
      });
    }

    const vType = vehicleDoc?.type || vehicleDoc?.vehicleId || data.vehicleType || 'sedan';
    const vName = vehicleDoc?.name || 'Comfort Sedan';

    // Route calculation via mapsService
    let distanceKm = parseFloat(data.distanceKm) || 0;
    let durationMins = 0;
    if (data.pickup && data.drop) {
      const route = await getRouteDetails(data.pickup, data.drop, req.body.pickupCoords, req.body.dropCoords);
      if (distanceKm <= 0) {
        distanceKm = route.distanceKm;
      }
      durationMins = route.durationMins;
    }

    // Authoritative Server-side Advanced Fare Calculation
    const pickupDateObj = new Date(`${data.date}T${data.time}:00`);
    const fareResult = await calculateAdvancedFare({
      vehicleType: vType,
      distanceKm,
      tripType: data.tripType || 'local',
      dateTime: isNaN(pickupDateObj.getTime()) ? new Date() : pickupDateObj,
      packageId: req.body.packageId || '',
      isRoundTrip: req.body.isRoundTrip || false,
      extraHours: req.body.extraHours || 0
    });

    const referenceCode = generateReferenceCode();

    const bookingPayload = {
      referenceCode,
      customerName: data.name,
      phone: data.phone,
      email: data.email || '',
      pickupLocation: data.pickup,
      dropLocation: data.drop,
      pickupCoords: req.body.pickupCoords || null,
      dropCoords: req.body.dropCoords || null,
      pickupDateTime: isNaN(pickupDateObj.getTime()) ? new Date() : pickupDateObj,
      tripType: data.tripType || 'local',
      packageId: req.body.packageId || '',
      isRoundTrip: req.body.isRoundTrip || false,
      vehicleName: vName,
      passengers: data.passengers,
      distanceKm: fareResult.distanceKm,
      durationMins,
      estimatedFare: fareResult.estimatedFare,
      fareBreakdown: fareResult.breakdown,
      status: 'pending',
      notes: data.notes || ''
    };

    if (isDbConnected) {
      const booking = new Booking({
        ...bookingPayload,
        vehicle: vehicleDoc?._id || null
      });
      await booking.save();
    } else {
      inMemoryBookings.set(referenceCode, bookingPayload);
    }

    // Send owner notification email
    sendOwnerBookingNotification(bookingPayload).catch((err) => {
      console.error(`Background email task failed: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: 'Cab booking request created successfully',
      referenceCode,
      data: bookingPayload
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:reference (Public status check)
router.get('/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;
    const refUpper = reference.toUpperCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let booking = null;
    if (isDbConnected) {
      booking = await Booking.findOne({ referenceCode: refUpper });
    } else {
      booking = inMemoryBookings.get(refUpper);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reference code not found'
      });
    }

    res.json({
      success: true,
      data: {
        referenceCode: booking.referenceCode,
        status: booking.status,
        pickupDateTime: booking.pickupDateTime,
        vehicleName: booking.vehicleName,
        estimatedFare: booking.estimatedFare,
        fareBreakdown: booking.fareBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
