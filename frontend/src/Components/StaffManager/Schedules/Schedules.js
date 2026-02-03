import React, { useState, useEffect } from 'react';
import './Schedules.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import { drawCommonHeader, applyFootersToAllPages } from '../utils/pdfUtils';
// Helpers for future-only validation
const getTodayISODate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMinStartTime = (date) => {
  if (!date) return undefined;
  const today = getTodayISODate();
  if (date > today) return undefined; // any time allowed for future dates
  if (date < today) return undefined; // input min will be blocked by min date
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const getMinEndTime = (date, startTime) => {
  if (startTime) return startTime; // end must be >= start
  return getMinStartTime(date);
};

const validateFutureOnly = (formData, setFieldErrors) => {
  const errs = {};
  const { date, startTime, endTime } = formData;
  if (!date) {
    errs.date = 'Date is required';
  } else {
    const today = getTodayISODate();
    if (date < today) errs.date = 'Date must be today or in the future';
  }

  if (date) {
    const today = getTodayISODate();
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (date === today && startTime && startTime < nowTime) {
      errs.startTime = 'Start time must be in the future';
    }
  }

  if (startTime && endTime && endTime <= startTime) {
    errs.endTime = 'End time must be after start time';
  }

  setFieldErrors && setFieldErrors(errs);
  return Object.keys(errs).length === 0;
};

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/schedules`;

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    shiftType: 'Day',
    position: '',
    notes: ''
  });

  // Fetch schedules and users on component mount
  useEffect(() => {
    fetchSchedules();
    fetchUsers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let response;
      try {
        response = await axios.get(API_URL, { timeout: 15000 });
      } catch (err) {
        if (API_BASE.includes('localhost')) {
          const fb = API_BASE.replace('localhost', '127.0.0.1');
          response = await axios.get(`${fb}/schedules`, { timeout: 15000 });
        } else {
          throw err;
        }
      }
      const payload = response.data;
      const arr = payload?.data || payload?.schedules || [];
      setSchedules(arr);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      let response;
      try {
        response = await axios.get(`${API_BASE}/Users`, { timeout: 15000 });
      } catch (err) {
        if (API_BASE.includes('localhost')) {
          const fb = API_BASE.replace('localhost', '127.0.0.1');
          response = await axios.get(`${fb}/Users`, { timeout: 15000 });
        } else {
          throw err;
        }
      }
      {
        const payload = response.data;
        const arr = payload?.data || payload?.Users || payload?.users || [];
        setUsers(arr);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Download schedules as PDF
  const downloadSchedulesPDF = () => {
    if (!schedules || schedules.length === 0) {
      alert('No schedules to download');
      return;
    }

    // Create a new PDF document
    const pdf = new jsPDF();
    
    // Common header
    drawCommonHeader(pdf, {
      title: 'Fire Brigade Staff Schedules Report',
      subtitle: `Generated on: ${new Date().toLocaleDateString()}  •  Total: ${schedules.length}`
    });
    
    // Set font for content
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    
    let yPosition = 55;
    
    // Add schedule details
    schedules.forEach((schedule, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        drawCommonHeader(pdf, {
          title: 'Fire Brigade Staff Schedules Report',
          subtitle: `Generated on: ${new Date().toLocaleDateString()}  •  Total: ${schedules.length}`
        });
        yPosition = 55;
      }
      
      // Schedule number and date
      pdf.setFontSize(12);
      pdf.setTextColor(178, 34, 34);
      pdf.text(`${index + 1}. Schedule for ${new Date(schedule.date).toLocaleDateString()}`, 20, yPosition);
      yPosition += 8;
      
      // Schedule details
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      
      const userName = getUserName(schedule.userId);
      const userPosition = getUserPosition(schedule.userId);
      
      pdf.text(`   Staff Member: ${userName}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Position: ${userPosition}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Time: ${schedule.startTime} - ${schedule.endTime}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`   Shift Type: ${schedule.shiftType}`, 25, yPosition);
      yPosition += 6;
      if (schedule.position) {
        pdf.text(`   Assigned Role: ${schedule.position}`, 25, yPosition);
        yPosition += 6;
      }
      if (schedule.notes) {
        pdf.text(`   Notes: ${schedule.notes}`, 25, yPosition);
        yPosition += 6;
      }
      yPosition += 12; // Extra space between schedules
    });
    
    // Apply footers with page numbers
    applyFootersToAllPages(pdf, { leftText: 'Fire Brigade • Staff Management System' });

    // Save the PDF
    pdf.save(`fire_brigade_schedules_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = validateFutureOnly(formData, setFieldErrors);
    if (!valid) {
      setError('Please fix validation errors before saving');
      return;
    }
    try {
      setLoading(true);
      if (editingSchedule) {
        // Update existing schedule
        await axios.put(`${API_URL}/${editingSchedule._id}`, formData);
        setError('Schedule updated successfully');
      } else {
        // Create new schedule
        await axios.post(API_URL, formData);
        setError('Schedule created successfully');
      }
      
      // Reset form and refresh data
      setFormData({
        userId: '',
        date: '',
        startTime: '',
        endTime: '',
        shiftType: 'Day',
        position: '',
        notes: ''
      });
      setShowForm(false);
      setEditingSchedule(null);
      fetchSchedules();
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      userId: schedule.userId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      shiftType: schedule.shiftType,
      position: schedule.position,
      notes: schedule.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (scheduleId) => {
    const confirmed = window.confirm('Are you sure you want to delete this schedule?');
    if (confirmed) {
      try {
        await axios.delete(`${API_URL}/${scheduleId}`);
        setError('Schedule deleted successfully');
        fetchSchedules();
        setTimeout(() => setError(''), 3000);
      } catch (error) {
        console.error('Error deleting schedule:', error);
        setError('Failed to delete schedule');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      userId: '',
      date: '',
      startTime: '',
      endTime: '',
      shiftType: 'Day',
      position: '',
      notes: ''
    });
    setFieldErrors({});
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserPosition = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.position : 'Unknown Position';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Schedules Management</h1>
          <p className="text-lg text-gray-600 mb-6">Manage and assign work schedules for fire brigade staff</p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Schedule
          </button>
        </div>

        {/* Error/Success Message */}
        {error && (
          <div className={`px-4 py-3 rounded-lg ${
            error.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Schedule Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="">Select Staff Member</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.position}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      const date = e.target.value;
                      const next = { ...formData, date };
                      setFormData(next);
                      validateFutureOnly(next, setFieldErrors);
                    }}
                    required
                    min={getTodayISODate()}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${fieldErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {fieldErrors.date && (
                    <p className="text-red-600 text-sm">{fieldErrors.date}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      const next = { ...formData, startTime };
                      setFormData(next);
                      validateFutureOnly(next, setFieldErrors);
                    }}
                    required
                    min={getMinStartTime(formData.date)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${fieldErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {fieldErrors.startTime && (
                    <p className="text-red-600 text-sm">{fieldErrors.startTime}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => {
                      const endTime = e.target.value;
                      const next = { ...formData, endTime };
                      setFormData(next);
                      validateFutureOnly(next, setFieldErrors);
                    }}
                    required
                    min={getMinEndTime(formData.date, formData.startTime)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors ${fieldErrors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {fieldErrors.endTime && (
                    <p className="text-red-600 text-sm">{fieldErrors.endTime}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Shift Type</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="24-Hour">24-Hour Shift</option>
                    <option value="Emergency">Emergency Call</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Firefighter, Driver, Officer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special instructions..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Saving...' : (editingSchedule ? 'Update Schedule' : 'Create Schedule')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Current Schedules Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Current Schedules</h2>
            <button 
              onClick={downloadSchedulesPDF}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download Schedule Details
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <p className="text-gray-600 text-lg">No schedules found.</p>
              <p className="text-gray-500">Create your first schedule above.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-semibold text-gray-900">
                            {new Date(schedule.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-semibold text-gray-900">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Shift</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            schedule.shiftType === 'Day' ? 'bg-yellow-100 text-yellow-800' :
                            schedule.shiftType === 'Night' ? 'bg-indigo-100 text-indigo-800' :
                            schedule.shiftType === '24-Hour' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {schedule.shiftType}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">{getUserName(schedule.userId)}</h3>
                        <p className="text-gray-600">{getUserPosition(schedule.userId)}</p>
                        
                        {schedule.position && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Assigned Role:</span> {schedule.position}
                          </p>
                        )}
                        
                        {schedule.notes && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {schedule.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <button 
                        onClick={() => handleEdit(schedule)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(schedule._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/>
                          <path d="M14 11v6"/>
                          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedules;
