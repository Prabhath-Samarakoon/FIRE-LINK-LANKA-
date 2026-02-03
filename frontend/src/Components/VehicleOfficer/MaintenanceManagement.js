import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaintenanceManagement.css';
import apiService from '../../services/api';

const MaintenanceManagement = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [approveData, setApproveData] = useState({ approvedBy: '', assignedTo: '', estimatedCost: 0, estimatedDuration: 4 });
  const [completeData, setCompleteData] = useState({ actualCost: 0, actualDuration: 1, diagnosis: '', solution: '', partsReplaced: '', notes: '' });
  const [formData, setFormData] = useState({
    requestId: '',
    selectedVehicle: '',
    vehicleName: '',
    issue: '',
    category: 'Engine',
    priority: 'Medium',
    requestedBy: '',
    symptoms: '',
    estimatedCost: 0,
    estimatedDuration: 4
  });


  useEffect(() => {
    fetchMaintenanceRequests();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await apiService.getVehicleOfficerVehicles();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/vehicle-officer/maintenance-requests');
      setMaintenanceRequests(response.data.maintenanceRequests || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setError('Failed to load maintenance requests. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requestId: '',
      selectedVehicle: '',
      vehicleName: '',
      issue: '',
      category: 'Engine',
      priority: 'Medium',
      requestedBy: '',
      symptoms: '',
      estimatedCost: 0,
      estimatedDuration: 4
    });
    setEditingRequest(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Find the selected vehicle
      const selectedVehicle = vehicles.find(v => v._id === formData.selectedVehicle);
      
      // Prepare the data to submit
      const submitData = {
        ...formData,
        vehicleId: selectedVehicle?.vehicleId || selectedVehicle?._id,
        vehicleName: selectedVehicle?.name || ''
      };

      if (editingRequest) {
        // Update existing request
        await axios.put(`http://localhost:5000/api/vehicle-officer/maintenance-requests/${editingRequest._id}`, submitData);
        alert('Maintenance request updated successfully!');
      } else {
        // Add new request
        await axios.post('http://localhost:5000/api/vehicle-officer/maintenance-requests/add', submitData);
        alert('Maintenance request added successfully!');
      }
      
      setShowForm(false);
      resetForm();
      fetchMaintenanceRequests();
      try { window.dispatchEvent(new CustomEvent('maintenanceChanged')); } catch (_) {}
    } catch (error) {
      console.error('Error saving maintenance request:', error);
      setError(error.response?.data?.message || 'Error saving maintenance request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    
    // Find the vehicle that matches the request's vehicle info
    const matchingVehicle = vehicles.find(v => 
      v.vehicleId === request.vehicleId || 
      v.name === request.vehicleName ||
      v._id === request.vehicleId
    );
    
    setFormData({
      requestId: request.requestId || '',
      selectedVehicle: matchingVehicle?._id || '',
      vehicleName: request.vehicleName || '',
      issue: request.issue || '',
      category: request.category || 'Engine',
      priority: request.priority || 'Medium',
      requestedBy: request.requestedBy || '',
      symptoms: request.symptoms || '',
      estimatedCost: request.estimatedCost || 0,
      estimatedDuration: request.estimatedDuration || 4
    });
    setShowForm(true);
  };

  const deleteMaintenance = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/vehicle-officer/maintenance-requests/${id}`);
        alert('Maintenance request deleted successfully!');
        fetchMaintenanceRequests();
        try { window.dispatchEvent(new CustomEvent('maintenanceChanged')); } catch (_) {}
      } catch (error) {
        console.error('Error deleting maintenance request:', error);
        alert(error.response?.data?.message || 'Error deleting maintenance request. Please try again.');
      }
    }
  };

  const clearAllMaintenance = async () => {
    if (window.confirm('Are you sure you want to delete ALL maintenance requests? This action cannot be undone.')) {
      try {
        // Delete all maintenance requests one by one (since we don't have a bulk delete endpoint)
        for (const request of maintenanceRequests) {
          await axios.delete(`http://localhost:5000/api/vehicle-officer/maintenance-requests/${request._id}`);
        }
        alert('All maintenance requests deleted successfully!');
        fetchMaintenanceRequests();
      } catch (error) {
        console.error('Error clearing maintenance requests:', error);
        alert(error.response?.data?.message || 'Error clearing maintenance requests. Please try again.');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    resetForm();
  };

  const handleVehicleChange = (vehicleId) => {
    const selectedVehicle = vehicles.find(v => v._id === vehicleId);
    setFormData(prev => ({
      ...prev,
      selectedVehicle: vehicleId,
      vehicleName: selectedVehicle?.name || ''
    }));
  };

  const openApproveForm = (request) => {
    setTransitionTarget(request);
    setApproveData({ approvedBy: '', assignedTo: '', estimatedCost: request.estimatedCost || 0, estimatedDuration: request.estimatedDuration || 4 });
    setShowApproveForm(true);
  };

  const openStart = async (request) => {
    if (!window.confirm('Start maintenance work for this request?')) return;
    try {
      await axios.post('http://localhost:5000/api/vehicle-officer/maintenance-requests/start', { requestId: request._id });
      fetchMaintenanceRequests();
      try { window.dispatchEvent(new CustomEvent('maintenanceChanged')); } catch (_) {}
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start maintenance');
    }
  };

  const openCompleteForm = (request) => {
    setTransitionTarget(request);
    setCompleteData({ actualCost: 0, actualDuration: 1, diagnosis: '', solution: '', partsReplaced: '', notes: '' });
    setShowCompleteForm(true);
  };

  const submitApprove = async (e) => {
    e.preventDefault();
    if (!transitionTarget) return;
    try {
      await axios.post('http://localhost:5000/api/vehicle-officer/maintenance-requests/approve', {
        requestId: transitionTarget._id,
        ...approveData
      });
      setShowApproveForm(false);
      setTransitionTarget(null);
      fetchMaintenanceRequests();
      try { window.dispatchEvent(new CustomEvent('maintenanceChanged')); } catch (_) {}
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!transitionTarget) return;
    try {
      await axios.post('http://localhost:5000/api/vehicle-officer/maintenance-requests/complete', {
        requestId: transitionTarget._id,
        ...completeData,
        partsReplaced: completeData.partsReplaced ? completeData.partsReplaced.split(',').map(p => p.trim()).filter(Boolean) : []
      });
      setShowCompleteForm(false);
      setTransitionTarget(null);
      fetchMaintenanceRequests();
      try { window.dispatchEvent(new CustomEvent('maintenanceChanged')); } catch (_) {}
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete maintenance');
    }
  };

  const categories = [
    "Engine",
    "Electrical",
    "Hydraulic", 
    "Body",
    "Equipment",
    "Tires",
    "Brakes",
    "Transmission",
    "Cooling System",
    "Fuel System",
    "Other"
  ];

  const priorities = [
    "Low",
    "Medium", 
    "High",
    "Critical"
  ];

  return (
    <div className="maintenance-management">
      <div className="maintenance-header">
        <h1>🔧 Maintenance Management</h1>
        <p>Manage vehicle maintenance requests and repairs</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMaintenanceRequests} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      )}

      <div className="maintenance-content">
        <div className="filter-row">
          <button className={`filter-btn ${statusFilter==='All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>All</button>
          <button className={`filter-btn ${statusFilter==='Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>Pending</button>
          <button className={`filter-btn ${statusFilter==='Approved' ? 'active' : ''}`} onClick={() => setStatusFilter('Approved')}>Approved</button>
          <button className={`filter-btn ${statusFilter==='In Progress' ? 'active' : ''}`} onClick={() => setStatusFilter('In Progress')}>In Progress</button>
          <button className={`filter-btn ${statusFilter==='Completed' ? 'active' : ''}`} onClick={() => setStatusFilter('Completed')}>Completed</button>
        </div>
        <div className="maintenance-section">
          <div className="section-header">
            <h2>Maintenance Requests</h2>
            <div className="header-actions">
              <button 
                className="add-btn"
                onClick={() => setShowForm(true)}
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                ➕ Add Request
              </button>
              {maintenanceRequests.length > 0 && (
                <button 
                  className="clear-btn"
                  onClick={clearAllMaintenance}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading maintenance requests...</div>
          ) : maintenanceRequests.length === 0 ? (
            <div className="no-data">
              <h3>No maintenance requests found</h3>
              <p>Add your first maintenance request to get started</p>
              <button onClick={() => setShowForm(true)} className="add-btn">
                ➕ Add First Request
              </button>
            </div>
          ) : (
            <div className="maintenance-grid">
              {maintenanceRequests
                .filter(m => statusFilter==='All' ? true : (m.status || 'Pending') === statusFilter)
                .map(maintenance => (
                <div key={maintenance._id} className="maintenance-card">
                  <div className="card-header">
                    <h3>{maintenance.requestId}</h3>
                    <span className={`status-badge ${maintenance.status?.toLowerCase().replace(' ', '-') || 'pending'}`}>
                      {maintenance.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-content">
                    <p><strong>Vehicle:</strong> {maintenance.vehicleName}</p>
                    <p><strong>Issue:</strong> {maintenance.issue}</p>
                    <p><strong>Category:</strong> {maintenance.category}</p>
                    <p><strong>Priority:</strong> {maintenance.priority}</p>
                    <p><strong>Requested By:</strong> {maintenance.requestedBy}</p>
                    <p>
                      <strong>Cost{maintenance.status === 'Completed' ? ' (Actual)' : ' (Estimated)'}:</strong> $
                      {maintenance.status === 'Completed' && maintenance.actualCost !== undefined && maintenance.actualCost !== null
                        ? maintenance.actualCost
                        : maintenance.estimatedCost}
                    </p>
                    <p>
                      <strong>Duration{maintenance.status === 'Completed' ? ' (Actual)' : ' (Estimated)'}:</strong> 
                      {maintenance.status === 'Completed' && maintenance.actualDuration !== undefined && maintenance.actualDuration !== null
                        ? maintenance.actualDuration
                        : maintenance.estimatedDuration} hours
                    </p>
                    {maintenance.status === 'Completed' && (
                      <>
                        {maintenance.diagnosis && (<p><strong>Diagnosis:</strong> {maintenance.diagnosis}</p>)}
                        {maintenance.solution && (<p><strong>Solution:</strong> {maintenance.solution}</p>)}
                        {Array.isArray(maintenance.partsReplaced) && maintenance.partsReplaced.length > 0 && (
                          <p><strong>Parts Replaced:</strong> {maintenance.partsReplaced.join(', ')}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(maintenance)}
                      style={{ backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteMaintenance(maintenance._id)}
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      🗑️ Delete
                    </button>
                    {(maintenance.status === 'Pending' || !maintenance.status) && (
                      <button 
                        className="approve-btn" 
                        onClick={() => openApproveForm(maintenance)}
                        style={{ backgroundColor: '#10b981', color: 'white' }}
                      >
                        ✅ Approve
                      </button>
                    )}
                    {maintenance.status === 'Approved' && (
                      <button 
                        className="start-btn" 
                        onClick={() => openStart(maintenance)}
                        style={{ backgroundColor: '#3b82f6', color: 'white' }}
                      >
                        ▶️ Start
                      </button>
                    )}
                    {maintenance.status === 'In Progress' && (
                      <button 
                        className="complete-btn" 
                        onClick={() => openCompleteForm(maintenance)}
                        style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                      >
                        ✅ Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingRequest ? 'Edit Maintenance Request' : 'Add New Maintenance Request'}</h3>
              <button onClick={handleFormClose}>✖</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label>Request ID:</label>
                <input
                  type="text"
                  value={formData.requestId}
                  onChange={(e) => setFormData({...formData, requestId: e.target.value})}
                  placeholder="MNT_001"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Select Vehicle:</label>
                  <select
                    value={formData.selectedVehicle}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a vehicle...</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} ({vehicle.Vtype}) - {vehicle.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle Name:</label>
                  <input
                    type="text"
                    value={formData.vehicleName}
                    onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                    placeholder="Vehicle name (auto-filled)"
                    required
                    disabled={isSubmitting}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    disabled={isSubmitting}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    disabled={isSubmitting}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Issue:</label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => setFormData({...formData, issue: e.target.value})}
                  placeholder="Describe the maintenance issue"
                  required
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Symptoms:</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe any symptoms or warning signs"
                  rows="2"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Requested By:</label>
                  <input
                    type="text"
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                    placeholder="Enter requester name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Cost ($):</label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Estimated Duration (hours):</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value)})}
                  min="1"
                  max="168"
                  placeholder="4"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{ 
                    backgroundColor: editingRequest ? '#f59e0b' : '#10b981', 
                    color: 'white' 
                  }}
                >
                  {isSubmitting ? 'Saving...' : (editingRequest ? 'Update Request' : 'Add Request')}
                </button>
                <button 
                  type="button" 
                  onClick={handleFormClose} 
                  className="cancel-btn"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApproveForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Approve Maintenance Request</h3>
              <button onClick={() => setShowApproveForm(false)}>✖</button>
            </div>
            <form onSubmit={submitApprove} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Approved By:</label>
                  <input type="text" value={approveData.approvedBy} onChange={(e)=>setApproveData({...approveData, approvedBy:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Assigned To:</label>
                  <input type="text" value={approveData.assignedTo} onChange={(e)=>setApproveData({...approveData, assignedTo:e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estimated Cost ($):</label>
                  <input type="number" min="0" step="0.01" value={approveData.estimatedCost} onChange={(e)=>setApproveData({...approveData, estimatedCost: parseFloat(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Estimated Duration (hours):</label>
                  <input type="number" min="1" value={approveData.estimatedDuration} onChange={(e)=>setApproveData({...approveData, estimatedDuration: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  Approve
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={()=>setShowApproveForm(false)}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Complete Maintenance</h3>
              <button onClick={() => setShowCompleteForm(false)}>✖</button>
            </div>
            <form onSubmit={submitComplete} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Actual Cost ($):</label>
                  <input type="number" min="0" step="0.01" value={completeData.actualCost} onChange={(e)=>setCompleteData({...completeData, actualCost: parseFloat(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Actual Duration (hours):</label>
                  <input type="number" min="1" value={completeData.actualDuration} onChange={(e)=>setCompleteData({...completeData, actualDuration: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis:</label>
                <textarea rows="2" value={completeData.diagnosis} onChange={(e)=>setCompleteData({...completeData, diagnosis:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Solution:</label>
                <textarea rows="2" value={completeData.solution} onChange={(e)=>setCompleteData({...completeData, solution:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Parts Replaced (comma separated):</label>
                <input type="text" value={completeData.partsReplaced} onChange={(e)=>setCompleteData({...completeData, partsReplaced:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea rows="2" value={completeData.notes} onChange={(e)=>setCompleteData({...completeData, notes:e.target.value})} />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                >
                  Complete
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={()=>setShowCompleteForm(false)}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;


