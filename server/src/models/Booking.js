import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true
    },
    dropLocation: {
      type: String,
      required: true,
      trim: true
    },
    pickupDateTime: {
      type: Date,
      required: true
    },
    tripType: {
      type: String,
      enum: ['local', 'outstation', 'airport', 'hourly'],
      default: 'local'
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    vehicleName: {
      type: String,
      default: ''
    },
    passengers: {
      type: Number,
      required: true,
      min: 1
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    estimatedFare: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
