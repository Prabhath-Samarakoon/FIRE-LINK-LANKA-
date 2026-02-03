require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const userRouter = require("./Routes/UserRoutes");
const incidentRouter = require("./Routes/IncidentRoutes");
const scheduleRouter = require("./Routes/ScheduleRoutes");
const trainingRouter = require("./Routes/TrainingRoutes");
const availabilityRouter = require("./Routes/AvailabilityRoutes");
const categoryRouter = require("./Routes/CategoryRoutes");
const itemRouter = require("./Routes/ItemRoutes");
const inspectionRouter = require("./Routes/InspectionRoutes");
const donationRouter = require("./Routes/DonationRoutes");
const reportRouter = require("./Routes/ReportRoutes");
const refillOrderRouter = require('./Routes/RefillOrderRoutes');

// Vehicle Officer routes
const vehicleOfficerRouter = require("./Routes/VehicleOfficerRoutes");
const emergencyAssignmentRouter = require("./Routes/EmergencyAssignmentRoutes");
const emergencyVehicleRouter = require("./Routes/EmergencyVehicleRoutes");
const emergencyVehicleAssignmentRouter = require("./Routes/EmergencyVehicleAssignmentRoutes");
const confirmedAssignmentRouter = require("./Routes/ConfirmedAssignmentRoutes");
const maintenanceRequestRouter = require("./Routes/MaintenanceRequestRoutes");
const resourceManagementRouter = require("./Routes/ResourceManagementRoutes");
const adminRouter = require("./Routes/AdminRoutes");
const paymentRouter = require("./Routes/PaymentRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  }
});

// Make io available to routes
app.set('io', io);

// Enhanced CORS configuration - allow local dev on 3000/3001 and 127.0.0.1
app.use(cors({
  origin: function(origin, callback) {
    // Allow non-browser requests and same-origin
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any localhost with arbitrary port during local dev
    const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
    if (localhostPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // relax for now (could be set to callback(new Error('Not allowed by CORS')))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fire Brigade API is operational',
    version: '1.0.0',
    endpoints: {
      users: '/Users',
      incidents: '/incidents',
      schedules: '/schedules',
      availability: '/availability',
      trainings: '/trainings',
      categories: '/api/categories',
      items: '/api/items',
      inspections: '/api/inspections'
    }
  });
});
app.use("/Users", userRouter);
app.use("/incidents", incidentRouter);
app.use("/schedules", scheduleRouter);
app.use("/availability", availabilityRouter);
app.use("/trainings", trainingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/items", itemRouter);
app.use("/api/inspections", inspectionRouter);
app.use("/api/donations", donationRouter);
app.use("/api/reports", reportRouter);

// Vehicle Officer routes
app.use("/api/vehicle-officer/vehicles", vehicleOfficerRouter);
app.use("/api/vehicle-officer/emergency-assignments", emergencyAssignmentRouter);
app.use("/api/vehicle-officer/emergency-vehicles", emergencyVehicleRouter);
app.use("/api/vehicle-officer/emergency-vehicle-assignments", emergencyVehicleAssignmentRouter);
app.use("/api/confirmed-assignments", confirmedAssignmentRouter);
app.use("/api/vehicle-officer/maintenance-requests", maintenanceRequestRouter);
app.use("/api/vehicle-officer/resource-management", resourceManagementRouter);
app.use("/api/vehicle-officer/refill-orders", refillOrderRouter);

// Admin routes
app.use("/api/admin", adminRouter);

// Payment routes
app.use("/api/payments", paymentRouter);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Connect to MongoDB with enhanced error handling and fallback
const MONGODB_ATLAS_URI = "mongodb+srv://admin:dmmlAOhj0Bl70FYR@cluster0.oxpvxep.mongodb.net/test?retryWrites=true&w=majority";
const MONGODB_LOCAL_URI = "mongodb://localhost:27017/test";

// Add environment variable support
const MONGODB_URI = process.env.MONGODB_URI || MONGODB_ATLAS_URI;

let currentMongoUri = null;
let isConnecting = false;

// Try Atlas first, fallback to local
const connectToMongoDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB Atlas...");
    console.log("🔗 Connection URI:", MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 60000,
      maxPoolSize: 20,
      retryWrites: true,
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    console.log("✅ Connected to MongoDB Atlas successfully");
    currentMongoUri = MONGODB_URI;
    return true;
  } catch (atlasError) {
    console.warn("⚠️ MongoDB Atlas connection failed:", atlasError.message);
    console.warn("🔍 Error details:", {
      name: atlasError.name,
      code: atlasError.code,
      codeName: atlasError.codeName
    });
    console.log("🔄 Attempting to connect to local MongoDB...");
    
    try {
      await mongoose.connect(MONGODB_LOCAL_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 60000,
        maxPoolSize: 20,
        retryWrites: false
      });
      console.log("✅ Connected to local MongoDB successfully");
      currentMongoUri = MONGODB_LOCAL_URI;
      return true;
    } catch (localError) {
      console.error("❌ Both MongoDB Atlas and local connections failed");
      console.error("Atlas error:", atlasError.message);
      console.error("Local error:", localError.message);
      console.error("💡 Troubleshooting tips:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MongoDB Atlas cluster is running");
      console.error("   3. Check if credentials are correct");
      console.error("   4. Install MongoDB locally: https://www.mongodb.com/try/download/community");
      return false;
    }
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
  
  // Handle incident vehicle confirmation from vehicle officers
  socket.on('incidentVehiclesConfirmed', (data) => {
    try {
      console.log('📡 Received incidentVehiclesConfirmed:', data);
      // Broadcast to all station officers
      socket.broadcast.emit('incidentVehiclesConfirmed', data);
    } catch (error) {
      console.error('❌ Error handling incidentVehiclesConfirmed:', error);
    }
  });
  
  // Handle assignment confirmation from station officers
  socket.on('assignmentConfirmed', (data) => {
    try {
      console.log('📡 Received assignmentConfirmed from Station Officer:', data);
      socket.broadcast.emit('assignmentConfirmed', data);
    } catch (error) {
      console.error('❌ Error handling assignmentConfirmed:', error);
    }
  });
  
  // Handle deployment status updates from vehicle officers
  socket.on('deploymentStatusUpdated', (data) => {
    try {
      console.log('📡 Received deploymentStatusUpdated:', data);
      socket.broadcast.emit('deploymentStatusUpdated', data);
    } catch (error) {
      console.error('❌ Error handling deploymentStatusUpdated:', error);
    }
  });
  
  // Handle assignment completion
  socket.on('assignmentCompleted', (data) => {
    try {
      console.log('📡 Received assignmentCompleted:', data);
      socket.broadcast.emit('assignmentCompleted', data);
    } catch (error) {
      console.error('❌ Error handling assignmentCompleted:', error);
    }
  });
  
  // Handle any other socket errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Start HTTP server immediately; DB will reconnect in background if needed
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time updates`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Users: http://localhost:${PORT}/Users`);
  console.log(`   - Incidents: http://localhost:${PORT}/incidents`);
  console.log(`   - Schedules: http://localhost:${PORT}/schedules`);
  console.log(`   - Categories: http://localhost:${PORT}/api/categories`);
  console.log(`   - Items: http://localhost:${PORT}/api/items`);
});

connectToMongoDB()
.then((ok) => {
  if (ok) {
    console.log("✅ Connected to MongoDB successfully");
    console.log("📊 Database:", mongoose.connection.name);
  } else {
    console.warn('⚠️ Initial MongoDB connection not established. Will keep retrying in background.');
  }
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  console.error("🔧 Please check your MongoDB connection string and network access");
  console.error("💡 You can also install MongoDB locally: https://www.mongodb.com/try/download/community");
  // Do not exit; schedule reconnect attempts
  scheduleReconnect();
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  scheduleReconnect();
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

function scheduleReconnect(delay = 5000) {
  if (isConnecting) return;
  isConnecting = true;
  setTimeout(async () => {
    try {
      console.log(`🔁 Reconnecting to MongoDB in ${delay / 1000}s ...`);
      const ok = await connectToMongoDB();
      if (!ok) {
        isConnecting = false;
        scheduleReconnect(Math.min(delay * 2, 60000));
      } else {
        isConnecting = false;
      }
    } catch (e) {
      isConnecting = false;
      scheduleReconnect(Math.min(delay * 2, 60000));
    }
  }, delay);
}

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await mongoose.connection.close(true);
  process.exit(0);
});
