import mongoose from 'mongoose';

const dispatchSettingsSchema = new mongoose.Schema(
  {
    searchRadiusKm: {
      type: Number,
      default: 15,
      min: 1
    },
    offerTimeoutSeconds: {
      type: Number,
      default: 30,
      min: 10
    },
    maxDriverRetries: {
      type: Number,
      default: 3,
      min: 1
    },
    autoAssignEnabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.DispatchSettings || mongoose.model('DispatchSettings', dispatchSettingsSchema);
