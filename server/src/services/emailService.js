import nodemailer from 'nodemailer';

/**
 * Send booking notification email to business owner using Nodemailer.
 *
 * @param {object} booking - Booking document
 */
export async function sendOwnerBookingNotification(booking) {
  const ownerEmail = process.env.OWNER_EMAIL || 'yashiadarsh2020@gmail.com';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'your_email_app_password') {
    console.log(`[EmailService] SMTP credentials not configured in .env. Skipping owner email send for reference: ${booking.referenceCode}`);
    return { success: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: `"Pi-Pip-Pip Booking System" <${emailUser}>`,
      to: ownerEmail,
      subject: `🚕 New Booking Received #${booking.referenceCode} - ${booking.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; color: #000; padding: 16px; text-align: center;">
            <h2 style="margin: 0;">Pi-Pip-Pip Cab Booking Request</h2>
            <p style="margin: 4px 0 0 0; font-weight: bold;">Reference Code: #${booking.referenceCode}</p>
          </div>
          <div style="padding: 20px;">
            <h3 style="color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 6px;">Customer & Trip Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${booking.customerName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone Number:</td><td><a href="tel:${booking.phone}">${booking.phone}</a></td></tr>
              ${booking.email ? `<tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${booking.email}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold;">Pickup Location:</td><td>${booking.pickupLocation}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Drop Location:</td><td>${booking.dropLocation}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Date & Time:</td><td>${new Date(booking.pickupDateTime).toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Trip Type:</td><td>${booking.tripType}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Vehicle:</td><td>${booking.vehicleName || 'Standard'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Passengers:</td><td>${booking.passengers}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Estimated Distance:</td><td>${booking.distanceKm} km</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Estimated Fare:</td><td style="font-size: 18px; font-weight: bold; color: #d97706;">₹${booking.estimatedFare}</td></tr>
              ${booking.notes ? `<tr><td style="padding: 8px 0; font-weight: bold;">Notes:</td><td>${booking.notes}</td></tr>` : ''}
            </table>
          </div>
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            Sent automatically by Pi-Pip-Pip Web Server
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Owner notification email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send owner email: ${error.message}`);
    // Non-blocking: log error and return success false
    return { success: false, error: error.message };
  }
}
