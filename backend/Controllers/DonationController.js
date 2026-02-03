const Donation = require("../Model/DonationModel");

const listDonations = async (req, res) => {
  try {
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving donations", error: error.message });
  }
};

const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.status(200).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving donation", error: error.message });
  }
};

const normalizeName = (v) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v;

const createDonation = async (req, res) => {
  try {
    const { donorName, email, paymentMethod, amount, date, sendEmail } = req.body;

    if (!donorName || !email || amount === undefined || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Required fields: donorName, email, amount, paymentMethod' });
    }

    const normalized = {
      donorName: normalizeName(String(donorName)),
      email: String(email).trim().toLowerCase(),
      paymentMethod: String(paymentMethod).trim(),
      amount: Number(amount),
      date: date ? new Date(date) : new Date()
    };

    if (!/^\S+@\S+\.[\S]+$/.test(normalized.email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!Number.isFinite(normalized.amount) || normalized.amount < 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' });
    }

    // Duplicate checks removed - allow multiple donations with same email/name

    const donation = new Donation(normalized);
    await donation.save();

    // Send email notification if requested
    console.log('🔍 Email check:', { sendEmail, hasSendEmail: !!sendEmail, trimmed: sendEmail?.trim() });
    if (sendEmail && sendEmail.trim() !== '') {
      try {
        console.log(`📧 Sending donation notification to: ${sendEmail}`);
        
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'shanukaw28@gmail.com',
            pass: 'mhad ghda pgdq glkn'
          }
        });

        const mailOptions = {
          from: 'shanukaw28@gmail.com',
          to: sendEmail,
          subject: `Donation Receipt - ${normalized.donorName} | FireLink Lanka`,
          text: `
Thank you for your generous donation to FireLink Lanka!

Donation Details:
- Donor: ${normalized.donorName}
- Amount: LKR ${normalized.amount.toLocaleString()}
- Payment Method: ${normalized.paymentMethod}
- Date: ${new Date(normalized.date).toLocaleDateString()}
- Donation ID: ${donation._id}

Your contribution helps us maintain our emergency response capabilities and serve the community better.

FireLink Lanka - Professional Emergency Response Management
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Donation email sent successfully to: ${sendEmail}`);
      } catch (emailError) {
        console.error(`❌ Failed to send donation email to ${sendEmail}:`, emailError.message);
        console.error('Full email error:', emailError);
        // Don't fail the donation creation if email fails
      }
    } else {
      console.log('📧 No email to send - sendEmail field is empty or not provided');
    }

    res.status(201).json({ success: true, donation });
  } catch (error) {
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({ success: false, message: `${key} already exists` });
    }
    res.status(500).json({ success: false, message: "Error creating donation", error: error.message });
  }
};

const updateDonation = async (req, res) => {
  try {
    const id = req.params.id;
    const update = {};
    if (req.body.donorName !== undefined) update.donorName = normalizeName(String(req.body.donorName));
    if (req.body.email !== undefined) update.email = String(req.body.email).trim().toLowerCase();
    if (req.body.paymentMethod !== undefined) update.paymentMethod = String(req.body.paymentMethod).trim();
    if (req.body.amount !== undefined) {
      const amt = Number(req.body.amount);
      if (!Number.isFinite(amt) || amt < 0) return res.status(400).json({ success: false, message: 'Amount must be a non-negative number' });
      update.amount = amt;
    }
    if (req.body.date !== undefined) update.date = new Date(req.body.date);
    update.updatedAt = new Date();

    // Duplicate checks removed - allow multiple donations with same email/name

    const donation = await Donation.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.status(200).json({ success: true, donation });
  } catch (error) {
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({ success: false, message: `${key} already exists` });
    }
    res.status(500).json({ success: false, message: "Error updating donation", error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.status(200).json({ success: true, message: 'Donation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting donation", error: error.message });
  }
};

const clearDonations = async (_req, res) => {
  try {
    const result = await Donation.deleteMany({});
    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error clearing donations", error: error.message });
  }
};

module.exports = { listDonations, getDonation, createDonation, updateDonation, deleteDonation, clearDonations };


