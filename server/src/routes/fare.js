import express from 'express';
import rateLimit from 'express-rate-limit';
import Vehicle from '../models/Vehicle.js';
import { getRouteDetails } from '../services/mapsService.js';
import { calculateAdvancedFare } from '../services/fareService.js';

const router = express.Router();

// Strict rate limiter for POST /api/fare/estimate to prevent API quota drain & abuse
const estimateRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30, // 30 requests per 10 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many fare estimation requests. Please try again in a few minutes.'
  }
});

// POST /api/fare/estimate (Public - Maps & Advanced Fare Calculation)
router.post('/estimate', estimateRateLimiter, async (req, res, next) => {
  try {
    const {
      pickup,
      drop,
      pickupCoords,
      dropCoords,
      vehicleId,
      vehicleType = 'sedan',
      tripType = 'local',
      dateTime = new Date(),
      packageId = '',
      isRoundTrip = false,
      extraHours = 0
    } = req.body;

    let distanceKm = parseFloat(req.body.distanceKm) || 0;
    let durationMins = 0;
    let routeSource = 'manual';

    // Call Maps service if pickup and drop locations are provided
    if (pickup && drop) {
      const route = await getRouteDetails(pickup, drop, pickupCoords, dropCoords);
      if (distanceKm <= 0) {
        distanceKm = route.distanceKm;
      }
      durationMins = route.durationMins;
      routeSource = route.source;
    }

    const fareResult = await calculateAdvancedFare({
      vehicleType,
      distanceKm,
      tripType,
      dateTime,
      packageId,
      isRoundTrip,
      extraHours
    });

    let finalEstimatedFare = fareResult.estimatedFare;
    let couponInfo = null;

    if (req.body.couponCode) {
      const { validateAndApplyCoupon } = await import('../services/couponService.js');
      const couponRes = await validateAndApplyCoupon({
        couponCode: req.body.couponCode,
        estimatedFare: fareResult.estimatedFare
      });
      if (couponRes.isValid) {
        finalEstimatedFare = couponRes.finalFare;
        couponInfo = {
          code: couponRes.couponCode,
          discountAmount: couponRes.discountAmount,
          message: couponRes.message
        };
      }
    }

    res.json({
      success: true,
      data: {
        pickup,
        drop,
        distanceKm: fareResult.distanceKm,
        durationMins,
        routeSource,
        vehicleType: fareResult.vehicleType,
        tripType: fareResult.tripType,
        originalFare: fareResult.estimatedFare,
        estimatedFare: finalEstimatedFare,
        breakdown: {
          ...fareResult.breakdown,
          discountAmount: couponInfo ? couponInfo.discountAmount : 0
        },
        coupon: couponInfo
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
