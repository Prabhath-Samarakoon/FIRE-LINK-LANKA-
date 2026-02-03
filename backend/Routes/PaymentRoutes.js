const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  approvePayment,
  markAsPaid,
  getPaymentStats,
  getStaffPayments
} = require('../Controllers/PaymentController');

// Create a new payment record
router.post('/', createPayment);

// Get all payments with filtering and pagination
router.get('/', getAllPayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

// Get payments for a specific staff member
router.get('/staff/:staffId', getStaffPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Update payment record
router.put('/:id', updatePayment);

// Delete payment record (soft delete)
router.delete('/:id', deletePayment);

// Approve payment
router.patch('/:id/approve', approvePayment);

// Mark payment as paid
router.patch('/:id/paid', markAsPaid);

module.exports = router;
