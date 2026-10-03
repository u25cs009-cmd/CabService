import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

dotenv.config();

const initialVehicles = [
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
    description: 'Ideal for solo travelers or small families navigating city traffic with light luggage.'
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
    description: 'Extra legroom and trunk space for comfortable highway rides and airport drops.'
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
    description: 'Spacious 6-7 seater vehicle designed for group family trips with extra luggage.'
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
    description: 'Maximum comfort for wedding parties, corporate events, and large tourist groups.'
  }
];

const sampleDrivers = [
  {
    name: 'Ramesh Kumar',
    phone: '9876500001',
    licenseNo: 'DL-2023-987654',
    vehicleNumber: 'KA-01-AB-1234',
    status: 'available'
  },
  {
    name: 'Suresh Yadav',
    phone: '9876500002',
    licenseNo: 'DL-2022-123456',
    vehicleNumber: 'KA-05-XY-9876',
    status: 'available'
  }
];

async function seedDatabase() {
  console.log('[Seed] Starting production-safe database initialization...');
  const conn = await connectDB();

  if (!conn) {
    console.error('[Seed] MongoDB connection failed. Exiting.');
    process.exit(1);
  }

  try {
    // 1. Seed Vehicles without deleting existing custom vehicles
    let vehiclesAdded = 0;
    for (const v of initialVehicles) {
      const res = await Vehicle.updateOne(
        { vehicleId: v.vehicleId },
        { $setOnInsert: v },
        { upsert: true }
      );
      if (res.upsertedCount > 0) vehiclesAdded++;
    }
    console.log(`[Seed] Vehicles: ${vehiclesAdded} initial vehicle(s) inserted. Existing vehicles preserved.`);

    // 2. Safe Admin Creation (reads ONLY from env, never prints password, never overwrites existing admin)
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists (${existingAdmin.email}). Skipping admin creation.`);
    } else {
      if (!adminEmail || !adminPassword) {
        console.warn('[Seed] ADMIN_EMAIL or ADMIN_PASSWORD env vars not set. Skipping initial admin creation.');
      } else {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        const newAdmin = await User.create({
          name: 'System Admin',
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin'
        });
        console.log(`[Seed] Successfully created initial admin account: ${newAdmin.email}`);
      }
    }

    // 3. Seed Sample Drivers without overwriting existing driver records
    let driversAdded = 0;
    for (const d of sampleDrivers) {
      const res = await Driver.updateOne(
        { licenseNo: d.licenseNo },
        { $setOnInsert: d },
        { upsert: true }
      );
      if (res.upsertedCount > 0) driversAdded++;
    }
    console.log(`[Seed] Drivers: ${driversAdded} sample driver(s) inserted. Existing drivers preserved.`);

    console.log('[Seed] Database initialization finished safely.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
    process.exit(1);
  }
}

seedDatabase();
