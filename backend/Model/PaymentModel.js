const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['salary', 'overtime', 'bonus', 'allowance', 'deduction', 'advance']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR']
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  payPeriod: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque', 'digital_wallet'],
    default: 'bank_transfer'
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchName: String
  },
  description: {
    type: String,
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ staffId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Virtual for payment period duration
paymentSchema.virtual('periodDuration').get(function() {
  if (this.payPeriod && this.payPeriod.startDate && this.payPeriod.endDate) {
    const start = new Date(this.payPeriod.startDate);
    const end = new Date(this.payPeriod.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }
  return 'N/A';
});

// Method to calculate total for a staff member
paymentSchema.statics.getTotalForStaff = async function(staffId, startDate, endDate) {
  const query = { staffId, isActive: true };
  
  if (startDate && endDate) {
    query.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Method to get payment summary by type
paymentSchema.statics.getPaymentSummary = async function(staffId, startDate, endDate) {
  const query = { staffId, isActive: true };
  
  if (startDate && endDate) {
    query.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: query },
    { 
      $group: { 
        _id: '$paymentType', 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      } 
    },
    { $sort: { total: -1 } }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
