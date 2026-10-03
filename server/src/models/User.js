import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'driver'],
      default: 'customer'
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    resetPasswordToken: {
      type: String,
      default: ''
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
