import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './VehicleOfficerLayout.css';

const VehicleOfficerLayout = () => {
  const location = useLocation();
  const isEmergencyMode = location.pathname.includes('/emergency-mode');

  return (
    <div className="vehicle-officer-layout">
      {!isEmergencyMode && <Sidebar />}
      <div className={`main-content ${isEmergencyMode ? 'emergency-fullscreen' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default VehicleOfficerLayout;

