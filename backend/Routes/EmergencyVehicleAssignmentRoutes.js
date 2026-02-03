const express = require("express");
const router = express.Router();

// Controller
const EmergencyVehicleAssignmentController = require("../Controllers/EmergencyVehicleAssignmentController");

// Vehicle Assignment Routes
router.post("/", EmergencyVehicleAssignmentController.createVehicleAssignment);
router.get("/", EmergencyVehicleAssignmentController.getAllVehicleAssignments);
router.get("/emergency/:emergencyId", EmergencyVehicleAssignmentController.getVehicleAssignmentsByEmergency);
router.get("/station-officer", EmergencyVehicleAssignmentController.getAssignmentsForStationOfficer);
router.put("/:assignmentId/status", EmergencyVehicleAssignmentController.updateVehicleAssignmentStatus);
router.put("/:assignmentId/equipment", EmergencyVehicleAssignmentController.addEquipmentToAssignment);
router.delete("/clear-old", EmergencyVehicleAssignmentController.clearOldAssignments);
router.delete("/clear-all", EmergencyVehicleAssignmentController.clearAllAssignments);
router.delete("/:assignmentId", EmergencyVehicleAssignmentController.deleteVehicleAssignment);

module.exports = router;
