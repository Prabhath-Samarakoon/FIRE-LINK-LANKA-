const mongoose = require("mongoose");
const Category = require("./Model/CategoryModel");
const Item = require("./Model/ItemModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test")
.then(() => console.log("Connected to MongoDB for seeding"))
.catch((err) => console.log("Error connecting to MongoDB:", err));

// Categories data
const categoriesData = [
  {
    name: 'Personal Protective Equipment (PPE)',
    slug: 'ppe',
    description: 'Protective clothing and equipment for firefighters',
    icon: '🦺'
  },
  {
    name: 'Respiratory Protection',
    slug: 'respiratory',
    description: 'Breathing apparatus and respiratory equipment',
    icon: '🫁'
  },
  {
    name: 'Hose & Water Delivery',
    slug: 'hose-water',
    description: 'Hoses, nozzles, and water delivery equipment',
    icon: '🚰'
  },
  {
    name: 'Ground Ladders',
    slug: 'ladders',
    description: 'Various types of ladders for firefighting operations',
    icon: '🪜'
  },
  {
    name: 'Forcible Entry & Hand Tools',
    slug: 'entry-tools',
    description: 'Tools for forcible entry and rescue operations',
    icon: '🔧'
  },
  {
    name: 'Power Tools & Ventilation',
    slug: 'power-tools',
    description: 'Power tools and ventilation equipment',
    icon: '⚡'
  },
  {
    name: 'Vehicle Extrication & Stabilization',
    slug: 'extrication',
    description: 'Equipment for vehicle extrication and stabilization',
    icon: '🚗'
  },
  {
    name: 'Rope & Technical Rescue',
    slug: 'rope-rescue',
    description: 'Ropes and technical rescue equipment',
    icon: '🪢'
  },
  {
    name: 'HazMat & Decontamination',
    slug: 'hazmat',
    description: 'Hazardous materials and decontamination equipment',
    icon: '☣️'
  },
  {
    name: 'EMS / Medical',
    slug: 'ems-medical',
    description: 'Emergency medical services and medical equipment',
    icon: '🏥'
  },
  {
    name: 'Communications',
    slug: 'communications',
    description: 'Communication devices and equipment',
    icon: '📡'
  },
  {
    name: 'Apparatus Loadouts',
    slug: 'apparatus',
    description: 'Fire apparatus and vehicle equipment',
    icon: '🚒'
  },
  {
    name: 'Station & Facilities',
    slug: 'station-facilities',
    description: 'Station equipment and facility maintenance',
    icon: '🏢'
  },
  {
    name: 'Training & Consumables',
    slug: 'training',
    description: 'Training equipment and consumable supplies',
    icon: '📚'
  },
  {
    name: 'Water Supply & Rural Ops',
    slug: 'water-supply-rural',
    description: 'Water supply and rural operations equipment',
    icon: '💧'
  }
];

// Build exactly 3 items per category
const ITEMS_BY_CATEGORY = {
  'ppe': ['Turnout Coat','Turnout Pants','Fire Helmet'],
  'respiratory': ['SCBA Unit','Air Cylinder','Facepiece'],
  'hose-water': ['Attack Hose 1.75"','Supply Hose 5"','Fog Nozzle'],
  'ladders': ['Extension Ladder','Roof Ladder','Attic Ladder'],
  'entry-tools': ['Halligan Bar','Flathead Axe','Pry Bar'],
  'power-tools': ['Chain Saw','Circular Saw','Ventilation Fan'],
  'extrication': ['Hydraulic Cutter','Hydraulic Spreader','Stabilization Struts'],
  'rope-rescue': ['Rescue Rope','Harness','Carabiner'],
  'hazmat': ['Level A Suit','Detection Meter','Decon Shower'],
  'ems-medical': ['Trauma Kit','Oxygen Cylinder','AED'],
  'communications': ['Portable Radio','Base Station Radio','Radio Charger'],
  'apparatus': ['Crosslay Assembly','Deck Gun','Portable Monitor'],
  'station-facilities': ['Fire Extinguisher','Gear Rack','Station Generator'],
  'training': ['Training Hose','Cones','Dummy/Manikin'],
  'water-supply-rural': ['Portable Tank','Suction Hose','Jet Siphon']
};

// Simple brand/model catalogs per category
const BRANDS_BY_CATEGORY = {
  'ppe': ['Globe', 'Lion', 'MSA'],
  'respiratory': ['MSA', 'Scott Safety', 'Dräger'],
  'hose-water': ['Key Hose', 'Elkhart Brass', 'Akron Brass'],
  'ladders': ['Duo-Safety', 'Alco-Lite', 'Little Giant'],
  'entry-tools': ['Council Tool', 'Paratech', 'FireHooks'],
  'power-tools': ['Stihl', 'DeWalt', 'Honda'],
  'extrication': ['HURST', 'Holmatro', 'Amkus'],
  'rope-rescue': ['Petzl', 'CMC', 'PMI'],
  'hazmat': ['Lakeland', 'Ansell', '3M'],
  'ems-medical': ['Laerdal', 'Zoll', 'Philips'],
  'communications': ['Motorola', 'Kenwood', 'Hytera'],
  'apparatus': ['Task Force Tips', 'Elkhart Brass', 'Akron Brass'],
  'station-facilities': ['Amerex', 'Ram Air', 'Generac'],
  'training': ['Rescue Randy', 'Conterra', 'TaskMaster'],
  'water-supply-rural': ['Folding Tank Co', 'Kochek', 'Harrington']
};

const MODELS_BY_CATEGORY = {
  'ppe': ['G-XTREME', 'V-Force', 'Tornado'],
  'respiratory': ['AirX 4500', 'X3 Pro', 'Panorama Nova'],
  'hose-water': ['LDH-5.0-100', 'Attack-1.75-50', 'Select-O-Flow'],
  'ladders': ['Duo-24', 'Roof-14', 'Attic-10'],
  'entry-tools': ['Pro-Bar', 'Flat-6lb', 'PryMax'],
  'power-tools': ['MS 461', 'DWS780', 'EU2200i'],
  'extrication': ['S700E2', 'SP 777E2', 'Strut-STD'],
  'rope-rescue': ['Axis 11mm', 'AVAO', 'Pinto'],
  'hazmat': ['ChemMax4', 'AlphaTec 4000', 'Versaflo'],
  'ems-medical': ['Laerdal-1', 'D-Size', 'FRx'],
  'communications': ['XPR 7550e', 'NX-5200', 'PD786'],
  'apparatus': ['TFT-Monitor', 'Elk-Stang', 'Apollo'],
  'station-facilities': ['B500', 'RE-100', 'GP6500'],
  'training': ['Randy-165', 'Cone-28', 'Prop-Basic'],
  'water-supply-rural': ['Husky-2500', 'Kochek-6in', 'Jet-2.5']
};

const serialFor = (slug, idx) => `${slug.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`;

const itemsData = categoriesData.flatMap(cat => {
  const names = ITEMS_BY_CATEGORY[cat.slug] || ['Item A','Item B','Item C'];
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + 7);
  return names.slice(0, 3).map((name, idx) => ({
    name,
    categorySlug: cat.slug,
    quantity: [5, 10, 15][idx] || 5,
    condition: 'Pending Inspection',
    brand: (BRANDS_BY_CATEGORY[cat.slug] || ['Generic'])[idx % (BRANDS_BY_CATEGORY[cat.slug]?.length || 1)],
    model: (MODELS_BY_CATEGORY[cat.slug] || ['Model-1'])[idx % (MODELS_BY_CATEGORY[cat.slug]?.length || 1)],
    serialNumber: serialFor(cat.slug, idx),
    lastInspection: null,
    nextInspection: null
  }));
});

async function seedData() {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Item.deleteMany({});
    console.log("Cleared existing data");

    // Insert categories
    const categories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${categories.length} categories`);

    // Create a map of category slugs to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update items with category IDs
    const itemsWithCategoryIds = itemsData.map(item => ({
      ...item,
      category: categoryMap[item.categorySlug]
    }));

    // Insert items
    const items = await Item.insertMany(itemsWithCategoryIds);
    console.log(`Inserted ${items.length} items`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedData();
