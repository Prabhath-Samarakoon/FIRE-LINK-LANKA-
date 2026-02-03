import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { drawCommonHeader, applyFootersToAllPages } from '../utils/pdfUtils';

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';

function Availability() {
  const [staff, setStaff] = useState([]);
  const [counts, setCounts] = useState({ available: 0, onduty: 0, resting: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      let usersResponse = await fetch(`${API_BASE}/Users`);
      let availabilityResponse = await fetch(`${API_BASE}/availability`);

      // Fallback to 127.0.0.1 for Windows/IPv6 edge cases
      if (!usersResponse.ok && API_BASE.includes('localhost')) {
        const fb = API_BASE.replace('localhost', '127.0.0.1');
        usersResponse = await fetch(`${fb}/Users`);
      }
      if (!availabilityResponse.ok && API_BASE.includes('localhost')) {
        const fb = API_BASE.replace('localhost', '127.0.0.1');
        availabilityResponse = await fetch(`${fb}/availability`);
      }

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch staff data');
      }

      const usersData = await usersResponse.json();
      const availabilityData = availabilityResponse.ok ? await availabilityResponse.json() : { availability: [] };

      const availabilityMap = new Map();
      if (availabilityData.availability) {
        availabilityData.availability.forEach(record => {
          const id = record.userId && (record.userId._id || record.userId);
          if (id) availabilityMap.set(id, record.status);
        });
      }

      const staffWithAvailability = (usersData.data || usersData.Users || usersData.users || []).map(user => ({
        ...user,
        availability: availabilityMap.get(user._id) || 'available'
      }));
      
      setStaff(staffWithAvailability);
      // Update counts immediately after fetch
      const nextCounts = {
        available: staffWithAvailability.filter(u => u.availability === 'available').length,
        onduty: staffWithAvailability.filter(u => u.availability === 'onduty').length,
        resting: staffWithAvailability.filter(u => u.availability === 'resting').length,
      };
      setCounts(nextCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (userId, status) => {
    try {
      const response = await fetch(`${API_BASE}/availability/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update availability status');
      }

      setStaff(prevStaff => {
        const updated = prevStaff.map(user => 
          user._id === userId 
            ? { ...user, availability: status }
            : user
        );
        // Update counts in-place for responsiveness
        const nextCounts = {
          available: updated.filter(u => u.availability === 'available').length,
          onduty: updated.filter(u => u.availability === 'onduty').length,
          resting: updated.filter(u => u.availability === 'resting').length,
        };
        setCounts(nextCounts);
        return updated;
      });
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability status. Please try again.');
    }
  };

  const countByStatus = (status) => staff.filter(s => s.availability === status).length;

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'onduty': return 'On Duty';
      case 'resting': return 'Resting';
      default: return 'Available';
    }
  };

  const generatePdf = (rows) => {
    // Use default unit (mm) to align with shared header/footer utils
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 55;

    // Common header
    drawCommonHeader(doc, {
      title: 'Staff Availability Report',
      subtitle: `Generated on: ${new Date().toLocaleDateString()}  •  Total Staff: ${rows.length}`
    });
    y += 0;

    const columns = ['Name', 'Age', 'Position', 'Status'];
    const colX = [48];
    const colWidths = [];
    const totalCols = columns.length;
    const usableWidth = pageWidth - 96;
    const widthEach = Math.floor(usableWidth / totalCols);

    for (let i = 0; i < totalCols; i++) {
      colWidths.push(widthEach);
      if (i > 0) colX.push(colX[i - 1] + colWidths[i - 1]);
    }

    doc.setFontSize(11);
    columns.forEach((col, i) => doc.text(String(col), colX[i] + 4, y));
    y += 12;
    doc.setLineWidth(0.5);
    doc.line(48, y, pageWidth - 48, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    rows.forEach((row) => {
      row.forEach((cell, i) => {
        const text = String(cell ?? '');
        const maxWidth = colWidths[i] - 8;
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, colX[i] + 4, y);
      });
      const rowHeights = row.map((cell, i) => {
        const lines = doc.splitTextToSize(String(cell ?? ''), colWidths[i] - 8);
        return Math.max(12, lines.length * 12);
      });
      const rowHeight = Math.max(16, ...rowHeights);
      y += rowHeight;

      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        drawCommonHeader(doc, {
          title: 'Staff Availability Report',
          subtitle: `Generated on: ${new Date().toLocaleDateString()}  •  Total Staff: ${rows.length}`
        });
        y = 55;
      }
    });

    // Footer with page numbers
    applyFootersToAllPages(doc, { leftText: 'Fire Brigade • Staff Management System' });

    doc.save('availability.pdf');
  };

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      let data = staff;
      if (!data || data.length === 0) {
        await fetchStaff();
        data = staff;
      }
      const rows = (data || []).map(u => [
        u.name ?? '',
        u.age ?? '',
        u.position ?? '',
        getStatusText(u.availability)
      ]);
      if (!rows.length) {
        alert('No data available to export.');
        return;
      }
      generatePdf(rows);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading staff availability...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchStaff} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Availability</h1>
            <p className="text-lg text-gray-600 mb-6">Monitor current availability across the team</p>
            <button 
              className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={handleDownloadPdf} 
              disabled={downloading}
            >
              {downloading ? 'Preparing…' : 'Download PDF'}
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Available</h3>
              <span className="text-4xl font-bold text-black">{counts.available}</span>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">On Duty</h3>
              <span className="text-4xl font-bold text-black">{counts.onduty}</span>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Resting</h3>
              <span className="text-4xl font-bold text-black">{counts.resting}</span>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staff.map((member) => (
              <div key={member._id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                {/* Staff Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black mb-1">{member.name || member.gmail || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600 mb-1">Age: {member.age || 'N/A'}</p>
                  <p className="text-sm font-semibold text-black">{member.position || 'Firefighter'}</p>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      member.availability === 'available' 
                        ? 'bg-green-600 text-white border-2 border-green-600' 
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-600'
                    }`}
                    onClick={() => updateAvailability(member._id, 'available')}
                  >
                    Available
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      member.availability === 'onduty' 
                        ? 'bg-blue-600 text-white border-2 border-blue-600' 
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600'
                    }`}
                    onClick={() => updateAvailability(member._id, 'onduty')}
                  >
                    On Duty
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      member.availability === 'resting' 
                        ? 'bg-yellow-500 text-white border-2 border-yellow-500' 
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-500'
                    }`}
                    onClick={() => updateAvailability(member._id, 'resting')}
                  >
                    Resting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Availability;
