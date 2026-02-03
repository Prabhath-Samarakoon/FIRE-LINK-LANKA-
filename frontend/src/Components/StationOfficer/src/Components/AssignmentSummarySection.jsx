import React from 'react';

function AssignmentSummarySection({ 
  selectedVehicles,
  selectedEquipment,
  availableVehicles,
  getVehicleColorClass,
  onConfirmAssignment,
  loading
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-all duration-300 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Assignment Summary</h3>
      </div>
      
      {selectedVehicles.size > 0 || selectedEquipment.size > 0 ? (
        <div className="flex flex-col h-full">
          {/* Content area */}
          <div className="flex-1 space-y-4 pr-2">
            {/* Vehicle Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-lg">
                  {selectedVehicles.size} Selected Vehicle{selectedVehicles.size > 1 ? 's' : ''}
                </h4>
                <div className="space-y-2">
                  {Array.from(selectedVehicles).map(vehicleId => {
                    const vehicle = availableVehicles.find(v => v.id === vehicleId);
                    return vehicle ? (
                      <div key={vehicleId} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${getVehicleColorClass(vehicle.color)} rounded-lg flex items-center justify-center text-white text-sm shadow-lg`}>
                          {vehicle.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{vehicle.dbName || vehicle.name}</div>
                          <div className="text-xs text-gray-600">{vehicle.dbVtype || vehicle.category}</div>
                          {vehicle.dbStatus && (
                            <div className={`text-xs ${vehicle.dbStatus === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                              Status: {vehicle.dbStatus}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Equipment Count */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600 mb-1 animate-pulse">{selectedEquipment.size}</div>
                <div className="text-sm font-semibold text-blue-600">Equipment Items Selected</div>
                <div className="text-xs text-blue-500 mt-1">Ready for Emergency Deployment</div>
              </div>
            </div>

            {/* Selected Equipment List */}
            {selectedEquipment.size > 0 && (
              <div className="border-2 border-gray-200 rounded-xl p-3 bg-gradient-to-br from-green-50 to-green-100">
                <h5 className="font-bold text-gray-900 mb-2 text-sm">Selected Equipment:</h5>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Array.from(selectedEquipment).map((item, index) => (
                    <div key={item} className="flex items-center space-x-2 text-xs bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Assignment Button */}
          {selectedVehicles.size > 0 && (
            <div className="mt-6">
              <button
                onClick={onConfirmAssignment}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>CONFIRMING...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>CONFIRM INCIDENT</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignment</h3>
          <p className="text-gray-500">Select vehicles and equipment to create an assignment.</p>
        </div>
      )}
    </div>
  );
}

export default AssignmentSummarySection;
