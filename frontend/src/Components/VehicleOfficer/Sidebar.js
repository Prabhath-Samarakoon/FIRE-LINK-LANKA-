import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Professional SVG Icons
  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  );

  const VehicleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 12c-.3-.1-.6-.1-.9-.1H6.2c-.3 0-.6 0-.9.1L4.5 11.1C3.7 11.3 3 12.1 3 13v3c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
      <path d="M5 17H3v-3c0-.9.7-1.7 1.5-1.9L5.3 12"/>
      <path d="M19 17h2v-3c0-.9-.7-1.7-1.5-1.9L18.7 12"/>
    </svg>
  );

  const MapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1,6 1,22 8,18 16,21 23,18 23,2 16,5 8,2 1,6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="5" x2="16" y2="21"/>
    </svg>
  );

  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  );

  const EmergencyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );

  const MaintenanceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );

  const ResourcesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    </svg>
  );

  const EmergencyModeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      description: 'Main dashboard',
      icon: <HomeIcon />
    },
    {
      path: '/vehicle-officer/vehicles',
      label: 'Vehicle Details',
      description: 'View and manage vehicles',
      icon: <VehicleIcon />
    },
    {
      path: '/vehicle-officer/map',
      label: 'Map',
      description: 'Live tracking and navigation',
      icon: <MapIcon />
    },
    {
      path: '/vehicle-officer',
      label: 'Dashboard',
      description: 'Analytics and reports',
      icon: <DashboardIcon />
    },
    {
      path: '/vehicle-officer/emergency-management',
      label: 'Emergency',
      description: 'Emergency response management',
      icon: <EmergencyIcon />
    },
    {
      path: '/vehicle-officer/maintenance-management',
      label: 'Maintenance',
      description: 'Vehicle maintenance tracking',
      icon: <MaintenanceIcon />
    },
    {
      path: '/vehicle-officer/resource-management',
      label: 'Resources',
      description: 'Resource management',
      icon: <ResourcesIcon />
    }
  ];

  const handleEmergencyMode = () => {
    // Navigate to emergency mode page
    window.location.href = '/vehicle-officer/emergency-mode';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button 
          className="toggle-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          ☰
        </button>
        {!isCollapsed && <span className="header-text">Menu</span>}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {navigationItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? item.description : ''}
          >
            {/* Icon - always visible */}
            <div className="nav-icon">
              {item.icon}
            </div>
            
            {/* Content - only visible when expanded */}
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            )}
          </Link>
        ))}
        
        {/* Emergency Mode Button */}
        <button
          onClick={handleEmergencyMode}
          className="emergency-mode-btn"
          title={isCollapsed ? 'EMERGENCY MODE' : ''}
        >
          {/* Emergency Icon - always visible */}
          <div className="emergency-icon-container">
            <EmergencyModeIcon />
          </div>
          
          {/* Content - only visible when expanded */}
          {!isCollapsed && (
            <div className="nav-content">
              <span className="nav-label">EMERGENCY MODE</span>
            </div>
          )}
        </button>
      </nav>

    </div>
  );
};

export default Sidebar;










