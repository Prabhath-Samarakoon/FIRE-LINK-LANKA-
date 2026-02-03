const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Persist assigned vehicle type IDs per incident key (e.g., callId)
const VehicleSelectionSchema = new Schema({
  incidentKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleTypeIds: {
    type: [String],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

VehicleSelectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("VehicleSelection", VehicleSelectionSchema);


