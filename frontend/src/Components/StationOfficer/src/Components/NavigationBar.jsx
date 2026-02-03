import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar({ currentPage, onNavigate, isEmergencyMode }) {
  const navigate = useNavigate();

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <nav className="nav-header">
      <div className="nav-content">
        <div className="nav-title-section">
          <span className="nav-title">FireLink Lanka</span>
        </div>
      </div>
      <div className="nav-links-section">
        <div className="nav-links">
          <div className="nav-links-left">
            <button
              onClick={() => onNavigate('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className={`nav-link ${currentPage === 'inventory' ? 'active' : ''}`}
            >
              Inventory
            </button>
            <button
              onClick={() => onNavigate('donations')}
              className={`nav-link ${currentPage === 'donations' ? 'active' : ''}`}
            >
              Donations
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
            >
              Reports
            </button>
            <button
              onClick={() => onNavigate('inspections')}
              className={`nav-link ${currentPage === 'inspections' ? 'active' : ''}`}
            >
              Inspections
            </button>
            {isEmergencyMode && (
              <button
                onClick={() => onNavigate('assignments')}
                className={`nav-link ${currentPage === 'assignments' ? 'active' : ''}`}
              >
                Assignments
              </button>
            )}
          </div>
          <button
            onClick={handleMainMenu}
            className="nav-link main-menu-link"
          >
            Main Menu
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
