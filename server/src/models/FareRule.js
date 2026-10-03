import mongoose from 'mongoose';

const localPackageSchema = new mongoose.Schema({
  packageId: { type: String, required: true },
  name: { type: String, required: true },
  hours: { type: Number, required: true },
  km: { type: Number, required: true },
  price: { type: Number, required: true },
  extraKmRate: { type: Number, required: true },
  extraHourRate: { type: Number, required: true }
});

const fareRuleSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      required: true,
      unique: true,
      enum: ['hatchback', 'sedan', 'suv', 'tempo']
    },
    vehicleName: {
      type: String,
      required: true
    },
    baseFare: {
      type: Number,
      required: true,
      default: 400
    },
    ratePerKm: {
      type: Number,
      required: true,
      default: 14
    },
    minFare: {
      type: Number,
      required: true,
      default: 400
    },
    nightCharge: {
      enabled: { type: Boolean, default: true },
      startHour: { type: Number, default: 22 }, // 10 PM
      endHour: { type: Number, default: 6 },     // 6 AM
      type: { type: String, enum: ['flat', 'percent'], default: 'percent' },
      amount: { type: Number, default: 15 }       // 15% or flat amount
    },
    waitingChargePerHour: {
      type: Number,
      default: 150
    },
    gstPercent: {
      type: Number,
      default: 5
    },
    localPackages: [localPackageSchema],
    outstation: {
      dailyMinKm: { type: Number, default: 250 },
      driverAllowancePerNight: { type: Number, default: 300 },
      roundTripDiscountPercent: { type: Number, default: 5 }
    },
    airport: {
      fixedAirportFee: { type: Number, default: 200 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.FareRule || mongoose.model('FareRule', fareRuleSchema);
