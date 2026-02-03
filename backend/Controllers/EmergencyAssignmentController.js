const EmergencyAssignment = require("../Model/EmergencyAssignmentModel");
const VehicleSelection = require("../Model/VehicleSelectionModel");

// Get all emergency assignments
const getAllEmergencyAssignments = async (req, res, next) => {
  let emergencyAssignments;
  try {
    emergencyAssignments = await EmergencyAssignment.find()
      .populate('assignedVehicles.vehicleId', 'name Vtype status')
      .sort({ reportedAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching emergency assignments" });
  }

  if (!emergencyAssignments || emergencyAssignments.length === 0) {
    return res.status(200).json({ emergencyAssignments: [] });
  }

  return res.status(200).json({ emergencyAssignments });
};

// Add a new emergency assignment
const addEmergencyAssignment = async (req, res, next) => {
  const {
    emergencyId,
    emergencyType,
    location,
    coordinates,
    priority,
    description,
    reporterName,
    reporterPhone,
    estimatedDuration
  } = req.body;

  const newEmergencyAssignment = new EmergencyAssignment({
    emergencyId,
    emergencyType,
    location,
    coordinates,
    priority,
    description,
    reporterName,
    reporterPhone,
    estimatedDuration
  });

  try {
    await newEmergencyAssignment.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error adding emergency assignment" });
  }

  return res.status(201).json({ 
    message: "Emergency assignment created successfully", 
    emergencyAssignment: newEmergencyAssignment 
  });
};

// Get emergency assignment by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let emergencyAssignment;

  try {
    emergencyAssignment = await EmergencyAssignment.findById(id)
      .populate('assignedVehicles.vehicleId', 'name Vtype status');
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching emergency assignment" });
  }

  if (!emergencyAssignment) {
    return res.status(404).json({ message: "Emergency assignment not found" });
  }

  return res.status(200).json({ emergencyAssignment });
};

// Update emergency assignment
const updateEmergencyAssignment = async (req, res, next) => {
  const id = req.params.id;
  const updateData = req.body;

  let emergencyAssignment;

  try {
    emergencyAssignment = await EmergencyAssignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedVehicles.vehicleId', 'name Vtype status');
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating emergency assignment" });
  }

  if (!emergencyAssignment) {
    return res.status(404).json({ message: "Emergency assignment not found" });
  }

  return res.status(200).json({ 
    message: "Emergency assignment updated successfully",
    emergencyAssignment 
  });
};

// Delete emergency assignment
const deleteEmergencyAssignment = async (req, res, next) => {
  const id = req.params.id;

  let emergencyAssignment;

  try {
    emergencyAssignment = await EmergencyAssignment.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting emergency assignment" });
  }

  if (!emergencyAssignment) {
    return res.status(404).json({ message: "Emergency assignment not found" });
  }

  return res.status(200).json({ 
    message: "Emergency assignment deleted successfully", 
    emergencyAssignment 
  });
};

// Assign vehicle to emergency
const assignVehicle = async (req, res, next) => {
  const { emergencyId, vehicleId, assignedCrew } = req.body;

  try {
    const emergencyAssignment = await EmergencyAssignment.findById(emergencyId);
    if (!emergencyAssignment) {
      return res.status(404).json({ message: "Emergency assignment not found" });
    }

    // Add vehicle assignment
    emergencyAssignment.assignedVehicles.push({
      vehicleId,
      assignedCrew,
      assignmentTime: new Date()
    });

    emergencyAssignment.status = 'In Progress';
    emergencyAssignment.assignedAt = new Date();

    await emergencyAssignment.save();

    return res.status(200).json({ 
      message: "Vehicle assigned successfully",
      emergencyAssignment 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error assigning vehicle" });
  }
};

// Update emergency status
const updateStatus = async (req, res, next) => {
  const { emergencyId, status, notes } = req.body;

  try {
    const emergencyAssignment = await EmergencyAssignment.findById(emergencyId);
    if (!emergencyAssignment) {
      return res.status(404).json({ message: "Emergency assignment not found" });
    }

    emergencyAssignment.status = status;
    if (status === 'Resolved') {
      emergencyAssignment.resolvedAt = new Date();
    }
    if (notes) {
      emergencyAssignment.notes = notes;
    }

    await emergencyAssignment.save();

    return res.status(200).json({ 
      message: "Status updated successfully",
      emergencyAssignment 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating status" });
  }
};

// Assign vehicle to emergency (from Vehicle Officer)
const assignVehicleToEmergency = async (req, res, next) => {
  const { emergencyId, vehicleId, vehicleName, vehicleType, assignedCrew, equipment } = req.body;

  try {
    const emergencyAssignment = await EmergencyAssignment.findById(emergencyId);
    if (!emergencyAssignment) {
      return res.status(404).json({ message: "Emergency assignment not found" });
    }

    // Add vehicle assignment
    emergencyAssignment.assignedVehicles.push({
      vehicleId,
      vehicleName,
      vehicleType,
      assignedCrew: assignedCrew || [],
      assignmentTime: new Date(),
      status: 'Assigned',
      equipment: equipment || []
    });

    emergencyAssignment.status = 'In Progress';
    emergencyAssignment.assignedAt = new Date();

    await emergencyAssignment.save();

    // Emit real-time update to station officers
    const io = req.app.get('io');
    if (io) {
      io.emit('emergencyVehicleAssigned', {
        emergencyId,
        vehicleId,
        vehicleName,
        vehicleType,
        assignedCrew,
        equipment,
        assignmentTime: new Date()
      });
    }

    return res.status(200).json({ 
      message: "Vehicle assigned successfully",
      emergencyAssignment 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error assigning vehicle" });
  }
};

// Get assigned vehicle types for an emergency (for station officer UI)
const getAssignedVehicleTypes = async (req, res, next) => {
  const { emergencyId } = req.params;

  try {
    const emergencyAssignment = await EmergencyAssignment.findById(emergencyId)
      .populate('assignedVehicles.vehicleId', 'name Vtype status');

    if (!emergencyAssignment) {
      return res.status(404).json({ message: "Emergency assignment not found" });
    }

    const vehicleTypeIds = emergencyAssignment.assignedVehicles.map(vehicle => vehicle.vehicleType);

    return res.status(200).json({ 
      data: { vehicleTypeIds },
      emergencyAssignment 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching assigned vehicle types" });
  }
};

// Get all staff members assigned to emergency incidents
const getEmergencyStaffAssignments = async (req, res, next) => {
  try {
    const emergencyAssignments = await EmergencyAssignment.find()
      .populate('assignedVehicles.vehicleId', 'name Vtype status')
      .sort({ reportedAt: -1 });

    // Extract all staff members from all emergency assignments
    const staffAssignments = [];
    
    emergencyAssignments.forEach(emergency => {
      emergency.assignedVehicles.forEach(vehicle => {
        if (vehicle.assignedCrew && vehicle.assignedCrew.length > 0) {
          vehicle.assignedCrew.forEach(crewMember => {
            staffAssignments.push({
              staffId: crewMember.crewMemberId,
              staffName: crewMember.crewMemberName,
              role: crewMember.role,
              emergencyId: emergency.emergencyId,
              emergencyType: emergency.emergencyType,
              location: emergency.location,
              priority: emergency.priority,
              status: emergency.status,
              vehicleName: vehicle.vehicleName,
              vehicleType: vehicle.vehicleType,
              assignmentTime: vehicle.assignmentTime,
              reportedAt: emergency.reportedAt,
              resolvedAt: emergency.resolvedAt
            });
          });
        }
      });
    });

    return res.status(200).json({
      message: "Emergency staff assignments retrieved successfully",
      staffAssignments,
      totalCount: staffAssignments.length
    });
  } catch (err) {
    console.error('Error in getEmergencyStaffAssignments:', err);
    return res.status(500).json({ message: "Error fetching emergency staff assignments" });
  }
};

module.exports = {
  getAllEmergencyAssignments,
  addEmergencyAssignment,
  getById,
  updateEmergencyAssignment,
  deleteEmergencyAssignment,
  assignVehicle,
  updateStatus,
  assignVehicleToEmergency,
  getAssignedVehicleTypes,
  getEmergencyStaffAssignments,
  // Persist assigned vehicle type IDs for an incident
  async setAssignedVehicleTypes(req, res) {
    try {
      const { incidentKey, vehicleTypeIds } = req.body;
      if (!incidentKey || !Array.isArray(vehicleTypeIds)) {
        return res.status(400).json({ message: 'incidentKey and vehicleTypeIds[] are required' });
      }

      const uniqueIds = Array.from(new Set(vehicleTypeIds.filter(Boolean)));
      const updated = await VehicleSelection.findOneAndUpdate(
        { incidentKey },
        { incidentKey, vehicleTypeIds: uniqueIds, updatedAt: new Date() },
        { new: true, upsert: true }
      );

      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to save assigned vehicle types' });
    }
  },

  // Retrieve assigned vehicle type IDs for an incident
  async getAssignedVehicleTypes(req, res) {
    try {
      const incidentKey = req.params.incidentKey;
      if (!incidentKey) {
        return res.status(400).json({ message: 'incidentKey is required' });
      }
      const doc = await VehicleSelection.findOne({ incidentKey });
      return res.status(200).json({ success: true, data: doc || { incidentKey, vehicleTypeIds: [] } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to load assigned vehicle types' });
    }
  }
};
