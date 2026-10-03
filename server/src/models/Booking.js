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
    pickupCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    dropCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
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
    packageId: {
      type: String,
      default: ''
    },
    isRoundTrip: {
      type: Boolean,
      default: false
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
    durationMins: {
      type: Number,
      default: 0
    },
    estimatedFare: {
      type: Number,
      required: true,
      min: 0
    },
    fareBreakdown: {
      baseCharge: { type: Number, default: 0 },
      distanceCharge: { type: Number, default: 0 },
      nightCharge: { type: Number, default: 0 },
      airportFee: { type: Number, default: 0 },
      driverAllowance: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalFare: { type: Number, default: 0 }
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    couponCode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
      index: true
    },
    paymentMode: {
      type: String,
      enum: ['online', 'pay_to_driver'],
      default: 'pay_to_driver'
    },
    paymentOption: {
      type: String,
      enum: ['full', 'advance', 'driver'],
      default: 'driver'
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    advancePercentage: {
      type: Number,
      default: 20
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    refunds: [
      {
        refundId: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        status: { type: String, default: 'processed' },
        reason: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
