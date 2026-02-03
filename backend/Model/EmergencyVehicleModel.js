const mongoose = require('mongoose');

const emergencyVehicleSchema = new mongoose.Schema({
  assignedVehicles: [{
    vehicleName: {
      type: String,
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('EmergencyVehicle', emergencyVehicleSchema);
