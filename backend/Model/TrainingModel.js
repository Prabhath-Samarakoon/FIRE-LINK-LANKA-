const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainingSchema = new Schema({
    type: {
        type: String,
        enum: ["practical", "theoretical"],
        required: true
    },
    part: {
        type: String,
        required: true
    },
    level: {
        type: String,
        default: "N/A"
    },
    assignedTo: [{
        type: String
    }],
    assignedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "Cancelled"],
        default: "Active"
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Training", trainingSchema);


