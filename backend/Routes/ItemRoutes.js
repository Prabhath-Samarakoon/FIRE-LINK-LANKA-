const express = require("express");
const router = express.Router();
const ItemController = require("../Controllers/ItemController");

// Get all items
router.get("/", ItemController.getAllItems);

// Get items by category
router.get("/category/:categorySlug", ItemController.getItemsByCategory);

// Get item by ID
router.get("/:id", ItemController.getItemById);

// Create new item
router.post("/", ItemController.createItem);

// Update item
router.put("/:id", ItemController.updateItem);

// Delete item
router.delete("/:id", ItemController.deleteItem);

// Bulk delete items (optionally by category: /api/items?category=slug)
router.delete("/", ItemController.deleteItems);

module.exports = router;
