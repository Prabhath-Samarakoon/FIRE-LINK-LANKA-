import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import apiService from '../../../services/api';
import { handleApiError, handleApiSuccess } from '../../../utils/notifications';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/Users`;

const fetchHandler = async () => {
  try {
    return await apiService.getUsers();
  } catch (error) {
    handleApiError(error, 'Failed to load users');
    throw error;
  }
};

function UserDetails() {
  const getPhotoUrl = (photo) => {
    if (!photo) return '';
    if (typeof photo !== 'string') return '';
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    // Ensure leading slash
    const path = photo.startsWith('/') ? photo : `/uploads/users/${photo}`;
    return `${API_BASE}${path}`;
  };
  const [Users, setusers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', gmail: '', age: '', address: '', photo: '', position: '' });
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

useEffect(() => {
  let mounted = true;
  const load = async () => {
    try {
      const data = await fetchHandler();
      if (mounted && data) {
        // Handle new standardized response format
        const users = data.data || [];
        setusers(users);
        handleApiSuccess(`Loaded ${users.length} users successfully`);
      }
    } catch (e) {
      if (mounted) setLoadError('Failed to load users. Please check the API.');
    }
  };
  load();
  const onAdded = () => load();
  window.addEventListener('staffAdded', onAdded);
  return () => { mounted = false; window.removeEventListener('staffAdded', onAdded); };
}, [])

  // Helper function to check if a user is being edited
  const isEditing = (userId) => editingUserId === userId;

  // Download functions
  const downloadPDF = () => {
    if (!Users || Users.length === 0) {
      alert('No data to download');
      return;
    }

    // Create a new PDF document
    const pdf = new jsPDF();
    
    // Set title
    pdf.setFontSize(20);
    pdf.setTextColor(178, 34, 34); // Fire brigade red
    pdf.text('Fire Brigade Staff Details Report', 105, 20, { align: 'center' });
    
    // Set subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    pdf.text(`Total Staff: ${Users.length}`, 105, 37, { align: 'center' });
    
    // Add line separator
    pdf.setDrawColor(178, 34, 34);
    pdf.line(20, 45, 190, 45);
    
    // Set font for content
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    
    let yPosition = 60;
    
    // Add staff details
    Users.forEach((user, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Staff number and name
      pdf.setFontSize(12);
      pdf.setTextColor(178, 34, 34);
      pdf.text(`${index + 1}. ${user.name || 'N/A'}`, 20, yPosition);
      yPosition += 8;
      
      // Staff details
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`   Email: ${user.gmail || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Position: ${user.position || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Age: ${user.age || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Address: ${user.address || 'N/A'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Photo: ${user.photo || 'N/A'}`, 25, yPosition);
      yPosition += 12; // Extra space between staff members
    });
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('--- End of Report ---', 105, yPosition + 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(`fire_brigade_staff_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Get position badge color
  const getPositionBadgeColor = (position) => {
    const colors = {
      'Firefighters': 'bg-red-100 text-red-800 border-red-200',
      'Dispatcher': 'bg-blue-100 text-blue-800 border-blue-200',
      'Equipment Technician': 'bg-green-100 text-green-800 border-green-200',
      'First Aid Officer': 'bg-purple-100 text-purple-800 border-purple-200',
      'Pump Operator': 'bg-orange-100 text-orange-800 border-orange-200',
      'Safety Officer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Unassigned': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[position] || colors['Unassigned'];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fire Brigade Staff Management</h1>
            <p className="text-gray-600">Manage and monitor your fire brigade personnel</p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <button 
              onClick={downloadPDF}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Staff Report
            </button>
            <button 
              onClick={() => window.location.href = '/staff-manager/addstaff'}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{Users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Personnel</p>
              <p className="text-2xl font-bold text-gray-900">{Users.filter(u => u.position && u.position !== 'Unassigned').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {loadError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-800">{loadError}</p>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Fire Brigade Personnel</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your fire brigade team members and their roles</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Users && Users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing(user._id) ? (
                      <div className="flex flex-col items-center space-y-2">
                        <button 
                          type="button" 
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          Choose Photo
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            if (file) {
                              if (photoPreviewUrl) {
                                window.URL.revokeObjectURL(photoPreviewUrl);
                              }
                              const localUrl = window.URL.createObjectURL(file);
                              setPhotoPreviewUrl(localUrl);
                              setEditForm((prev) => ({ ...prev, photo: file }));
                            }
                          }}
                        />
                        <img 
                          src={photoPreviewUrl || getPhotoUrl(editForm.photo) || getPhotoUrl(user.photo)} 
                          alt={user.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                        />
                      </div>
                    ) : (
                      <img 
                        src={getPhotoUrl(user.photo)} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing(user._id) ? (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Full Name *"
                        required
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing(user._id) ? (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        type="email"
                        value={editForm.gmail}
                        onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                        placeholder="Email Address *"
                        required
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{user.gmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing(user._id) ? (
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={editForm.position} 
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      >
                        <option value="Firefighters">Firefighters</option>
                        <option value="Dispatcher">Dispatcher</option>
                        <option value="Equipment Technician">Equipment Technician</option>
                        <option value="First Aid Officer">First Aid Officer</option>
                        <option value="Pump Operator">Pump Operator</option>
                        <option value="Safety Officer">Safety Officer</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPositionBadgeColor(user.position)}`}>
                        {user.position || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing(user._id) ? (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        placeholder="Age *"
                        required
                        min="1"
                        max="100"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{user.age}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing(user._id) ? (
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Address *"
                        required
                      />
                    ) : (
                      <div className="text-sm text-gray-900 max-w-xs truncate">{user.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing(user._id) ? (
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                          onClick={async () => {
                            try {
                              // Validate required fields
                              if (!editForm.name || !editForm.gmail || !editForm.age || !editForm.address) {
                                alert('Please fill in all required fields (Name, Email, Age, Address)');
                                return;
                              }
                              
                              // Build multipart form data if a new photo File is present
                              let payload;
                              let headers;
                              if (editForm.photo && typeof editForm.photo !== 'string') {
                                payload = new FormData();
                                payload.append('name', editForm.name.trim());
                                payload.append('gmail', editForm.gmail.trim());
                                payload.append('age', String(Number(editForm.age)));
                                payload.append('address', editForm.address.trim());
                                payload.append('position', editForm.position || '');
                                payload.append('photo', editForm.photo);
                                headers = { 'Content-Type': 'multipart/form-data' };
                              } else {
                                payload = {
                                  name: editForm.name.trim(),
                                  gmail: editForm.gmail.trim(),
                                  age: Number(editForm.age),
                                  address: editForm.address.trim(),
                                  position: editForm.position || '',
                                  photo: editForm.photo || ''
                                };
                                headers = { 'Content-Type': 'application/json' };
                              }
                              
                              console.log('Updating user with data:', (headers && headers['Content-Type'] === 'multipart/form-data') ? '[FormData]' : payload);
                              
                              const { data } = await axios.put(`${API_URL}/${user._id}`, payload, { headers });
                              
                              console.log('Update response:', data);
                              
                              const updated = data.data || { ...user, ...editForm, photo: (data?.data?.photo || user.photo) };
                              
                              setusers((prev) => prev.map((u) => (u._id === user._id ? { ...u, ...updated } : u)));
                              setEditingUserId(null);
                              setEditForm({ name: '', gmail: '', age: '', address: '', photo: '', position: '' });
                              
                              if (photoPreviewUrl) {
                                window.URL.revokeObjectURL(photoPreviewUrl);
                                setPhotoPreviewUrl('');
                              }
                            } catch (error) {
                              console.error('Error updating user:', error);
                              console.error('Error response:', error.response?.data);
                              console.error('Error status:', error.response?.status);
                              alert(`Failed to update user: ${error.response?.data?.message || error.message}. Please try again.`);
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button
                          className="bg-gray-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-600 transition-colors flex items-center gap-1"
                          onClick={() => {
                            setEditingUserId(null);
                            setEditForm({ name: '', gmail: '', age: '', address: '', photo: '', position: '' });
                            if (photoPreviewUrl) {
                              URL.revokeObjectURL(photoPreviewUrl);
                              setPhotoPreviewUrl('');
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                          onClick={() => {
                            setEditingUserId(user._id);
                            setEditForm({
                              name: user.name || '',
                              gmail: user.gmail || '',
                              age: user.age ?? '',
                              address: user.address || '',
                              photo: user.photo || '',
                              position: user.position || 'Firefighters',
                            });
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                          onClick={async () => {
                            try {
                              if (window.confirm('Are you sure you want to delete this fire brigade member?')) {
                                await axios.delete(`${API_URL}/${user._id}`);
                                setusers((prev) => prev.filter((u) => u._id !== user._id));
                                window.dispatchEvent(new CustomEvent('staffRemoved'));
                              }
                            } catch (error) {
                              console.error('Error deleting user:', error);
                              alert('Failed to delete user. Please try again.');
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
