/**
 * Calculate estimated cab fare based on distance and selected vehicle parameters.
 * Formula: max(minimum fare, distanceKm * ratePerKm)
 *
 * @param {number|string} distanceKm - Estimated trip distance in kilometers
 * @param {object} vehicle - Vehicle object with minFare and ratePerKm
 * @returns {object} Fare calculation breakdown
 */
export function calculateFare(distanceKm, vehicle) {
  if (!vehicle) {
    return {
      estimatedFare: 0,
      minFareUsed: false,
      ratePerKm: 0,
      minFare: 0,
      distanceKm: 0
    };
  }

  const distance = Math.max(0, parseFloat(distanceKm) || 0);
  const minFare = parseFloat(vehicle.minFare) || 0;
  const ratePerKm = parseFloat(vehicle.ratePerKm) || 0;

  const rawFare = distance * ratePerKm;
  const finalFare = Math.max(minFare, Math.round(rawFare));
  const minFareUsed = rawFare < minFare;

  return {
    estimatedFare: finalFare,
    minFareUsed,
    ratePerKm,
    minFare,
    distanceKm: distance
  };
}
