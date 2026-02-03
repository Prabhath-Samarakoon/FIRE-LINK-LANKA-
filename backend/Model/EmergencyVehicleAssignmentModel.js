const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Emergency Vehicle Assignment Schema
// This table stores vehicle assignments made by vehicle officers for station officers to see
const EmergencyVehicleAssignmentSchema = new Schema({
  // Emergency/Incident Information
  emergencyId: {
    type: String,
    required: true,
    trim: true
  },
  incidentId: {
    type: String,
    required: false,
    trim: true
  },
  
  // Vehicle Information
  vehicleId: {
    type: Schema.Types.Mixed, // Allow both ObjectId and String
    required: true
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    trim: true
  },
  vehicleStatus: {
    type: String,
    enum: ['Available', 'On Call', 'Under Maintenance', 'Out of Service'],
    default: 'Available'
  },
  
  // Assignment Details
  assignedBy: {
    type: String,
    required: true,
    enum: ['Vehicle Officer', 'Station Officer', 'Admin'],
    default: 'Vehicle Officer'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  
  // Crew Assignment
  assignedCrew: [{
    crewMemberId: String,
    crewMemberName: String,
    role: String,
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Equipment Assignment (from station officer)
  assignedEquipment: [{
    equipmentName: String,
    equipmentCategory: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Assignment Status
  status: {
    type: String,
    enum: ['Assigned', 'Equipment Assigned', 'En Route', 'On Scene', 'Returning', 'Completed', 'Cancelled'],
    default: 'Assigned'
  },
  
  // Additional Information
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  notes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
EmergencyVehicleAssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
EmergencyVehicleAssignmentSchema.index({ emergencyId: 1, status: 1 });
EmergencyVehicleAssignmentSchema.index({ vehicleId: 1 });
EmergencyVehicleAssignmentSchema.index({ assignedAt: -1 });

module.exports = mongoose.model("EmergencyVehicleAssignment", EmergencyVehicleAssignmentSchema);
