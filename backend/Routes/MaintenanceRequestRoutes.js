const express = require("express");
const router = express.Router();

// Controller
const MaintenanceRequestController = require("../Controllers/MaintenanceRequestController");

// Basic CRUD Routes
router.get("/", MaintenanceRequestController.getAllMaintenanceRequests);
router.post("/add", MaintenanceRequestController.addMaintenanceRequest);
router.get("/:id", MaintenanceRequestController.getById);
router.put("/:id", MaintenanceRequestController.updateMaintenanceRequest);
router.delete("/:id", MaintenanceRequestController.deleteMaintenanceRequest);

// Special Routes
router.post("/approve", MaintenanceRequestController.approveRequest);
router.post("/start", MaintenanceRequestController.startMaintenance);
router.post("/complete", MaintenanceRequestController.completeMaintenance);
router.get("/vehicle/:vehicleId", MaintenanceRequestController.getByVehicle);

module.exports = router;
