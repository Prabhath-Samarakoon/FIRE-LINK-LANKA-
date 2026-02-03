const express = require("express");
const router = express.Router();
const TrainingController = require("../Controllers/TrainingController");

// Route to get all trainings
router.get("/", TrainingController.getAllTrainings);
// Route to add a new training
router.post("/", TrainingController.addTraining);
// Route to get a training by ID
router.get("/:id", TrainingController.getTrainingById);
// Route to update training details
router.put("/:id", TrainingController.updateTraining);
// Route to delete a training
router.delete("/:id", TrainingController.deleteTraining);

module.exports = router;


