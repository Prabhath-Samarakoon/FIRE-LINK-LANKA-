const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefillOrderSchema = new Schema({
  vehicleId: { type: String, required: true },
  vehicleName: { type: String, required: true },
  mode: { type: String, enum: ['Amount', 'Full'], required: true },
  pricePerLiter: { type: Number, required: true, min: 0 },
  liters: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RefillOrderSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('RefillOrder', RefillOrderSchema);
