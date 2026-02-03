// Station Officer Emergency Header
// Updated for integration without React Router

import React from 'react'

function EmergencyHeader({ isEmergencyMode = false, onEmergencyModeChange, onNavigate }) {

  // Show emergency header when in emergency mode
  if (!isEmergencyMode) {
    return null;
  }

  return (
    <header className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-2 px-4 shadow-lg">
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-1.5 rounded-full">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wide">EMERGENCY VEHICLE EQUIPMENT ASSIGNMENT</h1>
                <p className="text-red-100 text-xs font-medium">Rapid Equipment Assignment System for Emergency Response</p>
              </div>
            </div>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-8 flex-1">
              {/* Go to Assignments quick link */}
              <button
                onClick={() => onNavigate && onNavigate('assignments')}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold text-sm border-2 border-transparent hover:border-white hover:border-opacity-50 focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:border-white transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Open Assignments
              </button>

              {/* Real-time status indicator */}
              <div className="bg-white bg-opacity-25 px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-white">SYSTEM ACTIVE</span>
                </div>
              </div>
            </div>

            {/* End Emergency Button - Right side */}
            <button
              onClick={() => onEmergencyModeChange && onEmergencyModeChange(false)}
              className="px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 text-red-700 text-xs font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-1.5 border border-white border-opacity-50 hover:border-opacity-100 ml-8"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span>End Emergency</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default EmergencyHeader


