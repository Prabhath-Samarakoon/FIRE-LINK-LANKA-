const mongoose = require('mongoose');
const Item = require('./Model/ItemModel');
const Inspection = require('./Model/InspectionModel');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/';
  try {
    await mongoose.connect(uri);
    const pendingItems = await Item.find({ condition: 'Pending Inspection', isActive: true });
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 7);

    let created = 0;
    for (const it of pendingItems) {
      const inspection = new Inspection({
        itemId: it._id,
        itemName: it.name,
        category: it.categorySlug,
        inspectorName: 'Auto-Inspector',
        condition: 'Good',
        notes: 'Auto new-item inspection',
        nextInspectionDate: next,
        isPassed: true,
        issues: []
      });
      await inspection.save();
      await Item.findByIdAndUpdate(it._id, {
        condition: 'Good',
        lastInspection: inspection.inspectionDate,
        nextInspection: next,
        updatedAt: new Date()
      });
      created += 1;
    }
    console.log(`Created ${created} inspections for pending items.`);
  } catch (e) {
    console.error('Bulk new item inspections failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  run();
}

module.exports = run;


