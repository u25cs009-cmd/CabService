import express from 'express';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';
import { optionalCustomer } from '../middleware/authCustomer.js';

const router = express.Router();

/**
 * GET /api/customer/company-status
 * Checks if the logged in customer belongs to an active corporate company
 */
router.get('/customer-status', optionalCustomer, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: true, isCorporate: false, company: null });
    }

    const company = await Company.findOne({
      'approvedEmployees.user': req.user._id,
      isActive: true
    });

    if (!company) {
      return res.json({ success: true, isCorporate: false, company: null });
    }

    const empInfo = company.approvedEmployees.find((e) => e.user.equals(req.user._id));

    res.json({
      success: true,
      isCorporate: true,
      company: {
        _id: company._id,
        name: company.name,
        employeeId: empInfo?.employeeId || '',
        costCenter: empInfo?.costCenter || ''
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ADMIN COMPANY ENDPOINTS
 */
router.use(requireAdmin);

// GET /api/admin/companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.find().populate('approvedEmployees.user', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/companies
router.post('/', async (req, res, next) => {
  try {
    const { name, gstNumber, billingAddress, contactPerson, creditTermsDays } = req.body;
    if (!name || !billingAddress || !contactPerson?.email) {
      return res.status(400).json({ success: false, message: 'Company name, billing address, and contact email are required.' });
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company with this name already exists.' });
    }

    const company = new Company({
      name: name.trim(),
      gstNumber: gstNumber || '',
      billingAddress: billingAddress.trim(),
      contactPerson,
      creditTermsDays: Number(creditTermsDays) || 30
    });
    await company.save();

    res.status(201).json({ success: true, message: 'Corporate company account created successfully', data: company });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/companies/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndUpdate(id, req.body, { new: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }
    res.json({ success: true, message: 'Company updated successfully', data: company });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/companies/:id/employees - Link employee email to company
router.post('/:id/employees', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userEmail, employeeId, costCenter } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Employee user email is required.' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }

    const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: `No user account found with email: ${userEmail}` });
    }

    // Check if employee already linked
    const alreadyLinked = company.approvedEmployees.some((e) => e.user.equals(user._id));
    if (alreadyLinked) {
      return res.status(400).json({ success: false, message: 'User is already linked to this corporate account.' });
    }

    company.approvedEmployees.push({
      user: user._id,
      employeeId: employeeId || '',
      costCenter: costCenter || ''
    });

    await company.save();
    res.json({ success: true, message: `Employee ${user.name} linked to corporate account.`, data: company });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/companies/:id/employees/:userId - Remove employee link
router.delete('/:id/employees/:userId', async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }

    company.approvedEmployees = company.approvedEmployees.filter((e) => !e.user.equals(userId));
    await company.save();

    res.json({ success: true, message: 'Employee unlinked successfully.', data: company });
  } catch (error) {
    next(error);
  }
});

export default router;
