import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000';

function Emergency() {
  const [availableStaff, setAvailableStaff] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentIncident, setRecentIncident] = useState(null);
  const [incidentLoading, setIncidentLoading] = useState(true);
  const [incidentError, setIncidentError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('emergency-active');

    loadAvailable();
    loadRecentIncident();
    const idAvail = setInterval(loadAvailable, 4000);
    const idIncident = setInterval(loadRecentIncident, 5000);

    return () => {
      clearInterval(idAvail);
      clearInterval(idIncident);
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('emergency-active');
    };
  }, []);

  const loadRecentIncident = async () => {
    try {
      setIncidentLoading(true);
      setIncidentError(null);
      const res = await fetch(`${API_BASE}/incidents?page=1&limit=1`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch recent incident');
      const data = await res.json();
      const incidents = data.incidents || [];
      setRecentIncident(incidents.length > 0 ? incidents[0] : null);
    } catch (e) {
      console.error('Error loading recent incident:', e);
      setIncidentError('Failed to load recent incident: ' + e.message);
    } finally {
      setIncidentLoading(false);
    }
  };

  const loadAvailable = async () => {
    try {
      const [usersRes, availRes] = await Promise.all([
        fetch(`${API_BASE}/Users`, { cache: 'no-store' }),
        fetch(`${API_BASE}/availability`, { cache: 'no-store' })
      ]);
      
      if (!usersRes.ok) {
        throw new Error('Failed to fetch staff data');
      }
      
      const users = await usersRes.json();
      const availability = availRes.ok ? await availRes.json() : { availability: [] };

      // Create availability map
      const availabilityMap = new Map();
      if (availability.availability && Array.isArray(availability.availability)) {
        availability.availability.forEach(r => {
          const id = r.userId && (r.userId._id || r.userId);
          if (id) availabilityMap.set(id, r.status);
        });
      }

      // Get all staff and filter for only those marked as 'available'
      const allStaff = users.data || users.Users || users.users || [];
      const availableOnly = allStaff.filter(u => {
        const status = availabilityMap.get(u._id) || 'available';
        return status === 'available';
      });

      setAvailableStaff(availableOnly);
      setLoading(false);
      setError(null);
    } catch (e) {
      console.error('Error loading available staff:', e);
      setError('Failed to load available staff: ' + e.message);
      setLoading(false);
    }
  };

  const assignToIncident = (user) => {
    if (assigned.find(a => a._id === user._id)) return;
    setAssigned(prev => [...prev, user]);
  };

  const removeFromIncident = (id) => {
    setAssigned(prev => prev.filter(u => u._id !== id));
  };

  const confirmIncident = () => {
    if (assigned.length === 0) {
      alert('Select at least one staff member.');
      return;
    }
    
    // Store incident data with assigned staff for Vehicle Officer
    const incidentData = {
      ...recentIncident,
      assignedStaff: assigned,
      availableStaffCount: availableStaff.length,
      confirmedAt: new Date().toISOString()
    };
    
    // Store in sessionStorage for Vehicle Officer to access
    sessionStorage.setItem('emergencyIncidentData', JSON.stringify(incidentData));
    
    // Also save to localStorage for history (with timestamp)
    const timestamp = new Date().getTime();
    localStorage.setItem(`emergencyIncidentData_${timestamp}`, JSON.stringify(incidentData));
    
    alert(`Incident team assigned: ${assigned.map(a => a.name).join(', ')}`);
    
    // Navigate to Staff Manager dashboard
    navigate('/staff-manager');
  };

  const exitEmergency = () => {
    navigate('/staff-manager');
  };

  // Show all available staff; cards are compact to fit more on one page
  const visibleAvailable = availableStaff;

  // Group available staff by their position
  const groupByPosition = (list) => {
    const groups = new Map();
    list.forEach((u) => {
      const key = (u.position && String(u.position).trim()) || 'Unassigned';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(u);
    });
    return groups;
  };

  const preferredOrder = [
    'Station Officer',
    'Team Lead',
    'Driver',
    'Paramedic',
    'Firefighter',
    'Support',
    'Unassigned'
  ];

  const sortPositions = (positions) => {
    const set = new Set(preferredOrder);
    const known = positions.filter(p => set.has(p)).sort((a,b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b));
    const unknown = positions.filter(p => !set.has(p)).sort((a,b) => a.localeCompare(b));
    return [...known, ...unknown];
  };

  const CompactCard = ({ user, onAdd }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '.4rem',
      padding: '.6rem .7rem',
      border: '1px solid rgba(0,0,0,0.12)',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.95)',
      minHeight: '140px'
    }}>
      <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#111827', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name || 'Unknown Name'}
      </div>
      <div style={{ fontSize: '.8rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
        <span>{user.position || 'Unassigned'}</span>
        <span>{user.age ? `Age ${user.age}` : ''}</span>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={onAdd}
          style={{
            padding: '.45rem .6rem',
            borderRadius: '10px',
            border: '2px solid #16a34a',
            background: '#16a34a',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '.8rem',
            width: '100%'
          }}
        >ADD</button>
      </div>
    </div>
  );

  const LabelValue = ({ label, value }) => (
    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', padding: '.35rem 0', borderBottom: '1px dashed rgba(0,0,0,0.08)' }}>
      <div style={{ minWidth: 130, color: '#374151', fontSize: '.95rem', fontWeight: 700 }}>{label}</div>
      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>{value || '—'}</div>
    </div>
  );

  const Card = ({ user, actionLabel, onAction, actionColor }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 1.25rem', 
      border: '2px solid rgba(0, 0, 0, 0.1)', 
      borderRadius: '16px', 
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: 900, 
          fontSize: '1.3rem', 
          color: '#1f2937',
          marginBottom: '0.25rem'
        }}>
          {user.name || 'Unknown Name'}
        </div>
        <div style={{ 
          fontSize: '1rem', 
          color: '#6b7280',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.1rem'
        }}>
          <span>Age: {user.age || 'N/A'}</span>
          <span>Position: {user.position || 'Unassigned'}</span>
        </div>
      </div>
      <button 
        onClick={onAction} 
        style={{ 
          padding: '0.9rem 1.4rem', 
          borderRadius: '9999px', 
          border: `3px solid ${actionColor}`, 
          background: actionColor, 
          color: '#fff', 
          fontWeight: 900, 
          cursor: 'pointer', 
          fontSize: '1.05rem',
          transition: 'all 0.2s ease',
          minWidth: '80px'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {actionLabel}
      </button>
    </div>
  );

  return (
    <div className="emergency-root" style={{ position: 'fixed', inset: 0, background: '#f8fafc', zIndex: 9999, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1.5rem 0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1f2937' }}>EMERGENCY MODE</div>
            <div style={{ marginTop: '.25rem', color: '#6b7280', fontSize: '1.05rem' }}>Assign available staff to the incident</div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button 
              onClick={() => {
                // Request Staff button - no action needed as per user request
                console.log('Request Staff clicked');
              }}
              style={{ 
                padding: '0.8rem 1.2rem', 
                borderRadius: '12px', 
                border: '2px solid #10b981', 
                background: '#10b981', 
                color: '#fff', 
                fontWeight: 700, 
                cursor: 'pointer', 
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#059669';
                e.target.style.borderColor = '#059669';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.borderColor = '#10b981';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Request Staff
            </button>
          </div>
        </div>
      </div>

      {/* Three part layout: 1) Incident details 2) Available staff 3) Assigning staff */}
      <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        {/* Incident Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem', background: '#ffffff', border: '2px solid rgba(15,23,42,0.12)', borderRadius: '18px', padding: '1.1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', overflow: 'auto' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '.2px' }}>Incident Details</div>
          {incidentLoading ? (
            <div style={{ color: '#1f2937' }}>Loading incident...</div>
          ) : incidentError ? (
            <div style={{ color: '#ef4444' }}>{incidentError}</div>
          ) : !recentIncident ? (
            <div style={{ color: '#6b7280' }}>No recent incidents.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '.5rem' }}>
              <LabelValue label="Caller" value={recentIncident.callerName} />
              <LabelValue label="Caller Number" value={recentIncident.callerPhone} />
              <LabelValue label="Type" value={recentIncident.incidentType} />
              <LabelValue label="Priority" value={recentIncident.priority} />
              <LabelValue label="People Trapped" value={recentIncident.peopleTrapped} />
              <LabelValue label="Injured" value={recentIncident.injured} />
              <LabelValue label="Crowd Size" value={recentIncident.crowdSize} />
              <LabelValue label="Emergency Scale" value={recentIncident.emergencyScale} />
              <LabelValue label="Note" value={recentIncident.liveNotes} />
            </div>
          )}
        </div>

        {/* Available Staff */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 .5rem 0', color: '#1f2937' }}>
            Available Staff ({availableStaff.length})
          </div>
          {loading ? (
            <div style={{ fontSize: '1.25rem', color: '#1f2937' }}>Loading available staff...</div>
          ) : error ? (
            <div style={{ fontSize: '1.25rem', color: '#ef4444' }}>{error}</div>
          ) : (
            <>
              {(() => {
                // Flatten into a single list sorted by preferred position order then by name
                const groups = groupByPosition(visibleAvailable);
                const positions = sortPositions(Array.from(groups.keys()));
                const flattened = positions.flatMap(pos =>
                  groups.get(pos).slice().sort((a,b) => (a.name || '').localeCompare(b.name || ''))
                );
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '.5rem' }}>
                    {flattened.map(u => (
                      <CompactCard key={u._id} user={u} onAdd={() => assignToIncident(u)} />
                    ))}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Assigning Staff */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f2937' }}>Assigned Team</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '.75rem', minHeight: 80 }}>
            {assigned.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .75rem', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <span style={{ fontWeight: 800, color: '#1f2937' }}>{u.name}</span>
                <button onClick={() => removeFromIncident(u._id)} style={{ padding: '.25rem .6rem', borderRadius: '9999px', border: '2px solid #ef4444', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '.8rem' }}>x</button>
              </div>
            ))}
            {assigned.length === 0 && <div style={{ color: '#6b7280' }}>No one assigned yet</div>}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          <button onClick={exitEmergency} style={{ padding: '1.1rem 1.8rem', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #6b7280, #374151)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '1.15rem' }}>EXIT EMERGENCY MODE</button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={confirmIncident} style={{ padding: '1.1rem 1.8rem', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '1.15rem' }}>CONFIRM INCIDENT</button>
        </div>
      </div>
    </div>
  );
}

export default Emergency;
