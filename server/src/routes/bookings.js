import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { validateBody, createBookingSchema } from '../middleware/validate.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';
import { calculateServerFare } from '../services/fareService.js';
import { sendOwnerBookingNotification } from '../services/emailService.js';

const router = express.Router();

const defaultVehicles = [
  { vehicleId: 'hatchback', name: 'Compact Hatchback', type: 'hatchback', ratePerKm: 12, baseFare: 300, seats: 4 },
  { vehicleId: 'sedan', name: 'Comfort Sedan', type: 'sedan', ratePerKm: 14, baseFare: 400, seats: 4 },
  { vehicleId: 'suv', name: 'Premium SUV / MUV', type: 'suv', ratePerKm: 18, baseFare: 600, seats: 6 },
  { vehicleId: 'tempo', name: 'Executive Tempo Traveller', type: 'tempo', ratePerKm: 25, baseFare: 1500, seats: 12 }
];

function generateReferenceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'PPP-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
}

// Memory cache for fallback bookings when DB is offline
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

    if (!vehicleDoc) {
      vehicleDoc = defaultVehicles.find(
        (v) => v.vehicleId === data.vehicleType || v.type === data.vehicleType
      ) || defaultVehicles[1];
    }

    // Capacity validation check
    const maxSeats = vehicleDoc.seats || vehicleDoc.passengerCapacity || 4;
    if (data.passengers > maxSeats) {
      return res.status(400).json({
        success: false,
        message: `Selected vehicle capacity is maximum ${maxSeats} passengers`
      });
    }

    // Authoritative server-side fare calculation
    const fareInfo = calculateServerFare(data.distanceKm, vehicleDoc);
    const referenceCode = generateReferenceCode();
    const pickupDateObj = new Date(`${data.date}T${data.time}:00`);

    const bookingPayload = {
      referenceCode,
      customerName: data.name,
      phone: data.phone,
      email: data.email || '',
      pickupLocation: data.pickup,
      dropLocation: data.drop,
      pickupDateTime: isNaN(pickupDateObj.getTime()) ? new Date() : pickupDateObj,
      tripType: data.tripType || 'local',
      vehicleName: vehicleDoc.name,
      passengers: data.passengers,
      distanceKm: fareInfo.distanceKm,
      estimatedFare: fareInfo.estimatedFare,
      status: 'pending',
      notes: data.notes || ''
    };

    if (isDbConnected) {
      const booking = new Booking({
        ...bookingPayload,
        vehicle: vehicleDoc._id || null
      });
      await booking.save();
    } else {
      inMemoryBookings.set(referenceCode, bookingPayload);
    }

    // Dispatch owner email notification asynchronously
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

// GET /api/bookings/:reference (Public status check by reference code)
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
        estimatedFare: booking.estimatedFare
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
