import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    channel: {
      type: String,
      enum: ['email', 'whatsapp', 'sms', 'push', 'in_app'],
      required: true
    },
    recipient: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped', 'fallback'],
      default: 'sent',
      index: true
    },
    errorMessage: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema);
