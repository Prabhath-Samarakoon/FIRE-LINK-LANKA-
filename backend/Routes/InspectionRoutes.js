const express = require("express");
const router = express.Router();
const InspectionController = require("../Controllers/InspectionController");

// Get all inspections
router.get("/", InspectionController.getAllInspections);

// Convenience: confirmed readiness (Good/Fair) latest per item
router.get("/confirmed-readiness", async (req, res) => {
  try {
    const all = await InspectionController.getAllInspectionsRaw?.() || [];
    // If helper not available, fetch via model directly
    if (!Array.isArray(all) || all.length === 0) {
      const Inspection = require("../Model/InspectionModel");
      const records = await Inspection.find({}).sort({ inspectionDate: -1 });
      const map = new Map();
      records.forEach(r => {
        const key = (r.itemName || '').trim();
        if (!key) return;
        if (!map.has(key)) map.set(key, r);
      });
      const latest = Array.from(map.values()).filter(r => r.condition === 'Good' || r.condition === 'Fair');
      return res.status(200).json({ success: true, data: latest });
    }
    const map = new Map();
    all.forEach(r => {
      const key = (r.itemName || '').trim();
      if (!key) return;
      const prev = map.get(key);
      if (!prev || new Date(r.inspectionDate) > new Date(prev.inspectionDate)) {
        map.set(key, r);
      }
    });
    const latest = Array.from(map.values()).filter(r => r.condition === 'Good' || r.condition === 'Fair');
    return res.status(200).json({ success: true, data: latest });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to compute confirmed readiness', error: e.message });
  }
});

// Get inspections by item
router.get("/item/:itemId", InspectionController.getInspectionsByItem);

// Get inspection by ID
router.get("/:id", InspectionController.getInspectionById);

// Create new inspection
router.post("/", InspectionController.createInspection);

// Update inspection
router.put("/:id", InspectionController.updateInspection);

// Delete inspection
router.delete("/:id", InspectionController.deleteInspection);

// Delete all inspections
router.delete("/", InspectionController.deleteAllInspections);

module.exports = router;
