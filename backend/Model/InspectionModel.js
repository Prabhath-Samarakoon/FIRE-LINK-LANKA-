const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inspectionSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  inspectorName: {
    type: String,
    required: true
  },
  inspectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  condition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor', 'Out of Service', 'Missing'],
    required: true
  },
  notes: {
    type: String,
    required: false,
    default: ""
  },
  nextInspectionDate: {
    type: Date,
    required: false
  },
  isMissing: {
    type: Boolean,
    required: false,
    default: false
  },
  isPassed: {
    type: Boolean,
    required: true,
    default: true
  },
  issues: [{
    description: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Inspection", inspectionSchema);
