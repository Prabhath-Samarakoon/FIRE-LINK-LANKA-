/*
  Seed core inventory categories so Items CRUD works without "Category not found" errors.
  Usage: node backend/seedCategories.js
*/
const mongoose = require('mongoose');
const Category = require('./Model/CategoryModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';

const CATEGORIES = [
  { slug: 'ppe', name: 'Personal Protective Equipment (PPE)', icon: '🦺' },
  { slug: 'respiratory', name: 'Respiratory Protection', icon: '🫁' },
  { slug: 'hose-water', name: 'Hose & Water Delivery', icon: '🚰' },
  { slug: 'ladders', name: 'Ground Ladders', icon: '🪜' },
  { slug: 'entry-tools', name: 'Forcible Entry & Hand Tools', icon: '🔨' },
  { slug: 'power-tools', name: 'Power Tools & Ventilation', icon: '⚡' },
  { slug: 'extrication', name: 'Vehicle Extrication & Stabilization', icon: '🚗' },
  { slug: 'rope-rescue', name: 'Rope & Technical Rescue', icon: '🪢' },
  { slug: 'hazmat', name: 'HazMat & Decontamination', icon: '☢️' },
  { slug: 'ems-medical', name: 'EMS / Medical', icon: '🏥' },
  { slug: 'communications', name: 'Communications', icon: '📡' },
  { slug: 'apparatus', name: 'Apparatus Loadouts', icon: '🚛' },
  { slug: 'station-facilities', name: 'Station & Facilities', icon: '🏢' },
  { slug: 'training', name: 'Training & Consumables', icon: '📚' },
  { slug: 'water-supply-rural', name: 'Water Supply & Rural Ops', icon: '💧' }
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: undefined });
    const ops = CATEGORIES.map(c => ({
      updateOne: {
        filter: { slug: c.slug },
        update: { $set: { ...c, isActive: true, updatedAt: new Date() } },
        upsert: true
      }
    }));
    const result = await Category.bulkWrite(ops, { ordered: false });
    console.log('Categories seeded/updated:', result.modifiedCount + (result.upsertedCount || 0));
  } catch (e) {
    console.error('Category seeding failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  run();
}

module.exports = run;


