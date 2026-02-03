const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    shiftType: {
        type: String,
        required: true,
        enum: ['Day', 'Night', '24-Hour', 'Emergency']
    },
    position: {
        type: String,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Schedule", scheduleSchema);
