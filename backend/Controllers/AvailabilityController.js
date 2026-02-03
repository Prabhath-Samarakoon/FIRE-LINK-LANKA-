const Availability = require("../Model/AvailabilityModel");

const getAllAvailability = async (req, res, next) => {
    let availability;
    try {
        availability = await Availability.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching availability", error: err.message });
    }

    if (!availability) {
        return res.status(404).json({ message: "No availability records found" });
    }

    return res.status(200).json({ availability });
};

const updateAvailabilityStatus = async (req, res, next) => {
    const { userId, status } = req.body;

    let availability;
    try {
        // Find existing availability record or create new one
        availability = await Availability.findOneAndUpdate(
            { userId },
            { userId, status },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating availability", error: err.message });
    }

    if (!availability) {
        return res.status(500).json({ message: "Unable to update availability" });
    }
    return res.status(200).json({ availability });
};

const getAvailabilityByUserId = async (req, res, next) => {
    const userId = req.params.userId;

    let availability;
    try {
        availability = await Availability.findOne({ userId });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching availability", error: err.message });
    }

    if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
    }

    return res.status(200).json({ availability });
};

exports.getAllAvailability = getAllAvailability;
exports.updateAvailabilityStatus = updateAvailabilityStatus;
exports.getAvailabilityByUserId = getAvailabilityByUserId;
