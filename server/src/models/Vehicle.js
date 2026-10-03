import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['hatchback', 'sedan', 'suv', 'tempo']
    },
    models: {
      type: String,
      default: ''
    },
    seats: {
      type: Number,
      required: true,
      min: 1
    },
    luggageCapacity: {
      type: Number,
      required: true,
      min: 0
    },
    ratePerKm: {
      type: Number,
      required: true,
      min: 0
    },
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },
    imageUrl: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
