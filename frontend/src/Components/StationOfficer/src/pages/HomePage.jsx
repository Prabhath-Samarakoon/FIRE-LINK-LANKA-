import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyHeader from '../Components/EmergencyHeader.jsx';
import stationOfficerApi from '../services/stationOfficerApi';
import './HomePage.css';
import { AppContext } from '../context/AppContext.jsx';

function HomePage({ onEmergencyModeChange, onNavigate, currentPage = 'home' }) {
  const navigate = useNavigate();
  const { emergencyMode, setEmergencyMode } = useContext(AppContext);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Category → common item names catalog
  const ITEM_NAMES_BY_CATEGORY = useMemo(() => ({
    'ppe': ['Turnout Coat','Turnout Pants','Fire Helmet','Fire Boots','Fire Gloves','Nomex Hood','Safety Glasses','Safety Vest'],
    'respiratory': ['SCBA Harness','SCBA Cylinder','Facepiece','Regulator','PAPR Unit','Airline Hose'],
    'hose-water': ['1.5" Attack Hose','2.5" Supply Hose','Hose Nozzle','Wye Valve','Hose Clamp','Hydrant Wrench'],
    'ladders': ['24ft Extension Ladder','14ft Roof Ladder','Attic Ladder','Ladder Roof Hook'],
    'entry-tools': ['Halligan Bar','Flathead Axe','Sledge Hammer','Pry Bar','Bolt Cutters'],
    'power-tools': ['Ventilation Saw','Circular Saw','Reciprocating Saw','Generator','Positive Pressure Fan'],
    'extrication': ['Hydraulic Cutter','Hydraulic Spreader','Rams','Stabilization Struts','Glass Management Kit'],
    'rope-rescue': ['Rescue Rope','Prusik Cord','Pulley','Descender','Harness','Carabiner'],
    'hazmat': ['Level A Suit','Level B Suit','Detection Meter','Decon Shower','Absorbent Pads'],
    'ems-medical': ['Trauma Kit','Oxygen Cylinder','BVM','AED','Spine Board','Cervical Collar'],
    'communications': ['Portable Radio','Mobile Radio','Radio Battery','Speaker Mic','Headset'],
    'apparatus': ['Crosslay Assembly','Deck Gun','Portable Monitor','Tool Mount','Scene Lighting'],
    'station-facilities': ['Fire Extinguisher','Washer Extractor','Dryer','Gear Rack','Station Generator'],
    'training': ['Training Hose','Cones','Dummy/Manikin','Prop Kit','Classroom Projector'],
    'water-supply-rural': ['Portable Tank','Suction Hose','Jet Siphon','Strainer','Dump Tank']
  }), []);

  // Load emergency mode from localStorage on component mount
  useEffect(() => {
    const savedEmergencyMode = localStorage.getItem('emergencyMode') === 'true';
    setIsEmergencyMode(savedEmergencyMode);
    // Sync with global emergency mode state
    if (savedEmergencyMode !== emergencyMode) {
      setEmergencyMode(savedEmergencyMode);
    }
  }, [emergencyMode, setEmergencyMode]);

  // Build suggestions catalog from category item names with backend fallback
  useEffect(() => {
    let isMounted = true;
    const fromCatalog = Object.entries(ITEM_NAMES_BY_CATEGORY).flatMap(([slug, names]) =>
      names.map(n => ({ _id: `${slug}:${n}`, name: n, categorySlug: slug }))
    );
    setAllItems(fromCatalog);
    (async () => {
      try {
        const data = await stationOfficerApi.getAllItems();
        const list = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []);
        if (isMounted && list && list.length) {
          setAllItems(prev => {
            // merge: prefer backend items, keep catalog for categories not present
            const seen = new Set(list.map(it => `${it.categorySlug}:${(it.name||'').toLowerCase()}`));
            const extras = fromCatalog.filter(it => !seen.has(`${it.categorySlug}:${it.name.toLowerCase()}`));
            return [...list.map(it => ({ _id: it._id, name: it.name, categorySlug: it.categorySlug })), ...extras];
          });
        }
      } catch (_) {}
    })();
    return () => { isMounted = false; };
  }, [ITEM_NAMES_BY_CATEGORY]);

  const handleEmergencyToggle = async () => {
    try {
      const newEmergencyMode = !emergencyMode;
      setIsEmergencyMode(newEmergencyMode);
      setEmergencyMode(newEmergencyMode);
      
      // Update emergency mode via API
      // Navigate immediately when activating, don't block on API
      if (newEmergencyMode) {
        if (onNavigate) onNavigate('assignments');
        navigate('/station-officer/assignments');
      }
      await stationOfficerApi.setEmergencyMode(newEmergencyMode);
      // Persist locally
      localStorage.setItem('emergencyMode', newEmergencyMode.toString());
      
      if (onEmergencyModeChange) {
        onEmergencyModeChange(newEmergencyMode);
      }
    } catch (error) {
      console.error('Failed to toggle emergency mode:', error);
      // Still update local state even if API fails
      const newEmergencyMode = !emergencyMode;
      setIsEmergencyMode(newEmergencyMode);
      setEmergencyMode(newEmergencyMode);
      localStorage.setItem('emergencyMode', newEmergencyMode.toString());
      if (newEmergencyMode) {
        if (onNavigate) onNavigate('assignments');
        navigate('/station-officer/assignments');
      }
    }
  };

  const emergencyContacts = [
    { 
      name: 'Call Operator', 
      number: '0712254001',
      email: 'calloperator@firelink.lk',
      location: 'Central Dispatch Center',
      shift: '24/7 Operations',
      responsibilities: 'Emergency call handling, incident dispatch, resource coordination',
      backupContact: '0712254002',
      icon: null,
      role: 'EMERGENCY DISPATCH',
      color: 'blue',
      description: 'Primary emergency contact for all fire and rescue operations'
    },
    { 
      name: 'Staff Manager', 
      number: '+94 11 234 5678',
      email: 'staffmanager@firelink.lk',
      location: 'Headquarters Office',
      shift: 'Mon-Fri 8AM-6PM',
      responsibilities: 'Personnel management, training coordination, staff scheduling',
      backupContact: '+94 11 234 5679',
      icon: null,
      role: 'PERSONNEL MANAGEMENT',
      color: 'green',
      description: 'Staff coordination, training, and resource management'
    },
    { 
      name: 'Vehicle Officer', 
      number: '+94 11 345 6789',
      email: 'vehicleofficer@firelink.lk',
      location: 'Vehicle Maintenance Bay',
      shift: '24/7 Fleet Operations',
      responsibilities: 'Vehicle maintenance, equipment dispatch, fleet coordination',
      backupContact: '+94 11 345 6790',
      icon: null,
      role: 'FLEET OPERATIONS',
      color: 'amber',
      description: 'Vehicle & equipment dispatch, maintenance coordination'
    }
  ];

  return (
    <div className="homepage">
      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="emergency-banner">
          🚨 EMERGENCY MODE ACTIVE - All personnel on standby 🚨
        </div>
      )}


      {/* Main Content */}
      <main className="homepage-main">
        <div className="homepage-container">
          
          {/* Global Item Search removed as per request */}

          {/* Hero CTA Section */}
          <div className="hero-section">
            {emergencyMode ? (
              <div className="emergency-mode-active">
                <button 
                  className="emergency-button deactivate"
                  onClick={handleEmergencyToggle}
                >
                  <div className="button-content">
                    <svg className="button-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="button-text">
                      EXIT EMERGENCY MODE
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                className="emergency-button"
                onClick={handleEmergencyToggle}
              >
                <div className="button-content">
                  <svg className="button-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="button-text">
                    ACTIVATE EMERGENCY MODE
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="emergency-contacts">
            <h2 className="section-title">Emergency Contacts</h2>
            <div className="contacts-grid">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className={`contact-card ${contact.color}`}>
                  <div className="contact-header">
                    <div className="contact-icon-wrapper">
                      <div className="contact-status-indicator"></div>
                    </div>
                    <div className="contact-info">
                      <h3 className="contact-name">{contact.name}</h3>
                      <p className="contact-role">{contact.role}</p>
                    </div>
                  </div>
                  <div className="contact-details">
                    <div className="contact-number-pill">
                      <span className="contact-number">{contact.number}</span>
                    </div>
                    <p className="contact-description">{contact.description}</p>
                    
                    {/* Additional Contact Information */}
                    <div className="contact-additional-info">
                      <div className="contact-info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{contact.email}</span>
                      </div>
                      <div className="contact-info-row">
                        <span className="info-label">Location:</span>
                        <span className="info-value">{contact.location}</span>
                      </div>
                      <div className="contact-info-row">
                        <span className="info-label">Shift:</span>
                        <span className="info-value">{contact.shift}</span>
                      </div>
                      <div className="contact-info-row">
                        <span className="info-label">Responsibilities:</span>
                        <span className="info-value">{contact.responsibilities}</span>
                      </div>
                      <div className="contact-info-row">
                        <span className="info-label">Backup Contact:</span>
                        <span className="info-value">{contact.backupContact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <p className="footer-text">&copy; 2024 FireLink Lanka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
