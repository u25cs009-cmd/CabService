import { z } from 'zod';

// Booking input Zod Schema
export const createBookingSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length === 10 || (digits.length >= 10 && digits.length <= 12);
  }, 'Phone number must be a valid 10-digit mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  pickup: z.string().min(2, 'Pickup location is required'),
  drop: z.string().min(2, 'Drop location is required'),
  date: z.string().min(1, 'Pickup date is required'),
  time: z.string().min(1, 'Pickup time is required'),
  tripType: z.enum(['local', 'outstation', 'airport', 'hourly']).optional().default('local'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  passengers: z.coerce.number().min(1, 'Passengers must be at least 1'),
  distanceKm: z.coerce.number().min(0).optional().default(0),
  paymentOption: z.enum(['full', 'advance', 'driver']).optional().default('driver'),
  notes: z.string().optional().default('')
});

// Create Razorpay Order Schema
export const createPaymentOrderSchema = z.object({
  referenceCode: z.string().min(1, 'Booking reference code is required'),
  paymentOption: z.enum(['full', 'advance']).optional().default('full')
});

// Verify Razorpay Payment Schema
export const verifyPaymentSchema = z.object({
  referenceCode: z.string().min(1, 'Booking reference code is required'),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required')
});

// Admin Refund Schema
export const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive('Refund amount must be positive').optional(),
  reason: z.string().optional().default('Admin initiated refund')
});


// Admin Login Schema
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

// Admin Booking Update Schema
export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'assigned', 'completed', 'cancelled']).optional(),
  driverId: z.string().optional(),
  notes: z.string().optional()
});

/**
 * Higher-order middleware to validate req.body against a Zod Schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    req.validatedData = result.data;
    next();
  };
}
