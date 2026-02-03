import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  // Removed sidebarToggle event listener as it's not needed for Staff Manager
  // The sidebar width is controlled by the Sidebar component itself

  const activateEmergencyMode = () => {
    if (location.pathname !== '/staff-manager/emergency') {
      navigate('/staff-manager/emergency')
    }
  }

  return (
    <div className={`sticky top-0 z-30 border-b border-blue-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70`}>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">FireLink Lanka</h1>
          <p className="text-base text-gray-600">Professional Emergency Response Management</p>
        </div>
        <div>
          <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-red-700 hover:to-red-800 transition-all duration-200" onClick={activateEmergencyMode}>
            <span>🚨</span>
            ACTIVATE EMERGENCY MODE
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
