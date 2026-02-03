
// CRUD example — remake for production
// Fire Brigade System Frontend - Inventory Page
// This is a skeleton to show structure & workflows

import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import EmergencyHeader from './src/Components/EmergencyHeader.jsx'
import EmergencyBanner from './src/Components/EmergencyBanner.jsx'
import SearchBar from './src/Components/SearchBar'
import { AppContext } from './src/context/AppContext.jsx'
import './Inventory.css'

function Inventory({ isEmergencyMode = false, onEmergencyModeChange }) {
  const { emergencyMode, setEmergencyMode } = useContext(AppContext);
  const location = useLocation();

  // Background images for category tiles (served from public/)
  const categoryImages = {
    'ppe': '/images/categories/ppe.jpg',
    'respiratory': '/images/categories/respiratory.jpg',
    'hose-water': '/images/categories/hose-water.jpg',
    'ladders': '/images/categories/ladders.jpg',
    'entry-tools': '/images/categories/entry-tools.jpg',
    'power-tools': '/images/categories/power-tools.jpg',
    'extrication': '/images/categories/extrication.jpg',
    'rope-rescue': '/images/categories/rope-rescue.jpg',
    'hazmat': '/images/categories/hazmat.jpg',
    'ems-medical': '/images/categories/ems-medical.jpg',
    'communications': '/images/categories/communications.jpg',
    'apparatus': '/images/categories/apparatus.jpg',
    'station-facilities': '/images/categories/station-facilities.jpg',
    'training': '/images/categories/training.jpg',
    'water-supply-rural': '/images/categories/water-supply-rural.jpg'
  }

  // Fixed categories as specified in requirements
  const categories = [
    {
      name: 'Personal Protective Equipment (PPE)',
      slug: 'ppe'
    },
    {
      name: 'Respiratory Protection',
      slug: 'respiratory'
    },
    {
      name: 'Hose & Water Delivery',
      slug: 'hose-water'
    },
    {
      name: 'Ground Ladders',
      slug: 'ladders'
    },
    {
      name: 'Forcible Entry & Hand Tools',
      slug: 'entry-tools'
    },
    {
      name: 'Power Tools & Ventilation',
      slug: 'power-tools'
    },
    {
      name: 'Vehicle Extrication & Stabilization',
      slug: 'extrication'
    },
    {
      name: 'Rope & Technical Rescue',
      slug: 'rope-rescue'
    },
    {
      name: 'HazMat & Decontamination',
      slug: 'hazmat'
    },
    {
      name: 'EMS / Medical',
      slug: 'ems-medical'
    },
    {
      name: 'Communications',
      slug: 'communications'
    },
    {
      name: 'Apparatus Loadouts',
      slug: 'apparatus'
    },
    {
      name: 'Station & Facilities',
      slug: 'station-facilities'
    },
    {
      name: 'Training & Consumables',
      slug: 'training'
    },
    {
      name: 'Water Supply & Rural Ops',
      slug: 'water-supply-rural'
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <EmergencyHeader isEmergencyMode={isEmergencyMode} onEmergencyModeChange={onEmergencyModeChange} />

      {/* Emergency Banner - Only show in emergency mode */}
      {emergencyMode && <EmergencyBanner message="EMERGENCY MODE ACTIVE - INVENTORY ON HIGH ALERT" />}

      <div className="inventory-content">
        {/* Professional Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                <p className="text-gray-600 mt-1 text-base">Select a category to manage items</p>
              </div>
              <div className="w-full max-w-xl">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-2">
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Removed secondary search bar */}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            {/* Categories Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/station-officer/inventory/${category.slug}`}
                  className="rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 group overflow-hidden bg-white"
                >
                  {/* Photo container */}
                  <div
                    className="h-24 w-full rounded-t-xl"
                    style={{
                      backgroundImage: `url(${categoryImages[category.slug] || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Optional subtle overlay for better photo visibility */}
                    <div className="h-full w-full bg-black/10 group-hover:bg-black/20 transition-opacity"></div>
                  </div>

                  {/* Category name below the photo */}
                  <div className="p-2 text-center">
                    <span className="text-gray-900 font-semibold text-sm tracking-tight leading-tight">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Emergency Mode Bottom Buttons */}
        {emergencyMode && (
          <div className="bg-white border-t-2 border-red-500 shadow-lg p-2">
            <div className="flex justify-between items-center">
              {/* Exit Emergency Mode Button - Left */}
              <button
                onClick={() => {
                  setEmergencyMode(false);
                  if (onEmergencyModeChange) onEmergencyModeChange(false);
                  window.location.href = '/station-officer';
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>EXIT EMERGENCY</span>
              </button>

              {/* Emergency Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-bold text-sm">EMERGENCY ACTIVE</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              {/* Spacer for right side */}
              <div className="w-32"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory

