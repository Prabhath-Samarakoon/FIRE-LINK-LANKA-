const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Maintenance Request Schema
const MaintenanceRequestSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  // Allow free-form vehicle identifiers so UI can work without ObjectId
  vehicleId: {
    type: String,
    required: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  
  // Issue Details
  issue: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Engine', 'Electrical', 'Hydraulic', 'Body', 'Equipment', 'Tires', 'Other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Status Tracking
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  // Request Details
  requestedBy: {
    type: String,
    required: true
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  
  // Approval & Assignment
  approvedBy: String,
  approvedDate: Date,
  assignedTo: String, // Maintenance team member
  estimatedCost: Number,
  estimatedDuration: Number, // in hours
  
  // Progress Tracking
  startDate: Date,
  completedDate: Date,
  actualCost: Number,
  actualDuration: Number, // in hours
  
  // Additional Information
  symptoms: String,
  diagnosis: String,
  solution: String,
  partsReplaced: [String],
  notes: String,
  
  // Attachments
  images: [String], // URLs to uploaded images
  documents: [String] // URLs to uploaded documents
});

// Export model
module.exports = mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
