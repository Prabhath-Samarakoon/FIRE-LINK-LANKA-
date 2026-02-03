import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './VehicleManagement.css';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleId: '',
    name: '',
    Vtype: 'Fire Truck',
    maxCrew: 4,
    Capacity: 2000,
    fuelLevel: 100,
    waterLevel: 100,
    fuelType: 'Diesel',
    waterCapacity: 2000,
    maintenanceStatus: 'Good',
    condition: 'Good',
    status: 'Available'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getVehicleOfficerVehicles();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCrew' || name === 'Capacity' || name === 'fuelLevel' || name === 'waterLevel' || name === 'waterCapacity' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await apiService.updateVehicleOfficerVehicle(editingVehicle._id, formData);
      } else {
        await apiService.createVehicleOfficerVehicle(formData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({
        vehicleId: '',
        name: '',
        Vtype: 'Fire Truck',
        maxCrew: 4,
        Capacity: 2000,
        fuelLevel: 100,
        waterLevel: 100,
        fuelType: 'Diesel',
        waterCapacity: 2000,
        maintenanceStatus: 'Good',
        condition: 'Good',
        status: 'Available'
      });
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId || '',
      name: vehicle.name || '',
      Vtype: vehicle.Vtype || 'Fire Truck',
      maxCrew: vehicle.maxCrew || 4,
      Capacity: vehicle.Capacity || 2000,
      fuelLevel: vehicle.fuelLevel || 100,
      waterLevel: vehicle.waterLevel || 100,
      fuelType: vehicle.fuelType || 'Diesel',
      waterCapacity: vehicle.waterCapacity || 2000,
      maintenanceStatus: vehicle.maintenanceStatus || 'Good',
      condition: vehicle.condition || 'Good',
      status: vehicle.status || 'Available'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await apiService.deleteVehicleOfficerVehicle(id);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-green-500';
      case 'On Call': return 'text-blue-500';
      case 'Under Maintenance': return 'text-yellow-500';
      case 'Out of Service': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="vehicle-fleet-management">
      <div className="header">
        <h1>🚗 Vehicle Management</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(true)} 
            className="add-btn"
          >
            ➕ Add Vehicle
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={() => {
                setShowForm(false);
                setEditingVehicle(null);
                setFormData({
                  vehicleId: '',
                  name: '',
                  Vtype: 'Fire Truck',
                  maxCrew: 4,
                  Capacity: 2000,
                  fuelLevel: 100,
                  waterLevel: 100,
                  fuelType: 'Diesel',
                  waterCapacity: 2000,
                  maintenanceStatus: 'Good',
                  condition: 'Good',
                  status: 'Available'
                });
              }} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehicle ID *</label>
                  <input
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., VH-001"
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Fire Engine Alpha"
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select name="Vtype" value={formData.Vtype} onChange={handleInputChange} required>
                    <option value="Fire Truck">Fire Truck</option>
                    <option value="Water Tanker">Water Tanker</option>
                    <option value="Rescue Vehicle">Rescue Vehicle</option>
                    <option value="Command Vehicle">Command Vehicle</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Ladder Truck">Ladder Truck</option>
                    <option value="Hazmat Vehicle">Hazmat Vehicle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Crew *</label>
                  <input
                    type="number"
                    name="maxCrew"
                    value={formData.maxCrew}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity (L) *</label>
                  <input
                    type="number"
                    name="Capacity"
                    value={formData.Capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Level (%)</label>
                  <input
                    type="number"
                    name="fuelLevel"
                    value={formData.fuelLevel}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Water Level (%)</label>
                  <input
                    type="number"
                    name="waterLevel"
                    value={formData.waterLevel}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Water Capacity (L)</label>
                  <input
                    type="number"
                    name="waterCapacity"
                    value={formData.waterCapacity}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Maintenance Status</label>
                  <select name="maintenanceStatus" value={formData.maintenanceStatus} onChange={handleInputChange}>
                    <option value="Good">Good</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange}>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Available">Available</option>
                    <option value="On Call">On Call</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading vehicles...</div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.length === 0 ? (
            <div className="no-vehicles">
              <h3>No vehicles found</h3>
              <p>Add your first vehicle to get started</p>
            </div>
          ) : (
            vehicles.map(vehicle => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-header">
                  <h3>{vehicle.name}</h3>
                  <span className={`status ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="vehicle-details">
                  <p><strong>ID:</strong> {vehicle.vehicleId}</p>
                  <p><strong>Type:</strong> {vehicle.Vtype}</p>
                  <p><strong>Crew:</strong> {vehicle.maxCrew} members</p>
                  <p><strong>Capacity:</strong> {vehicle.Capacity}L</p>
                  <p><strong>Fuel:</strong> {vehicle.fuelLevel}%</p>
                  <p><strong>Water:</strong> {vehicle.waterLevel}%</p>
                  <p><strong>Condition:</strong> {vehicle.condition}</p>
                </div>
                <div className="vehicle-actions">
                  <button onClick={() => handleEdit(vehicle)} className="edit-btn">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(vehicle._id)} className="delete-btn">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
