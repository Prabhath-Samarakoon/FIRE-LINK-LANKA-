const express = require("express");
const router = express.Router();

// Controller
const EmergencyAssignmentController = require("../Controllers/EmergencyAssignmentController");

// Basic CRUD Routes
router.get("/", EmergencyAssignmentController.getAllEmergencyAssignments);
router.post("/add", EmergencyAssignmentController.addEmergencyAssignment);
router.get("/staff-assignments", EmergencyAssignmentController.getEmergencyStaffAssignments);
router.get("/:id", EmergencyAssignmentController.getById);
router.put("/:id", EmergencyAssignmentController.updateEmergencyAssignment);
router.delete("/:id", EmergencyAssignmentController.deleteEmergencyAssignment);

// Special Routes
router.post("/assign-vehicle", EmergencyAssignmentController.assignVehicle);
router.put("/update-status", EmergencyAssignmentController.updateStatus);
router.post("/assign-vehicle-to-emergency", EmergencyAssignmentController.assignVehicleToEmergency);
router.get("/assigned-vehicle-types/:emergencyId", EmergencyAssignmentController.getAssignedVehicleTypes);

// Assigned vehicle type IDs persistence (per incident)
router.post("/assigned-vehicle-types", EmergencyAssignmentController.setAssignedVehicleTypes);
router.get("/assigned-vehicle-types/:incidentKey", EmergencyAssignmentController.getAssignedVehicleTypes);

module.exports = router;
