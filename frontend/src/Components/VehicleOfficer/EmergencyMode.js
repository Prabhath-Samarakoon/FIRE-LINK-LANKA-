import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import ConfirmedAssignmentsOverlay from './ConfirmedAssignmentsOverlay';
import './EmergencyMode.css';

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';

function EmergencyMode() {
  const [incidentData, setIncidentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [confirmedVehicles, setConfirmedVehicles] = useState([]);
  const [isIncidentConfirmed, setIsIncidentConfirmed] = useState(false);
  const [showAssignmentsOverlay, setShowAssignmentsOverlay] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('emergency-active');

    loadIncidentData();
    loadVehicles();

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('emergency-active');
    };
  }, []);

  const loadIncidentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to get data from sessionStorage (from Staff Manager confirmation)
      const storedData = sessionStorage.getItem('emergencyIncidentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setIncidentData(parsedData);
        setLoading(false);
        return;
      }
      
      // Fallback: Fetch the most recent incident from API
      const response = await fetch(`${API_BASE}/incidents?page=1&limit=1`, { 
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch incident data');
      }
      
      const data = await response.json();
      const incidents = data.incidents || [];
      
      if (incidents.length > 0) {
        setIncidentData(incidents[0]);
      } else {
        setError('No incident data available');
      }
    } catch (err) {
      console.error('Error loading incident data:', err);
      setError('Failed to load incident data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      console.log('🔄 Loading vehicles from:', `${API_BASE}/api/vehicle-officer/vehicles`);
      const response = await fetch(`${API_BASE}/api/vehicle-officer/vehicles`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehicles loaded:', data.vehicles?.length || 0, 'vehicles');
        console.log('🚒 Vehicle data:', data.vehicles);
        setVehicles(data.vehicles || []);
      } else {
        console.error('❌ Failed to load vehicles, status:', response.status);
        setVehicles([]);
      }
    } catch (e) {
      console.error('❌ Error loading vehicles:', e);
      setVehicles([]);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/vehicle-officer');
  };

  const handleNavigateToMap = () => {
    navigate('/vehicle-officer/map');
  };

  const handleAddVehicle = (vehicle) => {
    if (!assignedVehicles.find(v => v._id === vehicle._id)) {
      setAssignedVehicles([...assignedVehicles, vehicle]);
    }
  };

  const handleRemoveVehicle = (vehicleId) => {
    setAssignedVehicles(assignedVehicles.filter(v => v._id !== vehicleId));
  };

  const parsedCoords = useMemo(() => {
    const c = incidentData?.coordinates;
    if (!c) return null;
    if (typeof c === 'object' && c.lat != null && c.lng != null) {
      return { lat: c.lat, lng: c.lng };
    }
    if (typeof c === 'string') {
      const parts = c.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && parts.every(n => !Number.isNaN(n))) {
        return { lat: parts[0], lng: parts[1] };
      }
    }
    return null;
  }, [incidentData]);

  if (loading) {
    return (
      <div className="emergency-mode-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading emergency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emergency-mode-container">
        <div className="error-container">
          <h2>⚠️ Error Loading Emergency Data</h2>
          <p>{error}</p>
          <button onClick={loadIncidentData} className="retry-btn">
            Retry
          </button>
          <button onClick={handleBackToDashboard} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!incidentData) {
    return (
      <div className="emergency-mode-container">
        <div className="no-data-container">
          <h2>📋 No Active Emergency</h2>
          <p>No incident data is currently available.</p>
          <button onClick={handleBackToDashboard} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-mode-container">
      {/* Emergency Mode Active Banner */}
      <div className="emergency-banner">
        <div className="emergency-banner-content">
          <div className="siren-icon">🚨</div>
          <span className="banner-text">EMERGENCY MODE ACTIVE - All personnel on standby</span>
          <div className="siren-icon">🚨</div>
        </div>
      </div>


      {/* Three Panel Layout */}
      <div className="emergency-three-panel">
        {/* 1) Incident Info */}
        <div className="panel incident-panel">
          <h2>Incident Details</h2>
          <div className="incident-info">
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{incidentData.address || 'Address not available'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Coordinates:</span>
              <span className="info-value">
                {parsedCoords ? `${parsedCoords.lat}, ${parsedCoords.lng}` : 'Coordinates not available'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">{incidentData.incidentType || incidentData.type || 'Unknown'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">People Trapped:</span>
              <span className="info-value">{incidentData.peopleTrapped || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Injured:</span>
              <span className="info-value">{incidentData.injured || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned Staff:</span>
              <span className="info-value">{incidentData.assignedStaff?.length || 0}</span>
            </div>
          </div>
          
          {/* Assigned Staff Details */}
          {incidentData.assignedStaff && incidentData.assignedStaff.length > 0 && (
            <div className="assigned-staff-section">
              <h3>Assigned Staff Details</h3>
              <div className="staff-list">
                {incidentData.assignedStaff.map((staff, index) => (
                  <div key={index} className="staff-item">
                    <div className="staff-info">
                      <span className="staff-name">{staff.name || staff}</span>
                      <span className="staff-position">{staff.position || staff.role || 'Staff Member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button onClick={handleBackToDashboard} className="exit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
            <span>EXIT EMERGENCY MODE</span>
          </button>
        </div>

        {/* 2) Available Vehicles */}
        <div className="panel vehicles-panel">
          <h2>Available Vehicles ({vehicles.length})</h2>
          <div className="vehicles-list-simple">
            {vehicles.length === 0 ? (
              <p className="no-vehicles">No vehicles found</p>
            ) : (
              vehicles.map((vehicle) => (
                <div key={vehicle._id || vehicle.vehicleId} className="vehicle-row-simple">
                  <span className="vehicle-name-simple">{vehicle.name || vehicle.Vtype || 'Vehicle'}</span>
                  <button 
                    onClick={() => handleAddVehicle(vehicle)}
                    className="add-vehicle-btn-simple"
                    disabled={assignedVehicles.find(v => v._id === vehicle._id)}
                  >
                    ADD
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3) Assigned Vehicles */}
        <div className="panel assigned-panel">
          <h2>Assigned Vehicles</h2>
          <div className="assigned-content">
            {assignedVehicles.length === 0 ? (
              <div className="no-assigned">
                <p>No vehicles assigned yet</p>
              </div>
            ) : (
              <div className="assigned-list">
                {assignedVehicles.map((vehicle) => (
                  <div key={vehicle._id} className="assigned-vehicle-card">
                    <div className="assigned-vehicle-info">
                      <div className="assigned-vehicle-name">{vehicle.name || vehicle.Vtype}</div>
                      <div className="assigned-vehicle-type">{vehicle.Vtype}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveVehicle(vehicle._id)}
                      className="remove-vehicle-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="confirm-section">
            <button 
              onClick={async () => {
                try {
                  console.log('🚨 Starting incident confirmation...');
                  console.log('Assigned vehicles:', assignedVehicles);
                  console.log('Incident data:', incidentData);

                  if (!assignedVehicles || assignedVehicles.length === 0) {
                    alert('Please assign at least one vehicle before confirming the incident.');
                    return;
                  }

                  // Create vehicle assignments in the new EmergencyVehicleAssignment table
                  const assignmentPromises = assignedVehicles.map(async (vehicle) => {
                    console.log('Processing vehicle:', vehicle);
                    console.log('Vehicle ID check:', { 
                      _id: vehicle._id, 
                      vehicleId: vehicle.vehicleId, 
                      name: vehicle.name,
                      hasId: !!vehicle._id,
                      idType: typeof vehicle._id
                    });
                    
                    if (!vehicle._id) {
                      throw new Error(`Vehicle ${vehicle.name || 'Unknown'} has no ID. Vehicle data: ${JSON.stringify(vehicle)}`);
                    }

                    const assignmentData = {
                      emergencyId: incidentData?.callId || incidentData?._id || 'emergency-' + Date.now(),
                      incidentId: incidentData?._id,
                      vehicleId: vehicle._id, // Use MongoDB ObjectId for database lookup
                      vehicleName: vehicle.name || vehicle.Vtype || 'Unknown Vehicle',
                      vehicleType: vehicle.Vtype || 'Emergency Vehicle',
                      assignedCrew: vehicle.assignedCrew || [],
                      priority: incidentData?.priority || 'Medium',
                      notes: `Assigned by Vehicle Officer for ${incidentData?.type || 'Emergency'} incident`
                    };

                    console.log('Assignment data:', assignmentData);

                    const response = await fetch(`${API_BASE}/api/vehicle-officer/emergency-vehicle-assignments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(assignmentData)
                    });

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('API Error for vehicle:', vehicle.name, 'Response:', errorText);
                      console.error('Assignment data that failed:', assignmentData);
                      throw new Error(`Failed to create assignment for vehicle ${vehicle.name}: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log('Assignment created:', result);
                    return result;
                  });

                  // Wait for all assignments to be created
                  const assignmentResults = await Promise.all(assignmentPromises);
                  console.log('✅ All vehicle assignments created:', assignmentResults);

                  // Store confirmed vehicles and show them in the dedicated area
                  setConfirmedVehicles([...assignedVehicles]);
                  setIsIncidentConfirmed(true);
                  
                  // Emit Socket.IO event to notify Station Officers
                  try {
                    const io = (await import('socket.io-client')).default;
                    const socket = io('http://localhost:5000');
                    
                    const eventData = {
                      confirmedVehicles: assignedVehicles.map(vehicle => ({
                        id: vehicle._id,
                        name: vehicle.name || vehicle.Vtype,
                        type: vehicle.Vtype,
                        category: vehicle.category || 'Emergency Vehicle',
                        icon: '🚒',
                        status: 'Assigned & Ready',
                        confirmedAt: new Date().toISOString()
                      })),
                      incidentData: incidentData,
                      confirmedBy: 'Vehicle Officer',
                      totalVehicles: assignedVehicles.length
                    };
                    
                    socket.emit('incidentVehiclesConfirmed', eventData);
                    console.log('✅ Event emitted to Station Officers');
                    
                    // Also emit individual vehicle assignment events for each vehicle
                    assignedVehicles.forEach(vehicle => {
                      const vehicleEventData = {
                        emergencyId: incidentData?.callId || incidentData?._id || 'emergency-' + Date.now(),
                        vehicleId: vehicle._id,
                        vehicleName: vehicle.name || vehicle.Vtype,
                        vehicleType: vehicle.Vtype,
                        assignedCrew: vehicle.assignedCrew || [],
                        assignedAt: new Date().toISOString()
                      };
                      
                      socket.emit('vehicleAssignedToEmergency', vehicleEventData);
                    });
                    
                    console.log('✅ Individual vehicle assignment events emitted');
                    
                    socket.disconnect();
                  } catch (socketError) {
                    console.error('❌ Failed to emit socket event:', socketError);
                  }
                  
                  alert(`Incident confirmed with ${assignedVehicles.length} vehicles assigned!`);
                } catch (error) {
                  console.error('Error confirming incident:', error);
                  alert('Error confirming incident. Please try again.');
                }
              }}
              className="confirm-incident-btn"
            >
              CONFIRM INCIDENT
            </button>
          </div>
        </div>
      </div>

      {/* Confirmed Vehicles Display Area */}
      {isIncidentConfirmed && confirmedVehicles.length > 0 && (
        <div className="confirmed-vehicles-section">
          <div className="confirmed-vehicles-container">
            <div className="confirmed-vehicles-header">
              <h2 className="confirmed-vehicles-title">
                ✅ Incident Confirmed - Assigned Vehicles
              </h2>
              <button 
                onClick={() => setIsIncidentConfirmed(false)}
                className="close-confirmed-btn"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="confirmed-vehicles-grid">
              {confirmedVehicles.map((vehicle, index) => (
                <div key={vehicle._id || index} className="confirmed-vehicle-card">
                  <div className="confirmed-vehicle-icon">
                    🚒
                  </div>
                  <div className="confirmed-vehicle-info">
                    <div className="confirmed-vehicle-name">
                      {vehicle.name || vehicle.Vtype || 'Vehicle'}
                    </div>
                    <div className="confirmed-vehicle-type">
                      {vehicle.Vtype || 'Emergency Vehicle'}
                    </div>
                    <div className="confirmed-vehicle-status">
                      Status: Assigned & Ready
                    </div>
                  </div>
                  <div className="confirmed-vehicle-badge">
                    CONFIRMED
                  </div>
                </div>
              ))}
            </div>
            <div className="confirmed-actions">
              <button 
                onClick={() => navigate('/vehicle-officer')}
                className="back-to-dashboard-btn"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => navigate('/vehicle-officer/map')}
                className="view-map-btn"
              >
                View on Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Assignments Overlay */}
      <ConfirmedAssignmentsOverlay 
        isVisible={showAssignmentsOverlay}
        onClose={() => setShowAssignmentsOverlay(false)}
      />
    </div>
  );
}

export default EmergencyMode;
