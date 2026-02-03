import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './VehicleCardGrid.css';

const VehicleCardGrid = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredVehicle, setHoveredVehicle] = useState(null);

  // Fetch vehicles from backend
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getVehicleOfficerVehicles();
      const backendVehicles = response.vehicles || [];
      
      // Transform backend vehicles to card format
      const cardVehicles = backendVehicles.map((vehicle, index) => {
        const vehicleTypeSlug = vehicle.Vtype?.toLowerCase().replace(/\s+/g, '-');
        
        // Map vehicle types to actual image filenames
        const getImagePath = (vehicleType, vehicleName) => {
          const imageMap = {
            'Fire Truck': 'FireEngine_pumper.png',
            'Water Tanker': 'WaterBowser.png',
            'Rescue Vehicle': 'Rescue Tender.png',
            'Command Vehicle': 'Fire Command Suv.png',
            'Ambulance': 'Ambulance.png',
            'Police Car': 'Fire Command Suv.png',
            'Ladder Truck': 'Aerial Ladder Platform.png',
            'Hazmat Vehicle': 'hazmat Truck.png',
            'Medical Response Unit': 'Ambulance.png',
            'Search & Rescue Vehicle': 'Wild land truck.png'
          };
          
          // Handle special cases for vehicles that might have different names
          if (vehicleName && typeof vehicleName === 'string') {
            const lowerName = vehicleName.toLowerCase();
            
            // Check for foam tender variations
            if (lowerName.includes('foam')) {
              return 'Foam Tender.png';
            }
            
            // Check for logistics truck variations
            if (lowerName.includes('logistics') || lowerName.includes('support') || lowerName.includes('utility')) {
              return 'Logistics Truck.png';
            }
            
            // Check for wildland tender variations
            if (lowerName.includes('wildland') || lowerName.includes('wild') || lowerName.includes('brush')) {
              return 'Wild land truck.png';
            }
          }
          
          // Fallback to vehicle type mapping
          if (vehicleType && typeof vehicleType === 'string') {
            const lowerType = vehicleType.toLowerCase();
            
            // Check for foam tender variations in type
            if (lowerType.includes('foam')) {
              return 'Foam Tender.png';
            }
            
            // Check for logistics truck variations in type
            if (lowerType.includes('logistics') || lowerType.includes('support') || lowerType.includes('utility')) {
              return 'Logistics Truck.png';
            }
            
            // Check for wildland tender variations in type
            if (lowerType.includes('wildland') || lowerType.includes('wild') || lowerType.includes('brush')) {
              return 'Wild land truck.png';
            }
          }
          
          return imageMap[vehicleType] || 'FireEngine_pumper.png';
        };
        
        return {
          id: vehicle._id || index,
          vehicleId: vehicle.vehicleId,
          name: vehicle.name,
          type: vehicle.Vtype,
          image: `/images/vehicles/${getImagePath(vehicle.Vtype, vehicle.name)}`,
          status: vehicle.status,
          condition: vehicle.condition,
          maxCrew: vehicle.maxCrew,
          capacity: vehicle.Capacity,
          fuelLevel: vehicle.fuelLevel,
          waterLevel: vehicle.waterLevel,
          maintenanceStatus: vehicle.maintenanceStatus,
          year: vehicle.year,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
          ...vehicle
        };
      });
      
      setVehicles(cardVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleVehicleClick = (vehicle) => {
    const vehicleTypeSlug = vehicle.type?.toLowerCase().replace(/\s+/g, '-');
    const vehicleNameSlug = vehicle.name?.toLowerCase().replace(/\s+/g, '-');
    const showcaseId = `${vehicleTypeSlug}-${vehicleNameSlug}`;
    navigate(`/vehicle-officer/vehicle-showcase/${showcaseId}`);
  };

  const handleAddVehicle = () => {
    navigate('/vehicle-officer/add-vehicle');
  };

  const handleEditVehicle = (vehicle, e) => {
    e.stopPropagation();
    navigate(`/vehicle-officer/update-vehicle/${vehicle.id}`);
  };

  const handleDeleteVehicle = async (vehicle, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${vehicle.name}?`)) {
      try {
        await apiService.deleteVehicleOfficerVehicle(vehicle.id);
        // Refresh the vehicle list
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="vehicle-card-grid-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-card-grid-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchVehicles} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-card-grid-container">
      {/* Enhanced Header */}
      <div className="vehicle-actions-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 7h-1V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v1H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"/>
                <path d="M9 6h6v1H9V6z"/>
                <path d="M8 17h8v-8H8v8z"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>Vehicle Fleet Management</h1>
              <p>Comprehensive emergency vehicle fleet overview and management</p>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="action-btn add-btn"
              onClick={handleAddVehicle}
              title="Add New Vehicle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="vehicle-card"
            onMouseEnter={() => setHoveredVehicle(vehicle.id)}
            onMouseLeave={() => setHoveredVehicle(null)}
            onClick={() => handleVehicleClick(vehicle)}
          >
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="vehicle-image"
              onError={(e) => {
                e.target.src = '/images/vehicles/FireEngine_pumper.png';
              }}
            />
            
            {/* Vehicle Action Buttons - Show on Hover */}
            <div className="vehicle-card-actions">
              <button 
                className="card-action-btn edit-btn"
                onClick={(e) => handleEditVehicle(vehicle, e)}
                title="Edit Vehicle"
              >
                ✏️
              </button>
              <button 
                className="card-action-btn delete-btn"
                onClick={(e) => handleDeleteVehicle(vehicle, e)}
                title="Delete Vehicle"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {vehicles.length === 0 && (
        <div className="no-vehicles">
          <div className="no-vehicles-icon">🚗</div>
          <h3>No vehicles found</h3>
          <p>Add some vehicles to get started</p>
          <button 
            className="action-btn add-btn"
            onClick={handleAddVehicle}
          >
            ➕ Add First Vehicle
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleCardGrid;
