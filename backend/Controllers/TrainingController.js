const Training = require("../Model/TrainingModel");

const getAllTrainings = async (req, res, next) => {
    let trainings;
    try {
        trainings = await Training.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching trainings", error: err.message });
    }

    if (!trainings) {
        return res.status(404).json({ message: "No trainings found" });
    }

    return res.status(200).json({ trainings });
};

const addTraining = async (req, res, next) => {
    const { type, part, level = "N/A", assignedTo = [], assignedDate, status = "Active", notes = "" } = req.body;

    let training;
    try {
        training = new Training({ type, part, level, assignedTo, assignedDate, status, notes });
        await training.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error adding training", error: err.message });
    }

    if (!training) {
        return res.status(500).json({ message: "Unable to add training" });
    }
    return res.status(200).json({ training });
};

const getTrainingById = async (req, res, next) => {
    const id = req.params.id;

    let training;
    try {
        training = await Training.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching training", error: err.message });
    }

    if (!training) {
        return res.status(404).json({ message: "Training not found" });
    }

    return res.status(200).json({ training });
};

const updateTraining = async (req, res, next) => {
    const id = req.params.id;
    const { type, part, level = "N/A", assignedTo = [], assignedDate, status, notes } = req.body;

    let training;
    try {
        training = await Training.findByIdAndUpdate(id, { type, part, level, assignedTo, assignedDate, status, notes }, { new: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating training", error: err.message });
    }
    if (!training) {
        return res.status(404).json({ message: "Unable to Update Training details" });
    }
    return res.status(200).json({ training });
};

const deleteTraining = async (req, res, next) => {
    const id = req.params.id;

    let training;
    try {
        training = await Training.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error deleting training", error: err.message });
    }
    if (!training) {
        return res.status(404).json({ message: "Unable to Delete Training details" });
    }
    return res.status(200).json({ message: "Training deleted successfully" });
};

exports.getAllTrainings = getAllTrainings;
exports.addTraining = addTraining;
exports.getTrainingById = getTrainingById;
exports.updateTraining = updateTraining;
exports.deleteTraining = deleteTraining;


