import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmergencyManagement.css';

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingEmergency, setEditingEmergency] = useState(null);
  const [formData, setFormData] = useState({
    emergencyId: '',
    emergencyType: 'Fire',
    location: '',
    priority: 'Medium',
    description: '',
    reporterName: '',
    reporterPhone: ''
  });


  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/vehicle-officer/emergency-assignments');
      setEmergencies(response.data.emergencyAssignments || []);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setError('Failed to load emergency assignments. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      emergencyId: '',
      emergencyType: 'Fire',
      location: '',
      priority: 'Medium',
      description: '',
      reporterName: '',
      reporterPhone: ''
    });
    setEditingEmergency(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingEmergency) {
        // Update existing emergency
        await axios.put(`http://localhost:5000/api/vehicle-officer/emergency-assignments/${editingEmergency._id}`, formData);
        alert('Emergency updated successfully!');
      } else {
        // Add new emergency
        await axios.post('http://localhost:5000/api/vehicle-officer/emergency-assignments/add', formData);
        alert('Emergency added successfully!');
      }
      
      setShowForm(false);
      resetForm();
      fetchEmergencies();
    } catch (error) {
      console.error('Error saving emergency:', error);
      setError(error.response?.data?.message || 'Error saving emergency. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (emergency) => {
    setEditingEmergency(emergency);
    setFormData({
      emergencyId: emergency.emergencyId || '',
      emergencyType: emergency.emergencyType || 'Fire',
      location: emergency.location || '',
      priority: emergency.priority || 'Medium',
      description: emergency.description || '',
      reporterName: emergency.reporterName || '',
      reporterPhone: emergency.reporterPhone || ''
    });
    setShowForm(true);
  };


  const deleteEmergency = async (id) => {
    if (window.confirm('Are you sure you want to delete this emergency? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/vehicle-officer/emergency-assignments/${id}`);
        alert('Emergency deleted successfully!');
        fetchEmergencies();
      } catch (error) {
        console.error('Error deleting emergency:', error);
        alert(error.response?.data?.message || 'Error deleting emergency. Please try again.');
      }
    }
  };

  const clearAllEmergencies = async () => {
    if (window.confirm('Are you sure you want to delete ALL emergency assignments? This action cannot be undone.')) {
      try {
        // Delete all emergencies one by one (since we don't have a bulk delete endpoint)
        for (const emergency of emergencies) {
          await axios.delete(`http://localhost:5000/api/vehicle-officer/emergency-assignments/${emergency._id}`);
        }
        alert('All emergency assignments deleted successfully!');
        fetchEmergencies();
      } catch (error) {
        console.error('Error clearing emergencies:', error);
        alert(error.response?.data?.message || 'Error clearing emergencies. Please try again.');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    resetForm();
  };

  const emergencyTypes = [
    "Fire",
    "Rescue", 
    "Medical",
    "Hazardous Material",
    "Vehicle Accident",
    "Natural Disaster",
    "Building Collapse",
    "Chemical Spill",
    "Gas Leak",
    "Electrical Emergency"
  ];

  const priorities = [
    "Low",
    "Medium", 
    "High",
    "Critical"
  ];

  return (
    <div className="emergency-management">
      <div className="emergency-header">
        <h1>🚨 Emergency Management</h1>
        <p>Manage emergency assignments and response operations</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchEmergencies} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      )}

      <div className="emergency-content">
        <div className="emergency-section">
          <div className="section-header">
            <h2>Emergency Assignments</h2>
            <div className="header-actions">
              <button 
                className="add-btn"
                onClick={() => setShowForm(true)}
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                ➕ Add Emergency
              </button>
              {emergencies.length > 0 && (
                <button 
                  className="clear-btn"
                  onClick={clearAllEmergencies}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading emergencies...</div>
          ) : emergencies.length === 0 ? (
            <div className="no-data">
              <h3>No emergency assignments found</h3>
              <p>Add your first emergency assignment to get started</p>
              <button onClick={() => setShowForm(true)} className="add-btn">
                ➕ Add First Emergency
              </button>
            </div>
          ) : (
            <div className="emergency-grid">
              {emergencies.map(emergency => (
                <div key={emergency._id} className="emergency-card">
                  <div className="card-header">
                    <h3>{emergency.emergencyId}</h3>
                    <span className={`status-badge ${emergency.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                      {emergency.status || 'Active'}
                    </span>
                  </div>
                  <div className="card-content">
                    <p><strong>Type:</strong> {emergency.emergencyType}</p>
                    <p><strong>Location:</strong> {emergency.location}</p>
                    <p><strong>Priority:</strong> {emergency.priority}</p>
                    <p><strong>Description:</strong> {emergency.description}</p>
                    <p><strong>Reporter:</strong> {emergency.reporterName}</p>
                    <p><strong>Phone:</strong> {emergency.reporterPhone}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(emergency)}
                      style={{ backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteEmergency(emergency._id)}
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEmergency ? 'Edit Emergency Assignment' : 'Add New Emergency Assignment'}</h3>
              <button onClick={handleFormClose}>✖</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label>Emergency ID:</label>
                <input
                  type="text"
                  value={formData.emergencyId}
                  onChange={(e) => setFormData({...formData, emergencyId: e.target.value})}
                  placeholder="EMG_001"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Type:</label>
                  <select
                    value={formData.emergencyType}
                    onChange={(e) => setFormData({...formData, emergencyType: e.target.value})}
                    disabled={isSubmitting}
                  >
                    {emergencyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                <label>Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter emergency location"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the emergency situation"
                  required
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Reporter Name:</label>
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({...formData, reporterName: e.target.value})}
                    placeholder="Enter reporter name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label>Reporter Phone:</label>
                  <input
                    type="tel"
                    value={formData.reporterPhone}
                    onChange={(e) => setFormData({...formData, reporterPhone: e.target.value})}
                    placeholder="Enter phone number"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{ 
                    backgroundColor: editingEmergency ? '#f59e0b' : '#10b981', 
                    color: 'white' 
                  }}
                >
                  {isSubmitting ? 'Saving...' : (editingEmergency ? 'Update Emergency' : 'Add Emergency')}
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
    </div>
  );
};

export default EmergencyManagement;
