import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    licenseNo: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true
    },
    vehicleType: {
      type: String,
      default: 'Sedan',
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'on_trip', 'inactive'],
      default: 'available'
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isMustChangePassword: {
      type: Boolean,
      default: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139] // Default New Delhi coordinates
      }
    }
  },
  { timestamps: true }
);

driverSchema.index({ location: '2dsphere' });

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
