const mongoose = require('mongoose');
const Admin = require('./Model/AdminModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Admin data to seed
const adminData = [
  {
    username: 'shanuka',
    password: 'shanuka12345',
    role: 'vehicle-officer'
  },
  {
    username: 'umesh',
    password: 'umesh12345',
    role: 'call-operator'
  },
  {
    username: 'rashmika',
    password: 'rashmika12345',
    role: 'staff-manager'
  },
  {
    username: 'malindu',
    password: 'malindu12345',
    role: 'station-officer'
  }
];

// Seed function
const seedAdmins = async () => {
  try {
    // Clear existing admin data
    await Admin.deleteMany({});
    console.log('Cleared existing admin data');

    // Insert new admin data one by one to trigger pre-save hooks
    const admins = [];
    for (const adminDataItem of adminData) {
      const admin = new Admin(adminDataItem);
      await admin.save();
      admins.push(admin);
    }
    
    console.log(`Successfully seeded ${admins.length} admin users:`);
    admins.forEach(admin => {
      console.log(`- ${admin.username} (${admin.role})`);
    });

    console.log('\nAdmin seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding admin data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedAdmins();
};

// Run if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedAdmins, connectDB };
