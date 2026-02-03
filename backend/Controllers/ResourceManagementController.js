const ResourceManagement = require("../Model/ResourceManagementModel");
const sseBus = require("../utils/eventBus");

// Get all resource management records
const getAllResourceManagement = async (req, res, next) => {
  let resourceManagement;
  try {
    resourceManagement = await ResourceManagement.find()
      .sort({ updatedAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching resource management records" });
  }

  if (!resourceManagement || resourceManagement.length === 0) {
    return res.status(200).json({ resourceManagement: [] });
  }

  return res.status(200).json({ resourceManagement });
};

// Add a new resource management record
const addResourceManagement = async (req, res, next) => {
  const {
    vehicleId,
    vehicleName,
    fuelType,
    fuelCapacity,
    currentFuelLevel,
    waterCapacity,
    currentWaterLevel,
    fuelAlertThreshold,
    waterAlertThreshold
  } = req.body;

  const newResourceManagement = new ResourceManagement({
    vehicleId,
    vehicleName,
    fuelType,
    fuelCapacity,
    currentFuelLevel,
    waterCapacity,
    currentWaterLevel,
    fuelAlertThreshold,
    waterAlertThreshold
  });

  try {
    await newResourceManagement.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error adding resource management record" });
  }

  sseBus.broadcast({ domain: 'resources', action: 'created', id: newResourceManagement._id });
  return res.status(201).json({ 
    message: "Resource management record created successfully", 
    resourceManagement: newResourceManagement 
  });
};

// Get resource management record by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let resourceManagement;

  try {
    resourceManagement = await ResourceManagement.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching resource management record" });
  }

  if (!resourceManagement) {
    return res.status(404).json({ message: "Resource management record not found" });
  }

  return res.status(200).json({ resourceManagement });
};

// Update resource management record
const updateResourceManagement = async (req, res, next) => {
  const id = req.params.id;
  const updateData = req.body;

  let resourceManagement;

  try {
    resourceManagement = await ResourceManagement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating resource management record" });
  }

  if (!resourceManagement) {
    return res.status(404).json({ message: "Resource management record not found" });
  }

  sseBus.broadcast({ domain: 'resources', action: 'updated', id });
  return res.status(200).json({ 
    message: "Resource management record updated successfully",
    resourceManagement 
  });
};

// Delete resource management record
const deleteResourceManagement = async (req, res, next) => {
  const id = req.params.id;

  let resourceManagement;

  try {
    resourceManagement = await ResourceManagement.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting resource management record" });
  }

  if (!resourceManagement) {
    return res.status(404).json({ message: "Resource management record not found" });
  }

  sseBus.broadcast({ domain: 'resources', action: 'deleted', id });
  return res.status(200).json({ 
    message: "Resource management record deleted successfully", 
    resourceManagement 
  });
};

// Update fuel level
const updateFuelLevel = async (req, res, next) => {
  const { recordId, newFuelLevel, type, amount, notes } = req.body;

  try {
    const resourceManagement = await ResourceManagement.findById(recordId);
    if (!resourceManagement) {
      return res.status(404).json({ message: "Resource management record not found" });
    }

    resourceManagement.currentFuelLevel = newFuelLevel;
    
    // Add to consumption history
    resourceManagement.fuelConsumption.push({
      date: new Date(),
      amount: amount,
      type: type,
      notes: notes
    });

    // Update last refill date if it's a refill
    if (type === 'Refill') {
      resourceManagement.lastFuelRefill = new Date();
    }

    // Update status based on fuel level
    if (newFuelLevel <= resourceManagement.fuelAlertThreshold) {
      resourceManagement.status = 'Low Fuel';
    } else if (resourceManagement.status === 'Low Fuel') {
      resourceManagement.status = 'Ready';
    }

    await resourceManagement.save();
    sseBus.broadcast({ domain: 'resources', action: 'fuel-updated', id: recordId });

    return res.status(200).json({ 
      message: "Fuel level updated successfully",
      resourceManagement 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating fuel level" });
  }
};

// Update water level
const updateWaterLevel = async (req, res, next) => {
  const { recordId, newWaterLevel, type, amount, notes } = req.body;

  try {
    const resourceManagement = await ResourceManagement.findById(recordId);
    if (!resourceManagement) {
      return res.status(404).json({ message: "Resource management record not found" });
    }

    resourceManagement.currentWaterLevel = newWaterLevel;
    
    // Add to consumption history
    resourceManagement.waterConsumption.push({
      date: new Date(),
      amount: amount,
      type: type,
      notes: notes
    });

    // Update last refill date if it's a refill
    if (type === 'Refill') {
      resourceManagement.lastWaterRefill = new Date();
    }

    // Update status based on water level
    if (newWaterLevel <= resourceManagement.waterAlertThreshold) {
      resourceManagement.status = 'Low Water';
    } else if (resourceManagement.status === 'Low Water') {
      resourceManagement.status = 'Ready';
    }

    await resourceManagement.save();
    sseBus.broadcast({ domain: 'resources', action: 'water-updated', id: recordId });

    return res.status(200).json({ 
      message: "Water level updated successfully",
      resourceManagement 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating water level" });
  }
};

// Schedule refills
const scheduleRefills = async (req, res, next) => {
  const { recordId, nextFuelRefill, nextWaterRefill } = req.body;

  try {
    const resourceManagement = await ResourceManagement.findById(recordId);
    if (!resourceManagement) {
      return res.status(404).json({ message: "Resource management record not found" });
    }

    if (nextFuelRefill) {
      resourceManagement.nextFuelRefill = new Date(nextFuelRefill);
    }
    if (nextWaterRefill) {
      resourceManagement.nextWaterRefill = new Date(nextWaterRefill);
    }

    await resourceManagement.save();
    sseBus.broadcast({ domain: 'resources', action: 'refill-scheduled', id: recordId });

    return res.status(200).json({ 
      message: "Refill schedule updated successfully",
      resourceManagement 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error scheduling refills" });
  }
};

// Get resource management by vehicle
const getByVehicle = async (req, res, next) => {
  const vehicleId = req.params.vehicleId;
  let resourceManagement;

  try {
    resourceManagement = await ResourceManagement.find({ vehicleId })
      .sort({ updatedAt: -1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching resource management records" });
  }

  return res.status(200).json({ resourceManagement });
};

// Get low resource alerts
const getLowResourceAlerts = async (req, res, next) => {
  let lowResourceAlerts;
  try {
    // Use aggregation expression to compare fields in the same document
    lowResourceAlerts = await ResourceManagement.find({
      $or: [
        { $expr: { $lte: ["$currentFuelLevel", "$fuelAlertThreshold"] } },
        { $expr: { $lte: ["$currentWaterLevel", "$waterAlertThreshold"] } }
      ]
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching low resource alerts" });
  }

  return res.status(200).json({ lowResourceAlerts });
};

// Auto-create ResourceManagement records for vehicles that don't have them
const ensureResourceManagementRecords = async (req, res, next) => {
  try {
    const Vehicle = require('../Model/VehicleModel');
    
    // Get all vehicles
    const vehicles = await Vehicle.find({});
    
    for (const vehicle of vehicles) {
      // Check if ResourceManagement record exists
      const existingRecord = await ResourceManagement.findOne({
        $or: [
          { vehicleId: vehicle.vehicleId },
          { vehicleName: vehicle.name }
        ]
      });
      
      if (!existingRecord) {
        // Create new ResourceManagement record
        const newRecord = new ResourceManagement({
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.name,
          fuelType: vehicle.fuelType || 'Diesel',
          fuelCapacity: 100, // Default capacity
          currentFuelLevel: vehicle.fuelLevel || 100,
          waterCapacity: vehicle.waterCapacity || 2000,
          currentWaterLevel: vehicle.waterLevel || 100,
          fuelAlertThreshold: 30,
          waterAlertThreshold: 30,
          status: vehicle.fuelLevel <= 30 ? 'Low Fuel' : 'Ready'
        });
        
        await newRecord.save();
        console.log(`Auto-created ResourceManagement record for vehicle: ${vehicle.name} (${vehicle.vehicleId})`);
      }
    }
    
    return res.status(200).json({ message: "ResourceManagement records ensured for all vehicles" });
  } catch (err) {
    console.error('Error ensuring ResourceManagement records:', err);
    return res.status(500).json({ message: "Error ensuring ResourceManagement records" });
  }
};

module.exports = {
  getAllResourceManagement,
  addResourceManagement,
  getById,
  updateResourceManagement,
  deleteResourceManagement,
  updateFuelLevel,
  updateWaterLevel,
  scheduleRefills,
  getByVehicle,
  getLowResourceAlerts,
  ensureResourceManagementRecords
};
