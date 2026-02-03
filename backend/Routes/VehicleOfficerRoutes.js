const express = require("express");
const router = express.Router();
const multer = require("multer");

// Controller
const VehicleOfficerController = require("../Controllers/VehicleOfficerController");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = require('path').join(__dirname, '../uploads/vehicles');
    const fs = require('fs');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + require('path').extname(file.originalname));
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

// Routes
router.get("/", VehicleOfficerController.getAllVehicles);
router.post("/add", upload.single('image'), VehicleOfficerController.addVehicle);
router.get("/:id", VehicleOfficerController.getById);
router.put("/:id", upload.single('image'), VehicleOfficerController.updateVehicle);
router.delete("/:id", VehicleOfficerController.deleteVehicle);

// Trip data routes
router.get("/:vehicleId/trip", VehicleOfficerController.getVehicleTrip);
router.put("/:vehicleId/trip", VehicleOfficerController.updateVehicleTrip);

module.exports = router;
