const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
    callId: {
        type: String,
        required: false,
        unique: true
    },
    callerName: {
        type: String,
        required: true
    },
    callerPhone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    coordinates: {
        type: String,
        default: ""
    },
    incidentType: {
        type: String,
        enum: ['Building', 'Vehicle', 'Forest', 'HazMat'],
        required: true
    },
    hazards: [{
        type: String,
        enum: ['Gas Cylinders', 'Chemicals', 'Explosives', 'Electrical', 'Structural']
    }],
    peopleTrapped: {
        type: Number,
        default: 0,
        min: 0
    },
    injured: {
        type: Number,
        default: 0,
        min: 0
    },
    crowdSize: {
        type: String,
        enum: ['Small', 'Medium', 'Large', 'Very Large'],
        default: 'Small'
    },
    emergencyScale: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    liveNotes: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['Active', 'Dispatched', 'Resolved', 'Closed'],
        default: 'Active'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Emergency'],
        default: 'Medium'
    },
    assignedUnits: [{
        type: String
    }],
    estimatedResponseTime: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    },
    operatorNotes: {
        type: String,
        default: ""
    },
    safetyAdvice: [{
        type: String
    }],
    dispatchTime: {
        type: Date
    },
    responseTime: {
        type: Number,
        default: 0
    }
});

// Update the updatedAt field before saving
incidentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate unique call ID
incidentSchema.pre('save', function(next) {
    if (!this.callId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.callId = `#${timestamp}${random}`;
    }
    next();
});

module.exports = mongoose.model("Incident", incidentSchema);
