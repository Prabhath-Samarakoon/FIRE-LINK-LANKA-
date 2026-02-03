const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['Inventory', 'Inspection', 'Donation', 'General'] },
  description: { type: String, required: false, default: "" },
  status: { type: String, enum: ['Draft', 'Generated', 'Published'], default: 'Draft' },
  generatedBy: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed, required: false },
  filePath: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
