const express = require("express");
const router = express.Router();
const CategoryController = require("../Controllers/CategoryController");

// Get all categories
router.get("/", CategoryController.getAllCategories);

// Get category by ID
router.get("/:id", CategoryController.getCategoryById);

// Create new category
router.post("/", CategoryController.createCategory);

// Update category
router.put("/:id", CategoryController.updateCategory);

// Delete category
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
