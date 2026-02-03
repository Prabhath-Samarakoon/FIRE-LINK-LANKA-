const ConfirmedAssignment = require("../Model/ConfirmedAssignmentModel");
const EmergencyAssignment = require("../Model/EmergencyAssignmentModel");

// Create confirmed assignment (Station Officer confirms incident)
const createConfirmedAssignment = async (req, res, next) => {
  try {
    const {
      emergencyId,
      incidentId,
      selectedVehicles,
      selectedEquipment,
      location,
      priority,
      deploymentNotes
    } = req.body;

    // Validate required fields
    if (!emergencyId || !selectedVehicles || !location) {
      return res.status(400).json({
        message: "Missing required fields: emergencyId, selectedVehicles, location"
      });
    }

    // Check if assignment already exists for this emergency
    const existingAssignment = await ConfirmedAssignment.findOne({
      emergencyId,
      status: 'Active'
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "Assignment already confirmed for this emergency"
      });
    }

    // Create new confirmed assignment
    const confirmedAssignment = new ConfirmedAssignment({
      emergencyId,
      incidentId,
      confirmedBy: 'Station Officer',
      selectedVehicles,
      selectedEquipment: selectedEquipment || [],
      location,
      priority: priority || 'Medium',
      deploymentNotes,
      deploymentStatus: 'Confirmed'
    });

    await confirmedAssignment.save();

    // Emit real-time update to Vehicle Officers
    const io = req.app.get('io');
    if (io) {
      io.emit('assignmentConfirmed', {
        assignmentId: confirmedAssignment._id,
        emergencyId,
        incidentId,
        selectedVehicles,
        selectedEquipment,
        location,
        priority,
        confirmedAt: confirmedAssignment.confirmedAt,
        confirmedBy: 'Station Officer'
      });
    }

    return res.status(201).json({
      message: "Assignment confirmed successfully",
      assignment: confirmedAssignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error confirming assignment" });
  }
};

// Get confirmed assignments for Vehicle Officer map
const getConfirmedAssignmentsForMap = async (req, res, next) => {
  try {
    // Get active confirmed assignments from the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const assignments = await ConfirmedAssignment.find({
      status: 'Active',
      confirmedAt: { $gte: twoMinutesAgo }
    })
      .populate('selectedVehicles.vehicleId', 'name Vtype status location')
      .sort({ confirmedAt: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Confirmed assignments retrieved successfully",
      assignments,
      count: assignments.length
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching confirmed assignments" });
  }
};

// Update deployment status (Vehicle Officer updates vehicle status)
const updateDeploymentStatus = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { deploymentStatus, deploymentNotes } = req.body;

    const assignment = await ConfirmedAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.deploymentStatus = deploymentStatus;
    if (deploymentNotes) {
      assignment.deploymentNotes = deploymentNotes;
    }

    await assignment.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('deploymentStatusUpdated', {
        assignmentId,
        deploymentStatus,
        deploymentNotes,
        updatedAt: assignment.updatedAt
      });
    }

    return res.status(200).json({
      message: "Deployment status updated successfully",
      assignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating deployment status" });
  }
};

// Complete assignment
const completeAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ConfirmedAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.status = 'Completed';
    assignment.deploymentStatus = 'Completed';
    await assignment.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('assignmentCompleted', {
        assignmentId,
        completedAt: assignment.updatedAt
      });
    }

    return res.status(200).json({
      message: "Assignment completed successfully",
      assignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error completing assignment" });
  }
};

// Clear old confirmed assignments (older than specified minutes)
const clearOldConfirmedAssignments = async (req, res, next) => {
  try {
    const { olderThanMinutes = 1 } = req.body;
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    const result = await ConfirmedAssignment.deleteMany({
      confirmedAt: { $lt: cutoffTime }
    });

    console.log(`Cleared ${result.deletedCount} old confirmed assignments (older than ${olderThanMinutes} minute(s))`);

    return res.status(200).json({
      message: `Old confirmed assignments cleared successfully (older than ${olderThanMinutes} minute(s))`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error clearing old confirmed assignments" });
  }
};

// Clear all confirmed assignments (for logout/refresh)
const clearAllConfirmedAssignments = async (req, res, next) => {
  try {
    const result = await ConfirmedAssignment.deleteMany({});
    
    console.log(`Cleared all ${result.deletedCount} confirmed assignments`);

    return res.status(200).json({
      message: "All confirmed assignments cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error clearing all confirmed assignments" });
  }
};

module.exports = {
  createConfirmedAssignment,
  getConfirmedAssignmentsForMap,
  updateDeploymentStatus,
  completeAssignment,
  clearOldConfirmedAssignments,
  clearAllConfirmedAssignments
};
