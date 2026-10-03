import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    trips: [
      {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
        referenceCode: { type: String, required: true },
        pickupDateTime: { type: Date, required: true },
        customerName: { type: String, default: '' },
        costCenter: { type: String, default: '' },
        employeeId: { type: String, default: '' },
        fare: { type: Number, required: true }
      }
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    gstPercentage: {
      type: Number,
      default: 5
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft',
      index: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
