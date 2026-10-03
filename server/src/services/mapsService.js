/**
 * Maps & Routes API Service with in-memory caching and Haversine fallback.
 */

// In-memory cache for route calculations (cached for 10 minutes)
const routeCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Calculate Haversine distance between two sets of lat/lng coordinates.
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  // Apply 1.25 multiplier for real road curvature estimate
  return Math.round(distance * 1.25 * 10) / 10;
}

/**
 * Fetch route distance and duration using Google Routes API / Distance Matrix.
 * Fallback to Haversine or estimate if API key is not configured.
 *
 * @param {string} pickupLocation
 * @param {string} dropLocation
 * @param {object} [pickupCoords] - { lat, lng }
 * @param {object} [dropCoords] - { lat, lng }
 * @returns {Promise<{distanceKm: number, durationMins: number, source: string}>}
 */
export async function getRouteDetails(pickupLocation, dropLocation, pickupCoords, dropCoords) {
  const cacheKey = `${pickupLocation.toLowerCase()}|${dropLocation.toLowerCase()}|${pickupCoords?.lat || ''}|${dropCoords?.lat || ''}`;

  // 1. Check in-memory cache
  if (routeCache.has(cacheKey)) {
    const cached = routeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[MapsService] Cache hit for route: ${pickupLocation} -> ${dropLocation}`);
      return cached.data;
    } else {
      routeCache.delete(cacheKey);
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  // 2. Haversine distance if coordinates are present
  if (pickupCoords?.lat && pickupCoords?.lng && dropCoords?.lat && dropCoords?.lng) {
    const distKm = calculateHaversineDistance(
      pickupCoords.lat,
      pickupCoords.lng,
      dropCoords.lat,
      dropCoords.lng
    );
    const durationMins = Math.round(distKm * 2.5); // Average 24 km/h city speed

    const result = { distanceKm: Math.max(1, distKm), durationMins: Math.max(5, durationMins), source: 'haversine' };
    routeCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  }

  // 3. Google Maps Distance Matrix API call if key is set
  if (apiKey && apiKey !== 'your_google_maps_server_key') {
    try {
      const origins = encodeURIComponent(pickupLocation);
      const destinations = encodeURIComponent(dropLocation);
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK' && json.rows[0]?.elements[0]?.status === 'OK') {
        const element = json.rows[0].elements[0];
        const distanceKm = Math.round((element.distance.value / 1000) * 10) / 10;
        const durationMins = Math.round(element.duration.value / 60);

        const result = { distanceKm: Math.max(1, distanceKm), durationMins: Math.max(5, durationMins), source: 'google_maps' };
        routeCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      }
    } catch (error) {
      console.warn(`[MapsService] Google Maps API call failed: ${error.message}. Using fallback calculation.`);
    }
  }

  // 4. Default fallback distance calculation
  const fallbackResult = {
    distanceKm: 15,
    durationMins: 35,
    source: 'fallback'
  };

  routeCache.set(cacheKey, { timestamp: Date.now(), data: fallbackResult });
  return fallbackResult;
}
