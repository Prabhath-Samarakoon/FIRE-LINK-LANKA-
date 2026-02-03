const mongoose = require("mongoose");
const Category = require("./Model/CategoryModel");
const Item = require("./Model/ItemModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test")
.then(() => console.log("Connected to MongoDB for adding missing items"))
.catch((err) => console.log("Error connecting to MongoDB:", err));

// Complete item names by category (from frontend definitions)
const COMPLETE_ITEMS_BY_CATEGORY = {
  'ppe': [
    'Turnout Coat', 'Turnout Pants', 'Fire Helmet', 'Fire Boots', 
    'Fire Gloves', 'Nomex Hood', 'Safety Glasses', 'Safety Vest'
  ],
  'respiratory': [
    'SCBA Harness', 'SCBA Cylinder', 'Facepiece', 'Regulator', 
    'PAPR Unit', 'Airline Hose'
  ],
  'hose-water': [
    '1.5" Attack Hose', '2.5" Supply Hose', 'Hose Nozzle', 'Wye Valve', 
    'Hose Clamp', 'Hydrant Wrench'
  ],
  'ladders': [
    '24ft Extension Ladder', '14ft Roof Ladder', 'Attic Ladder', 
    'Ladder Roof Hook'
  ],
  'entry-tools': [
    'Halligan Bar', 'Flathead Axe', 'Sledge Hammer', 'Pry Bar', 
    'Bolt Cutters'
  ],
  'power-tools': [
    'Ventilation Saw', 'Circular Saw', 'Reciprocating Saw', 'Generator', 
    'Positive Pressure Fan'
  ],
  'extrication': [
    'Hydraulic Cutter', 'Hydraulic Spreader', 'Rams', 'Stabilization Struts', 
    'Glass Management Kit'
  ],
  'rope-rescue': [
    'Rescue Rope', 'Prusik Cord', 'Pulley', 'Descender', 'Harness', 
    'Carabiner'
  ],
  'hazmat': [
    'Level A Suit', 'Level B Suit', 'Detection Meter', 'Decon Shower', 
    'Absorbent Pads'
  ],
  'ems-medical': [
    'Trauma Kit', 'Oxygen Cylinder', 'BVM', 'AED', 'Spine Board', 
    'Cervical Collar'
  ],
  'communications': [
    'Portable Radio', 'Mobile Radio', 'Radio Battery', 'Speaker Mic', 
    'Headset'
  ],
  'apparatus': [
    'Crosslay Assembly', 'Deck Gun', 'Portable Monitor', 'Tool Mount', 
    'Scene Lighting'
  ],
  'station-facilities': [
    'Fire Extinguisher', 'Washer Extractor', 'Dryer', 'Gear Rack', 
    'Station Generator'
  ],
  'training': [
    'Training Hose', 'Cones', 'Dummy/Manikin', 'Prop Kit', 
    'Classroom Projector'
  ],
  'water-supply-rural': [
    'Portable Tank', 'Suction Hose', 'Jet Siphon', 'Strainer', 
    'Dump Tank'
  ]
};

// Brand and model data for realistic item creation
const BRANDS_BY_CATEGORY = {
  'ppe': ['Globe', 'Lion', 'MSA', 'Fire-Dex', 'Morning Pride'],
  'respiratory': ['MSA', 'Scott Safety', 'Dräger', 'Interspiro', 'Avon'],
  'hose-water': ['Key Hose', 'Elkhart Brass', 'Akron Brass', 'Task Force Tips', 'Hale'],
  'ladders': ['Duo-Safety', 'Alco-Lite', 'Little Giant', 'Werner', 'Louisville'],
  'entry-tools': ['Council Tool', 'Paratech', 'FireHooks', 'Pro-Bar', 'Husky'],
  'power-tools': ['Stihl', 'DeWalt', 'Honda', 'Makita', 'Milwaukee'],
  'extrication': ['HURST', 'Holmatro', 'Amkus', 'Genesis', 'Temres'],
  'rope-rescue': ['Petzl', 'CMC', 'PMI', 'Sterling', 'Yates'],
  'hazmat': ['Lakeland', 'Ansell', '3M', 'DuPont', 'Kimberly-Clark'],
  'ems-medical': ['Laerdal', 'Zoll', 'Philips', 'Stryker', 'Medtronic'],
  'communications': ['Motorola', 'Kenwood', 'Hytera', 'Icom', 'Vertex'],
  'apparatus': ['Task Force Tips', 'Elkhart Brass', 'Akron Brass', 'Hale', 'Waterous'],
  'station-facilities': ['Amerex', 'Ram Air', 'Generac', 'Honeywell', 'Johnson Controls'],
  'training': ['Rescue Randy', 'Conterra', 'TaskMaster', 'FireTech', 'Simulaids'],
  'water-supply-rural': ['Folding Tank Co', 'Kochek', 'Harrington', 'PortaTank', 'WaterMaster']
};

const MODELS_BY_CATEGORY = {
  'ppe': ['G-XTREME', 'V-Force', 'Tornado', 'ProGuard', 'UltraFlex'],
  'respiratory': ['AirX 4500', 'X3 Pro', 'Panorama Nova', 'G1', 'MRS'],
  'hose-water': ['LDH-5.0-100', 'Attack-1.75-50', 'Select-O-Flow', 'TaskMaster', 'UltraFlow'],
  'ladders': ['Duo-24', 'Roof-14', 'Attic-10', 'Pro-28', 'Multi-22'],
  'entry-tools': ['Pro-Bar', 'Flat-6lb', 'PryMax', 'Force-Bar', 'Entry-Pro'],
  'power-tools': ['MS 461', 'DWS780', 'EU2200i', 'MS 271', 'DCD996'],
  'extrication': ['S700E2', 'SP 777E2', 'Strut-STD', 'Genesis', 'Temres-Pro'],
  'rope-rescue': ['Axis 11mm', 'AVAO', 'Pinto', 'Sterling', 'Yates-Pro'],
  'hazmat': ['ChemMax4', 'AlphaTec 4000', 'Versaflo', 'Tychem', 'Barrier'],
  'ems-medical': ['Laerdal-1', 'D-Size', 'FRx', 'Stryker', 'Medtronic-Pro'],
  'communications': ['XPR 7550e', 'NX-5200', 'PD786', 'Icom-Pro', 'Vertex-Standard'],
  'apparatus': ['TFT-Monitor', 'Elk-Stang', 'Apollo', 'Hale-Pro', 'Waterous-Adv'],
  'station-facilities': ['B500', 'RE-100', 'GP6500', 'Honeywell-Pro', 'Johnson-Adv'],
  'training': ['Randy-165', 'Cone-28', 'Prop-Basic', 'FireTech-Pro', 'Simulaids-Adv'],
  'water-supply-rural': ['Husky-2500', 'Kochek-6in', 'Jet-2.5', 'PortaTank-Pro', 'WaterMaster-Adv']
};

// Generate unique serial number
const generateSerialNumber = (categorySlug, itemName, index) => {
  const prefix = categorySlug.toUpperCase().substring(0, 3);
  const itemCode = itemName.replace(/[^A-Z0-9]/g, '').substring(0, 4);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${itemCode}-${String(index + 1).padStart(3, '0')}-${timestamp}`;
};

async function addMissingItems() {
  try {
    console.log("Starting to add missing items...");
    
    // Get all categories
    const categories = await Category.find({ isActive: true });
    console.log(`Found ${categories.length} active categories`);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    
    for (const category of categories) {
      const categorySlug = category.slug;
      const expectedItems = COMPLETE_ITEMS_BY_CATEGORY[categorySlug] || [];
      
      if (expectedItems.length === 0) {
        console.log(`No items defined for category: ${categorySlug}`);
        continue;
      }
      
      console.log(`\nProcessing category: ${category.name} (${categorySlug})`);
      console.log(`Expected items: ${expectedItems.length}`);
      
      // Get existing items for this category
      const existingItems = await Item.find({ 
        categorySlug: categorySlug, 
        isActive: true 
      });
      
      const existingItemNames = existingItems.map(item => item.name);
      console.log(`Existing items: ${existingItemNames.length} - ${existingItemNames.join(', ')}`);
      
      // Find missing items
      const missingItems = expectedItems.filter(itemName => 
        !existingItemNames.includes(itemName)
      );
      
      console.log(`Missing items: ${missingItems.length} - ${missingItems.join(', ')}`);
      
      if (missingItems.length === 0) {
        console.log(`✅ All items already exist for ${categorySlug}`);
        continue;
      }
      
      // Create missing items
      const itemsToCreate = missingItems.map((itemName, index) => {
        const brands = BRANDS_BY_CATEGORY[categorySlug] || ['Generic'];
        const models = MODELS_BY_CATEGORY[categorySlug] || ['Standard'];
        
        return {
          name: itemName,
          category: category._id,
          categorySlug: categorySlug,
          quantity: Math.floor(Math.random() * 20) + 1, // Random quantity 1-20
          condition: 'Pending Inspection',
          serialNumber: generateSerialNumber(categorySlug, itemName, index),
          assignedToVehicle: '',
          location: 'Station',
          notes: `Auto-generated item for ${category.name}`,
          model: models[index % models.length],
          brand: brands[index % brands.length],
          subcategory: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      
      // Insert missing items
      const createdItems = await Item.insertMany(itemsToCreate);
      console.log(`✅ Created ${createdItems.length} items for ${categorySlug}`);
      
      totalAdded += createdItems.length;
      totalSkipped += existingItems.length;
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`Total items added: ${totalAdded}`);
    console.log(`Total items skipped (already existed): ${totalSkipped}`);
    console.log(`Total items processed: ${totalAdded + totalSkipped}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding missing items:", error);
    process.exit(1);
  }
}

// Run the function
addMissingItems();
