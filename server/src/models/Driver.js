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
    status: {
      type: String,
      enum: ['available', 'on_trip', 'inactive'],
      default: 'available'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
