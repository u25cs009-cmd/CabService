import NotificationLog from '../models/NotificationLog.js';
import { sendCustomerBookingUpdate, sendOwnerBookingNotification, sendCustomerPaymentReceiptEmail } from './emailService.js';
import User from '../models/User.js';

/**
 * Send WhatsApp template message via Meta Cloud API
 */
async function sendWhatsAppMessage({ phone, templateName, components }) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId || token === 'your_whatsapp_token') {
    return { success: false, reason: 'WhatsApp API credentials unconfigured in .env' };
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const recipientPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components: components || []
        }
      })
    });

    const data = await response.json();
    if (response.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, reason: data.error?.message || 'WhatsApp Cloud API error' };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Send SMS via Configurable Gateway Adapter
 */
async function sendSMS({ phone, text }) {
  const apiKey = process.env.SMS_API_KEY;
  const gatewayUrl = process.env.SMS_GATEWAY_URL;

  if (!apiKey || !gatewayUrl || apiKey === 'your_sms_api_key') {
    return { success: false, reason: 'SMS Gateway credentials unconfigured in .env' };
  }

  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phone,
        message: text
      })
    });

    if (response.ok) {
      return { success: true };
    }
    return { success: false, reason: `SMS API returned ${response.status}` };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Unified Notification Entry Point
 */
export async function sendUnifiedNotification({
  event,
  booking,
  recipientUser = null,
  driver = null,
  channels = ['email'],
  isPromotional = false,
  customText = ''
}) {
  // Non-blocking asynchronous dispatch
  setImmediate(async () => {
    try {
      // 1. Promotional Opt-out check
      if (isPromotional && recipientUser?.promoOptOut) {
        await NotificationLog.create({
          event,
          booking: booking?._id || null,
          user: recipientUser?._id || null,
          channel: 'email',
          recipient: recipientUser?.email || booking?.email || '',
          status: 'skipped',
          errorMessage: 'User opted out of promotional notifications'
        });
        return;
      }

      for (const channel of channels) {
        let result = { success: false, reason: '' };

        if (channel === 'whatsapp') {
          result = await sendWhatsAppMessage({
            phone: booking?.phone || recipientUser?.phone || '',
            templateName: 'cab_booking_update',
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: booking?.referenceCode || '' },
                  { type: 'text', text: booking?.status || '' }
                ]
              }
            ]
          });

          // Quiet fallback to Email if WhatsApp unconfigured
          if (!result.success) {
            console.log(`[NotificationService] WhatsApp fallback to Email: ${result.reason}`);
            const emailRes = await sendCustomerBookingUpdate(booking, driver);
            await NotificationLog.create({
              event,
              booking: booking?._id || null,
              user: recipientUser?._id || null,
              channel: 'whatsapp',
              recipient: booking?.phone || '',
              status: 'fallback',
              errorMessage: `WhatsApp failed (${result.reason}). Fallback to Email sent.`
            });
            continue;
          }
        } else if (channel === 'sms') {
          const smsText = customText || `Pi-Pip-Pip Cabs: Booking #${booking?.referenceCode} status is ${booking?.status?.toUpperCase()}. Track: ${process.env.CLIENT_URL}/track/${booking?.trackingToken}`;
          result = await sendSMS({
            phone: booking?.phone || recipientUser?.phone || '',
            text: smsText
          });

          if (!result.success) {
            console.log(`[NotificationService] SMS fallback to Email: ${result.reason}`);
            await sendCustomerBookingUpdate(booking, driver);
            await NotificationLog.create({
              event,
              booking: booking?._id || null,
              user: recipientUser?._id || null,
              channel: 'sms',
              recipient: booking?.phone || '',
              status: 'fallback',
              errorMessage: `SMS failed (${result.reason}). Fallback to Email sent.`
            });
            continue;
          }
        } else if (channel === 'email') {
          if (event === 'payment_received') {
            result = await sendCustomerPaymentReceiptEmail(booking);
          } else if (event === 'needs_manual_assignment_alert') {
            result = await sendOwnerBookingNotification(booking);
          } else {
            result = await sendCustomerBookingUpdate(booking, driver);
          }
        }

        // Log delivery status
        await NotificationLog.create({
          event,
          booking: booking?._id || null,
          user: recipientUser?._id || null,
          driver: driver?._id || null,
          channel,
          recipient: booking?.email || booking?.phone || '',
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.reason || ''
        });
      }
    } catch (error) {
      console.error(`[NotificationService] Error dispatching event ${event}:`, error);
    }
  });
}
