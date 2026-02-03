const express = require("express");
const router = express.Router();
const ScheduleController = require("../Controllers/ScheduleController");

// Route to get all schedules
router.get("/", ScheduleController.getAllSchedules);
// Route to add a new schedule
router.post("/", ScheduleController.addSchedule);
// Route to get a schedule by ID
router.get("/:id", ScheduleController.getScheduleById);
// Route to update schedule details
router.put("/:id", ScheduleController.updateSchedule);
// Route to delete a schedule
router.delete("/:id", ScheduleController.deleteSchedule);

module.exports = router;
