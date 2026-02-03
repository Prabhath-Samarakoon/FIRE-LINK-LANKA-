const express = require("express");
const router = express.Router();

// Controller
const ConfirmedAssignmentController = require("../Controllers/ConfirmedAssignmentController");

// Confirmed Assignment Routes
router.post("/", ConfirmedAssignmentController.createConfirmedAssignment);
router.get("/map", ConfirmedAssignmentController.getConfirmedAssignmentsForMap);
router.put("/:assignmentId/status", ConfirmedAssignmentController.updateDeploymentStatus);
router.put("/:assignmentId/complete", ConfirmedAssignmentController.completeAssignment);
router.delete("/clear-old", ConfirmedAssignmentController.clearOldConfirmedAssignments);
router.delete("/clear-all", ConfirmedAssignmentController.clearAllConfirmedAssignments);

module.exports = router;
