import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import VehicleCard from './VehicleCard';
import VehicleCardGrid from './VehicleCardGrid';
import VehicleShowcase from './VehicleShowcase';
import apiService from '../../services/api';
import './VehicleDetails.css';

const VehicleDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewMode, setViewMode] = useState('carousel'); // 'grid', 'carousel', 'showcase'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  // Fetch vehicles from backend
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getVehicleOfficerVehicles();
      setVehicles(response.vehicles || []);
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

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (viewMode === 'showcase') {
      navigate(`/vehicle-officer/vehicle-showcase/${vehicle.vehicleId?.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  // Handle vehicle deletion
  const handleVehicleDelete = (vehicleId) => {
    setVehicles(prev => prev.filter(v => v._id !== vehicleId));
    if (selectedVehicle?._id === vehicleId) {
      setSelectedVehicle(null);
    }
  };

  // Filter and sort vehicles
  const filteredAndSortedVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.Vtype?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || vehicle.Vtype === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique vehicle types for filter
  const vehicleTypes = ['all', ...new Set(vehicles.map(v => v.Vtype))];

  // Render loading state
  if (loading) {
    return (
      <div className="vehicle-details-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="vehicle-details-container">
        <Sidebar />
        <div className="main-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Vehicles</h2>
            <p>{error}</p>
            <button onClick={fetchVehicles} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render showcase view
  if (viewMode === 'showcase') {
    return <VehicleShowcase />;
  }

  // Render card grid view
  if (viewMode === 'carousel') {
    return <VehicleCardGrid />;
  }

  // Render main grid view
  return (
    <div className="vehicle-details-container">
      <Sidebar />
      <div className="main-content">
        {/* Header Section */}
        <div className="vehicle-header">
          <div className="header-content">
            <h1>Vehicle Details</h1>
            <p>Comprehensive vehicle and fleet management system</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/vehicle-officer/add-vehicle')} 
              className="btn btn-primary"
            >
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-number">{vehicles.length}</span>
              <span className="stat-label">Total Vehicles</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-number">
                {vehicles.filter(v => v.status === 'Available').length}
              </span>
              <span className="stat-label">Available</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-number">
                {vehicles.filter(v => v.status === 'Under Maintenance').length}
              </span>
              <span className="stat-label">Under Maintenance</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-number">
                {vehicles.filter(v => v.Vtype === 'Fire Truck').length}
              </span>
              <span className="stat-label">Fire Trucks</span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {/* icon removed */}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {vehicleTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="sort-select"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="Vtype-asc">Type (A-Z)</option>
              <option value="Vtype-desc">Type (Z-A)</option>
              <option value="maxCrew-desc">Crew (High-Low)</option>
              <option value="maxCrew-asc">Crew (Low-High)</option>
              <option value="Capacity-desc">Capacity (High-Low)</option>
              <option value="Capacity-asc">Capacity (Low-High)</option>
            </select>
          </div>
          <div className="view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            />
            <button
              onClick={() => setViewMode('carousel')}
              className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}
              title="Carousel View"
            />
            <button
              onClick={() => setViewMode('showcase')}
              className={`view-btn ${viewMode === 'showcase' ? 'active' : ''}`}
              title="Showcase View"
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="vehicle-grid">
          {filteredAndSortedVehicles.length === 0 ? (
            <div className="no-vehicles">
              <h3>No vehicles found</h3>
              <p>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first vehicle to get started'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <button 
                  onClick={() => navigate('/vehicle-officer/add-vehicle')} 
                  className="btn btn-primary"
                >
                  Add Vehicle
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedVehicles.map(vehicle => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onDelete={handleVehicleDelete}
                onClick={() => handleVehicleSelect(vehicle)}
                isSelected={selectedVehicle?._id === vehicle._id}
              />
            ))
          )}
        </div>

        {/* Selected Vehicle Details Panel */}
        {selectedVehicle && (
          <div className="selected-vehicle-panel">
            <div className="panel-header">
              <h3>Selected Vehicle Details</h3>
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="panel-content">
              <div className="vehicle-info">
                <div className="info-section">
                  <h4>Basic Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedVehicle.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">ID:</span>
                      <span className="value">{selectedVehicle.vehicleId}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Type:</span>
                      <span className="value">{selectedVehicle.Vtype}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className={`value status-${selectedVehicle.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Specifications</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Max Crew:</span>
                      <span className="value">{selectedVehicle.maxCrew} members</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Capacity:</span>
                      <span className="value">{selectedVehicle.Capacity}L</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Fuel Type:</span>
                      <span className="value">{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Water Capacity:</span>
                      <span className="value">{selectedVehicle.waterCapacity}L</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Fluid Levels</h4>
                  <div className="fluid-levels">
                    <div className="fluid-level">
                      <div className="fluid-header">
                        <span className="fluid-label">Fuel Level</span>
                        <span className="fluid-percentage">{selectedVehicle.fuelLevel}%</span>
                      </div>
                      <div className="fluid-bar">
                        <div 
                          className="fluid-fill fuel" 
                          style={{ width: `${selectedVehicle.fuelLevel}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="fluid-level">
                      <div className="fluid-header">
                        <span className="fluid-label">Water Level</span>
                        <span className="fluid-percentage">{selectedVehicle.waterLevel}%</span>
                      </div>
                      <div className="fluid-bar">
                        <div 
                          className="fluid-fill water" 
                          style={{ width: `${selectedVehicle.waterLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Maintenance</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className={`value maintenance-${selectedVehicle.maintenanceStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedVehicle.maintenanceStatus}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Condition:</span>
                      <span className={`value condition-${selectedVehicle.condition?.toLowerCase()}`}>
                        {selectedVehicle.condition}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Year:</span>
                      <span className="value">{selectedVehicle.year}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Manufacturer:</span>
                      <span className="value">{selectedVehicle.manufacturer}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="panel-actions">
                <button 
                  onClick={() => navigate(`/update-vehicle/${selectedVehicle._id}`)}
                  className="btn btn-secondary"
                >
                  ✏️ Edit Vehicle
                </button>
                <button 
                  onClick={() => navigate(`/vehicle-officer/vehicle-showcase/${selectedVehicle.vehicleId?.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="btn btn-primary"
                >
                  🖼️ View Showcase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;
