const mongoose = require("mongoose");
const Item = require("./Model/ItemModel");
const Inspection = require("./Model/InspectionModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test")
.then(() => console.log("Connected to MongoDB for simulating inspections"))
.catch((err) => console.log("Error connecting to MongoDB:", err));

async function simulateInspections() {
  try {
    console.log("Starting to simulate inspections...");
    
    // Get all items with "Pending Inspection" condition
    const pendingItems = await Item.find({ 
      condition: 'Pending Inspection',
      isActive: true 
    });
    
    console.log(`Found ${pendingItems.length} items with "Pending Inspection"`);
    
    if (pendingItems.length === 0) {
      console.log("No pending items found to inspect");
      process.exit(0);
    }
    
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    let inspectionsCreated = 0;
    let itemsUpdated = 0;
    let missingItems = 0;
    let poorItems = 0;
    
    // Process items in batches
    const batchSize = 10;
    for (let i = 0; i < pendingItems.length; i += batchSize) {
      const batch = pendingItems.slice(i, i + batchSize);
      
      for (const item of batch) {
        let condition;
        let isMissing = false;
        let notes = '';
        
        // Determine condition based on item index
        const itemIndex = pendingItems.indexOf(item);
        
        if (itemIndex < 3) {
          // First 3 items: Missing
          condition = 'Missing';
          isMissing = true;
          notes = 'Item not found during inspection';
          missingItems++;
        } else if (itemIndex < 5) {
          // Next 2 items: Poor condition
          condition = 'Poor';
          notes = 'Item requires immediate attention or replacement';
          poorItems++;
        } else if (itemIndex % 3 === 0) {
          // Every 3rd item: Fair condition
          condition = 'Fair';
          notes = 'Item is functional but shows signs of wear';
        } else {
          // Rest: Good condition
          condition = 'Good';
          notes = 'Item is in good working condition';
        }
        
        // Create inspection record
        const inspectionData = {
          itemId: item._id,
          itemName: item.name,
          category: item.categorySlug,
          inspectorName: 'System Inspector',
          inspectionDate: now,
          condition: condition,
          notes: notes,
          nextInspectionDate: nextWeek,
          isMissing: isMissing,
          isPassed: condition !== 'Poor' && condition !== 'Missing',
          issues: condition === 'Poor' ? [{
            description: 'Item requires maintenance or replacement',
            severity: 'High',
            resolved: false
          }] : []
        };
        
        const inspection = new Inspection(inspectionData);
        await inspection.save();
        inspectionsCreated++;
        
        // Update item condition and inspection dates
        const updateData = {
          condition: condition,
          lastInspection: now,
          nextInspection: nextWeek,
          updatedAt: new Date()
        };
        
        await Item.findByIdAndUpdate(item._id, updateData);
        itemsUpdated++;
        
        console.log(`✅ Inspected: ${item.name} - ${condition}`);
      }
    }
    
    console.log(`\n🎉 Inspection Summary:`);
    console.log(`Total inspections created: ${inspectionsCreated}`);
    console.log(`Total items updated: ${itemsUpdated}`);
    console.log(`Missing items: ${missingItems}`);
    console.log(`Poor condition items: ${poorItems}`);
    console.log(`Good/Fair condition items: ${itemsUpdated - missingItems - poorItems}`);
    
    // Verify results
    const goodItems = await Item.countDocuments({ condition: 'Good' });
    const fairItems = await Item.countDocuments({ condition: 'Fair' });
    const poorItemsCount = await Item.countDocuments({ condition: 'Poor' });
    const missingItemsCount = await Item.countDocuments({ condition: 'Missing' });
    const pendingItemsCount = await Item.countDocuments({ condition: 'Pending Inspection' });
    
    console.log(`\n📊 Current Item Status:`);
    console.log(`Good: ${goodItems}`);
    console.log(`Fair: ${fairItems}`);
    console.log(`Poor: ${poorItemsCount}`);
    console.log(`Missing: ${missingItemsCount}`);
    console.log(`Pending Inspection: ${pendingItemsCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error simulating inspections:", error);
    process.exit(1);
  }
}

// Run the function
simulateInspections();
