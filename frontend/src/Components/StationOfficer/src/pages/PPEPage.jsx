// Station Officer PPE Page
// Updated for integration without React Router

import React, { useState, useEffect } from 'react';
import EmergencyHeader from '../Components/EmergencyHeader.jsx';
import './CategoryItems.css';
import './PPEPage.css';

function PPEPage({ isEmergencyMode = false, onEmergencyModeChange, onNavigate }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    itemID: '',
    category: 'Personal Protective Equipment (PPE)',
    subcategory: '',
    itemName: '',
    model: '',
    brand: '',
    serialLot: '',
    size: '',
    quantity: 1,
    condition: 'Pending Inspection'
  });

  // PPE Subcategories
  const ppeSubcategories = [
    'Structural PPE',
    'Wildland PPE', 
    'Technical Rescue PPE',
    'Water/Swiftwater PPE',
    'Medical PPE'
  ];

  // PPE Item Names
  const ppeItemNames = [
    'Turnout Coat',
    'Turnout Pants',
    'Fire Helmet',
    'Fire Boots',
    'Fire Gloves',
    'Nomex Hood',
    'SCBA Harness',
    'Safety Glasses',
    'Ear Protection',
    'Safety Vest',
    'Wildland Jacket',
    'Wildland Pants',
    'Technical Rescue Harness',
    'Water Rescue Suit',
    'Medical Gloves',
    'Medical Mask'
  ];

  // Condition options
  const conditionOptions = ['Pending Inspection', 'Good', 'Fair', 'Poor', 'Out of Service'];

  // Generate unique Item ID
  const generateItemID = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PPE-${timestamp}-${random}`.toUpperCase();
  };

  // Check if selected item requires size field
  const requiresSizeField = (itemName) => {
    const itemsRequiringSize = [
      'Turnout Coat', 'Turnout Pants', 'Fire Boots', 'Fire Gloves',
      'Wildland Jacket', 'Wildland Pants', 'Water Rescue Suit',
      'Medical Gloves', 'Medical Mask'
    ];
    return itemsRequiringSize.includes(itemName);
  };

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      // Backend expects category slug; if name is used, API still returns items but we'll
      // map and normalize fields here.
      const response = await fetch('http://localhost:5000/api/items?category=ppe');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      const rawItems = data.items || data.data || [];
      // Normalize shape for UI: prefer serialNumber or provided itemID; fallback to short id
      const normalized = rawItems.map((it) => ({
        ...it,
        displayId: it.itemID || it.serialNumber || (it._id ? `ID-${String(it._id).slice(-6).toUpperCase()}` : ''),
        itemName: it.itemName || it.name,
      }));
      setItems(normalized);
    } catch (err) {
      setError('Failed to load items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      itemID: '',
      category: 'Personal Protective Equipment (PPE)',
      subcategory: '',
      itemName: '',
      model: '',
      brand: '',
      serialLot: '',
      size: '',
      quantity: 1,
      condition: 'Pending Inspection',
      lastInspection: null,
      nextInspection: null
    });
    setEditingItem(null);
  };

  // Open form for adding new item
  const handleAddItem = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      itemID: generateItemID()
    }));
    setShowForm(true);
  };

  // Open form for editing item
  const handleEditItem = (item) => {
    setFormData({
      itemID: item.itemID || item.displayId || '',
      category: 'Personal Protective Equipment (PPE)',
      subcategory: item.subcategory || '',
      itemName: item.itemName || item.name || '',
      model: item.model || '',
      brand: item.brand || '',
      serialLot: item.serialLot || item.serialNumber || '',
      size: item.size || '',
      quantity: item.quantity || 1,
      condition: item.condition || 'Pending Inspection',
      lastInspection: item.lastInspection || null,
      nextInspection: item.nextInspection || null
    });
    setEditingItem(item);
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:5000/api/items/${editingItem._id}`
        : 'http://localhost:5000/api/items';

      const method = editingItem ? 'PUT' : 'POST';

      // Map formData to backend payload shape
      const payload = {
        name: formData.itemName,
        categorySlug: 'ppe',
        quantity: Number(formData.quantity) || 0,
        condition: formData.condition,
        size: formData.size || '',
        serialNumber: formData.serialLot || '',
        model: formData.model || '',
        brand: formData.brand || '',
        subcategory: formData.subcategory || '',
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }

      // Refresh items list
      await fetchItems();
      handleCloseForm();
    } catch (err) {
      setError('Failed to save item: ' + err.message);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This will also remove all related inspection records.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      const result = await response.json();
      
      // Show success message with inspection deletion info
      if (result.success) {
        const message = result.deletedInspectionsCount > 0 
          ? `Item deleted successfully. ${result.deletedInspectionsCount} related inspection records were also removed.`
          : result.message;
        alert(message);
      }

      // Refresh items list
      await fetchItems();
    } catch (err) {
      setError('Failed to delete item: ' + err.message);
    }
  };

  // Get condition badge class
  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'Pending Inspection':
        return 'condition-badge condition-pending-inspection';
      case 'Good':
        return 'condition-badge condition-good';
      case 'Fair':
        return 'condition-badge condition-fair';
      case 'Poor':
        return 'condition-badge condition-poor';
      case 'Needs Maintenance':
        return 'condition-badge condition-needs-maintenance';
      case 'Missing':
        return 'condition-badge condition-missing';
      case 'Out of Service':
        return 'condition-badge condition-out-of-service';
      default:
        return 'condition-badge condition-default';
    }
  };

  // Get next inspection class for highlighting
  const getNextInspectionClass = (nextInspectionDate) => {
    const today = new Date();
    const nextDate = new Date(nextInspectionDate);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'next-inspection-overdue'; // Red for overdue
    } else if (diffDays <= 3) {
      return 'next-inspection-due-soon'; // Orange for due within 3 days
    } else {
      return 'next-inspection-normal'; // Normal for others
    }
  };

  // Handle flag for replacement
  const handleFlagForReplacement = (itemId) => {
    if (window.confirm('Flag this item for replacement? This will mark it for urgent review.')) {
      // Here you could add logic to update the item status or create a replacement request
      alert('Item flagged for replacement. Please review and take action.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar isEmergencyMode={isEmergencyMode} onEmergencyModeChange={onEmergencyModeChange} />
        <EmergencyHeader isEmergencyMode={isEmergencyMode} onEmergencyModeChange={onEmergencyModeChange} />
        
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => onNavigate && onNavigate('inventory')} 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Inventory
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">Personal Protective Equipment (PPE)</span>
          </nav>
        </div>

        <div className="category-page">
          <div className="category-header">
            <h1>Personal Protective Equipment (PPE)</h1>
            <p>Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmergencyHeader isEmergencyMode={isEmergencyMode} onEmergencyModeChange={onEmergencyModeChange} />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          <button 
            onClick={() => onNavigate && onNavigate('inventory')} 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Inventory
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">Personal Protective Equipment (PPE)</span>
        </nav>
      </div>

      <div className="category-page">
        <div className="category-header">
          <h1>Personal Protective Equipment (PPE)</h1>
          <p>Manage personal protective equipment inventory</p>
          <button className="add-button" onClick={handleAddItem}>
            Add New Item
          </button>
        </div>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#721c24', 
              marginLeft: '10px', 
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="items-table-container">
        {items.length === 0 ? (
          <div className="no-items">
            <p>No PPE items found.</p>
            <p>Click "Add New Item" to get started.</p>
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Subcategory</th>
                <th>Item Name</th>
                <th>Model</th>
                <th>Brand</th>
                <th>Serial/Lot</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Condition</th>
                <th>Last Inspection</th>
                <th>Next Inspection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr 
                  key={item._id} 
                  className={item.condition === 'Poor' ? 'poor-condition-row' : ''}
                  title={item.condition === 'Poor' ? 'This item requires urgent review or removal from inventory' : ''}
                >
                  <td>{item.displayId}</td>
                  <td>{item.subcategory}</td>
                  <td>{item.itemName}</td>
                  <td>{item.model}</td>
                  <td>{item.brand}</td>
                  <td>{item.serialLot}</td>
                  <td>{item.size || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <span className={getConditionBadgeClass(item.condition)}>
                      {item.condition}
                    </span>
                    {item.condition === 'Poor' && (
                      <span className="poor-warning-badge" title="This item requires urgent review or removal from inventory">
                        ⚠️ Poor Condition
                      </span>
                    )}
                  </td>
                                     <td>
                     {item.condition === 'Pending Inspection' ? '-' : 
                        (item.lastInspection ? 
                          (() => {
                            const date = new Date(item.lastInspection);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}/${month}/${day}`;
                          })() : 
                          '-'
                        )
                     }
                   </td>
                   <td>
                     {item.condition === 'Pending Inspection' ? '-' :
                        (item.nextInspection ? (
                          <span 
                            className={getNextInspectionClass(item.nextInspection)}
                            title="Scheduled based on last inspection date and inspection type"
                          >
                            {(() => {
                             const date = new Date(item.nextInspection);
                             const year = date.getFullYear();
                             const month = String(date.getMonth() + 1).padStart(2, '0');
                             const day = String(date.getDate()).padStart(2, '0');
                             return `${year}/${month}/${day}`;
                           })()}
                          </span>
                        ) : (
                          '-'
                        ))
                     }
                   </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditItem(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        Delete
                      </button>
                      {item.condition === 'Poor' && (
                        <button 
                          className="flag-replacement-button"
                          onClick={() => handleFlagForReplacement(item._id)}
                          title="Flag for Replacement"
                        >
                          🚩 Flag for Replacement
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-overlay" onClick={handleCloseForm}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemID">Item ID</label>
                  <input
                    type="text"
                    id="itemID"
                    name="itemID"
                    value={formData.itemID}
                    onChange={handleInputChange}
                    className="readonly"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    className="readonly"
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subcategory">Subcategory *</label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {ppeSubcategories.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="itemName">Item Name *</label>
                  <select
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Item Name</option>
                    {ppeItemNames.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brand">Brand *</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="serialLot">Serial/Lot *</label>
                  <input
                    type="text"
                    id="serialLot"
                    name="serialLot"
                    value={formData.serialLot}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  {/* Empty div for grid alignment */}
                </div>
              </div>

              {/* Size field - only visible for items that require size */}
              {requiresSizeField(formData.itemName) && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="size">Size *</label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., Large, 10, Standard"
                      required
                    />
                  </div>
                  <div className="form-group">
                    {/* Empty div for grid alignment */}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  {/* Empty div for grid alignment */}
                </div>
              </div>

              {/* Only show condition and inspection fields when editing */}
              {editingItem && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="condition">Condition</label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                      >
                        {conditionOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      {/* Empty div for grid alignment */}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="lastInspection">Last Inspection</label>
                      <input
                        type="date"
                        id="lastInspection"
                        name="lastInspection"
                        value={formData.lastInspection ? new Date(formData.lastInspection).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        readOnly
                        className="readonly-field"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nextInspection">Next Inspection</label>
                      <input
                        type="date"
                        id="nextInspection"
                        name="nextInspection"
                        value={formData.nextInspection ? new Date(formData.nextInspection).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        readOnly
                        className="readonly-field"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button type="button" className="cancel-button" onClick={handleCloseForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PPEPage;
