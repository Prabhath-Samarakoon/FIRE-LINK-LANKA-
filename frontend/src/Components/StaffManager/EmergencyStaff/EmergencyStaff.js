import React, { useState, useEffect } from 'react';

function EmergencyStaff() {
  const [incidentData, setIncidentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidentData();
  }, []);

  const loadIncidentData = () => {
    try {
      setLoading(true);
      const storedData = sessionStorage.getItem('emergencyIncidentData');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setIncidentData(parsedData);
      }
    } catch (err) {
      console.error('Error loading incident data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 Most Recent Incident</h1>
            <p className="text-gray-600">Latest emergency incident and assigned staff</p>
          </div>
        </div>

        {incidentData ? (
          <>
            {/* Incident Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Incident Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Incident ID:</span>
                  <p className="text-gray-900">{incidentData._id || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-900">{incidentData.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Caller Name:</span>
                  <p className="text-gray-900">{incidentData.callerName || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Assigned Staff */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">👥 Assigned Staff Members</h2>
                <p className="text-gray-600 mt-1">{incidentData.assignedStaff?.length || 0} staff members assigned</p>
              </div>

              {incidentData.assignedStaff && incidentData.assignedStaff.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {incidentData.assignedStaff.map((staff, index) => (
                    <div key={staff._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {staff.position}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Assigned</h3>
                  <p className="text-gray-600">No staff members have been assigned to this incident yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recent Incident</h3>
            <p className="text-gray-600">No emergency incident has been confirmed yet. Go to emergency mode to assign staff.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmergencyStaff;