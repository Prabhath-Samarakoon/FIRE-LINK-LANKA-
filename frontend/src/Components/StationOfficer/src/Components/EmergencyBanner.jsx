import React from 'react';
import './EmergencyBanner.css';

const EmergencyBanner = ({ message = "EMERGENCY MODE ACTIVE - ALL SYSTEMS ON HIGH ALERT" }) => {
  return (
    <div className="emergency-banner">
      <div className="emergency-banner-content">
        <span className="emergency-banner-icon">🚨</span>
        <span className="emergency-banner-text">{message}</span>
        <span className="emergency-banner-icon">🚨</span>
      </div>
    </div>
  );
};

export default EmergencyBanner;
