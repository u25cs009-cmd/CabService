import { siteConfig } from '../config/site';

/**
 * Submit booking details.
 * Formats the payload into a pre-filled WhatsApp chat message.
 * Single source of truth reads number and site name from siteConfig.
 *
 * @param {object} bookingData - The booking form data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitBooking(bookingData) {
  try {
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

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    return {
      success: true,
      message: `Booking request generated! Redirecting to WhatsApp (${siteConfig.whatsapp}) to send details...`
    };
  } catch (error) {
    console.error('Error submitting booking:', error);
    return {
      success: false,
      message: `Unable to launch WhatsApp. Please call ${siteConfig.name} at ${siteConfig.phone} directly.`
    };
  }
}
