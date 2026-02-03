import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import apiService from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./AddVehicle.css";

function AddVehicle() {
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
    image: null
  });

  const [assignedCrew, setAssignedCrew] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [emergencyAssignments, setEmergencyAssignments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const container = document.querySelector('.add-vehicle-container');
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
      
      setInputs((prev) => ({ ...prev, image: file }));
      
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
    setInputs((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('vehicle-image');
    if (fileInput) fileInput.value = '';
  };

  const handleCrewChange = (index, field, value) => {
    setAssignedCrew(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addCrewMember = () => setAssignedCrew(prev => [...prev, { crewMemberId: '', crewMemberName: '', role: '' }]);
  const removeCrewMember = (i) => setAssignedCrew(prev => prev.filter((_, idx) => idx !== i));

  const addMaintenanceItem = () => setMaintenanceHistory(prev => [...prev, { requestId: '', issue: '', priority: 'Medium', status: 'Pending', notes: '' }]);
  const updateMaintenanceItem = (index, field, value) => setMaintenanceHistory(prev => prev.map((m,i)=> i===index ? { ...m, [field]: value } : m));
  const removeMaintenanceItem = (i) => setMaintenanceHistory(prev => prev.filter((_, idx) => idx !== i));

  const addEmergencyAssignment = () => setEmergencyAssignments(prev => [...prev, { emergencyId: '', emergencyType: '', location: '', status: 'Active' }]);
  const updateEmergencyAssignment = (index, field, value) => setEmergencyAssignments(prev => prev.map((m,i)=> i===index ? { ...m, [field]: value } : m));
  const removeEmergencyAssignment = (i) => setEmergencyAssignments(prev => prev.filter((_, idx) => idx !== i));

  const validateStep1 = () => {
    if (!inputs.vehicleId.trim()) {
      setError("Vehicle ID is required");
      return false;
    }
    if (inputs.vehicleId.trim().length < 3 || inputs.vehicleId.trim().length > 20) {
      setError("Vehicle ID must be 3-20 characters");
      return false;
    }
    if (!inputs.name.trim()) {
      setError("Vehicle name is required");
      return false;
    }
    if (inputs.name.trim().length < 2 || inputs.name.trim().length > 50) {
      setError("Vehicle name must be 2-50 characters");
      return false;
    }
    if (!inputs.Vtype) {
      setError("Please select a vehicle type");
      return false;
    }
    if (!inputs.maxCrew || inputs.maxCrew < 1 || inputs.maxCrew > 10) {
      setError("Maximum crew size must be between 1 and 10");
      return false;
    }
    if (!inputs.Capacity || inputs.Capacity < 1) {
      setError("Capacity must be at least 1 liter");
      return false;
    }
    const currentYear = new Date().getFullYear();
    if (inputs.year && (Number(inputs.year) < 1900 || Number(inputs.year) > currentYear)) {
      setError(`Year must be between 1900 and ${currentYear}`);
      return false;
    }
    if (!/^[A-Z0-9-]+$/.test(inputs.vehicleId.trim().toUpperCase())) {
      setError("Vehicle ID must contain only uppercase letters, numbers, and hyphens");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setError("");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateStep1()) {
      setIsLoading(false);
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
      
      // Add image if selected
      if (inputs.image) {
        formData.append('image', inputs.image);
      }

      await apiService.createVehicleOfficerVehicle(formData);
      
      alert("Vehicle added successfully!");
      try { window.dispatchEvent(new CustomEvent('vehicleAdded', { detail: payload })); } catch(e){}
      navigate("/vehicle-officer/vehicles");
    } catch (err) {
      console.error(err);
      
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.join(', ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid data provided. Please check your input.");
      } else {
        setError("Failed to add vehicle. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const vehicleTypes = [
    "Fire Truck",
    "Water Tanker", 
    "Rescue Vehicle",
    "Command Vehicle",
    "Ambulance",
    "Police Car",
    "Ladder Truck",
    "Hazmat Vehicle",
    "Medical Response Unit",
    "Search & Rescue Vehicle"
  ];

  return (
    <div className="add-vehicle-container">
      <Sidebar />
      <div className="add-vehicle-content">
        {/* Header */}
        <div className="add-vehicle-header">
          <div className="header-content">
            <h1>Add New Vehicle</h1>
            <p>Complete vehicle registration and configuration</p>
          </div>
          <div className="step-indicator">
            <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Basic Info</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Details & Crew</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <p>{error}</p>
            </div>
            <button onClick={() => setError("")} className="error-close">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-vehicle-form">
          <div className="form-panels">
            {/* Left Panel - Basic Information */}
            <div className="form-panel left-panel">
              <div className="panel-header">
                <h2>Basic Information</h2>
                <p>Essential vehicle details and identification</p>
              </div>

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
                  placeholder="e.g., FT-001, AMB-001"
                  required
                  maxLength="20"
                  minLength="3"
                  pattern="[A-Z0-9\-]+"
                />
                <small className="form-hint">Uppercase letters, numbers, and hyphens only</small>
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
                  placeholder="e.g., Engine 1, Ambulance Alpha"
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
                    placeholder="1-10"
                    required
                    min="1"
                    max="10"
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
                    placeholder="Liters"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" value={inputs.status} onChange={handleChange} className="form-input">
                    <option value="Available">Available</option>
                    <option value="On Call">On Call</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select name="condition" value={inputs.condition} onChange={handleChange} className="form-input">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Panel - Advanced Details */}
            <div className="form-panel right-panel">
              <div className="panel-header">
                <h2>Advanced Details</h2>
                <p>Technical specifications and maintenance info</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select name="fuelType" value={inputs.fuelType} onChange={handleChange} className="form-input">
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fuel Level (%)</label>
                  <input 
                    type="number" 
                    name="fuelLevel" 
                    value={inputs.fuelLevel} 
                    onChange={handleChange} 
                    className="form-input" 
                    min="0" 
                    max="100" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Water Capacity (L)</label>
                  <input 
                    type="number" 
                    name="waterCapacity" 
                    value={inputs.waterCapacity} 
                    onChange={handleChange} 
                    className="form-input" 
                    min="0" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Water Level (%)</label>
                  <input 
                    type="number" 
                    name="waterLevel" 
                    value={inputs.waterLevel} 
                    onChange={handleChange} 
                    className="form-input" 
                    min="0" 
                    max="100" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fuel Consumption</label>
                  <input 
                    name="fuelConsumption" 
                    value={inputs.fuelConsumption} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder={inputs.fuelType === 'Diesel' ? 'e.g., 8.5 L/100km' : inputs.fuelType === 'Petrol' ? 'e.g., 12.3 L/100km' : 'e.g., 0 kWh/100km'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Engine Capacity</label>
                  <input 
                    name="engineCapacity" 
                    value={inputs.engineCapacity} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder={inputs.fuelType === 'Diesel' ? 'e.g., 6.7L V8' : inputs.fuelType === 'Petrol' ? 'e.g., 5.0L V8' : 'e.g., 200kW Electric'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input 
                    type="number" 
                    name="year" 
                    value={inputs.year} 
                    onChange={handleChange} 
                    className="form-input" 
                    min="1900" 
                    max={new Date().getFullYear()} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maintenance Status</label>
                  <select name="maintenanceStatus" value={inputs.maintenanceStatus} onChange={handleChange} className="form-input">
                    <option value="Good">Good</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Maintenance</label>
                  <input 
                    type="date" 
                    name="lastMaintenance" 
                    value={inputs.lastMaintenance} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Next Maintenance</label>
                  <input 
                    type="date" 
                    name="nextMaintenance" 
                    value={inputs.nextMaintenance} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate("/vehicle-officer/vehicles")}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Adding Vehicle...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVehicle;