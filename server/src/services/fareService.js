/**
 * Server-side fare calculation service.
 * Never trust fare sent by client; calculate authoritatively on server.
 *
 * Formula: max(baseFare/minFare, distanceKm * ratePerKm)
 *
 * @param {number} distanceKm
 * @param {object} vehicleSpec - Object containing ratePerKm and baseFare / minFare
 * @returns {object} Calculated fare breakdown
 */
export function calculateServerFare(distanceKm, vehicleSpec) {
  const dist = Math.max(0, parseFloat(distanceKm) || 0);
  const minFare = parseFloat(vehicleSpec?.baseFare || vehicleSpec?.minFare) || 0;
  const ratePerKm = parseFloat(vehicleSpec?.ratePerKm) || 0;

  const rawFare = dist * ratePerKm;
  const finalFare = Math.max(minFare, Math.round(rawFare));

  return {
    estimatedFare: finalFare,
    ratePerKm,
    minFare,
    distanceKm: dist,
    minFareUsed: rawFare < minFare
  };
}
