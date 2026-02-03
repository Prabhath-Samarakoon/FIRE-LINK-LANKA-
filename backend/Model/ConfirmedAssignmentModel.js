const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConfirmedAssignmentSchema = new Schema({
  emergencyId: {
    type: String,
    required: true,
    index: true
  },
  incidentId: {
    type: String,
    required: false
  },
  confirmedBy: {
    type: String,
    required: true,
    enum: ['Station Officer'],
    default: 'Station Officer'
  },
  confirmedAt: {
    type: Date,
    default: Date.now
  },
  selectedVehicles: [{
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
    }]
  }],
  selectedEquipment: [{
    equipmentName: String,
    equipmentCategory: String,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  deploymentStatus: {
    type: String,
    enum: ['Confirmed', 'Deploying', 'Deployed', 'On Scene', 'Returning', 'Completed'],
    default: 'Confirmed'
  },
  deploymentNotes: String,
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
ConfirmedAssignmentSchema.index({ emergencyId: 1, status: 1 });
ConfirmedAssignmentSchema.index({ confirmedAt: -1 });
ConfirmedAssignmentSchema.index({ deploymentStatus: 1 });

module.exports = mongoose.model("ConfirmedAssignment", ConfirmedAssignmentSchema);
