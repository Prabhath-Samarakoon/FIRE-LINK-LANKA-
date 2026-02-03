const express = require("express");
const router = express.Router();
const IncidentController = require("../Controllers/IncidentControllers");

// Get all incidents with pagination and filtering
router.get("/", IncidentController.getAllIncidents);

// Get incident statistics
router.get("/stats", IncidentController.getIncidentStats);

// Search incidents
router.get("/search", IncidentController.searchIncidents);

// Get incident by ID
router.get("/:id", IncidentController.getIncidentById);

// Create new incident
router.post("/", IncidentController.createIncident);

// Update incident
router.put("/:id", IncidentController.updateIncident);

// Update incident status
router.patch("/:id/status", IncidentController.updateIncidentStatus);

// Delete incident
router.delete("/:id", IncidentController.deleteIncident);

module.exports = router;
