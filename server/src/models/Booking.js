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
      enum: ['pending', 'confirmed', 'offered', 'assigned', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled', 'needs_manual_assignment'],
      default: 'pending',
      index: true
    },
    otpCode: {
      type: String,
      default: ''
    },
    assignedDriverOffer: {
      driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
      },
      offerExpiresAt: {
        type: Date,
        default: null
      },
      declinedDrivers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Driver'
        }
      ]
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: String, default: 'system' }, // system, admin, driver, customer
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ],
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
    isCorporateBooking: {
      type: Boolean,
      default: false
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    costCenter: {
      type: String,
      default: '',
      trim: true
    },
    employeeId: {
      type: String,
      default: '',
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
      index: true
    },
    paymentMode: {
      type: String,
      enum: ['online', 'pay_to_driver', 'pay_corporate'],
      default: 'pay_to_driver'
    },
    paymentOption: {
      type: String,
      enum: ['full', 'advance', 'driver', 'corporate'],
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
    trackingToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    routeTrail: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        heading: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
      }
    ],
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

bookingSchema.index({ pickupDateTime: -1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ company: 1, createdAt: -1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
