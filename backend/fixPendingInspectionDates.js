const mongoose = require("mongoose");
const Item = require("./Model/ItemModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test")
.then(() => console.log("Connected to MongoDB for fixing pending inspection dates"))
.catch((err) => console.log("Error connecting to MongoDB:", err));

async function fixPendingInspectionDates() {
  try {
    console.log("Starting to fix pending inspection dates...");
    
    // Find all items with "Pending Inspection" condition that have inspection dates
    const pendingItemsWithDates = await Item.find({
      condition: 'Pending Inspection',
      $or: [
        { lastInspection: { $exists: true, $ne: null } },
        { nextInspection: { $exists: true, $ne: null } }
      ]
    });
    
    console.log(`Found ${pendingItemsWithDates.length} items with "Pending Inspection" that have inspection dates`);
    
    if (pendingItemsWithDates.length === 0) {
      console.log("✅ No items need fixing");
      process.exit(0);
    }
    
    // Update these items to remove inspection dates
    const updateResult = await Item.updateMany(
      {
        condition: 'Pending Inspection',
        $or: [
          { lastInspection: { $exists: true, $ne: null } },
          { nextInspection: { $exists: true, $ne: null } }
        ]
      },
      {
        $set: {
          lastInspection: null,
          nextInspection: null,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} items`);
    console.log("All items with 'Pending Inspection' now have null inspection dates");
    
    // Verify the fix
    const remainingItemsWithDates = await Item.find({
      condition: 'Pending Inspection',
      $or: [
        { lastInspection: { $exists: true, $ne: null } },
        { nextInspection: { $exists: true, $ne: null } }
      ]
    });
    
    if (remainingItemsWithDates.length === 0) {
      console.log("✅ Verification successful: No pending items have inspection dates");
    } else {
      console.log(`❌ Warning: ${remainingItemsWithDates.length} items still have inspection dates`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error fixing pending inspection dates:", error);
    process.exit(1);
  }
}

// Run the function
fixPendingInspectionDates();
