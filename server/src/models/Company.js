import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    gstNumber: {
      type: String,
      default: '',
      trim: true,
      uppercase: true
    },
    billingAddress: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true }
    },
    creditTermsDays: {
      type: Number,
      default: 30,
      min: 0
    },
    approvedEmployees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        employeeId: { type: String, default: '', trim: true },
        costCenter: { type: String, default: '', trim: true }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model('Company', companySchema);
