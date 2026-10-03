import express from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import { calculateServerFare } from '../services/fareService.js';

const router = express.Router();

const defaultVehicles = [
  { vehicleId: 'hatchback', name: 'Compact Hatchback', type: 'hatchback', ratePerKm: 12, baseFare: 300, seats: 4 },
  { vehicleId: 'sedan', name: 'Comfort Sedan', type: 'sedan', ratePerKm: 14, baseFare: 400, seats: 4 },
  { vehicleId: 'suv', name: 'Premium SUV / MUV', type: 'suv', ratePerKm: 18, baseFare: 600, seats: 6 },
  { vehicleId: 'tempo', name: 'Executive Tempo Traveller', type: 'tempo', ratePerKm: 25, baseFare: 1500, seats: 12 }
];

// POST /api/fare/estimate
router.post('/estimate', async (req, res, next) => {
  try {
    const { distanceKm, vehicleId, vehicleType } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    let vehicle = null;
    if (isDbConnected) {
      if (vehicleId) {
        vehicle = await Vehicle.findById(vehicleId);
      }
      if (!vehicle && vehicleType) {
        vehicle = await Vehicle.findOne({
          $or: [{ vehicleId: vehicleType }, { type: vehicleType }],
          isActive: true
        });
      }
    }

    if (!vehicle) {
      vehicle = defaultVehicles.find(
        (v) => v.vehicleId === vehicleType || v.type === vehicleType
      ) || defaultVehicles[0];
    }

    const fareInfo = calculateServerFare(distanceKm, vehicle);

    res.json({
      success: true,
      data: {
        vehicle: {
          id: vehicle._id || vehicle.vehicleId,
          name: vehicle.name,
          type: vehicle.type || vehicle.vehicleId
        },
        ...fareInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
