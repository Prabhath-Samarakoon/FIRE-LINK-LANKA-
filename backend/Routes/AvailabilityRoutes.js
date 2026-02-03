const express = require("express");
const router = express.Router();
const AvailabilityController = require("../Controllers/AvailabilityController");

// Route to get all availability records
router.get("/", AvailabilityController.getAllAvailability);
// Route to update availability status
router.put("/status", AvailabilityController.updateAvailabilityStatus);
// Route to get availability by user ID
router.get("/:userId", AvailabilityController.getAvailabilityByUserId);

module.exports = router;
