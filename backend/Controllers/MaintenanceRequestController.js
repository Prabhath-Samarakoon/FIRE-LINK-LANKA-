const MaintenanceRequest = require("../Model/MaintenanceRequestModel");
const sseBus = require("../utils/eventBus");

// Get all maintenance requests
const getAllMaintenanceRequests = async (req, res, next) => {
  let maintenanceRequests;
  try {
    maintenanceRequests = await MaintenanceRequest.find()
      .sort({ requestedDate: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching maintenance requests" });
  }

  if (!maintenanceRequests || maintenanceRequests.length === 0) {
    return res.status(200).json({ maintenanceRequests: [] });
  }

  return res.status(200).json({ maintenanceRequests });
};

// Add a new maintenance request
const addMaintenanceRequest = async (req, res, next) => {
  const {
    requestId,
    vehicleId,
    vehicleName,
    issue,
    category,
    priority,
    requestedBy,
    symptoms,
    estimatedCost,
    estimatedDuration
  } = req.body;

  const newMaintenanceRequest = new MaintenanceRequest({
    requestId,
    vehicleId,
    vehicleName,
    issue,
    category,
    priority,
    requestedBy,
    symptoms,
    estimatedCost,
    estimatedDuration
  });

  try {
    await newMaintenanceRequest.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error adding maintenance request" });
  }

  sseBus.broadcast({ domain: 'maintenance', action: 'created', id: newMaintenanceRequest._id });
  return res.status(201).json({ 
    message: "Maintenance request created successfully", 
    maintenanceRequest: newMaintenanceRequest 
  });
};

// Get maintenance request by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let maintenanceRequest;

  try {
    maintenanceRequest = await MaintenanceRequest.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching maintenance request" });
  }

  if (!maintenanceRequest) {
    return res.status(404).json({ message: "Maintenance request not found" });
  }

  return res.status(200).json({ maintenanceRequest });
};

// Update maintenance request
const updateMaintenanceRequest = async (req, res, next) => {
  const id = req.params.id;
  const updateData = req.body;

  let maintenanceRequest;

  try {
    maintenanceRequest = await MaintenanceRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating maintenance request" });
  }

  if (!maintenanceRequest) {
    return res.status(404).json({ message: "Maintenance request not found" });
  }

  sseBus.broadcast({ domain: 'maintenance', action: 'updated', id });
  return res.status(200).json({ 
    message: "Maintenance request updated successfully",
    maintenanceRequest 
  });
};

// Delete maintenance request
const deleteMaintenanceRequest = async (req, res, next) => {
  const id = req.params.id;

  let maintenanceRequest;

  try {
    maintenanceRequest = await MaintenanceRequest.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting maintenance request" });
  }

  if (!maintenanceRequest) {
    return res.status(404).json({ message: "Maintenance request not found" });
  }

  sseBus.broadcast({ domain: 'maintenance', action: 'deleted', id });
  return res.status(200).json({ 
    message: "Maintenance request deleted successfully", 
    maintenanceRequest 
  });
};

// Approve maintenance request
const approveRequest = async (req, res, next) => {
  const { requestId, approvedBy, assignedTo, estimatedCost, estimatedDuration } = req.body;

  try {
    const maintenanceRequest = await MaintenanceRequest.findById(requestId);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    maintenanceRequest.status = 'Approved';
    maintenanceRequest.approvedBy = approvedBy;
    maintenanceRequest.approvedDate = new Date();
    maintenanceRequest.assignedTo = assignedTo;
    maintenanceRequest.estimatedCost = estimatedCost;
    maintenanceRequest.estimatedDuration = estimatedDuration;

    await maintenanceRequest.save();
    sseBus.broadcast({ domain: 'maintenance', action: 'approved', id: requestId });

    return res.status(200).json({ 
      message: "Maintenance request approved successfully",
      maintenanceRequest 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error approving maintenance request" });
  }
};

// Start maintenance work
const startMaintenance = async (req, res, next) => {
  const { requestId, startDate } = req.body;

  try {
    const maintenanceRequest = await MaintenanceRequest.findById(requestId);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    maintenanceRequest.status = 'In Progress';
    maintenanceRequest.startDate = startDate || new Date();

    await maintenanceRequest.save();
    sseBus.broadcast({ domain: 'maintenance', action: 'started', id: requestId });

    return res.status(200).json({ 
      message: "Maintenance work started successfully",
      maintenanceRequest 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error starting maintenance work" });
  }
};

// Complete maintenance work
const completeMaintenance = async (req, res, next) => {
  const { requestId, actualCost, actualDuration, diagnosis, solution, partsReplaced, notes } = req.body;

  try {
    const maintenanceRequest = await MaintenanceRequest.findById(requestId);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    maintenanceRequest.status = 'Completed';
    maintenanceRequest.completedDate = new Date();
    maintenanceRequest.actualCost = actualCost;
    maintenanceRequest.actualDuration = actualDuration;
    maintenanceRequest.diagnosis = diagnosis;
    maintenanceRequest.solution = solution;
    maintenanceRequest.partsReplaced = partsReplaced;
    maintenanceRequest.notes = notes;

    await maintenanceRequest.save();
    sseBus.broadcast({ domain: 'maintenance', action: 'completed', id: requestId });

    return res.status(200).json({ 
      message: "Maintenance work completed successfully",
      maintenanceRequest 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error completing maintenance work" });
  }
};

// Get maintenance requests by vehicle
const getByVehicle = async (req, res, next) => {
  const vehicleId = req.params.vehicleId;
  let maintenanceRequests;

  try {
    maintenanceRequests = await MaintenanceRequest.find({ vehicleId })
      .sort({ requestedDate: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching maintenance requests" });
  }

  return res.status(200).json({ maintenanceRequests });
};

module.exports = {
  getAllMaintenanceRequests,
  addMaintenanceRequest,
  getById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  approveRequest,
  startMaintenance,
  completeMaintenance,
  getByVehicle
};
