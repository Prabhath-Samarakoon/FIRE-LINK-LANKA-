const RefillOrder = require('../Model/RefillOrderModel');
const ResourceManagement = require('../Model/ResourceManagementModel');
const Vehicle = require('../Model/VehicleModel');
const sseBus = require('../utils/eventBus');

exports.list = async (req, res) => {
  try {
    const orders = await RefillOrder.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (e) { res.status(500).json({ message: 'Error listing orders' }); }
};

exports.create = async (req, res) => {
  try {
    const order = await RefillOrder.create(req.body);
    sseBus.broadcast({ domain: 'orders', action: 'created', id: order._id });
    res.status(201).json({ order });
  } catch (e) { res.status(400).json({ message: 'Error creating order' }); }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await RefillOrder.findByIdAndUpdate(id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    sseBus.broadcast({ domain: 'orders', action: 'updated', id });
    res.status(200).json({ order });
  } catch (e) { res.status(400).json({ message: 'Error updating order' }); }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await RefillOrder.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    sseBus.broadcast({ domain: 'orders', action: 'deleted', id });
    res.status(200).json({ order });
  } catch (e) { res.status(400).json({ message: 'Error deleting order' }); }
};

exports.complete = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await RefillOrder.findById(id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = 'Completed';
    await order.save();

    // Find vehicle by multiple possible ID formats
    let vehicle = null;
    if (order.vehicleId) {
      // Try exact match first
      vehicle = await Vehicle.findOne({ vehicleId: order.vehicleId });
      
      // If not found, try case-insensitive match
      if (!vehicle) {
        vehicle = await Vehicle.findOne({ 
          vehicleId: { $regex: new RegExp(`^${order.vehicleId}$`, 'i') } 
        });
      }
      
      // If still not found, try by name
      if (!vehicle && order.vehicleName) {
        vehicle = await Vehicle.findOne({ 
          name: { $regex: new RegExp(`^${order.vehicleName}$`, 'i') } 
        });
      }
    }

    if (vehicle) {
      // Update Vehicle fuelLevel
      vehicle.fuelLevel = 100;
      await vehicle.save();
      sseBus.broadcast({ domain: 'vehicles', action: 'updated', id: vehicle._id });

      // Find or create ResourceManagement record
      let resourceRecord = await ResourceManagement.findOne({ 
        $or: [
          { vehicleId: vehicle.vehicleId },
          { vehicleId: order.vehicleId },
          { vehicleName: vehicle.name }
        ]
      });

      if (!resourceRecord) {
        // Create new ResourceManagement record
        resourceRecord = new ResourceManagement({
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.name,
          fuelType: vehicle.fuelType || 'Diesel',
          fuelCapacity: 100, // Default capacity
          currentFuelLevel: 100,
          waterCapacity: vehicle.waterCapacity || 2000,
          currentWaterLevel: vehicle.waterLevel || 100,
          fuelAlertThreshold: 30,
          waterAlertThreshold: 30,
          status: 'Ready'
        });
        await resourceRecord.save();
        console.log(`Created new ResourceManagement record for vehicle: ${vehicle.name} (${vehicle.vehicleId})`);
      } else {
        // Update existing ResourceManagement record
        resourceRecord.currentFuelLevel = 100;
        resourceRecord.status = 'Ready';
        resourceRecord.lastFuelRefill = new Date();
        await resourceRecord.save();
        console.log(`Updated ResourceManagement record for vehicle: ${vehicle.name} (${vehicle.vehicleId})`);
      }

      sseBus.broadcast({ domain: 'resources', action: 'fuel-updated', id: resourceRecord._id });
    } else {
      console.error(`Vehicle not found for refill order: vehicleId=${order.vehicleId}, vehicleName=${order.vehicleName}`);
    }

    sseBus.broadcast({ domain: 'orders', action: 'completed', id });
    res.status(200).json({ order });
  } catch (e) { 
    console.error('Error completing refill order:', e);
    res.status(400).json({ message: 'Error completing order' }); 
  }
};
