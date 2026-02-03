const Vehicle = require("../Model/VehicleModel");
const sseBus = require("../utils/eventBus");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/vehicles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all vehicles
const getAllVehicles = async (req, res, next) => {
  let vehicles;
  try {
    vehicles = await Vehicle.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicles" });
  }

  if (!vehicles || vehicles.length === 0) {
    return res.status(200).json({ vehicles: [] });
  }

  return res.status(200).json({ vehicles });
};

// Add a new vehicle
const addVehicle = async (req, res, next) => {
  const { vehicleId, name, Vtype, maxCrew, Capacity, fuelLevel, waterLevel, fuelType, waterCapacity, maintenanceStatus, condition, assignedCrew, maintenanceHistory, emergencyAssignments, year, fuelConsumption, engineCapacity, lastMaintenance, nextMaintenance } = req.body;
  
  // Handle image file
  let imagePath = null;
  if (req.file) {
    imagePath = `/uploads/vehicles/${req.file.filename}`;
  }

  // Validate required fields
  if (!vehicleId || !name || !Vtype || !maxCrew || !Capacity) {
    return res.status(400).json({ 
      message: "All fields are required: vehicleId, name, Vtype, maxCrew, Capacity" 
    });
  }

  // Validate vehicleId format (should be alphanumeric)
  if (!/^[A-Z0-9-]+$/.test(String(vehicleId).trim().toUpperCase()) || String(vehicleId).length < 3 || String(vehicleId).length > 20) {
    return res.status(400).json({ 
      message: "Vehicle ID must be 3-20 chars, uppercase letters, numbers, and hyphens" 
    });
  }

  // Validate maxCrew range
  if (maxCrew < 1 || maxCrew > 10) {
    return res.status(400).json({ 
      message: "Maximum crew size must be between 1 and 10" 
    });
  }

  // Validate Capacity range
  if (Capacity < 1) {
    return res.status(400).json({ 
      message: "Capacity must be at least 1 liter" 
    });
  }

  // Validate year is not in the future
  const currentYear = new Date().getFullYear();
  if (year && (Number(year) < 1900 || Number(year) > currentYear)) {
    return res.status(400).json({
      message: `Year must be between 1900 and ${currentYear}`
    });
  }

  // Check if vehicleId already exists (case-insensitive)
  try {
    const existingVehicle = await Vehicle.findOne({ vehicleId: String(vehicleId).trim().toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({ 
        message: "Vehicle ID already exists. Please use a unique ID." 
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error checking vehicle ID uniqueness" });
  }

  // Check if vehicle name already exists (trimmed)
  try {
    const existingVehicleName = await Vehicle.findOne({ name: String(name).trim() });
    if (existingVehicleName) {
      return res.status(400).json({ 
        message: "Vehicle name already exists. Please use a unique name." 
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error checking vehicle name uniqueness" });
  }

  // Parse JSON fields from FormData
  let parsedAssignedCrew = [];
  let parsedMaintenanceHistory = [];
  let parsedEmergencyAssignments = [];
  
  try {
    if (assignedCrew) {
      parsedAssignedCrew = typeof assignedCrew === 'string' ? JSON.parse(assignedCrew) : assignedCrew;
    }
    if (maintenanceHistory) {
      parsedMaintenanceHistory = typeof maintenanceHistory === 'string' ? JSON.parse(maintenanceHistory) : maintenanceHistory;
    }
    if (emergencyAssignments) {
      parsedEmergencyAssignments = typeof emergencyAssignments === 'string' ? JSON.parse(emergencyAssignments) : emergencyAssignments;
    }
  } catch (err) {
    console.log('Error parsing JSON fields:', err);
    return res.status(400).json({ message: "Invalid JSON format in form data" });
  }

  const newVehicle = new Vehicle({
    vehicleId: vehicleId.trim().toUpperCase(),
    name: name.trim(),
    Vtype,
    maxCrew: Number(maxCrew),
    Capacity: Number(Capacity),
    fuelLevel: fuelLevel || 100,
    waterLevel: waterLevel || 100,
    fuelType: fuelType || 'Diesel',
    waterCapacity: waterCapacity || 2000,
    maintenanceStatus: maintenanceStatus || 'Good',
    condition: condition || 'Good',
    assignedCrew: Array.isArray(parsedAssignedCrew) ? parsedAssignedCrew : [],
    maintenanceHistory: Array.isArray(parsedMaintenanceHistory) ? parsedMaintenanceHistory : [],
    emergencyAssignments: Array.isArray(parsedEmergencyAssignments) ? parsedEmergencyAssignments : [],
    year: year || new Date().getFullYear(),
    fuelConsumption: fuelConsumption || '',
    engineCapacity: engineCapacity || '',
    lastMaintenance: lastMaintenance || Date.now(),
    nextMaintenance: nextMaintenance || Date.now(),
    status: req.body.status || 'Available',
    imagePath: imagePath
  });

  try {
    await newVehicle.save();
  } catch (err) {
    console.log(err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    return res.status(500).json({ message: "Error adding vehicle" });
  }

  // Notify listeners before sending response
  sseBus.broadcast({ domain: 'vehicles', action: 'created', id: newVehicle._id });
  return res.status(201).json({ 
    message: "Vehicle added successfully", 
    vehicle: newVehicle 
  });
};

// Get by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let vehicle;

  try {
    vehicle = await Vehicle.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicle" });
  }

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  return res.status(200).json({ vehicle });
};

// Update Vehicle details
const updateVehicle = async (req, res, next) => {
  const id = req.params.id;
  const { vehicleId, name, Vtype, maxCrew, Capacity, fuelLevel, waterLevel, fuelType, waterCapacity, maintenanceStatus, condition, assignedCrew, maintenanceHistory, emergencyAssignments, year, fuelConsumption, engineCapacity, lastMaintenance, nextMaintenance } = req.body;
  
  // Handle image file
  let imagePath = null;
  if (req.file) {
    imagePath = `/uploads/vehicles/${req.file.filename}`;
  }

  // Validate required fields
  if (!vehicleId || !name || !Vtype || !maxCrew || !Capacity) {
    return res.status(400).json({ 
      message: "All fields are required: vehicleId, name, Vtype, maxCrew, Capacity" 
    });
  }

  // Validate vehicleId format
  if (!/^[A-Z0-9-]+$/.test(String(vehicleId).trim().toUpperCase()) || String(vehicleId).length < 3 || String(vehicleId).length > 20) {
    return res.status(400).json({ 
      message: "Vehicle ID must be 3-20 chars, uppercase letters, numbers, and hyphens" 
    });
  }

  // Validate maxCrew range
  if (maxCrew < 1 || maxCrew > 10) {
    return res.status(400).json({ 
      message: "Maximum crew size must be between 1 and 10" 
    });
  }

  // Validate Capacity range
  if (Capacity < 1) {
    return res.status(400).json({ 
      message: "Capacity must be at least 1 liter" 
    });
  }

  // Validate year is not in the future
  const currentYear2 = new Date().getFullYear();
  if (year && (Number(year) < 1900 || Number(year) > currentYear2)) {
    return res.status(400).json({
      message: `Year must be between 1900 and ${currentYear2}`
    });
  }

  let vehicle;

  try {
    // Check if vehicleId is being changed and if it already exists
    const existingVehicle = await Vehicle.findOne({ vehicleId: String(vehicleId).trim().toUpperCase(), _id: { $ne: id } });
    if (existingVehicle) {
      return res.status(400).json({ 
        message: "Vehicle ID already exists. Please use a different ID." 
      });
    }

    // Check if name is being changed and if it already exists
    const existingVehicleName = await Vehicle.findOne({ name: String(name).trim(), _id: { $ne: id } });
    if (existingVehicleName) {
      return res.status(400).json({ 
        message: "Vehicle name already exists. Please use a different name." 
      });
    }

    // Parse JSON fields from FormData
    let parsedAssignedCrew = [];
    let parsedMaintenanceHistory = [];
    let parsedEmergencyAssignments = [];
    
    try {
      if (assignedCrew) {
        parsedAssignedCrew = typeof assignedCrew === 'string' ? JSON.parse(assignedCrew) : assignedCrew;
      }
      if (maintenanceHistory) {
        parsedMaintenanceHistory = typeof maintenanceHistory === 'string' ? JSON.parse(maintenanceHistory) : maintenanceHistory;
      }
      if (emergencyAssignments) {
        parsedEmergencyAssignments = typeof emergencyAssignments === 'string' ? JSON.parse(emergencyAssignments) : emergencyAssignments;
      }
    } catch (err) {
      console.log('Error parsing JSON fields:', err);
      return res.status(400).json({ message: "Invalid JSON format in form data" });
    }

    const updateData = { 
      vehicleId: vehicleId.trim().toUpperCase(),
      name: name.trim(),
      Vtype, 
      maxCrew: Number(maxCrew), 
      Capacity: Number(Capacity),
      fuelLevel: fuelLevel || 100,
      waterLevel: waterLevel || 100,
      fuelType: fuelType || 'Diesel',
      waterCapacity: waterCapacity || 2000,
      maintenanceStatus: maintenanceStatus || 'Good',
      condition: condition || 'Good',
      assignedCrew: Array.isArray(parsedAssignedCrew) ? parsedAssignedCrew : [],
      maintenanceHistory: Array.isArray(parsedMaintenanceHistory) ? parsedMaintenanceHistory : [],
      emergencyAssignments: Array.isArray(parsedEmergencyAssignments) ? parsedEmergencyAssignments : [],
      year: year || new Date().getFullYear(),
      fuelConsumption: fuelConsumption || '',
      engineCapacity: engineCapacity || '',
      lastMaintenance: lastMaintenance || Date.now(),
      nextMaintenance: nextMaintenance || Date.now(),
      status: req.body.status || 'Available'
    };

    // Add image path if new image was uploaded
    if (imagePath) {
      updateData.imagePath = imagePath;
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid vehicle ID format" 
      });
    }
    
    return res.status(500).json({ message: "Error updating vehicle" });
  }

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  sseBus.broadcast({ domain: 'vehicles', action: 'updated', id });
  return res.status(200).json({ 
    message: "Vehicle updated successfully",
    vehicle 
  });
};

// Delete Vehicle Details
const deleteVehicle = async (req, res, next) => {
  const id = req.params.id;

  let vehicle;

  try {
    vehicle = await Vehicle.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting vehicle" });
  }

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  sseBus.broadcast({ domain: 'vehicles', action: 'deleted', id });
  return res.status(200).json({ message: "Vehicle deleted successfully", vehicle });
};

// Update vehicle trip data
const updateVehicleTrip = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { tripA, tripB, tripC, distance, origin, destination } = req.body;

    // Try to find by vehicleId first, then by _id
    let vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      vehicle = await Vehicle.findById(vehicleId);
    }
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Ensure defaults
    if (vehicle.tripA === undefined || vehicle.tripA === null) vehicle.tripA = 0;
    if (vehicle.tripB === undefined || vehicle.tripB === null) vehicle.tripB = 200;
    if (vehicle.tripC === undefined || vehicle.tripC === null) vehicle.tripC = 1000; // migrate legacy

    // Update trip meters
    if (tripA !== undefined) vehicle.tripA = tripA;
    if (tripB !== undefined) vehicle.tripB = tripB;
    if (tripC !== undefined) vehicle.tripC = tripC;

    // Add deployment record if distance is provided
    if (distance && origin && destination) {
      const deploymentRecord = {
        deploymentId: `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        distance: distance,
        origin: origin,
        destination: destination,
        deployedAt: new Date(),
        status: 'Deployed'
      };
      
      vehicle.deploymentHistory.push(deploymentRecord);
    }

    await vehicle.save();

    res.status(200).json({
      message: "Trip data updated successfully",
      vehicle: {
        vehicleId: vehicle.vehicleId,
        name: vehicle.name,
        tripA: vehicle.tripA,
        tripB: vehicle.tripB,
        tripC: vehicle.tripC
      }
    });
  } catch (error) {
    console.error("Error updating trip data:", error);
    res.status(500).json({ message: "Error updating trip data" });
  }
};

// Get vehicle trip data
const getVehicleTrip = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Try to find by vehicleId first, then by _id
    let vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      vehicle = await Vehicle.findById(vehicleId);
    }
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Migrate/ensure defaults without breaking existing data
    let mutated = false;
    if (vehicle.tripA === undefined || vehicle.tripA === null) { vehicle.tripA = 0; mutated = true; }
    if (vehicle.tripB === undefined || vehicle.tripB === null) { vehicle.tripB = 200; mutated = true; }
    if (vehicle.tripC === undefined || vehicle.tripC === null) { vehicle.tripC = 1000; mutated = true; }
    if (mutated) {
      try { await vehicle.save(); } catch (_) {}
    }

    res.status(200).json({
      vehicleId: vehicle.vehicleId,
      name: vehicle.name,
      tripA: vehicle.tripA,
      tripB: vehicle.tripB,
      tripC: vehicle.tripC,
      deploymentHistory: vehicle.deploymentHistory
    });
  } catch (error) {
    console.error("Error fetching trip data:", error);
    res.status(500).json({ message: "Error fetching trip data" });
  }
};

module.exports = {
  getAllVehicles,
  addVehicle,
  getById,
  updateVehicle,
  deleteVehicle,
  updateVehicleTrip,
  getVehicleTrip
};
