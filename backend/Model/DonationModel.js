const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donationSchema = new Schema({
  donorName: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120,
    set: (v) => typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
  },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.[\S]+$/, 'Please enter a valid email'] 
  },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true, enum: ['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Other'] },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes are already defined in the schema fields above

module.exports = mongoose.model("Donation", donationSchema);


