import React from 'react';
import './MainHome.css';
import { useNavigate } from 'react-router-dom';

export default function MainHome() {
  const navigate = useNavigate();
  return (
    <div className="mainhome-root">
      <div className="mainhome-hero">
        <div className="mainhome-title">Fire Brigade Emergency Response</div>
        <div className="mainhome-sub">Choose a subsystem to continue</div>
        <div className="mainhome-actions">
          <button className="mh-btn" onClick={() => navigate('/login')}>Access System</button>
        </div>
      </div>
    </div>
  );
}


