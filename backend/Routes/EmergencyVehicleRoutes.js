const express = require('express');
const router = express.Router();
const EmergencyVehicleController = require('../Controllers/EmergencyVehicleController');

// Create emergency vehicle assignment
router.post('/create', EmergencyVehicleController.createEmergencyVehicle);

// Get all emergency vehicle assignments
router.get('/', EmergencyVehicleController.getAllEmergencyVehicles);

// Delete emergency vehicle assignment
router.delete('/:id', EmergencyVehicleController.deleteEmergencyVehicle);

module.exports = router;
