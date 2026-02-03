const EmergencyVehicleAssignment = require("../Model/EmergencyVehicleAssignmentModel");
const EmergencyAssignment = require("../Model/EmergencyAssignmentModel");
const Vehicle = require("../Model/VehicleModel");

// Create a new emergency vehicle assignment (from Vehicle Officer)
const createVehicleAssignment = async (req, res, next) => {
  const {
    emergencyId,
    incidentId,
    vehicleId,
    vehicleName,
    vehicleType,
    assignedCrew,
    priority,
    notes
  } = req.body;

  try {
    console.log('🚨 Vehicle Officer creating assignment:', {
      emergencyId,
      incidentId,
      vehicleId,
      vehicleName,
      vehicleType,
      assignedCrew,
      priority
    });
    
    // Validate required fields
    if (!vehicleId) {
      return res.status(400).json({ message: "Vehicle ID is required" });
    }
    
    if (!vehicleName) {
      return res.status(400).json({ message: "Vehicle name is required" });
    }
    // Check if vehicle exists - try both _id and vehicleId fields
    let vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      // Try to find by vehicleId string field as fallback
      vehicle = await Vehicle.findOne({ vehicleId: vehicleId });
    }
    if (!vehicle) {
      console.error('Vehicle not found:', { vehicleId, type: typeof vehicleId });
      return res.status(404).json({ 
        message: "Vehicle not found", 
        details: `Vehicle with ID ${vehicleId} does not exist in the database`,
        suggestion: "Please ensure the vehicle exists in the system before assignment"
      });
    }

    // Check if emergency assignment exists, create if not
    let emergencyAssignment = await EmergencyAssignment.findOne({ emergencyId });
    if (!emergencyAssignment) {
      // Create a new emergency assignment if it doesn't exist
      emergencyAssignment = new EmergencyAssignment({
        emergencyId,
        emergencyType: 'Fire', // Default type
        location: 'Emergency Location',
        priority: priority || 'Medium',
        description: 'Emergency assignment created by Vehicle Officer',
        status: 'Active'
      });
      await emergencyAssignment.save();
    }

    // Create new vehicle assignment
    const newAssignment = new EmergencyVehicleAssignment({
      emergencyId,
      incidentId,
      vehicleId,
      vehicleName,
      vehicleType,
      vehicleStatus: vehicle.status,
      assignedCrew: assignedCrew || [],
      priority,
      notes,
      assignedBy: 'Vehicle Officer'
    });

    try {
      await newAssignment.save();
      console.log('✅ Vehicle assignment created successfully:', newAssignment._id);
    } catch (saveError) {
      console.error('❌ Database save error:', saveError);
      console.error('❌ Assignment data that failed to save:', {
        emergencyId,
        incidentId,
        vehicleId,
        vehicleName,
        vehicleType,
        vehicleStatus: vehicle.status,
        assignedCrew,
        priority,
        notes,
        assignedBy: 'Vehicle Officer'
      });
      throw saveError;
    }

    // Also add to EmergencyAssignment for backward compatibility
    try {
      emergencyAssignment.assignedVehicles.push({
        vehicleId,
        vehicleName,
        vehicleType,
        assignedCrew: assignedCrew || [],
        assignmentTime: new Date(),
        status: 'Assigned'
      });

      await emergencyAssignment.save();
      console.log('✅ Emergency assignment updated successfully');
    } catch (emergencySaveError) {
      console.error('❌ Emergency assignment save error:', emergencySaveError);
      // Don't throw here - the main assignment was successful
    }

    // Emit real-time update to station officers
    const io = req.app.get('io');
    if (io) {
      io.emit('vehicleAssignedToEmergency', {
        emergencyId,
        assignmentId: newAssignment._id,
        vehicleId,
        vehicleName,
        vehicleType,
        assignedCrew,
        assignedAt: newAssignment.assignedAt
      });
    }

    return res.status(201).json({
      message: "Vehicle assigned successfully",
      assignment: newAssignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error creating vehicle assignment" });
  }
};

// Get all vehicle assignments for a specific emergency
const getVehicleAssignmentsByEmergency = async (req, res, next) => {
  const { emergencyId } = req.params;

  try {
    const assignments = await EmergencyVehicleAssignment.find({ emergencyId })
      .populate('vehicleId', 'name Vtype status')
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      message: "Vehicle assignments retrieved successfully",
      assignments
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicle assignments" });
  }
};

// Get all vehicle assignments for station officers
const getAllVehicleAssignments = async (req, res, next) => {
  try {
    const assignments = await EmergencyVehicleAssignment.find()
      .populate('vehicleId', 'name Vtype status')
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      message: "All vehicle assignments retrieved successfully",
      assignments
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicle assignments" });
  }
};

// Update vehicle assignment status
const updateVehicleAssignmentStatus = async (req, res, next) => {
  const { assignmentId } = req.params;
  const { status, notes } = req.body;

  try {
    const assignment = await EmergencyVehicleAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Vehicle assignment not found" });
    }

    assignment.status = status;
    if (notes) assignment.notes = notes;
    assignment.updatedAt = new Date();

    await assignment.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('vehicleAssignmentStatusUpdated', {
        assignmentId,
        emergencyId: assignment.emergencyId,
        status,
        updatedAt: assignment.updatedAt
      });
    }

    return res.status(200).json({
      message: "Vehicle assignment status updated successfully",
      assignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating vehicle assignment status" });
  }
};

// Add equipment to vehicle assignment (from Station Officer)
const addEquipmentToAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;
  const { equipment } = req.body;

  try {
    const assignment = await EmergencyVehicleAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Vehicle assignment not found" });
    }

    // Add equipment to assignment
    if (equipment && Array.isArray(equipment)) {
      assignment.assignedEquipment.push(...equipment.map(eq => ({
        equipmentName: eq.name || eq.equipmentName,
        equipmentCategory: eq.category || eq.equipmentCategory,
        assignedAt: new Date()
      })));
    }

    assignment.status = 'Equipment Assigned';
    assignment.updatedAt = new Date();

    await assignment.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('equipmentAssignedToVehicle', {
        assignmentId,
        emergencyId: assignment.emergencyId,
        vehicleId: assignment.vehicleId,
        equipment,
        assignedAt: new Date()
      });
    }

    return res.status(200).json({
      message: "Equipment assigned to vehicle successfully",
      assignment
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error assigning equipment to vehicle" });
  }
};

// Get vehicle assignments for station officer emergency mode
const getAssignmentsForStationOfficer = async (req, res, next) => {
  try {
    console.log('🔍 Station Officer requesting vehicle assignments...');
    
    // Get assignments from the last 5 minutes to ensure we only show current emergency
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const assignments = await EmergencyVehicleAssignment.find({
      status: { $in: ['Assigned', 'Equipment Assigned'] },
      assignedAt: { $gte: fiveMinutesAgo }
    })
      .populate('vehicleId', 'name Vtype status')
      .sort({ assignedAt: -1 });

    console.log('📋 Found assignments from last 5 minutes:', assignments.length);
    console.log('📋 Assignment details:', assignments.map(a => ({
      id: a._id,
      emergencyId: a.emergencyId,
      vehicleName: a.vehicleName,
      status: a.status,
      assignedAt: a.assignedAt
    })));

    // Group by emergency ID for easier frontend processing
    const groupedAssignments = {};
    assignments.forEach(assignment => {
      if (!groupedAssignments[assignment.emergencyId]) {
        groupedAssignments[assignment.emergencyId] = [];
      }
      groupedAssignments[assignment.emergencyId].push(assignment);
    });

    return res.status(200).json({
      message: "Vehicle assignments for station officer retrieved successfully",
      assignments: groupedAssignments,
      count: assignments.length
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicle assignments for station officer" });
  }
};

// Delete vehicle assignment
const deleteVehicleAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await EmergencyVehicleAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Vehicle assignment not found" });
    }

    await EmergencyVehicleAssignment.findByIdAndDelete(assignmentId);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('vehicleAssignmentDeleted', {
        assignmentId,
        emergencyId: assignment.emergencyId,
        vehicleId: assignment.vehicleId
      });
    }

    return res.status(200).json({
      message: "Vehicle assignment deleted successfully"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting vehicle assignment" });
  }
};

// Clear old vehicle assignments (older than specified minutes)
const clearOldAssignments = async (req, res, next) => {
  try {
    const { olderThanMinutes = 1 } = req.body;
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    const result = await EmergencyVehicleAssignment.deleteMany({
      assignedAt: { $lt: cutoffTime }
    });

    console.log(`Cleared ${result.deletedCount} old assignments (older than ${olderThanMinutes} minute(s))`);

    return res.status(200).json({
      message: `Old assignments cleared successfully (older than ${olderThanMinutes} minute(s))`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error clearing old assignments" });
  }
};

// Clear all assignments (for logout/refresh)
const clearAllAssignments = async (req, res, next) => {
  try {
    const result = await EmergencyVehicleAssignment.deleteMany({});
    
    console.log(`Cleared all ${result.deletedCount} assignments`);

    return res.status(200).json({
      message: "All assignments cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error clearing all assignments" });
  }
};

module.exports = {
  createVehicleAssignment,
  getVehicleAssignmentsByEmergency,
  getAllVehicleAssignments,
  updateVehicleAssignmentStatus,
  addEquipmentToAssignment,
  getAssignmentsForStationOfficer,
  deleteVehicleAssignment,
  clearOldAssignments,
  clearAllAssignments
};
