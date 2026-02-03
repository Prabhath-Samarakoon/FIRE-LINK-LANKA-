const Schedule = require("../Model/ScheduleModel");

const getAllSchedules = async (req, res, next) => {
    let schedules;
    try {
        schedules = await Schedule.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching schedules", error: err.message });
    }

    if (!schedules) {
        return res.status(404).json({ message: "No schedules found" });
    }

    return res.status(200).json({ 
        success: true,
        message: "Schedules retrieved successfully",
        data: schedules,
        count: schedules.length
    });
};

const addSchedule = async (req, res, next) => {
    const { userId, date, startTime, endTime, shiftType, position, notes } = req.body;

    let schedule;
    try {
        schedule = new Schedule({ userId, date, startTime, endTime, shiftType, position, notes });
        await schedule.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error adding schedule", error: err.message });
    }

    if (!schedule) {
        return res.status(500).json({ message: "Unable to add schedule" });
    }
    return res.status(201).json({ 
        success: true,
        message: "Schedule created successfully",
        data: schedule
    });
};

const getScheduleById = async (req, res, next) => {
    const id = req.params.id;

    let schedule;
    try {
        schedule = await Schedule.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching schedule", error: err.message });
    }

    if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
    }

    return res.status(200).json({ 
        success: true,
        message: "Schedule retrieved successfully",
        data: schedule
    });
};

const updateSchedule = async (req, res, next) => {
    const id = req.params.id;
    const { userId, date, startTime, endTime, shiftType, position, notes } = req.body;

    let schedule;
    try {
        schedule = await Schedule.findByIdAndUpdate(id, { userId, date, startTime, endTime, shiftType, position, notes }, { new: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating schedule", error: err.message });
    }
    if (!schedule) {
        return res.status(404).json({ message: "Unable to Update Schedule details" });
    }
    return res.status(200).json({ 
        success: true,
        message: "Schedule updated successfully",
        data: schedule
    });
};

const deleteSchedule = async (req, res, next) => {
    const id = req.params.id;

    let schedule;
    try {
        schedule = await Schedule.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error deleting schedule", error: err.message });
    }
    if (!schedule) {
        return res.status(404).json({ message: "Unable to Delete Schedule details" });
    }
    return res.status(200).json({ 
        success: true,
        message: "Schedule deleted successfully"
    });
};

exports.getAllSchedules = getAllSchedules;
exports.addSchedule = addSchedule;
exports.getScheduleById = getScheduleById;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
