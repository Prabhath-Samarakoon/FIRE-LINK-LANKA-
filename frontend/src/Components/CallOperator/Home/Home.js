import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { Flame, CheckCircle, Download, Square } from 'lucide-react';
import MapComponent from '../MapComponent';
// Tailwind styles applied via className

const Home = () => {
  const navigate = useNavigate();
  const [callerName, setCallerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('6.9271, 79.8612');
  const [fireLocation, setFireLocation] = useState(null);
  const [liveNotes, setLiveNotes] = useState('');
  const [incidentType, setIncidentType] = useState('Building');
  const [hazards, setHazards] = useState(['Gas Cylinders', 'Chemicals']);
  const [peopleTrapped, setPeopleTrapped] = useState(0);
  const [injured, setInjured] = useState(0);
  const [crowdSize, setCrowdSize] = useState('Select');
  const [emergencyScale, setEmergencyScale] = useState('Select');
  const [callId] = useState('#482851');
  const [status] = useState('Available');
  const [time, setTime] = useState('00:00');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/incidents';

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch recent incidents
  useEffect(() => {
    const fetchRecentIncidents = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (response.ok) {
          const data = await response.json();
          setRecentIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error('Error fetching incidents:', err);
      }
    };

    fetchRecentIncidents();
  }, []);

  const toggleHazard = (hazard) => {
    if (hazards.includes(hazard)) {
      setHazards(hazards.filter(h => h !== hazard));
    } else {
      setHazards([...hazards, hazard]);
    }
  };


  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^(\+94|0)?[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateCoordinates = (coords) => {
    if (!coords.trim()) return true; // Optional field
    const coordRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return coordRegex.test(coords.trim());
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!callerName.trim()) {
      newErrors.callerName = 'Caller name is required';
    } else if (callerName.trim().length < 2) {
      newErrors.callerName = 'Caller name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Please provide a more specific address';
    }

    if (!incidentType) {
      newErrors.incidentType = 'Please select an incident type';
    }

    if (coordinates && !validateCoordinates(coordinates)) {
      newErrors.coordinates = 'Please enter valid coordinates (e.g., 6.9271, 79.8612)';
    }

    if (peopleTrapped < 0) {
      newErrors.peopleTrapped = 'Number of people trapped cannot be negative';
    }

    if (injured < 0) {
      newErrors.injured = 'Number of injured cannot be negative';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form whenever inputs change
  useEffect(() => {
    const valid = validateForm();
    setIsFormValid(valid);
  }, [callerName, phone, address, incidentType, coordinates, peopleTrapped, injured]);


  const downloadReport = () => {
    // Create report content
    const reportData = {
      callId: callId,
      timestamp: new Date().toLocaleString(),
      caller: {
        name: callerName || 'Not provided',
        phone: phone || 'Not provided'
      },
      location: {
        address: address || 'Not provided',
        coordinates: coordinates || 'Not provided'
      },
      incident: {
        type: incidentType,
        hazards: hazards,
        peopleTrapped: peopleTrapped,
        injured: injured,
        crowdSize: crowdSize,
        emergencyScale: emergencyScale
      },
      notes: liveNotes || 'No notes taken',
      status: status
    };

    // Create PDF content using jsPDF
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Fire Brigade Report - ${reportData.callId}`,
      subject: 'Emergency Call Report',
      author: 'Fire Brigade Call Operator',
      creator: 'Fire Brigade Call Operator Console'
    });

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(220, 53, 69); // Red color for header
    doc.text('FIRE BRIGADE - CALL OPERATOR REPORT', 105, 20, { align: 'center' });
    
    // Add separator line
    doc.setDrawColor(220, 53, 69);
    doc.line(20, 30, 190, 30);
    
    // Reset text color and font size
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let yPosition = 45;
    
    // Call ID and Timestamp
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Call ID: ${reportData.callId}`, 20, yPosition);
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Timestamp: ${reportData.timestamp}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Status: ${reportData.status}`, 20, yPosition);
    yPosition += 20;
    
    // Caller Information
    doc.setFont(undefined, 'bold');
    doc.text('CALLER INFORMATION:', 20, yPosition);
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${reportData.caller.name}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Phone: ${reportData.caller.phone}`, 30, yPosition);
    yPosition += 20;
    
    // Location Details
    doc.setFont(undefined, 'bold');
    doc.text('LOCATION DETAILS:', 20, yPosition);
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Address: ${reportData.location.address}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Coordinates: ${reportData.location.coordinates}`, 30, yPosition);
    yPosition += 20;
    
    // Incident Details
    doc.setFont(undefined, 'bold');
    doc.text('INCIDENT DETAILS:', 20, yPosition);
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Type: ${reportData.incident.type}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Hazards: ${reportData.incident.hazards.join(', ')}`, 30, yPosition);
    yPosition += 8;
    doc.text(`People Trapped: ${reportData.incident.peopleTrapped}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Injured: ${reportData.incident.injured}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Crowd Size: ${reportData.incident.crowdSize}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Emergency Scale: ${reportData.incident.emergencyScale}`, 30, yPosition);
    yPosition += 20;
    
    // Live Notes
    doc.setFont(undefined, 'bold');
    doc.text('LIVE NOTES:', 20, yPosition);
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    
    // Handle long notes by wrapping text
    const notesLines = doc.splitTextToSize(reportData.notes, 150);
    doc.text(notesLines, 30, yPosition);
    yPosition += (notesLines.length * 8) + 20;
    
    // Footer
    doc.setDrawColor(220, 53, 69);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Report generated by Fire Brigade Call Operator Console', 105, yPosition, { align: 'center' });
    
    // Save the PDF
    const fileName = `FireBrigade_Report_${callId.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    alert('PDF Report downloaded successfully!');
  };

  const escalate = () => {
    alert('Call escalated to supervisor');
  };

  const endCall = () => {
    alert('Call ended');
  };

  const submitDispatch = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const incidentData = {
        callerName,
        callerPhone: phone,
        address,
        coordinates,
        incidentType,
        hazards,
        peopleTrapped,
        injured,
        crowdSize: crowdSize === 'Select' ? 'Small' : crowdSize,
        emergencyScale: emergencyScale === 'Select' ? 'Medium' : emergencyScale,
        liveNotes,
        priority,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      if (!response.ok) {
        throw new Error('Failed to create incident');
      }

      const data = await response.json();
      alert('Call submitted and dispatched successfully! Incident ID: ' + data.incident.callId);
      
      // Refresh incidents list
      const refreshResponse = await fetch(API_BASE_URL);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setRecentIncidents(refreshData.incidents || []);
      }
      
      // Navigate to incidents page to view the created incident
      navigate('/incidents');
    } catch (err) {
      setError(err.message);
      alert('Error submitting incident: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-0 text-gray-800">
      {/* Error Display */}
      {error && (
        <div className="mx-6 my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid w-full grid-cols-1 gap-5 px-6 py-5 lg:grid-cols-3">
        {/* Left Column - Caller & Live Notes */}
        <div className="flex flex-col gap-6">
          {/* Caller Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">Caller</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Caller Name *</label>
              <input
                type="text"
                placeholder="e.g., Nuwan Perera"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                  formErrors.callerName 
                    ? 'border-red-500 ring-red-500 bg-red-50' 
                    : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                }`}
              />
              {formErrors.callerName && (
                <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.callerName}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="text"
                placeholder="e.g., 07X-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                  formErrors.phone 
                    ? 'border-red-500 ring-red-500 bg-red-50' 
                    : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                }`}
              />
              {formErrors.phone && (
                <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.phone}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">Call ID: {callId}</div>
          </div>

          {/* Live Notes Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">Live Notes</h3>
            <div>
              <textarea
                className="h-56 w-full resize-none rounded-lg border-2 border-gray-300 bg-gray-50 p-3 outline-none ring-blue-500 placeholder:text-gray-400 focus:ring-2 focus:border-blue-500 transition-colors"
                placeholder="Type quick notes while caller speaks..."
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-sm text-blue-600">
                <div className="font-medium">Recording...</div>
                <div className="flex gap-2">
                  <button className="rounded-md border-2 border-blue-300 bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100 transition-colors">📝</button>
                  <button className="rounded-md border-2 border-blue-300 bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100 transition-colors">🎤</button>
                  <button className="rounded-md border-2 border-blue-300 bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100 transition-colors">💾</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Column - Location & Incident Details */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Location Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">Location</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Address / Landmark *</label>
              <input
                type="text"
                placeholder="House No., Street, Town"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                  formErrors.address 
                    ? 'border-red-500 ring-red-500 bg-red-50' 
                    : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                }`}
              />
              {formErrors.address && (
                <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.address}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Coordinates (optional)</label>
              <input
                type="text"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                  formErrors.coordinates 
                    ? 'border-red-500 ring-red-500 bg-red-50' 
                    : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                }`}
              />
              {formErrors.coordinates && (
                <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.coordinates}</p>
              )}
            </div>
            <div>
              <div className="mb-3 h-64 w-full rounded-md border-2 border-gray-300 bg-white overflow-hidden">
                <MapComponent
                  fireLocation={fireLocation}
                  setFireLocation={setFireLocation}
                  address={address}
                  setAddress={setAddress}
                  coordinates={coordinates}
                  setCoordinates={setCoordinates}
                  onMarkFireLocation={(location, address) => {
                    console.log('Fire location marked:', location, address);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Click on the map to mark fire location
              </p>
            </div>
          </div>

          {/* Incident Details Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">Incident Details</h3>
            
            <div className="incident-type">
              <label className="mb-2 block text-sm font-medium text-gray-700">Incident Type *</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${incidentType === 'Building' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => setIncidentType('Building')}
                >
                  🏠 Building
                </button>
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${incidentType === 'Vehicle' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => setIncidentType('Vehicle')}
                >
                  🚗 Vehicle
                </button>
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${incidentType === 'Forest' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => setIncidentType('Forest')}
                >
                  🌳 Forest
                </button>
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${incidentType === 'HazMat' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => setIncidentType('HazMat')}
                >
                  ☢️ HazMat
                </button>
              </div>
            </div>

            <div className="hazards">
              <label className="mb-2 block text-sm font-medium text-gray-700">Possible Hazards</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${hazards.includes('Gas Cylinders') ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => toggleHazard('Gas Cylinders')}
                >
                  <Flame className="h-4 w-4 text-orange-600" /> Gas Cylinders
                </button>
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${hazards.includes('Chemicals') ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => toggleHazard('Chemicals')}
                >
                  🧪 Chemicals
                </button>
                <button
                  className={`rounded-md border-2 px-3 py-2 font-medium transition-colors ${hazards.includes('Explosives') ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                  onClick={() => toggleHazard('Explosives')}
                >
                  💣 Explosives
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="">
                <label className="mb-2 block text-sm font-medium text-gray-700">People Trapped</label>
                <input
                  type="number"
                  value={peopleTrapped}
                  onChange={(e) => setPeopleTrapped(parseInt(e.target.value) || 0)}
                  min="0"
                  className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                    formErrors.peopleTrapped 
                      ? 'border-red-500 ring-red-500 bg-red-50' 
                      : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                  }`}
                />
                {formErrors.peopleTrapped && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.peopleTrapped}</p>
                )}
              </div>
              <div className="">
                <label className="mb-2 block text-sm font-medium text-gray-700">Injured</label>
                <input
                  type="number"
                  value={injured}
                  onChange={(e) => setInjured(parseInt(e.target.value) || 0)}
                  min="0"
                  className={`h-12 w-full rounded-lg border-2 px-3 outline-none focus:ring-2 transition-colors ${
                    formErrors.injured 
                      ? 'border-red-500 ring-red-500 bg-red-50' 
                      : 'border-gray-300 ring-blue-500 bg-gray-50 focus:border-blue-500'
                  }`}
                />
                {formErrors.injured && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{formErrors.injured}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="">
                <label className="mb-2 block text-sm font-medium text-gray-700">Crowd Size</label>
                <select 
                  value={crowdSize} 
                  onChange={(e) => setCrowdSize(e.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-3 outline-none ring-blue-500 focus:ring-2 focus:border-blue-500 transition-colors"
                >
                  <option value="Select">Select</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <div className="">
                <label className="mb-2 block text-sm font-medium text-gray-700">Emergency Scale</label>
                <select 
                  value={emergencyScale} 
                  onChange={(e) => setEmergencyScale(e.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-3 outline-none ring-blue-500 focus:ring-2 focus:border-blue-500 transition-colors"
                >
                  <option value="Select">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="">
              <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="h-12 w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-3 outline-none ring-blue-500 focus:ring-2 focus:border-blue-500 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Required: <span className="font-medium text-gray-800">Caller Name, Phone, Location, Incident Type</span>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            Download Report
          </button>
          <button className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 transition-colors flex items-center gap-2" onClick={endCall}>
            <Square className="h-4 w-4" />
            End Call
          </button>
          <button 
            className={`rounded-md px-3 py-2 text-white disabled:opacity-60 transition-colors ${
              isFormValid && !loading
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={submitDispatch}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Submitting...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit & Dispatch
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
