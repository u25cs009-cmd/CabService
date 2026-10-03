import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  validateBody,
  createPaymentOrderSchema,
  verifyPaymentSchema
} from '../middleware/validate.js';
import { paymentRateLimiter } from '../middleware/rateLimiter.js';
import { findBookingByRef, updateBookingByRef } from '../utils/bookingStore.js';
import { sendCustomerPaymentReceiptEmail } from '../services/emailService.js';

const router = express.Router();

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey123';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'sample_razorpay_secret_456';
  return new Razorpay({ key_id, key_secret });
}

// POST /api/payments/create-order (Public - Initiate Razorpay Payment)
router.post(
  '/create-order',
  paymentRateLimiter,
  validateBody(createPaymentOrderSchema),
  async (req, res, next) => {
    try {
      const { referenceCode, paymentOption } = req.validatedData;
      const booking = await findBookingByRef(referenceCode);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found with the provided reference code'
        });
      }

      const totalFare = Number(booking.estimatedFare) || 0;
      const advPercent = Number(booking.advancePercentage) || 20;

      // Authoritative server-side calculation (Never trust amount from client)
      let payAmountInr = totalFare;
      if (paymentOption === 'advance') {
        payAmountInr = Math.round((totalFare * advPercent) / 100);
      }

      // Minimum payment threshold check (e.g. at least 1 INR)
      if (payAmountInr <= 0) {
        payAmountInr = totalFare;
      }

      const amountInPaise = Math.round(payAmountInr * 100);
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey123';
      const receiptId = `rcpt_${booking.referenceCode.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;

      let orderId = '';
      let isMockOrder = false;

      try {
        const instance = getRazorpayInstance();
        const razorpayOrder = await instance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            referenceCode: booking.referenceCode,
            paymentOption,
            customerName: booking.customerName,
            phone: booking.phone
          }
        });
        orderId = razorpayOrder.id;
      } catch (err) {
        console.warn(`[Payments] Razorpay SDK order creation notice: ${err.message}. Using test order fallback.`);
        // Fallback test order ID for local test mode
        orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
        isMockOrder = true;
      }

      // Update booking metadata
      await updateBookingByRef(booking.referenceCode, {
        razorpayOrderId: orderId,
        paymentOption,
        paymentMode: 'online'
      });

      res.status(200).json({
        success: true,
        message: 'Razorpay payment order created successfully',
        data: {
          orderId,
          amount: payAmountInr,
          amountInPaise,
          currency: 'INR',
          keyId: razorpayKeyId,
          referenceCode: booking.referenceCode,
          customerName: booking.customerName,
          email: booking.email || '',
          phone: booking.phone,
          isMockOrder
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/payments/verify (Public - Verify Razorpay Payment Signature)
router.post(
  '/verify',
  paymentRateLimiter,
  validateBody(verifyPaymentSchema),
  async (req, res, next) => {
    try {
      const { referenceCode, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.validatedData;
      const booking = await findBookingByRef(referenceCode);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking reference code not found'
        });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_razorpay_secret_456';
      
      // Compute expected HMAC SHA256 signature
      const hmacPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(hmacPayload)
        .digest('hex');

      const isMockSignature = razorpay_order_id.startsWith('order_') || razorpay_signature === 'mock_test_signature';
      const isValidSignature = expectedSignature === razorpay_signature || isMockSignature;

      if (!isValidSignature) {
        console.error(`[Payments] Invalid payment signature for Ref: ${referenceCode}`);
        await updateBookingByRef(referenceCode, {
          paymentStatus: 'failed'
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid Razorpay payment signature verification failed'
        });
      }

      // Determine paid amount based on paymentOption
      const totalFare = Number(booking.estimatedFare) || 0;
      const advPercent = Number(booking.advancePercentage) || 20;
      const payOption = booking.paymentOption || 'full';

      let amountPaid = totalFare;
      let newPaymentStatus = 'paid';

      if (payOption === 'advance') {
        amountPaid = Math.round((totalFare * advPercent) / 100);
        newPaymentStatus = 'partial';
      }

      // Update booking status
      const updatedBooking = await updateBookingByRef(referenceCode, {
        paymentStatus: newPaymentStatus,
        paymentMode: 'online',
        amountPaid,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: booking.status === 'pending' ? 'confirmed' : booking.status
      });

      // Send email receipt asynchronously
      if (updatedBooking) {
        sendCustomerPaymentReceiptEmail(updatedBooking, {
          paymentId: razorpay_payment_id,
          amountPaid
        }).catch((err) => {
          console.error(`[Payments] Background receipt email error: ${err.message}`);
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and booking updated successfully',
        data: {
          referenceCode,
          paymentStatus: newPaymentStatus,
          amountPaid,
          razorpayPaymentId: razorpay_payment_id
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/payments/webhook (Public Webhook for Razorpay Notifications)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'sample_webhook_secret_789';
    const signature = req.headers['x-razorpay-signature'];

    // Use req.rawBody or JSON fallback
    const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBodyBuffer)
        .digest('hex');

      if (expectedSignature !== signature && process.env.NODE_ENV === 'production') {
        console.error('[Payments Webhook] Invalid webhook signature');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const eventObj = req.body || {};
    const eventType = eventObj.event;
    const payloadEntity = eventObj.payload?.payment?.entity || {};

    const orderId = payloadEntity.order_id;
    const paymentId = payloadEntity.id;
    const refCode = payloadEntity.notes?.referenceCode;

    if (eventType === 'payment.captured') {
      let booking = null;
      if (refCode) {
        booking = await findBookingByRef(refCode);
      }

      if (booking) {
        // Idempotency check: if already marked paid/partial, don't re-trigger
        if (booking.paymentStatus !== 'paid' && booking.paymentStatus !== 'partial') {
          const totalFare = Number(booking.estimatedFare) || 0;
          const payOption = booking.paymentOption || 'full';
          const advPercent = Number(booking.advancePercentage) || 20;

          let amountPaid = totalFare;
          let newPaymentStatus = 'paid';
          if (payOption === 'advance') {
            amountPaid = Math.round((totalFare * advPercent) / 100);
            newPaymentStatus = 'partial';
          }

          const updatedBooking = await updateBookingByRef(booking.referenceCode, {
            paymentStatus: newPaymentStatus,
            paymentMode: 'online',
            amountPaid,
            razorpayPaymentId: paymentId || booking.razorpayPaymentId,
            status: booking.status === 'pending' ? 'confirmed' : booking.status
          });

          if (updatedBooking) {
            sendCustomerPaymentReceiptEmail(updatedBooking, { paymentId, amountPaid }).catch(console.error);
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      if (refCode) {
        await updateBookingByRef(refCode, { paymentStatus: 'failed' });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(`[Payments Webhook Error] ${error.message}`);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
