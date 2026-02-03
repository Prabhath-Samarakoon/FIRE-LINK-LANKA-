const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availabilitySchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'onduty', 'resting'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Availability", availabilitySchema);
