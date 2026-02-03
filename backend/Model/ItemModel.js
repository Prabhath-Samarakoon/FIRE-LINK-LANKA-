const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  itemID: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categorySlug: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  condition: {
    type: String,
    enum: ['Pending Inspection', 'Good', 'Fair', 'Poor', 'Out of Service'],
    required: true,
    default: 'Pending Inspection'
  },
  serialNumber: {
    type: String,
    required: false,
    default: "",
    unique: false
  },
  assignedToVehicle: {
    type: String,
    required: false,
    default: ""
  },
  location: {
    type: String,
    required: false,
    default: "Station"
  },
  lastInspection: {
    type: Date,
    required: false
  },
  nextInspection: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    required: false,
    default: ""
  },
  model: {
    type: String,
    required: false,
    default: ""
  },
  brand: {
    type: String,
    required: false,
    default: ""
  },
  subcategory: {
    type: String,
    required: false,
    default: ""
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Item", itemSchema);
