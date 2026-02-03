import React, { useState, useEffect } from 'react';

function VehicleAssignmentSection({ 
  assignedVehicles, 
  staffCount, 
  onVehicleToggle, 
  selectedVehicles,
  availableVehicles,
  assignedVehicleIds,
  getVehicleColorClass,
  incidentData,
  onViewVehicles,
  assignedVehiclesFromOfficer
}) {

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Vehicle Assignment</h3>
          <p className="text-gray-600">Vehicles assigned by Vehicle Officer</p>
        </div>
      </div>

      {/* Staff Positions Display */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 mb-3">
        <div className="text-center mb-4">
          <div className="text-3xl font-black text-green-600 mb-1">{staffCount}</div>
          <div className="text-sm font-semibold text-green-600">Staff Members Assigned</div>
          <div className="text-xs text-green-500 mt-1">Ready for Emergency Response</div>
        </div>
        
      </div>

      {/* Assigned Vehicles from Vehicle Officer */}
      {assignedVehiclesFromOfficer && assignedVehiclesFromOfficer.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-800 text-sm">Current Emergency Vehicles:</h4>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {assignedVehiclesFromOfficer.length} assigned
            </div>
          </div>
          <div className="space-y-2">
            {assignedVehiclesFromOfficer.map((vehicle, index) => (
              <div 
                key={vehicle.id || index} 
                className={`bg-white rounded-lg p-3 border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedVehicles.has(vehicle.vehicleId) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-blue-200 hover:border-blue-300'
                }`}
                onClick={() => onVehicleToggle(vehicle.vehicleId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold ${
                      selectedVehicles.has(vehicle.vehicleId)
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {selectedVehicles.has(vehicle.vehicleId) ? '✓' : '🚒'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{vehicle.name}</div>
                      <div className="text-xs text-gray-600">{vehicle.type}</div>
                      <div className="text-xs text-blue-600">Assigned: {new Date(vehicle.assignedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedVehicles.has(vehicle.vehicleId)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedVehicles.has(vehicle.vehicleId) ? 'SELECTED' : 'ASSIGNED'}
                    </div>
                    {vehicle.assignedCrew && vehicle.assignedCrew.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {vehicle.assignedCrew.length} crew
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Action Buttons */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 flex flex-col">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm">Vehicle Actions:</h4>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Refresh Button */}
            <button
              onClick={() => {
                console.log('Manual refresh triggered');
                if (window.fetchVehicleAssignments) {
                  window.fetchVehicleAssignments();
                } else {
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>REFRESH</span>
            </button>
            
            {/* Clear Old Assignments Button */}
            <button
              onClick={async () => {
                try {
                  console.log('Clearing old assignments (older than 2 minutes)...');
                  
                  // Clear old emergency vehicle assignments (older than 2 minutes)
                  await fetch('http://localhost:5000/api/vehicle-officer/emergency-vehicle-assignments/clear-old', {
                    method: 'DELETE'
                  });
                  
                  // Clear old confirmed assignments (older than 2 minutes)
                  await fetch('http://localhost:5000/api/confirmed-assignments/clear-old', {
                    method: 'DELETE'
                  });
                  
                  console.log('Old assignments cleared (older than 2 minutes)');
                  
                  // Refresh the page to show clean state
                  window.location.reload();
                } catch (error) {
                  console.error('Error clearing old assignments:', error);
                  alert('Error clearing old assignments: ' + error.message);
                }
              }}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 mt-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>CLEAR</span>
            </button>
            
          </div>
        </div>
      </div>


    </div>
  );
}

export default VehicleAssignmentSection;
