import express from 'express';
import PDFDocument from 'pdfkit';
import Invoice from '../models/Invoice.js';
import Company from '../models/Company.js';
import Booking from '../models/Booking.js';
import { requireAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();
router.use(requireAdmin);

/**
 * GET /api/admin/invoices
 */
router.get('/', async (req, res, next) => {
  try {
    const { companyId, status } = req.query;
    const query = {};
    if (companyId) query.company = companyId;
    if (status) query.status = status;

    const invoices = await Invoice.find(query).populate('company').sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/invoices/generate
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { companyId, startDate, endDate, gstPercentage = 5 } = req.body;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Company ID, start date, and end date are required.' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Find all completed corporate bookings for this company in date range
    const bookings = await Booking.find({
      company: company._id,
      status: 'completed',
      pickupDateTime: { $gte: start, $lte: end }
    });

    if (bookings.length === 0) {
      return res.status(400).json({ success: false, message: 'No completed corporate trips found for this company in the selected date range.' });
    }

    const trips = bookings.map((b) => ({
      booking: b._id,
      referenceCode: b.referenceCode,
      pickupDateTime: b.pickupDateTime,
      customerName: b.customerName,
      costCenter: b.costCenter || '',
      employeeId: b.employeeId || '',
      fare: b.estimatedFare
    }));

    const subtotal = trips.reduce((sum, t) => sum + t.fare, 0);
    const gstAmount = Math.round(subtotal * (gstPercentage / 100));
    const grandTotal = subtotal + gstAmount;

    // Generate invoice number INV-YYYY-XXXX
    const year = new Date().getFullYear();
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const creditDays = company.creditTermsDays || 30;
    const dueDate = new Date(Date.now() + creditDays * 24 * 60 * 60 * 1000);

    const invoice = new Invoice({
      invoiceNumber,
      company: company._id,
      billingPeriod: { startDate: start, endDate: end },
      trips,
      subtotal,
      gstPercentage,
      gstAmount,
      grandTotal,
      status: 'draft',
      dueDate
    });

    await invoice.save();
    res.status(201).json({ success: true, message: 'Corporate monthly invoice generated successfully', data: invoice });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/invoices/:id/pdf
 * Dynamically streams PDF document using PDFKit
 */
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('company');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // PDF Header
    doc.fontSize(20).text('TAX INVOICE - Pi-Pip-Pip Cabs', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();

    // Bill To
    doc.fontSize(12).text('BILL TO:', { underline: true });
    doc.fontSize(10).text(`Company Name: ${invoice.company.name}`);
    doc.text(`GST No: ${invoice.company.gstNumber || 'N/A'}`);
    doc.text(`Billing Address: ${invoice.company.billingAddress}`);
    doc.text(`Contact Person: ${invoice.company.contactPerson.name} (${invoice.company.contactPerson.email})`);
    doc.moveDown();

    // Table Header
    doc.fontSize(10).text('TRIP DETAILS', { underline: true });
    doc.moveDown(0.5);

    invoice.trips.forEach((t, i) => {
      const dateStr = new Date(t.pickupDateTime).toLocaleDateString();
      doc.text(`${i + 1}. Ref: ${t.referenceCode} | Date: ${dateStr} | Passenger: ${t.customerName} | Fare: ₹${t.fare}`);
    });

    doc.moveDown();
    doc.text('------------------------------------------------------------');
    doc.text(`Subtotal: ₹${invoice.subtotal}`, { align: 'right' });
    doc.text(`GST (${invoice.gstPercentage}%): ₹${invoice.gstAmount}`, { align: 'right' });
    doc.fontSize(12).text(`Grand Total: ₹${invoice.grandTotal}`, { align: 'right' });

    doc.end();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/invoices/:id/send
 * Emails PDF Invoice to company contact person
 */
router.post('/:id/send', async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('company');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass || emailPass === 'your_email_app_password') {
      return res.status(400).json({ success: false, message: 'SMTP credentials missing in .env to send email.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const mailOptions = {
      from: `"Pi-Pip-Pip Corporate Billing" <${emailUser}>`,
      to: invoice.company.contactPerson.email,
      subject: `📄 Monthly Tax Invoice #${invoice.invoiceNumber} - ${invoice.company.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Monthly Corporate Tax Invoice</h2>
          <p>Dear <strong>${invoice.company.contactPerson.name}</strong>,</p>
          <p>Please find attached your monthly ride invoice <strong>#${invoice.invoiceNumber}</strong> for ${invoice.company.name}.</p>
          <p><strong>Total Amount Due:</strong> ₹${invoice.grandTotal}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p>Thank you for partnering with Pi-Pip-Pip Cabs.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    invoice.status = 'sent';
    await invoice.save();

    res.json({ success: true, message: `Invoice #${invoice.invoiceNumber} emailed to ${invoice.company.contactPerson.email}` });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/invoices/:id
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateData = { status };

    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const invoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    res.json({ success: true, message: 'Invoice status updated', data: invoice });
  } catch (error) {
    next(error);
  }
});

export default router;
