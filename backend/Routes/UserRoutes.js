const express = require("express");
const router = express.Router();
const User = require("../Model/UserModel");
const UserController = require("../Controllers/UserControllers");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure multer storage for user photos
const userPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/users");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = (file.originalname || "photo").replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `user-${unique}-${safeName}`);
  }
});

const uploadUserPhoto = multer({
  storage: userPhotoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  }
});

// Route to get counts by position - place BEFORE /:id to avoid conflicts
router.get("/count-by-position", UserController.getCountByPosition);
// Route to search users by name
router.get("/search", UserController.searchUsers);
// Route to get all users
router.get("/", UserController.getAllUsers);
// Route to add a new user
router.post("/", uploadUserPhoto.single('photo'), UserController.addUsers);
// Route to get a user by ID
router.get("/:id", UserController.getById);
// Route to update user details
router.put("/:id", uploadUserPhoto.single('photo'), UserController.updateUser);
// Route to delete a user
router.delete("/:id", UserController.deleteUser);

module.exports = router;