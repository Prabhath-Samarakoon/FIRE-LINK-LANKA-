import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const getStats = () => {
    const totalVehicles = vehicles.length;
    const highCapacityVehicles = vehicles.filter(v => v.Capacity > 5000).length;
    const largeCrewVehicles = vehicles.filter(v => v.maxCrew > 8).length;
    const fireTrucks = vehicles.filter(v => v.Vtype === 'Fire Truck').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'Under Maintenance').length;

    return {
      totalVehicles,
      highCapacityVehicles,
      largeCrewVehicles,
      fireTrucks,
      availableVehicles,
      maintenanceVehicles
    };
  };

  const stats = getStats();

  return (
    <div className="vehicle-officer-dashboard">
      <div className="dashboard-header">
        <h1>Vehicle Officer Dashboard</h1>
        <p>Comprehensive vehicle and fleet management system</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchVehicles} className="refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Refresh Data
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 7h-1V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v1H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"/>
              <path d="M9 6h6v1H9V6z"/>
              <path d="M8 17h8v-8H8v8z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalVehicles}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.availableVehicles}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.maintenanceVehicles}</div>
            <div className="stat-label">Under Maintenance</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-1.12-2.5-2.5-2.5S6 10.62 6 12s1.12 2.5 2.5 2.5z"/>
              <path d="M14.5 9.5A2.5 2.5 0 0 0 17 7c0-1.38-1.12-2.5-2.5-2.5S12 5.62 12 7s1.12 2.5 2.5 2.5z"/>
              <path d="M9 12h6"/>
              <path d="M12 9v6"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.fireTrucks}</div>
            <div className="stat-label">Fire Trucks</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.highCapacityVehicles}</div>
            <div className="stat-label">High Capacity</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.largeCrewVehicles}</div>
            <div className="stat-label">Large Crew</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>System Overview</h2>
          
          <div className="overview-grid">
            <div className="overview-card" onClick={() => navigate('/vehicle-officer/vehicles')}>
              <div className="overview-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 7h-1V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v1H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2"/>
                  <path d="M9 6h6v1H9V6z"/>
                  <path d="M8 17h8v-8H8v8z"/>
                </svg>
              </div>
              <div className="overview-content">
                <h3>Vehicle Management</h3>
                <p>Manage emergency response vehicles, add new vehicles, and track vehicle status</p>
                <div className="overview-stats">
                  <span>{stats.totalVehicles} Vehicles</span>
                  <span>{stats.availableVehicles} Available</span>
                </div>
              </div>
              <div className="overview-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            <div className="overview-card" onClick={() => navigate('/vehicle-officer/emergency-management')}>
              <div className="overview-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <path d="M12 9v4"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <div className="overview-content">
                <h3>Emergency Management</h3>
                <p>Handle emergency assignments, coordinate responses, and track incident status</p>
                <div className="overview-stats">
                  <span>Active Emergencies</span>
                  <span>Response Teams</span>
                </div>
              </div>
              <div className="overview-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            <div className="overview-card" onClick={() => navigate('/vehicle-officer/maintenance-management')}>
              <div className="overview-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div className="overview-content">
                <h3>Maintenance Management</h3>
                <p>Track maintenance requests, schedule repairs, and monitor vehicle condition</p>
                <div className="overview-stats">
                  <span>{stats.maintenanceVehicles} Under Repair</span>
                  <span>Maintenance Requests</span>
                </div>
              </div>
              <div className="overview-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            <div className="overview-card" onClick={() => navigate('/vehicle-officer/resource-management')}>
              <div className="overview-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z"/>
                  <path d="M9 9h6v6H9z"/>
                  <path d="M9 3v6"/>
                  <path d="M15 3v6"/>
                  <path d="M9 15v6"/>
                  <path d="M15 15v6"/>
                </svg>
              </div>
              <div className="overview-content">
                <h3>Resource Management</h3>
                <p>Monitor fuel levels, water capacity, and resource allocation for vehicles</p>
                <div className="overview-stats">
                  <span>Fuel Levels</span>
                  <span>Water Capacity</span>
                </div>
              </div>
              <div className="overview-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
