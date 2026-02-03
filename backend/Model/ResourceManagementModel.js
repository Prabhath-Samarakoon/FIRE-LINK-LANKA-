const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsumptionSchema = new Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Refill', 'Consumption', 'Adjustment', 'Other'], default: 'Other' },
  notes: String
}, { _id: false });

const ResourceManagementSchema = new Schema({
  // Allow free-form vehicle identifiers so UI can work without ObjectId
  vehicleId: { type: String, required: true },
  vehicleName: { type: String },

  // Fuel
  fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Electric', 'Other'], default: 'Diesel' },
  fuelCapacity: { type: Number, default: 0 },
  currentFuelLevel: { type: Number, default: 0 },
  fuelAlertThreshold: { type: Number, default: 10 },
  lastFuelRefill: Date,
  nextFuelRefill: Date,
  fuelConsumption: [ConsumptionSchema],

  // Water
  waterCapacity: { type: Number, default: 0 },
  currentWaterLevel: { type: Number, default: 0 },
  waterAlertThreshold: { type: Number, default: 10 },
  lastWaterRefill: Date,
  nextWaterRefill: Date,
  waterConsumption: [ConsumptionSchema],

  // General
  status: { type: String, enum: ['Ready', 'Low Fuel', 'Low Water', 'Needs Attention'], default: 'Ready' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResourceManagementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ResourceManagement', ResourceManagementSchema);
