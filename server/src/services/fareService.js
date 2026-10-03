import mongoose from 'mongoose';
import FareRule from '../models/FareRule.js';

// Default Fallback Rules if database hasn't been seeded yet
const DEFAULT_RULES = {
  hatchback: {
    baseFare: 300,
    ratePerKm: 12,
    minFare: 300,
    gstPercent: 5,
    nightCharge: { enabled: true, startHour: 22, endHour: 6, type: 'percent', amount: 15 },
    localPackages: [
      { packageId: '4hr_40km', name: '4 Hrs / 40 KM', hours: 4, km: 40, price: 1000, extraKmRate: 12, extraHourRate: 120 },
      { packageId: '8hr_80km', name: '8 Hrs / 80 KM', hours: 8, km: 80, price: 1800, extraKmRate: 12, extraHourRate: 120 },
      { packageId: '12hr_120km', name: '12 Hrs / 120 KM', hours: 12, km: 120, price: 2600, extraKmRate: 12, extraHourRate: 120 }
    ],
    outstation: { dailyMinKm: 250, driverAllowancePerNight: 300, roundTripDiscountPercent: 5 },
    airport: { fixedAirportFee: 150 }
  },
  sedan: {
    baseFare: 400,
    ratePerKm: 14,
    minFare: 400,
    gstPercent: 5,
    nightCharge: { enabled: true, startHour: 22, endHour: 6, type: 'percent', amount: 15 },
    localPackages: [
      { packageId: '4hr_40km', name: '4 Hrs / 40 KM', hours: 4, km: 40, price: 1200, extraKmRate: 14, extraHourRate: 150 },
      { packageId: '8hr_80km', name: '8 Hrs / 80 KM', hours: 8, km: 80, price: 2200, extraKmRate: 14, extraHourRate: 150 },
      { packageId: '12hr_120km', name: '12 Hrs / 120 KM', hours: 12, km: 120, price: 3200, extraKmRate: 14, extraHourRate: 150 }
    ],
    outstation: { dailyMinKm: 250, driverAllowancePerNight: 300, roundTripDiscountPercent: 5 },
    airport: { fixedAirportFee: 200 }
  },
  suv: {
    baseFare: 600,
    ratePerKm: 18,
    minFare: 600,
    gstPercent: 5,
    nightCharge: { enabled: true, startHour: 22, endHour: 6, type: 'percent', amount: 15 },
    localPackages: [
      { packageId: '4hr_40km', name: '4 Hrs / 40 KM', hours: 4, km: 40, price: 1600, extraKmRate: 18, extraHourRate: 200 },
      { packageId: '8hr_80km', name: '8 Hrs / 80 KM', hours: 8, km: 80, price: 3000, extraKmRate: 18, extraHourRate: 200 },
      { packageId: '12hr_120km', name: '12 Hrs / 120 KM', hours: 12, km: 120, price: 4200, extraKmRate: 18, extraHourRate: 200 }
    ],
    outstation: { dailyMinKm: 250, driverAllowancePerNight: 400, roundTripDiscountPercent: 5 },
    airport: { fixedAirportFee: 300 }
  },
  tempo: {
    baseFare: 1500,
    ratePerKm: 25,
    minFare: 1500,
    gstPercent: 5,
    nightCharge: { enabled: true, startHour: 22, endHour: 6, type: 'percent', amount: 15 },
    localPackages: [
      { packageId: '4hr_40km', name: '4 Hrs / 40 KM', hours: 4, km: 40, price: 3000, extraKmRate: 25, extraHourRate: 300 },
      { packageId: '8hr_80km', name: '8 Hrs / 80 KM', hours: 8, km: 80, price: 5500, extraKmRate: 25, extraHourRate: 300 },
      { packageId: '12hr_120km', name: '12 Hrs / 120 KM', hours: 12, km: 120, price: 7500, extraKmRate: 25, extraHourRate: 300 }
    ],
    outstation: { dailyMinKm: 300, driverAllowancePerNight: 500, roundTripDiscountPercent: 5 },
    airport: { fixedAirportFee: 500 }
  }
};

/**
 * Advanced fare calculator function.
 * Calculates detailed itemized fare breakdown authoritatively on the server.
 *
 * @param {object} params
 * @returns {Promise<object>} Itemized fare breakdown
 */
export async function calculateAdvancedFare({
  vehicleType = 'sedan',
  distanceKm = 0,
  tripType = 'local',
  dateTime = new Date(),
  packageId = '',
  isRoundTrip = false,
  extraHours = 0
}) {
  const vKey = (vehicleType || 'sedan').toLowerCase();
  const isDbConnected = mongoose.connection.readyState === 1;

  let rule = null;
  if (isDbConnected) {
    rule = await FareRule.findOne({ vehicleType: vKey });
  }

  if (!rule) {
    rule = DEFAULT_RULES[vKey] || DEFAULT_RULES.sedan;
  }

  const dist = Math.max(0, parseFloat(distanceKm) || 0);
  const pickupTimeObj = new Date(dateTime);
  const pickupHour = isNaN(pickupTimeObj.getTime()) ? 10 : pickupTimeObj.getHours();

  let baseCharge = 0;
  let distanceCharge = 0;
  let airportFee = 0;
  let driverAllowance = 0;

  // 1. Calculate Base & Distance Charges depending on Trip Type
  if (tripType === 'hourly') {
    const pkgList = rule.localPackages || DEFAULT_RULES.sedan.localPackages;
    const matchedPkg = pkgList.find((p) => p.packageId === packageId) || pkgList[0];

    baseCharge = matchedPkg.price;
    const extraKm = Math.max(0, dist - matchedPkg.km);
    distanceCharge = extraKm * matchedPkg.extraKmRate + (parseFloat(extraHours) || 0) * matchedPkg.extraHourRate;
  } else if (tripType === 'outstation') {
    const outstationRule = rule.outstation || DEFAULT_RULES.sedan.outstation;
    const effectiveDist = isRoundTrip ? dist * 2 : dist;
    const minKm = outstationRule.dailyMinKm || 250;
    const billableKm = Math.max(minKm, effectiveDist);

    baseCharge = rule.baseFare || 400;
    distanceCharge = billableKm * (rule.ratePerKm || 14);
    driverAllowance = outstationRule.driverAllowancePerNight || 300;

    if (isRoundTrip && outstationRule.roundTripDiscountPercent > 0) {
      distanceCharge = Math.round(distanceCharge * (1 - outstationRule.roundTripDiscountPercent / 100));
    }
  } else if (tripType === 'airport') {
    const airportRule = rule.airport || DEFAULT_RULES.sedan.airport;
    baseCharge = rule.baseFare || 400;
    airportFee = airportRule.fixedAirportFee || 200;
    distanceCharge = dist * (rule.ratePerKm || 14);
  } else {
    // Standard Local Point-to-Point
    baseCharge = rule.baseFare || 400;
    distanceCharge = dist * (rule.ratePerKm || 14);
    const minFare = rule.minFare || 400;
    if (baseCharge + distanceCharge < minFare) {
      distanceCharge = minFare - baseCharge;
    }
  }

  // 2. Check Night Charge (10 PM to 6 AM)
  let nightCharge = 0;
  const nightRule = rule.nightCharge || { enabled: true, startHour: 22, endHour: 6, type: 'percent', amount: 15 };
  if (nightRule.enabled && (pickupHour >= nightRule.startHour || pickupHour < nightRule.endHour)) {
    if (nightRule.type === 'percent') {
      nightCharge = Math.round((baseCharge + distanceCharge) * (nightRule.amount / 100));
    } else {
      nightCharge = nightRule.amount;
    }
  }

  // 3. Calculate Tax (GST)
  const subtotal = baseCharge + distanceCharge + nightCharge + airportFee + driverAllowance;
  const gstPercent = rule.gstPercent || 5;
  const taxAmount = Math.round(subtotal * (gstPercent / 100));
  const totalFare = subtotal + taxAmount;

  return {
    vehicleType: vKey,
    tripType,
    distanceKm: dist,
    breakdown: {
      baseCharge: Math.round(baseCharge),
      distanceCharge: Math.round(distanceCharge),
      nightCharge: Math.round(nightCharge),
      airportFee: Math.round(airportFee),
      driverAllowance: Math.round(driverAllowance),
      taxAmount: Math.round(taxAmount),
      totalFare: Math.round(totalFare)
    },
    estimatedFare: Math.round(totalFare)
  };
}
