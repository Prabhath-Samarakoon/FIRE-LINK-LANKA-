const Payment = require('../Model/PaymentModel');
const User = require('../Model/UserModel');
const mongoose = require('mongoose');

// Create a new payment record
const createPayment = async (req, res) => {
  try {
    const {
      staffId,
      paymentType,
      amount,
      currency,
      paymentDate,
      payPeriod,
      paymentMethod,
      bankDetails,
      description,
      notes,
      email
    } = req.body;

    // Validate required fields
    if (!staffId || !paymentType || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID, payment type, amount, and description are required'
      });
    }

    // Check if staff exists
    let staff;
    try {
      staff = await User.findById(staffId);
    } catch (error) {
      console.error('Error finding staff:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID format'
      });
    }
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Create payment record
    const paymentData = {
      staffId,
      staffName: staff.name,
      paymentType,
      amount: parseFloat(amount),
      currency: currency || 'LKR',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || 'bank_transfer',
      description,
      notes: notes || '',
      status: 'paid'
    };

    // Only add payPeriod if it exists and has valid dates
    if (payPeriod && payPeriod.startDate && payPeriod.endDate) {
      paymentData.payPeriod = {
        startDate: new Date(payPeriod.startDate),
        endDate: new Date(payPeriod.endDate)
      };
    } else {
      // Set default payPeriod if not provided
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      paymentData.payPeriod = {
        startDate: startOfMonth,
        endDate: endOfMonth
      };
    }

    // Only add bankDetails if it exists
    if (bankDetails && Object.keys(bankDetails).length > 0) {
      paymentData.bankDetails = bankDetails;
    }

    const payment = new Payment(paymentData);

    const savedPayment = await payment.save();

    // Send simple email if email is provided
    if (email && email.trim() !== '') {
      try {
        console.log(`📧 Sending payment notification to: ${email}`);
        
        // Simple email sending using built-in Node.js modules
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
          to: email,
          subject: `Payment Notification - ${paymentType} | FireLink Lanka`,
          text: `
Payment Details:
- Staff: ${staff.name}
- Type: ${paymentType}
- Amount: ${currency} ${amount}
- Date: ${new Date(paymentDate).toLocaleDateString()}
- Description: ${description}
- Status: ${savedPayment.status}

FireLink Lanka - Professional Emergency Response Management
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to: ${email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${email}:`, emailError.message);
        // Don't fail the payment creation if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully',
      data: savedPayment
    });

  } catch (error) {
    console.error('Create payment error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all payments with filtering and pagination
const getAllPayments = async (req, res) => {
  try {
    console.log('Getting all payments...');
    
    // Check if MongoDB is connected
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('MongoDB database name:', mongoose.connection.name);
    
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning empty result');
      return res.status(200).json({
        success: true,
        data: {
          payments: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }
    
    const {
      page = 1,
      limit = 10,
      staffId,
      paymentType,
      status,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {}; // No filter needed since we're doing hard deletes
    
    if (staffId) filter.staffId = staffId;
    if (paymentType) filter.paymentType = paymentType;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log('Filter:', filter);

    // First, let's check if there are ANY payments in the database
    const totalPaymentsInDB = await Payment.countDocuments({});
    console.log('Total payments in database (any status):', totalPaymentsInDB);
    
    // Check payments without any filters
    const allPayments = await Payment.find({});
    console.log('All payments (no filters):', allPayments.length);
    
    if (allPayments.length > 0) {
      console.log('Sample payment:', JSON.stringify(allPayments[0], null, 2));
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments with pagination (removed populate to fix User model error)
    const payments = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found payments with filter:', payments.length);

    // Get total count
    const total = await Payment.countDocuments(filter);

    console.log('Total payments:', total);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasNext: skip + payments.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return empty result instead of error for better UX
    res.status(200).json({
      success: true,
      data: {
        payments: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update payment record
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.transactionId;
    delete updateData.paidAt;

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment record updated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete payment record (soft delete)
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting payment with ID:', id);

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      console.log('Payment not found for deletion');
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    console.log('Payment deleted successfully:', payment._id);
    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully',
      data: { deletedId: payment._id }
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve payment
const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: payment
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark payment as paid
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        transactionId,
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment marked as paid successfully',
      data: payment
    });

  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;

    const filter = { isActive: true };
    if (staffId) filter.staffId = staffId;
    if (startDate && endDate) {
      filter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get payment type breakdown
    const typeBreakdown = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalAmount: 0,
          totalPayments: 0,
          averageAmount: 0,
          pendingCount: 0,
          approvedCount: 0,
          paidCount: 0
        },
        typeBreakdown
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payments for a specific staff member
const getStaffPayments = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { staffId, isActive: true };
    if (startDate && endDate) {
      filter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(filter)
      .sort({ paymentDate: -1 });

    // Get total amount
    const total = await Payment.getTotalForStaff(staffId, startDate, endDate);

    // Get payment summary by type
    const summary = await Payment.getPaymentSummary(staffId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        payments,
        total,
        summary
      }
    });

  } catch (error) {
    console.error('Get staff payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  approvePayment,
  markAsPaid,
  getPaymentStats,
  getStaffPayments
};
