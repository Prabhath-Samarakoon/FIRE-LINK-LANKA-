const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define Vehicle schema based on actual data structure
const VehicleSchema = new Schema({
  // Basic Information
  vehicleId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'Vehicle ID must contain only uppercase letters, numbers, and hyphens'],
    minlength: 3,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  Vtype: {
    type: String,
    required: true,
    enum: ['Fire Truck', 'Water Tanker', 'Rescue Vehicle', 'Command Vehicle', 'Ambulance', 'Police Car', 'Ladder Truck', 'Hazmat Vehicle', 'Medical Response Unit', 'Search & Rescue Vehicle']
  },
  maxCrew: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  Capacity: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Vehicle Status & Availability
  status: {
    type: String,
    required: true,
    enum: ['Available', 'On Call', 'Under Maintenance', 'Out of Service'],
    default: 'Available'
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
  
  // Emergency Assignments
  emergencyAssignments: [{
    emergencyId: String,
    emergencyType: String,
    location: String,
    assignedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active'
    }
  }],
  
  // Water & Fuel Management
  fuelLevel: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
    default: 100
  },
  waterLevel: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
    default: 100
  },
  fuelType: {
    type: String,
    required: false,
    enum: ['Diesel', 'Petrol', 'Electric'],
    default: 'Diesel'
  },
  waterCapacity: {
    type: Number,
    required: false,
    min: 0,
    default: 2000
  },
  
  // Maintenance & Condition
  maintenanceStatus: {
    type: String,
    required: false,
    enum: ['Good', 'Needs Attention', 'Under Repair', 'Critical'],
    default: 'Good'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date,
    default: Date.now
  },
  
  // Maintenance History
  maintenanceHistory: [{
    requestId: String,
    issue: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    requestedDate: {
      type: Date,
      default: Date.now
    },
    completedDate: Date,
    notes: String
  }],
  
  // Vehicle Details
  condition: {
    type: String,
    required: false,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
    default: new Date().getFullYear()
  },
  fuelConsumption: {
    type: String,
    default: ''
  },
  engineCapacity: {
    type: String,
    default: ''
  },
  imagePath: {
    type: String,
    default: null
  },
  
  // Trip Meter Data
  tripA: {
    type: Number,
    default: 0.000,
    min: 0
  },
  tripB: {
    type: Number,
    default: 200.000, // Starting odometer reading for Trip B
    min: 0
  },
  tripC: {
    type: Number,
    default: 1000.000, // Trip C starts at 1000 km
    min: 0
  },
  
  // Deployment History
  deploymentHistory: [{
    deploymentId: String,
    distance: Number, // Distance in km
    origin: {
      lat: Number,
      lng: Number,
      address: String
    },
    destination: {
      lat: Number,
      lng: Number,
      address: String
    },
    deployedAt: {
      type: Date,
      default: Date.now
    },
    returnedAt: Date,
    status: {
      type: String,
      enum: ['Deployed', 'Returned', 'In Progress'],
      default: 'Deployed'
    }
  }],
  
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

// Update timestamp on save
VehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export model
module.exports = mongoose.model("Vehicle", VehicleSchema);
