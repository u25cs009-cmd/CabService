import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import DispatchSettings from '../models/DispatchSettings.js';

/**
 * Helper to fetch or create singleton dispatch settings
 */
export const getDispatchSettings = async () => {
  let settings = await DispatchSettings.findOne();
  if (!settings) {
    settings = await DispatchSettings.create({
      searchRadiusKm: 15,
      offerTimeoutSeconds: 30,
      maxDriverRetries: 3,
      autoAssignEnabled: true
    });
  }
  return settings;
};

/**
 * Attempts to find the nearest online & available driver and offer the trip.
 * Uses 2dsphere location matching.
 */
export const findAndOfferNextDriver = async (bookingId) => {
  try {
    const settings = await getDispatchSettings();
    if (!settings.autoAssignEnabled) {
      return null;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return null;

    // Do not dispatch if booking is already assigned, cancelled, or completed
    if (['assigned', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled'].includes(booking.status)) {
      return null;
    }

    const declinedList = booking.assignedDriverOffer?.declinedDrivers || [];
    if (declinedList.length >= settings.maxDriverRetries) {
      booking.status = 'needs_manual_assignment';
      booking.statusHistory.push({
        status: 'needs_manual_assignment',
        changedBy: 'system',
        note: `Exhausted ${settings.maxDriverRetries} driver offers without acceptance.`
      });
      await booking.save();
      return null;
    }

    // Determine pickup coordinates [lng, lat]
    let lng = 77.2090;
    let lat = 28.6139;
    if (booking.pickupCoords && typeof booking.pickupCoords.lng === 'number' && typeof booking.pickupCoords.lat === 'number') {
      lng = booking.pickupCoords.lng;
      lat = booking.pickupCoords.lat;
    }

    // Find nearest online available driver not in declined list
    const candidateDrivers = await Driver.find({
      isOnline: true,
      status: 'available',
      _id: { $nin: declinedList },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: settings.searchRadiusKm * 1000
        }
      }
    }).limit(1);

    if (!candidateDrivers || candidateDrivers.length === 0) {
      // If no drivers found in radius
      booking.status = 'needs_manual_assignment';
      booking.statusHistory.push({
        status: 'needs_manual_assignment',
        changedBy: 'system',
        note: 'No available online drivers found within search radius.'
      });
      await booking.save();
      return null;
    }

    const nextDriver = candidateDrivers[0];

    // Generate 4-digit OTP if not already generated
    if (!booking.otpCode) {
      booking.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    }

    booking.status = 'offered';
    booking.assignedDriverOffer = {
      driver: nextDriver._id,
      offerExpiresAt: new Date(Date.now() + settings.offerTimeoutSeconds * 1000),
      declinedDrivers: declinedList
    };

    booking.statusHistory.push({
      status: 'offered',
      changedBy: 'system',
      note: `Trip offered to driver ${nextDriver.name}`
    });

    await booking.save();
    return { booking, driver: nextDriver };
  } catch (error) {
    console.error('Error in findAndOfferNextDriver:', error);
    return null;
  }
};

/**
 * Periodically checks for expired driver offers (30s timer) and passes offer to next driver
 */
export const processExpiredOffers = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'offered',
      'assignedDriverOffer.offerExpiresAt': { $lt: new Date() }
    });

    for (const booking of expiredBookings) {
      if (booking.assignedDriverOffer?.driver) {
        booking.assignedDriverOffer.declinedDrivers.push(booking.assignedDriverOffer.driver);
      }
      booking.assignedDriverOffer.driver = null;
      booking.assignedDriverOffer.offerExpiresAt = null;
      booking.statusHistory.push({
        status: 'offered',
        changedBy: 'system',
        note: 'Driver offer timed out (30s)'
      });
      await booking.save();

      // Offer to next nearest driver
      await findAndOfferNextDriver(booking._id);
    }
  } catch (error) {
    console.error('Error in processExpiredOffers:', error);
  }
};

/**
 * Purges route trails older than retentionDays (default 30 days) for privacy compliance
 */
export const purgeOldRouteTrails = async (retentionDays = 30) => {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    await Booking.updateMany(
      { updatedAt: { $lt: cutoffDate }, 'routeTrail.0': { $exists: true } },
      { $set: { routeTrail: [] } }
    );
  } catch (error) {
    console.error('Error purging old route trails:', error);
  }
};

// Start background offer check interval (every 5 seconds) and retention purge (every 6 hours)
let intervalId = null;
let retentionIntervalId = null;
export const startDispatchCron = () => {
  if (!intervalId) {
    intervalId = setInterval(processExpiredOffers, 5000);
  }
  if (!retentionIntervalId) {
    purgeOldRouteTrails();
    retentionIntervalId = setInterval(() => purgeOldRouteTrails(30), 6 * 60 * 60 * 1000);
  }
};
