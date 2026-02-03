const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Emergency Assignment Schema
const EmergencyAssignmentSchema = new Schema({
  emergencyId: {
    type: String,
    required: true,
    unique: true
  },
  emergencyType: {
    type: String,
    required: true,
    enum: ['Fire', 'Rescue', 'Medical', 'Hazardous Material', 'Vehicle Accident']
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: true
  },
  
  // Vehicle Assignment
  assignedVehicles: [{
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    vehicleName: String,
    vehicleType: String,
    assignedCrew: [{
      crewMemberId: String,
      crewMemberName: String,
      role: String
    }],
    assignmentTime: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Assigned', 'En Route', 'On Scene', 'Returning', 'Completed'],
      default: 'Assigned'
    },
    equipment: [{
      equipmentName: String,
      equipmentCategory: String,
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // Emergency Status
  status: {
    type: String,
    required: true,
    enum: ['Active', 'In Progress', 'Resolved', 'Cancelled'],
    default: 'Active'
  },
  
  // Timestamps
  reportedAt: {
    type: Date,
    default: Date.now
  },
  assignedAt: Date,
  resolvedAt: Date,
  
  // Additional Details
  reporterName: String,
  reporterPhone: String,
  estimatedDuration: Number, // in minutes
  actualDuration: Number, // in minutes
  notes: String
});

// Export model
module.exports = mongoose.model("EmergencyAssignment", EmergencyAssignmentSchema);
