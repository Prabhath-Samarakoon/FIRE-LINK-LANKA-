const EmergencyVehicle = require('../Model/EmergencyVehicleModel');

// Create emergency vehicle assignment
const createEmergencyVehicle = async (req, res, next) => {
  const { assignedVehicles } = req.body;

  try {
    // Create new record with only vehicle names
    const emergencyVehicle = new EmergencyVehicle({
      assignedVehicles
    });

    await emergencyVehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Emergency vehicle assignment saved successfully',
      emergencyVehicle
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ 
      success: false,
      message: 'Error saving emergency vehicle assignment' 
    });
  }
};

// Get all emergency vehicle assignments
const getAllEmergencyVehicles = async (req, res, next) => {
  try {
    const emergencyVehicles = await EmergencyVehicle.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      emergencyVehicles
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching emergency vehicle assignments' 
    });
  }
};

// Delete emergency vehicle assignment
const deleteEmergencyVehicle = async (req, res, next) => {
  const { id } = req.params;

  try {
    const emergencyVehicle = await EmergencyVehicle.findByIdAndDelete(id);
    
    if (!emergencyVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Emergency vehicle assignment not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Emergency vehicle assignment deleted successfully'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ 
      success: false,
      message: 'Error deleting emergency vehicle assignment' 
    });
  }
};

module.exports = {
  createEmergencyVehicle,
  getAllEmergencyVehicles,
  deleteEmergencyVehicle
};
