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
  console.log('[Seed] Starting database seeding process...');
  const conn = await connectDB();

  if (!conn) {
    console.error('[Seed] MongoDB connection failed. Make sure MongoDB service is active.');
    process.exit(1);
  }

  try {
    // 1. Seed Vehicles
    await Vehicle.deleteMany({});
    const insertedVehicles = await Vehicle.insertMany(initialVehicles);
    console.log(`[Seed] Successfully seeded ${insertedVehicles.length} vehicles.`);

    // 2. Seed Admin User
    await User.deleteMany({ role: 'admin' });
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pipippip.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword123!';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'admin'
    });
    console.log(`[Seed] Created admin account: ${adminUser.email}`);

    // 3. Seed Sample Drivers
    await Driver.deleteMany({});
    const insertedDrivers = await Driver.insertMany(sampleDrivers);
    console.log(`[Seed] Created ${insertedDrivers.length} sample drivers.`);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
    process.exit(1);
  }
}

seedDatabase();
