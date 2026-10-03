import nodemailer from 'nodemailer';

/**
 * Send booking notification email to business owner using Nodemailer.
 */
export async function sendOwnerBookingNotification(booking) {
  const ownerEmail = process.env.OWNER_EMAIL || 'yashiadarsh2020@gmail.com';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'your_email_app_password') {
    console.log(`[EmailService] SMTP credentials missing. Skipping owner email for Ref: ${booking.referenceCode}`);
    return { success: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const mailOptions = {
      from: `"Pi-Pip-Pip Cab Service" <${emailUser}>`,
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
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Owner notification email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send owner email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send status update or driver assignment email to customer.
 */
export async function sendCustomerBookingUpdate(booking, driver = null) {
  if (!booking.email) {
    return { success: false, reason: 'Customer did not provide an email address' };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'your_email_app_password') {
    console.log(`[EmailService] SMTP missing. Skipping customer status email for Ref: ${booking.referenceCode}`);
    return { success: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const statusTitle = booking.status.toUpperCase();
    let driverInfoHtml = '';

    if (driver) {
      driverInfoHtml = `
        <div style="background-color: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 12px; margin-top: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #065f46;">Assigned Driver Information</h4>
          <p style="margin: 4px 0;"><strong>Driver Name:</strong> ${driver.name}</p>
          <p style="margin: 4px 0;"><strong>Driver Phone:</strong> <a href="tel:${driver.phone}">${driver.phone}</a></p>
          <p style="margin: 4px 0;"><strong>Cab Vehicle No:</strong> ${driver.vehicleNumber}</p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"Pi-Pip-Pip Cab Service" <${emailUser}>`,
      to: booking.email,
      subject: `🚕 Ride Booking Status Update #${booking.referenceCode} - ${statusTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; color: #000; padding: 16px; text-align: center;">
            <h2 style="margin: 0;">Pi-Pip-Pip Cab Status Update</h2>
            <p style="margin: 4px 0 0 0; font-weight: bold;">Reference Code: #${booking.referenceCode}</p>
          </div>
          <div style="padding: 20px;">
            <p>Hello <strong>${booking.customerName}</strong>,</p>
            <p>Your cab booking status has been updated to: <strong style="color: #d97706; text-transform: uppercase;">${booking.status}</strong>.</p>
            
            ${driverInfoHtml}

            <div style="margin-top: 20px; padding-top: 12px; border-t: 1px solid #eee;">
              <p style="margin: 4px 0;"><strong>Pickup:</strong> ${booking.pickupLocation}</p>
              <p style="margin: 4px 0;"><strong>Drop:</strong> ${booking.dropLocation}</p>
              <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${new Date(booking.pickupDateTime).toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Estimated Fare:</strong> ₹${booking.estimatedFare}</p>
            </div>
            
            <p style="margin-top: 20px;">Need support? Call us 24/7 at <strong>6201901834</strong>.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Customer update email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send customer email: ${error.message}`);
    return { success: false, error: error.message };
  }
}
