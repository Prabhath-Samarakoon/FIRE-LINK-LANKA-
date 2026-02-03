import React, { useState } from 'react'
import './Inspections.css'

function Inspections() {
  const [selectedInspectionType, setSelectedInspectionType] = useState('weekly')
  const [formData, setFormData] = useState({
    itemName: '',
    inspectionType: 'Weekly',
    condition: 'Good',
    inspectorName: '',
    comments: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Inspection submitted:', formData)
    // Here you would typically send the data to your backend
    alert('Inspection submitted successfully!')
  }

  return (
    <div className="p-4">
        <div className="inspections-container">
          {/* Select Inspection Type Section */}
          <div className="inspection-type-section">
            <h2>Select Inspection Type</h2>
            <div className="inspection-type-buttons">
              <button
                className={`type-btn ${selectedInspectionType === 'weekly' ? 'active' : ''}`}
                onClick={() => setSelectedInspectionType('weekly')}
              >
                Weekly Inspection
              </button>
              <button
                className={`type-btn ${selectedInspectionType === 'new-items' ? 'active' : ''}`}
                onClick={() => setSelectedInspectionType('new-items')}
              >
                New Items Inspection
              </button>
            </div>
          </div>

          {/* Weekly Inspection Form Section */}
          <div className="inspection-form-section">
            <div className="form-header">
              <div className="form-title">
                <div className="title-icon">📋</div>
                <h3>Weekly Inspection</h3>
              </div>
              <p className="form-subtitle">Inspect items currently in service</p>
            </div>

            <form onSubmit={handleSubmit} className="inspection-form">
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <select
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange('itemName', e.target.value)}
                  required
                >
                  <option value="">No items due today</option>
                  <option value="fire-extinguisher-1">Fire Extinguisher #1</option>
                  <option value="fire-extinguisher-2">Fire Extinguisher #2</option>
                  <option value="hose-reel">Hose Reel</option>
                  <option value="breathing-apparatus">Breathing Apparatus</option>
                  <option value="ladder">Extension Ladder</option>
                  <option value="pump">Fire Pump</option>
                </select>
                <p className="field-note">Items reappear here on their Next Inspection date.</p>
              </div>

              <div className="form-group">
                <label htmlFor="inspectionType">Inspection Type *</label>
                <input
                  type="text"
                  id="inspectionType"
                  value={formData.inspectionType}
                  onChange={(e) => handleInputChange('inspectionType', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  required
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Critical">Critical</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="inspectorName">Inspector Name *</label>
                <input
                  type="text"
                  id="inspectorName"
                  value={formData.inspectorName}
                  onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                  placeholder="Enter inspector name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="comments">Comments</label>
                <textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Enter comments or notes about the inspection"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Submit Inspection
                </button>
                <button type="button" className="reset-btn" onClick={() => setFormData({
                  itemName: '',
                  inspectionType: 'Weekly',
                  condition: 'Good',
                  inspectorName: '',
                  comments: ''
                })}>
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  )
}

export default Inspections
