import { siteConfig } from '../config/site';
import { vehiclesData as fallbackVehicles } from '../data/vehicles';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch active vehicle fleet from API server.
 * Falls back to local mock data if the API server is unreachable.
 *
 * @returns {Promise<Array>} List of vehicles
 */
export async function fetchVehicles() {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return fallbackVehicles;
  } catch (error) {
    console.warn(`[API] Vehicles endpoint unavailable (${error.message}). Using local vehicle data.`);
    return fallbackVehicles;
  }
}

/**
 * Submit booking details to backend API.
 * Calls POST /api/bookings and receives a unique reference code.
 * Falls back to WhatsApp pre-filled message if API is unreachable.
 *
 * @param {object} bookingData - The booking form payload
 * @returns {Promise<{success: boolean, referenceCode?: string, message: string, isFallback?: boolean}>}
 */
export async function submitBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const json = await response.json();

    if (response.ok && json.success) {
      return {
        success: true,
        referenceCode: json.referenceCode || json.data?.referenceCode,
        message: json.message || 'Booking request created successfully!',
        data: json.data
      };
    } else {
      throw new Error(json.message || 'API booking creation failed');
    }
  } catch (error) {
    console.warn(`[API] Booking endpoint error (${error.message}). Falling back to WhatsApp submission.`);
    
    // Open WhatsApp fallback
    openWhatsAppFallback(bookingData);

    return {
      success: true,
      referenceCode: null,
      isFallback: true,
      message: 'Server unreachable. Created booking request via WhatsApp fallback.'
    };
  }
}

/**
 * Helper to generate pre-filled WhatsApp message URL and open in new window
 */
export function openWhatsAppFallback(bookingData, referenceCode = null) {
  const {
    name,
    phone,
    email,
    pickup,
    drop,
    date,
    time,
    serviceType,
    vehicleType,
    passengers,
    distanceKm,
    estimatedFare,
    notes
  } = bookingData;

  const formattedMessage = `🚕 *NEW CAB BOOKING REQUEST - ${siteConfig.name.toUpperCase()}* 🚕\n` +
    (referenceCode ? `🔖 *Ref Code:* #${referenceCode}\n` : '') +
    `-----------------------------------\n` +
    `👤 *Name:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    (email ? `✉️ *Email:* ${email}\n` : '') +
    `📍 *Pickup:* ${pickup}\n` +
    `🏁 *Drop:* ${drop}\n` +
    `📅 *Date:* ${date}\n` +
    `⏰ *Time:* ${time}\n` +
    `🏷️ *Service:* ${serviceType || 'Standard Ride'}\n` +
    `🚘 *Vehicle:* ${vehicleType}\n` +
    `👥 *Passengers:* ${passengers}\n` +
    (distanceKm ? `📏 *Est. Distance:* ${distanceKm} km\n` : '') +
    (estimatedFare ? `💰 *Est. Fare:* ₹${estimatedFare}\n` : '') +
    (notes ? `📝 *Notes:* ${notes}\n` : '') +
    `-----------------------------------\n` +
    `Sent via ${siteConfig.name} Cab Booking Website`;

  const whatsappNumber = siteConfig.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
