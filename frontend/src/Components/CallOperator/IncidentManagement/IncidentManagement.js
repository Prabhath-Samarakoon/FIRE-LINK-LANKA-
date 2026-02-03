import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Download, Plus } from 'lucide-react';
// Tailwind styles applied via className

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    incidentType: '',
    priority: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    callerName: '',
    callerPhone: '',
    address: '',
    coordinates: '',
    incidentType: 'Building',
    hazards: [],
    peopleTrapped: 0,
    injured: 0,
    crowdSize: 'Small',
    emergencyScale: 'Medium',
    liveNotes: '',
    priority: 'Medium',
  });

  const API_BASE_URL = 'http://localhost:5000/incidents';

  // Fetch incidents
  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      
      const data = await response.json();
      setIncidents(data.incidents);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search incidents
  const searchIncidents = async () => {
    if (!searchQuery.trim()) {
      fetchIncidents();
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        q: searchQuery,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
      if (!response.ok) throw new Error('Failed to search incidents');
      
      const data = await response.json();
      setIncidents(data.incidents);
      setTotalPages(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create incident
  const createIncident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create incident');
      
      const data = await response.json();
      setIncidents([data.incident, ...incidents]);
      setShowForm(false);
      resetForm();
      alert('Incident created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update incident
  const updateIncident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${editingIncident._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update incident');
      
      const data = await response.json();
      setIncidents(incidents.map(inc => 
        inc._id === editingIncident._id ? data.incident : inc
      ));
      setEditingIncident(null);
      setShowForm(false);
      resetForm();
      alert('Incident updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete incident
  const deleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete incident');
      
      setIncidents(incidents.filter(inc => inc._id !== id));
      alert('Incident deleted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download incidents as PDF
  const downloadIncidentsPDF = () => {
    try {
      // Check if incidents exist and are valid
      if (!incidents || incidents.length === 0) {
        alert('No incidents available to download');
        return;
      }

      // Debug: Log incidents data
      console.log('Downloading PDF for incidents:', incidents.length, 'incidents');
      console.log('First incident sample:', incidents[0]);

      // Create a simple PDF first to test basic functionality
      const doc = new jsPDF();
      
      // Test basic PDF creation first
      console.log('PDF object created successfully');
      
      // Set document properties
      try {
        doc.setProperties({
          title: 'Fire Brigade Incidents Report',
          subject: 'Incident Management Report',
          author: 'Fire Brigade Call Operator',
          creator: 'Fire Brigade Call Operator Console'
        });
        console.log('PDF properties set successfully');
      } catch (propError) {
        console.warn('Error setting PDF properties:', propError);
      }

      // Add header
      try {
        doc.setFontSize(20);
        doc.setTextColor(220, 53, 69); // Red color for header
        doc.text('FIRE BRIGADE - INCIDENTS REPORT', 105, 20, { align: 'center' });
        console.log('Header added successfully');
      } catch (headerError) {
        console.warn('Error adding header:', headerError);
      }
      
      // Add separator line
      try {
        doc.setDrawColor(220, 53, 69);
        doc.line(20, 30, 190, 30);
        console.log('Separator line added successfully');
      } catch (lineError) {
        console.warn('Error adding separator line:', lineError);
      }
      
      // Add report info
      try {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 45);
        doc.text(`Total Incidents: ${incidents.length}`, 20, 55);
        console.log('Report info added successfully');
      } catch (infoError) {
        console.warn('Error adding report info:', infoError);
      }
      
      // Prepare table data with safe handling
      const tableData = incidents.map((incident, index) => {
        try {
          let dateStr = 'N/A';
          if (incident && incident.createdAt) {
            const date = new Date(incident.createdAt);
            if (!isNaN(date.getTime())) {
              dateStr = date.toLocaleDateString();
            }
          }
          
          return [
            (incident && incident.callId) || `Incident-${index + 1}`,
            (incident && incident.callerName) || 'Unknown',
            (incident && incident.incidentType) || 'Unknown',
            (incident && incident.priority) || 'Unknown',
            (incident && incident.status) || 'Unknown',
            dateStr
          ];
        } catch (error) {
          console.warn('Error processing incident at index', index, error);
          return [
            `Error-${index + 1}`,
            'Error',
            'Error',
            'Error',
            'Error',
            'Error'
          ];
        }
      });

      // Add table with error handling
      try {
        console.log('Attempting to create table with data:', tableData.length, 'rows');
        doc.autoTable({
          head: [['Call ID', 'Caller Name', 'Incident Type', 'Priority', 'Status', 'Date']],
          body: tableData,
          startY: 70,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [220, 53, 69],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
        console.log('AutoTable created successfully');
      } catch (tableError) {
        console.warn('AutoTable failed, using simple table:', tableError);
        // Fallback: simple table without autoTable
        try {
          doc.setFontSize(10);
          doc.text('Call ID', 20, 80);
          doc.text('Caller Name', 50, 80);
          doc.text('Type', 100, 80);
          doc.text('Priority', 130, 80);
          doc.text('Status', 160, 80);
          doc.text('Date', 190, 80);
          
          let yPos = 90;
          tableData.forEach((row, index) => {
            try {
              doc.text(row[0] || 'N/A', 20, yPos);
              doc.text(row[1] || 'N/A', 50, yPos);
              doc.text(row[2] || 'N/A', 100, yPos);
              doc.text(row[3] || 'N/A', 130, yPos);
              doc.text(row[4] || 'N/A', 160, yPos);
              doc.text(row[5] || 'N/A', 190, yPos);
              yPos += 10;
            } catch (rowError) {
              console.warn('Error adding row', index, rowError);
            }
          });
          console.log('Simple table created successfully');
        } catch (simpleTableError) {
          console.error('Even simple table failed:', simpleTableError);
          doc.text('Error creating table', 20, 80);
        }
      }

      // Add summary statistics with error handling
      try {
        const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : 70 + (tableData.length * 10) + 20) + 20;
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69);
        doc.text('SUMMARY STATISTICS', 20, finalY);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Count by status
        const statusCounts = incidents.reduce((acc, incident) => {
          try {
            const status = (incident && incident.status) || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
          } catch (error) {
            console.warn('Error processing status for incident:', error);
            acc['Error'] = (acc['Error'] || 0) + 1;
          }
          return acc;
        }, {});
        
        let yPos = finalY + 15;
        Object.entries(statusCounts).forEach(([status, count]) => {
          try {
            doc.text(`${status}: ${count} incidents`, 30, yPos);
            yPos += 8;
          } catch (error) {
            console.warn('Error adding status text:', error);
          }
        });

        // Count by priority
        yPos += 10;
        doc.text('Priority Distribution:', 20, yPos);
        yPos += 8;
        
        const priorityCounts = incidents.reduce((acc, incident) => {
          try {
            const priority = (incident && incident.priority) || 'Unknown';
            acc[priority] = (acc[priority] || 0) + 1;
          } catch (error) {
            console.warn('Error processing priority for incident:', error);
            acc['Error'] = (acc['Error'] || 0) + 1;
          }
          return acc;
        }, {});
        
        Object.entries(priorityCounts).forEach(([priority, count]) => {
          try {
            doc.text(`${priority}: ${count} incidents`, 30, yPos);
            yPos += 8;
          } catch (error) {
            console.warn('Error adding priority text:', error);
          }
        });
        
        console.log('Statistics added successfully');
      } catch (statsError) {
        console.warn('Error adding statistics:', statsError);
        doc.text('Statistics unavailable', 20, 200);
      }

      // Add footer with error handling
      try {
        doc.setDrawColor(220, 53, 69);
        doc.line(20, 200, 190, 200);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Report generated by Fire Brigade Call Operator Console', 105, 210, { align: 'center' });
        console.log('Footer added successfully');
      } catch (footerError) {
        console.warn('Error adding footer:', footerError);
      }
      
      // Save the PDF with error handling
      try {
        const fileName = `FireBrigade_Incidents_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Attempting to save PDF with filename:', fileName);
        doc.save(fileName);
        console.log('PDF saved successfully');
        alert('PDF Report downloaded successfully!');
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        alert('Error saving PDF file. Please try again.');
        throw saveError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        incidentsLength: incidents?.length,
        incidentsData: incidents
      });
      alert(`Error generating PDF report: ${error.message}. Please check console for details.`);
    }
  };

  // Download single incident as PDF
  const downloadSingleIncidentPDF = (incident) => {
    try {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Fire Brigade Incident Report - ${incident.callId}`,
        subject: 'Individual Incident Report',
        author: 'Fire Brigade Call Operator',
        creator: 'Fire Brigade Call Operator Console'
      });

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(220, 53, 69); // Red color for header
      doc.text('FIRE BRIGADE - INCIDENT REPORT', 105, 20, { align: 'center' });
      
      // Add separator line
      doc.setDrawColor(220, 53, 69);
      doc.line(20, 30, 190, 30);
      
      // Add incident details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      let yPos = 45;
      
      // Call ID and Status
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Call ID: ${incident.callId || 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Status: ${incident.status || 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.text(`Priority: ${incident.priority || 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.text(`Created: ${new Date(incident.createdAt).toLocaleString()}`, 20, yPos);
      yPos += 20;
      
      // Caller Information
      doc.setFont(undefined, 'bold');
      doc.text('CALLER INFORMATION:', 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Name: ${incident.callerName || 'N/A'}`, 30, yPos);
      yPos += 8;
      doc.text(`Phone: ${incident.callerPhone || 'N/A'}`, 30, yPos);
      yPos += 20;
      
      // Location Details
      doc.setFont(undefined, 'bold');
      doc.text('LOCATION DETAILS:', 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Address: ${incident.address || 'N/A'}`, 30, yPos);
      yPos += 8;
      doc.text(`Coordinates: ${incident.coordinates || 'N/A'}`, 30, yPos);
      yPos += 20;
      
      // Incident Details
      doc.setFont(undefined, 'bold');
      doc.text('INCIDENT DETAILS:', 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      doc.text(`Type: ${incident.incidentType || 'N/A'}`, 30, yPos);
      yPos += 8;
      doc.text(`Hazards: ${incident.hazards?.join(', ') || 'None'}`, 30, yPos);
      yPos += 8;
      doc.text(`People Trapped: ${incident.peopleTrapped || 0}`, 30, yPos);
      yPos += 8;
      doc.text(`Injured: ${incident.injured || 0}`, 30, yPos);
      yPos += 8;
      doc.text(`Crowd Size: ${incident.crowdSize || 'N/A'}`, 30, yPos);
      yPos += 8;
      doc.text(`Emergency Scale: ${incident.emergencyScale || 'N/A'}`, 30, yPos);
      yPos += 20;
      
      // Live Notes
      if (incident.liveNotes) {
        doc.setFont(undefined, 'bold');
        doc.text('LIVE NOTES:', 20, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
        
        // Handle long notes by wrapping text
        const notesLines = doc.splitTextToSize(incident.liveNotes, 150);
        doc.text(notesLines, 30, yPos);
        yPos += (notesLines.length * 8) + 20;
      }
      
      
      // Footer
      doc.setDrawColor(220, 53, 69);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Report generated by Fire Brigade Call Operator Console', 105, yPos, { align: 'center' });
      
      // Save the PDF
      const fileName = `FireBrigade_Incident_${incident.callId?.replace('#', '') || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert('Incident PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating incident PDF:', error);
      alert('Error generating incident PDF. Please try again.');
    }
  };

  // Update incident status
  const updateStatus = async (id, newStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      const data = await response.json();
      setIncidents(incidents.map(inc => 
        inc._id === id ? data.incident : inc
      ));
      alert('Status updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit incident
  const editIncident = (incident) => {
    setEditingIncident(incident);
    setFormData({
      callerName: incident.callerName,
      callerPhone: incident.callerPhone,
      address: incident.address,
      coordinates: incident.coordinates,
      incidentType: incident.incidentType,
      hazards: incident.hazards,
      peopleTrapped: incident.peopleTrapped,
      injured: incident.injured,
      crowdSize: incident.crowdSize,
      emergencyScale: incident.emergencyScale,
      liveNotes: incident.liveNotes,
      priority: incident.priority,
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      callerName: '',
      callerPhone: '',
      address: '',
      coordinates: '',
      incidentType: 'Building',
      hazards: [],
      peopleTrapped: 0,
      injured: 0,
      crowdSize: 'Small',
      emergencyScale: 'Medium',
      liveNotes: '',
      priority: 'Medium',
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle hazard toggle
  const toggleHazard = (hazard) => {
    const newHazards = formData.hazards.includes(hazard)
      ? formData.hazards.filter(h => h !== hazard)
      : [...formData.hazards, hazard];
    handleInputChange('hazards', newHazards);
  };


  // Effects
  useEffect(() => {
    fetchIncidents();
  }, [currentPage, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchIncidents();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading && incidents.length === 0) {
    return <div className="flex h-96 items-center justify-center text-zinc-500">Loading incidents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Incident Management</h1>
        <div className="flex gap-3">
          <button 
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 flex items-center gap-2"
            onClick={downloadIncidentsPDF}
            disabled={incidents.length === 0}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button 
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => {
              setShowForm(true);
              setEditingIncident(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="">
          <input
            type="text"
            placeholder="Search by caller name, address, or call ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 outline-none ring-blue-500 focus:ring-2"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="h-11 rounded-md border border-zinc-300 px-3"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          
          <select
            value={filters.incidentType}
            onChange={(e) => setFilters(prev => ({ ...prev, incidentType: e.target.value }))}
            className="h-11 rounded-md border border-zinc-300 px-3"
          >
            <option value="">All Types</option>
            <option value="Building">Building</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Forest">Forest</option>
            <option value="HazMat">HazMat</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="h-11 rounded-md border border-zinc-300 px-3"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Incident Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800">{editingIncident ? 'Edit Incident' : 'New Incident'}</h2>
              <button 
                className="rounded-md border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowForm(false);
                  setEditingIncident(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={editingIncident ? updateIncident : createIncident} className="p-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-2">
                  <h3 className="mb-1 border-b border-gray-200 pb-1 text-xs font-semibold text-gray-800">Caller Information</h3>
                  <input
                    type="text"
                    placeholder="Caller Name"
                    value={formData.callerName}
                    onChange={(e) => handleInputChange('callerName', e.target.value)}
                    className="mb-1 h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.callerPhone}
                    onChange={(e) => handleInputChange('callerPhone', e.target.value)}
                    className="h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="rounded-lg border border-gray-200 p-2">
                  <h3 className="mb-1 border-b border-gray-200 pb-1 text-xs font-semibold text-gray-800">Location</h3>
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mb-1 h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Coordinates (optional)"
                    value={formData.coordinates}
                    onChange={(e) => handleInputChange('coordinates', e.target.value)}
                    className="h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="rounded-lg border border-gray-200 p-2">
                  <h3 className="mb-1 border-b border-gray-200 pb-1 text-xs font-semibold text-gray-800">Incident Details</h3>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => handleInputChange('incidentType', e.target.value)}
                    className="mb-3 h-11 w-full rounded-md border border-zinc-300 px-3"
                  >
                    <option value="Building">Building</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Forest">Forest</option>
                    <option value="HazMat">HazMat</option>
                  </select>
                  
                  <div className="">
                    <label className="mb-2 block text-sm text-zinc-600">Hazards:</label>
                    <div className="flex flex-wrap gap-1">
                      {['Gas Cylinders', 'Chemicals', 'Explosives', 'Electrical', 'Structural'].map(hazard => (
                        <button
                          key={hazard}
                          type="button"
                          className={`rounded border px-1.5 py-0.5 text-xs ${formData.hazards.includes(hazard) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-zinc-300 text-zinc-700'}`}
                          onClick={() => toggleHazard(hazard)}
                        >
                          {hazard}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-2">
                  <h3 className="mb-1 border-b border-gray-200 pb-1 text-xs font-semibold text-gray-800">Casualties & Crowd</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      type="number"
                      placeholder="People Trapped"
                      value={formData.peopleTrapped}
                      onChange={(e) => handleInputChange('peopleTrapped', parseInt(e.target.value) || 0)}
                      min="0"
                      className="h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Injured"
                      value={formData.injured}
                      onChange={(e) => handleInputChange('injured', parseInt(e.target.value) || 0)}
                      min="0"
                      className="h-7 w-full rounded-md border border-gray-300 bg-gray-50 px-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <select
                    value={formData.crowdSize}
                    onChange={(e) => handleInputChange('crowdSize', e.target.value)}
                    className="my-2 h-11 w-full rounded-md border border-zinc-300 px-3"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                  
                  <select
                    value={formData.emergencyScale}
                    onChange={(e) => handleInputChange('emergencyScale', e.target.value)}
                    className="h-11 w-full rounded-md border border-zinc-300 px-3"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="rounded-lg border border-gray-200 p-2">
                  <h3 className="mb-1 border-b border-gray-200 pb-1 text-xs font-semibold text-gray-800">Priority & Notes</h3>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="mb-3 h-11 w-full rounded-md border border-zinc-300 px-3"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  
                  <textarea
                    placeholder="Live Notes"
                    value={formData.liveNotes}
                    onChange={(e) => handleInputChange('liveNotes', e.target.value)}
                    className="h-12 w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-xs outline-none ring-blue-500 focus:ring-1 focus:border-blue-500 transition-colors"
                    rows="3"
                  />
                </div>

              </div>
              
              <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-2">
                <button type="button" className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => {
                  setShowForm(false);
                  setEditingIncident(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60 transition-colors" disabled={loading}>
                  {loading ? 'Saving...' : (editingIncident ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-zinc-600">
            No incidents found. {searchQuery && 'Try adjusting your search criteria.'}
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident._id} className="rounded-lg border border-zinc-200 bg-white">
              <div className="flex items-center gap-2 border-b border-zinc-100 p-3">
                <div className="font-mono text-sm text-zinc-600">{incident.callId}</div>
                <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${incident.status === 'Active' ? 'bg-amber-100 text-amber-700' : incident.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : incident.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'}`}>
                  {incident.status}
                </div>
                <div className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${incident.priority === 'Emergency' ? 'bg-red-100 text-red-700' : incident.priority === 'High' ? 'bg-orange-100 text-orange-700' : incident.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {incident.priority}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-sm text-zinc-700">
                  <div>
                    <strong>Caller:</strong> {incident.callerName} ({incident.callerPhone})
                  </div>
                  <div>
                    <strong>Location:</strong> {incident.address}
                  </div>
                  <div>
                    <strong>Type:</strong> {incident.incidentType}
                  </div>
                  <div>
                    <strong>Hazards:</strong> {incident.hazards.join(', ') || 'None'}
                  </div>
                  <div>
                    <strong>Casualties:</strong> {incident.peopleTrapped} trapped, {incident.injured} injured
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(incident.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={incident.status}
                    onChange={(e) => updateStatus(incident._id, e.target.value)}
                    className="h-10 rounded-md border border-zinc-300 px-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  
                  <button
                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 flex items-center gap-1"
                    onClick={() => downloadSingleIncidentPDF(incident)}
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </button>
                  
                  <button
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    onClick={() => editIncident(incident)}
                  >
                    Edit
                  </button>
                  
                  <button
                    className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    onClick={() => deleteIncident(incident._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4">
          <button
            className="rounded-md border border-zinc-300 px-4 py-2"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="text-sm text-zinc-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            className="rounded-md border border-zinc-300 px-4 py-2"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;
