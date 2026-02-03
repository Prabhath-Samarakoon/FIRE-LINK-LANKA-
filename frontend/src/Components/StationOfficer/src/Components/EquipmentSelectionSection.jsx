import React from 'react';

function EquipmentSelectionSection({ 
  selectedVehicles,
  selectedEquipment,
  onEquipmentToggle,
  onSelectAll,
  onClearAll,
  computedVehicleChecklist,
  isItemAvailable,
  getItemDisplayName,
  dataLoading,
  availableVehicles,
  vehicleCategoryMap,
  assignedVehiclesFromOfficer
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Equipment for {selectedVehicles.size} Selected Vehicle{selectedVehicles.size > 1 ? 's' : ''}
            </h3>
            {!dataLoading && (
              <div className="text-lg text-gray-600 mt-1 font-semibold">
                {(() => {
                  const allEquipment = [];
                  Object.values(computedVehicleChecklist).forEach(categoryItems => {
                    allEquipment.push(...categoryItems);
                  });
                  const availableCount = allEquipment.filter(item => isItemAvailable(item)).length;
                  const totalCount = allEquipment.length;
                  return `${availableCount}/${totalCount} items available`;
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onSelectAll}
            disabled={dataLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dataLoading ? 'Loading...' : 'Select All'}
          </button>
          <button
            onClick={onClearAll}
            disabled={dataLoading}
            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Equipment Selection Content */}
      {selectedVehicles.size > 0 ? (
        <>
          {dataLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading equipment availability...</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-96">
              {Array.from(selectedVehicles).map((vehicleId) => {
                // First try to find in assignedVehiclesFromOfficer (these are the actual selected vehicles)
                let vehicle = assignedVehiclesFromOfficer.find(v => v.vehicleId === vehicleId);
                
                if (vehicle) {
                  // Map the assigned vehicle to available vehicle for equipment categories
                  const mappedVehicle = availableVehicles.find(v => 
                    v.dbName === vehicle.name || 
                    v.dbVtype === vehicle.type ||
                    v.name === vehicle.name
                  );
                  
                  if (mappedVehicle) {
                    vehicle = {
                      ...vehicle,
                      ...mappedVehicle,
                      // Keep the original assigned vehicle data
                      assignedAt: vehicle.assignedAt,
                      assignedCrew: vehicle.assignedCrew
                    };
                  }
                } else {
                  // Fallback to availableVehicles
                  vehicle = availableVehicles.find(v => 
                    v.id === vehicleId || 
                    v._id === vehicleId || 
                    v.vehicleId === vehicleId ||
                    v.dbId === vehicleId ||
                    v.dbVehicleId === vehicleId
                  );
                }
                
                if (!vehicle) {
                  console.log('Vehicle not found for ID:', vehicleId);
                  return null;
                }
                
                // Get vehicle type for category mapping
                const vehicleType = vehicle.id || vehicle.type || 'unknown';
                const requiredCategories = vehicleCategoryMap[vehicleType] || [];
                
                console.log('Processing vehicle:', vehicle.name, 'Type:', vehicleType, 'Categories:', requiredCategories);
                
                return (
                  <div key={vehicleId} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {/* Vehicle Header */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${
                        vehicle.color === 'red' ? 'bg-red-500' :
                        vehicle.color === 'blue' ? 'bg-blue-500' :
                        vehicle.color === 'green' ? 'bg-green-500' :
                        vehicle.color === 'orange' ? 'bg-orange-500' :
                        vehicle.color === 'yellow' ? 'bg-yellow-500' :
                        vehicle.color === 'purple' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {vehicle.name || vehicle.dbName || 'Unknown Vehicle'}
                      </h4>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {vehicle.type || vehicle.category || 'Emergency Vehicle'}
                      </span>
                    </div>
                    
                    {/* Equipment Categories for this Vehicle */}
                    <div className="space-y-2">
                      {requiredCategories.length === 0 ? (
                        <div className="text-xs text-gray-500 italic">No specific equipment categories defined</div>
                      ) : (
                        requiredCategories.map((category) => {
                          const categoryItems = computedVehicleChecklist[category] || [];
                          
                          return (
                            <div key={category} className="bg-white rounded p-2 border border-gray-100">
                              <h5 className="font-semibold text-gray-800 mb-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                {category}
                              </h5>
                              
                              {categoryItems.length === 0 ? (
                                <div className="text-xs text-gray-500 italic">No Items Available</div>
                              ) : (
                                <div className="grid grid-cols-1 gap-1">
                                  {categoryItems.map((item) => {
                                    const available = isItemAvailable(item);
                                    const displayName = getItemDisplayName(item);
                                    return (
                                      <label key={item} className={`flex items-center space-x-2 p-1 rounded hover:bg-gray-50 cursor-pointer text-xs ${!available ? 'opacity-75' : ''}`}>
                                        <input
                                          type="checkbox"
                                          checked={selectedEquipment.has(item)}
                                          onChange={() => onEquipmentToggle(item)}
                                          disabled={!available}
                                          className={`w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <span className={`text-xs truncate ${available ? 'text-gray-900' : 'text-red-600 font-medium'}`}>
                                          {displayName}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Vehicles</h3>
          <p className="text-gray-500">Choose one or more emergency vehicles from the dropdown to view available equipment.</p>
        </div>
      )}
    </div>
  );
}

export default EquipmentSelectionSection;
