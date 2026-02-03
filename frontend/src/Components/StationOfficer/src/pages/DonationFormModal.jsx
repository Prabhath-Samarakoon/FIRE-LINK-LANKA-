import React, { useState, useEffect } from 'react';
import stationOfficerApi from '../services/stationOfficerApi';
import './DonationFormModal.css';

function DonationFormModal({ donation, onClose, onFormSubmit }) {
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General',
    status: 'Received',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!donation;

  useEffect(() => {
    if (isEditing && donation) {
      setFormData({
        donorName: donation.donorName || '',
        amount: donation.amount || '',
        date: donation.date ? new Date(donation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: donation.category || 'General',
        status: donation.status || 'Received',
        notes: donation.notes || ''
      });
    }
  }, [isEditing, donation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.donorName.trim()) {
        throw new Error('Donor name is required');
      }
      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const donationData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      };

      if (isEditing) {
        await stationOfficerApi.updateDonation(donation._id, donationData);
      } else {
        await stationOfficerApi.createDonation(donationData);
      }

      if (onFormSubmit) {
        onFormSubmit();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving donation:', err);
      setError(err.message || 'Failed to save donation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="form-overlay" onClick={handleClose}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit Donation' : 'Add New Donation'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="donorName" className="form-label">
                Donor Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter donor name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Amount <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="General">General</option>
                <option value="Emergency Equipment">Emergency Equipment</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Training Materials">Training Materials</option>
                <option value="Station Improvements">Station Improvements</option>
                <option value="Community Outreach">Community Outreach</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Received">Received</option>
                <option value="Pledged">Pledged</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
            <div className="form-group">
              {/* Empty div for grid alignment */}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter any additional notes"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Donation' : 'Add Donation')}
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonationFormModal;
