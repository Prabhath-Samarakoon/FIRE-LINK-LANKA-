const Inspection = require("../Model/InspectionModel");
const Item = require("../Model/ItemModel");

// Get all inspections
const getAllInspections = async (req, res) => {
  try {
    const { itemId, category } = req.query;
    let query = {};
    
    if (itemId) {
      query.itemId = itemId;
    }
    
    if (category) {
      query.category = category;
    }

    const inspections = await Inspection.find(query)
      .populate('itemId', 'name categorySlug')
      .sort({ inspectionDate: -1 });
    
    res.status(200).json({
      success: true,
      message: "Inspections retrieved successfully",
      inspections: inspections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving inspections",
      error: error.message
    });
  }
};

// Raw helper used by routes when computing aggregates without HTTP layer
async function getAllInspectionsRaw() {
  const Inspection = require("../Model/InspectionModel");
  return await Inspection.find({}).sort({ inspectionDate: -1 });
}

// Get inspection by ID
const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('itemId', 'name categorySlug');
    
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Inspection retrieved successfully",
      inspection: inspection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving inspection",
      error: error.message
    });
  }
};

// Create new inspection
const createInspection = async (req, res) => {
  try {
    const { 
      itemId, 
      itemName, 
      category, 
      inspectorName, 
      condition, 
      notes, 
      nextInspectionDate, 
      isPassed, 
      issues 
    } = req.body;
    
    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item not found"
      });
    }

    const inspection = new Inspection({
      itemId,
      itemName: itemName || item.name,
      category: category || item.categorySlug,
      inspectorName,
      condition,
      notes: notes || "",
      nextInspectionDate,
      isMissing: req.body.isMissing === true || condition === 'Missing',
      isPassed: isPassed !== undefined ? isPassed : (condition !== 'Missing' && condition !== 'Poor' ? true : false),
      issues: issues || []
    });

    await inspection.save();
    
    // Update item's last inspection date
    await Item.findByIdAndUpdate(itemId, {
      lastInspection: inspection.inspectionDate,
      nextInspection: nextInspectionDate,
      condition: condition,
      updatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: "Inspection created successfully",
      inspection: inspection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating inspection",
      error: error.message
    });
  }
};

// Update inspection
const updateInspection = async (req, res) => {
  try {
    const { 
      inspectorName, 
      condition, 
      notes, 
      nextInspectionDate, 
      isPassed, 
      issues 
    } = req.body;
    
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      {
        inspectorName,
        condition,
        notes,
        nextInspectionDate,
        isPassed,
        issues,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('itemId', 'name categorySlug');

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found"
      });
    }

    // Update item's condition if changed
    if (condition) {
      await Item.findByIdAndUpdate(inspection.itemId._id, {
        condition: condition,
        updatedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Inspection updated successfully",
      inspection: inspection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating inspection",
      error: error.message
    });
  }
};

// Delete inspection
const deleteInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inspection deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting inspection",
      error: error.message
    });
  }
};

// Delete ALL inspections
const deleteAllInspections = async (req, res) => {
  try {
    const result = await Inspection.deleteMany({});
    res.status(200).json({
      success: true,
      message: `All inspections deleted (${result.deletedCount})`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting all inspections",
      error: error.message
    });
  }
};

// Get inspections by item
const getInspectionsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const inspections = await Inspection.find({ itemId })
      .populate('itemId', 'name categorySlug')
      .sort({ inspectionDate: -1 });
    
    res.status(200).json({
      success: true,
      message: "Inspections retrieved successfully",
      inspections: inspections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving inspections",
      error: error.message
    });
  }
};

module.exports = {
  getAllInspections,
  getAllInspectionsRaw,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  deleteAllInspections,
  getInspectionsByItem
};
