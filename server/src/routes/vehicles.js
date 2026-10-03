import express from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

const defaultVehicles = [
  {
    vehicleId: 'hatchback',
    name: 'Compact Hatchback',
    type: 'hatchback',
    models: 'Maruti Swift, WagonR, Hyundai i10 or similar',
    seats: 4,
    luggageCapacity: 2,
    ratePerKm: 12,
    baseFare: 300,
    badge: 'Most Popular for City',
    description: 'Ideal for solo travelers or small families navigating city traffic with light luggage.',
    isActive: true
  },
  {
    vehicleId: 'sedan',
    name: 'Comfort Sedan',
    type: 'sedan',
    models: 'Maruti Dzire, Toyota Etios, Honda Amaze or similar',
    seats: 4,
    luggageCapacity: 3,
    ratePerKm: 14,
    baseFare: 400,
    badge: 'Best Value Outstation',
    description: 'Extra legroom and trunk space for comfortable highway rides and airport drops.',
    isActive: true
  },
  {
    vehicleId: 'suv',
    name: 'Premium SUV / MUV',
    type: 'suv',
    models: 'Toyota Innova, Maruti Ertiga, Mahindra XUV or similar',
    seats: 6,
    luggageCapacity: 5,
    ratePerKm: 18,
    baseFare: 600,
    badge: 'Family & Group Choice',
    description: 'Spacious 6-7 seater vehicle designed for group family trips with extra luggage.',
    isActive: true
  },
  {
    vehicleId: 'tempo',
    name: 'Executive Tempo Traveller',
    type: 'tempo',
    models: 'Force Traveller (12 Seater)',
    seats: 12,
    luggageCapacity: 8,
    ratePerKm: 25,
    baseFare: 1500,
    badge: 'Large Groups & Tours',
    description: 'Maximum comfort for wedding parties, corporate events, and large tourist groups.',
    isActive: true
  }
];

// GET /api/vehicles (Public active vehicles)
router.get('/', async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let vehicles = [];

    if (isDbConnected) {
      vehicles = await Vehicle.find({ isActive: true }).sort({ ratePerKm: 1 });
    }

    if (!vehicles || vehicles.length === 0) {
      vehicles = defaultVehicles;
    }

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.json({
      success: true,
      count: defaultVehicles.length,
      data: defaultVehicles
    });
  }
});

export default router;
