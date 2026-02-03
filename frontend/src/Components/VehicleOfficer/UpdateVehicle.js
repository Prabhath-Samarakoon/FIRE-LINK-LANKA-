import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './UpdateVehicle.css';

function UpdateVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({
    vehicleId: "",
    name: "",
    Vtype: "",
    maxCrew: "",
    Capacity: "",
    status: 'Available',
    fuelLevel: 100,
    waterLevel: 100,
    fuelType: 'Diesel',
    waterCapacity: 2000,
    maintenanceStatus: 'Good',
    condition: 'Good',
    year: new Date().getFullYear(),
    fuelConsumption: '',
    engineCapacity: '',
    lastMaintenance: '',
    nextMaintenance: '',
    imagePath: null
  });

  const [assignedCrew, setAssignedCrew] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [emergencyAssignments, setEmergencyAssignments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);

  // Vehicle type options for auto-suggestions
  const vehicleTypes = [
    'Fire Truck', 'Water Tanker', 'Rescue Vehicle', 'Command Vehicle', 
    'Ambulance', 'Police Car', 'Ladder Truck', 'Hazmat Vehicle', 
    'Medical Response Unit', 'Search & Rescue Vehicle'
  ];

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const container = document.querySelector('.update-vehicle-container');
      if (container) {
        if (event.detail.isCollapsed) {
          container.classList.add('sidebar-collapsed');
        } else {
          container.classList.remove('sidebar-collapsed');
        }
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  useEffect(() => {
    const onFuelUpdated = (e) => {
      const { vehicleId, vehicleName, fuelLevel } = e.detail || {};
      setInputs(prev => {
        const idMatch = prev.vehicleId && vehicleId && String(prev.vehicleId) === String(vehicleId);
        const nameMatch = prev.name && vehicleName && prev.name === vehicleName;
        return (idMatch || nameMatch) ? { ...prev, fuelLevel: Number(fuelLevel ?? prev.fuelLevel) } : prev;
      });
    };
    const onVehiclesUpdated = async (e) => {
      // Pull latest from backend to be safe
      try { const res = await apiService.getVehicleOfficerVehicleById(id); const v = res.vehicle || {}; setInputs(prev => ({ ...prev, fuelLevel: v.fuelLevel ?? prev.fuelLevel })); } catch {}
    };
    window.addEventListener('resourceFuelUpdated', onFuelUpdated);
    window.addEventListener('vehiclesUpdated', onVehiclesUpdated);
    return () => { window.removeEventListener('resourceFuelUpdated', onFuelUpdated); window.removeEventListener('vehiclesUpdated', onVehiclesUpdated); };
  }, [id]);

  const fetchVehicle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiService.getVehicleOfficerVehicleById(id);
      const v = response.vehicle || {};
      
      setInputs({
        vehicleId: v.vehicleId || "",
        name: v.name || "",
        Vtype: v.Vtype || "",
        maxCrew: v.maxCrew || "",
        Capacity: v.Capacity || "",
        status: v.status || 'Available',
        fuelLevel: v.fuelLevel ?? 100,
        waterLevel: v.waterLevel ?? 100,
        fuelType: v.fuelType || 'Diesel',
        waterCapacity: v.waterCapacity ?? 2000,
        maintenanceStatus: v.maintenanceStatus || 'Good',
        condition: v.condition || 'Good',
        year: v.year || new Date().getFullYear(),
        fuelConsumption: v.fuelConsumption || '',
        engineCapacity: v.engineCapacity || '',
        lastMaintenance: v.lastMaintenance ? new Date(v.lastMaintenance).toISOString().slice(0,10) : '',
        nextMaintenance: v.nextMaintenance ? new Date(v.nextMaintenance).toISOString().slice(0,10) : '',
        imagePath: v.imagePath || null
      });

      setAssignedCrew(v.assignedCrew || []);
      setMaintenanceHistory(v.maintenanceHistory || []);
      setEmergencyAssignments(v.emergencyAssignments || []);
      
      // Set image preview if vehicle has an existing image
      if (v.imagePath) {
        setImagePreview(`http://localhost:5000${v.imagePath}`);
      }
      
      // override fuel level from Resource Management if available
      if (v.vehicleId) {
        try {
          const res = await apiService.getResourceManagementByVehicle(v.vehicleId);
          const list = res?.resourceManagement || res?.data || [];
          const record = Array.isArray(list) ? list[0] : list;
          if (record && typeof record.currentFuelLevel === 'number') {
            setInputs(prev => ({ ...prev, fuelLevel: record.currentFuelLevel }));
          }
        } catch {}
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to fetch vehicle details');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setNewImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setNewImage(null);
    setImagePreview(inputs.imagePath ? `http://localhost:5000${inputs.imagePath}` : null);
    // Reset file input
    const fileInput = document.getElementById('vehicle-image');
    if (fileInput) fileInput.value = '';
  };

  const handleCrewChange = (index, field, value) => {
    setAssignedCrew(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addCrewMember = () => {
    setAssignedCrew(prev => [...prev, { crewMemberId: '', crewMemberName: '', role: '', assignedDate: new Date().toISOString().slice(0,10) }]);
  };

  const removeCrewMember = (index) => {
    setAssignedCrew(prev => prev.filter((_, i) => i !== index));
  };

  const handleMaintenanceChange = (index, field, value) => {
    setMaintenanceHistory(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMaintenanceRecord = () => {
    setMaintenanceHistory(prev => [...prev, { requestId: '', issue: '', priority: 'Medium', status: 'Pending', requestedDate: new Date().toISOString().slice(0,10), completedDate: '', notes: '' }]);
  };

  const removeMaintenanceRecord = (index) => {
    setMaintenanceHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmergencyChange = (index, field, value) => {
    setEmergencyAssignments(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const addEmergencyAssignment = () => {
    setEmergencyAssignments(prev => [...prev, { emergencyId: '', emergencyType: '', location: '', assignedDate: new Date().toISOString().slice(0,10), status: 'Active' }]);
  };

  const removeEmergencyAssignment = (index) => {
    setEmergencyAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!inputs.vehicleId.trim()) {
      setError('Vehicle ID is required');
      return false;
    }
    if (!inputs.name.trim()) {
      setError('Vehicle name is required');
      return false;
    }
    if (!inputs.Vtype) {
      setError('Vehicle type is required');
      return false;
    }
    if (!inputs.maxCrew || inputs.maxCrew < 1 || inputs.maxCrew > 10) {
      setError('Max crew must be between 1 and 10');
      return false;
    }
    if (!inputs.Capacity || inputs.Capacity < 1) {
      setError('Capacity must be at least 1');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!validateStep1()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('vehicleId', inputs.vehicleId.trim().toUpperCase());
      formData.append('name', inputs.name.trim());
      formData.append('Vtype', inputs.Vtype);
      formData.append('maxCrew', Number(inputs.maxCrew));
      formData.append('Capacity', Number(inputs.Capacity));
      formData.append('status', inputs.status);
      formData.append('fuelLevel', Number(inputs.fuelLevel));
      formData.append('waterLevel', Number(inputs.waterLevel));
      formData.append('fuelType', inputs.fuelType);
      formData.append('waterCapacity', Number(inputs.waterCapacity));
      formData.append('maintenanceStatus', inputs.maintenanceStatus);
      formData.append('condition', inputs.condition);
      formData.append('year', Number(inputs.year));
      formData.append('fuelConsumption', inputs.fuelConsumption || '');
      formData.append('engineCapacity', inputs.engineCapacity || '');
      formData.append('lastMaintenance', inputs.lastMaintenance || '');
      formData.append('nextMaintenance', inputs.nextMaintenance || '');
      formData.append('assignedCrew', JSON.stringify(assignedCrew));
      formData.append('maintenanceHistory', JSON.stringify(maintenanceHistory));
      formData.append('emergencyAssignments', JSON.stringify(emergencyAssignments));
      
      // Add new image if selected
      if (newImage) {
        formData.append('image', newImage);
      }

      await apiService.updateVehicleOfficerVehicle(id, formData);
      
      alert("Vehicle updated successfully!");
      try { window.dispatchEvent(new CustomEvent('vehicleUpdated', { detail: { id } })); } catch(e){}
      navigate("/vehicle-officer/vehicles");
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError(err.response?.data?.message || 'Failed to update vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await apiService.deleteVehicleOfficerVehicle(id);
        alert('Vehicle deleted successfully!');
        try { window.dispatchEvent(new CustomEvent('vehicleDeleted', { detail: { id } })); } catch(e){}
        navigate('/vehicle-officer/vehicles');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="update-vehicle-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error && !inputs.vehicleId) {
    return (
      <div className="update-vehicle-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Vehicle</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/vehicle-officer/vehicles')} className="btn btn-primary">
            BACK TO VEHICLE LIST
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="update-vehicle-container">
      <div className="update-vehicle-header">
        <h1 className="header-title">✏️ Update Vehicle</h1>
        <div className="step-indicator">
          <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Basic Info</span>
          </div>
          <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Advanced Details</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-vehicle-form-grid">
        {/* Left Panel - Basic Information */}
        <div className="form-panel">
          <div className="panel-header">
            <h2>🚗 Basic Information</h2>
            <p>Essential vehicle details and identification</p>
          </div>

          <div className="form-content">
            <div className="form-group">
              <label className="form-label">
                Vehicle ID <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="vehicleId"
                value={inputs.vehicleId}
                onChange={handleChange}
                placeholder="e.g., FEP-001"
                required
                maxLength="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Vehicle Name <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={inputs.name}
                onChange={handleChange}
                placeholder="e.g., Fire Engine Pumper"
                required
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Vehicle Type <span className="required">*</span>
              </label>
              <select
                className="form-input"
                name="Vtype"
                value={inputs.Vtype}
                onChange={handleChange}
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Image</label>
              <div className="image-upload-section">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Vehicle preview" className="image-preview" />
                    <div className="image-actions">
                      <button type="button" onClick={removeImage} className="btn-remove-image">
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="vehicle-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                    />
                    <label htmlFor="vehicle-image" className="image-upload-label">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">
                        <span className="upload-title">Upload Vehicle Image</span>
                        <span className="upload-hint">Click to select or drag & drop</span>
                        <span className="upload-format">PNG, JPG, JPEG up to 5MB</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Max Crew <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  name="maxCrew"
                  value={inputs.maxCrew}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Capacity (L) <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  name="Capacity"
                  value={inputs.Capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                name="status"
                value={inputs.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="On Call">On Call</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Panel - Advanced Details */}
        <div className="form-panel">
          <div className="panel-header">
            <h2>⚙️ Advanced Details</h2>
            <p>Technical specifications and maintenance info</p>
          </div>

          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fuel Level (%)</label>
                <input
                  className="form-input"
                  type="number"
                  name="fuelLevel"
                  value={inputs.fuelLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Water Level (%)</label>
                <input
                  className="form-input"
                  type="number"
                  name="waterLevel"
                  value={inputs.waterLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  className="form-input"
                  name="fuelType"
                  value={inputs.fuelType}
                  onChange={handleChange}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Water Capacity (L)</label>
                <input
                  className="form-input"
                  type="number"
                  name="waterCapacity"
                  value={inputs.waterCapacity}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Maintenance Status</label>
                <select
                  className="form-input"
                  name="maintenanceStatus"
                  value={inputs.maintenanceStatus}
                  onChange={handleChange}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-input"
                  name="condition"
                  value={inputs.condition}
                  onChange={handleChange}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  className="form-input"
                  type="number"
                  name="year"
                  value={inputs.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Consumption</label>
                <input
                  className="form-input"
                  type="text"
                  name="fuelConsumption"
                  value={inputs.fuelConsumption}
                  onChange={handleChange}
                  placeholder={inputs.fuelType === 'Diesel' ? 'e.g., 8.5 L/100km' : inputs.fuelType === 'Petrol' ? 'e.g., 12.3 L/100km' : 'e.g., 0 kWh/100km'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Engine Capacity</label>
              <input
                className="form-input"
                type="text"
                name="engineCapacity"
                value={inputs.engineCapacity}
                onChange={handleChange}
                placeholder={inputs.fuelType === 'Diesel' ? 'e.g., 6.7L V8' : inputs.fuelType === 'Petrol' ? 'e.g., 5.0L V8' : 'e.g., 200kW Electric'}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Last Maintenance</label>
                <input
                  className="form-input"
                  type="date"
                  name="lastMaintenance"
                  value={inputs.lastMaintenance}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Maintenance</label>
                <input
                  className="form-input"
                  type="date"
                  name="nextMaintenance"
                  value={inputs.nextMaintenance}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '💾 Updating...' : '💾 Update Vehicle'}
          </button>
          
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/vehicle-officer/vehicles')}
            disabled={isSubmitting}
          >
            ❌ Cancel
          </button>
          
          <button 
            type="button" 
            className="delete-btn"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            🗑️ Delete Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateVehicle;