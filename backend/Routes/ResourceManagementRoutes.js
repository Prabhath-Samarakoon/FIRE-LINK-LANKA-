const express = require("express");
const router = express.Router();

// Controller
const ResourceManagementController = require("../Controllers/ResourceManagementController");

// Basic CRUD Routes
router.get("/", ResourceManagementController.getAllResourceManagement);
router.post("/add", ResourceManagementController.addResourceManagement);
router.get("/:id", ResourceManagementController.getById);
router.put("/:id", ResourceManagementController.updateResourceManagement);
router.delete("/:id", ResourceManagementController.deleteResourceManagement);

// Special Routes
router.post("/update-fuel", ResourceManagementController.updateFuelLevel);
router.post("/update-water", ResourceManagementController.updateWaterLevel);
router.post("/schedule-refills", ResourceManagementController.scheduleRefills);
router.get("/vehicle/:vehicleId", ResourceManagementController.getByVehicle);
router.get("/alerts/low-resources", ResourceManagementController.getLowResourceAlerts);
router.post("/ensure-records", ResourceManagementController.ensureResourceManagementRecords);

module.exports = router;
