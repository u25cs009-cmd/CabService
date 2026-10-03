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
        const statusTitle = booking.status.toUpperCase();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const trackingUrl = booking.trackingToken ? `${clientUrl}/track/${booking.trackingToken}` : `${clientUrl}/booking/receipt/${booking.referenceCode}`;
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

            <div style="margin: 20px 0; text-align: center;">
              <a href="${trackingUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📍 Track Your Cab Live
              </a>
            </div>

            <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee;">
              <p style="margin: 4px 0;"><strong>Pickup:</strong> ${booking.pickupLocation}</p>
              <p style="margin: 4px 0;"><strong>Drop:</strong> ${booking.dropLocation}</p>
              <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${new Date(booking.pickupDateTime).toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Estimated Fare:</strong> ₹${booking.estimatedFare}</p>
            </div>
            
            <p style="margin-top: 20px;">Need support? Call us 24/7 at <strong>6201901834</strong>.</p>
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

/**
 * Send payment receipt email to customer upon successful payment.
 */
export async function sendCustomerPaymentReceiptEmail(booking, paymentDetails = {}) {
  if (!booking.email) {
    return { success: false, reason: 'Customer did not provide an email address' };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'your_email_app_password') {
    console.log(`[EmailService] SMTP missing. Skipping payment receipt email for Ref: ${booking.referenceCode}`);
    return { success: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const isFull = booking.paymentStatus === 'paid';
    const amountPaidStr = `₹${booking.amountPaid || paymentDetails.amountPaid || 0}`;
    const totalFareStr = `₹${booking.estimatedFare}`;
    const balanceDueStr = `₹${Math.max(0, (booking.estimatedFare || 0) - (booking.amountPaid || paymentDetails.amountPaid || 0))}`;

    const mailOptions = {
      from: `"Pi-Pip-Pip Cab Service" <${emailUser}>`,
      to: booking.email,
      subject: `💳 Payment Receipt #${booking.referenceCode} - Pi-Pip-Pip Cabs`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Payment Received!</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Booking Ref: #${booking.referenceCode}</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p>Dear <strong>${booking.customerName}</strong>,</p>
            <p>Thank you for choosing <strong>Pi-Pip-Pip Cab Service</strong>. We have received your payment via Razorpay.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0;">
              <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Payment Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 6px 0; color: #64748b;">Transaction ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${booking.razorpayPaymentId || paymentDetails.paymentId || 'N/A'}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Payment Status:</td><td style="text-align: right; font-weight: bold; color: ${isFull ? '#059669' : '#d97706'}; text-transform: uppercase;">${booking.paymentStatus}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="text-align: right; font-weight: bold; color: #059669; font-size: 16px;">${amountPaidStr}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Total Estimated Fare:</td><td style="text-align: right; font-weight: bold;">${totalFareStr}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Balance Due to Driver:</td><td style="text-align: right; font-weight: bold; color: #dc2626;">${balanceDueStr}</td></tr>
              </table>
            </div>

            <h4 style="color: #0f172a; margin-bottom: 8px;">Trip Overview</h4>
            <p style="margin: 4px 0;"><strong>Pickup:</strong> ${booking.pickupLocation}</p>
            <p style="margin: 4px 0;"><strong>Drop:</strong> ${booking.dropLocation}</p>
            <p style="margin: 4px 0;"><strong>Pickup Date & Time:</strong> ${new Date(booking.pickupDateTime).toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${booking.vehicleName || 'Cab'}</p>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 2px 0;">Pi-Pip-Pip Cab Service • Customer Care: +91 6201901834</p>
              <p style="margin: 2px 0;">Email: yashiadarsh2020@gmail.com</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Payment receipt email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send payment receipt email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

