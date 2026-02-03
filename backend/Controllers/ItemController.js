const Item = require("../Model/ItemModel");
const Category = require("../Model/CategoryModel");

// Get all items
const getAllItems = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.categorySlug = category;
    }

    const items = await Item.find(query)
      .populate('category', 'name slug icon')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: "Items retrieved successfully",
      items: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving items",
      error: error.message
    });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', 'name slug icon');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Item retrieved successfully",
      item: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving item",
      error: error.message
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { name, categorySlug, quantity, condition, serialNumber, assignedToVehicle, location, notes, model, brand, subcategory } = req.body;
    
    // Find category by slug
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found"
      });
    }

    const item = new Item({
      name,
      category: category._id,
      categorySlug,
      quantity: quantity || 0,
      condition: condition || 'Pending Inspection',
      serialNumber: serialNumber || "",
      assignedToVehicle: assignedToVehicle || "",
      location: location || "Station",
      notes: notes || "",
      model: model || "",
      brand: brand || "",
      subcategory: subcategory || ""
    });

    await item.save();
    
    // Populate category data
    await item.populate('category', 'name slug icon');
    
    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error.message
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { name, categorySlug, quantity, condition, serialNumber, assignedToVehicle, location, notes, isActive, model, brand, subcategory } = req.body;
    
    let updateData = {
      name,
      quantity,
      condition,
      serialNumber,
      assignedToVehicle,
      location,
      notes,
      isActive,
      model,
      brand,
      subcategory,
      updatedAt: new Date()
    };

    // If categorySlug is provided, update category reference
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category not found"
        });
      }
      updateData.category = category._id;
      updateData.categorySlug = categorySlug;
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name slug icon');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message
    });
  }
};

// Bulk delete items (by categorySlug if provided, otherwise delete all)
const deleteItems = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.categorySlug = category;
    const result = await Item.deleteMany(filter);
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} item(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting items",
      error: error.message
    });
  }
};

// Get items by category
const getItemsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    
    const items = await Item.find({ 
      categorySlug: categorySlug, 
      isActive: true 
    }).populate('category', 'name slug icon').sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: "Items retrieved successfully",
      items: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving items",
      error: error.message
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  deleteItems,
  getItemsByCategory
};
