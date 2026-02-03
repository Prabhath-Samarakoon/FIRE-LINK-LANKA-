import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  AlertTriangle, 
  ChevronRight, 
  Phone, 
  PhoneOff,
  ArrowRight,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EmergencyModeProduction from './EmergencyModeProduction';
import EmergencyModeSeparated from './EmergencyModeSeparated';
import Page1CallIntake from './Page1CallIntake';
import Page2IncidentDispatch from './Page2IncidentDispatch';
import Page3QuickActions from './Page3QuickActions';

const EmergencyModeFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Incident
  
  // Clock timer state
  const [startTime, setStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(0);
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [operatorStatus, setOperatorStatus] = useState('Available');
  
  // Simple toast notification function
  const addToast = (message, type = 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // Clock timer effect
  useEffect(() => {
    let interval;
    if (isClockRunning) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockRunning, startTime]);

  // Format time function
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Status update functions
  const handleMuteToggle = (isMuted) => {
    setOperatorStatus(isMuted ? 'Mute' : 'Available');
  };

  const handleHoldToggle = (isOnHold) => {
    setOperatorStatus(isOnHold ? 'Hold' : 'Available');
  };

  const handleDispatch = async () => {
    try {
      // Create incident data from the form inputs
      const incidentData = {
        callerName: callerName || 'Unknown',
        callerPhone: callerPhone || 'Unknown',
        address: address || 'Unknown',
        coordinates: coordinates || 'Unknown',
        incidentType: incidentType && ['Building', 'Vehicle', 'Forest', 'HazMat'].includes(incidentType) ? incidentType : 'Building',
        hazards: Array.isArray(hazards) ? hazards.filter(h => ['Gas Cylinders', 'Chemicals', 'Explosives', 'Electrical', 'Structural'].includes(h)) : [],
        peopleTrapped: parseInt(peopleTrapped) || 0,
        injured: parseInt(injured) || 0,
        crowdSize: crowdSize && ['Small', 'Medium', 'Large', 'Very Large'].includes(crowdSize) ? crowdSize : 'Small',
        emergencyScale: emergencyScale === '5' ? 'Critical' : 
                       emergencyScale === '4' ? 'Critical' : 
                       emergencyScale === '3' ? 'High' : 
                       emergencyScale === '2' ? 'Medium' : 
                       emergencyScale === '1' ? 'Low' : 
                       (emergencyScale || 'Medium'),
        liveNotes: liveNotes || '',
        priority: priority && ['Low', 'Medium', 'High', 'Emergency'].includes(priority) ? priority : 'Medium',
        status: 'Dispatched',
        dispatchTime: new Date().toISOString()
      };

      console.log('Creating incident with data:', incidentData);

      // Create the incident
      const response = await api.createIncident(incidentData);
      
      if (response && response.incident) {
        setCreatedIncident(response.incident);
        addToast(`Incident created successfully! Call ID: ${response.incident.callId}`, 'success');
      } else {
        setCreatedIncident(incidentData);
        addToast('Incident created successfully!', 'success');
      }
      
      setIsClockRunning(false);
      navigate('/call-operator');
    } catch (error) {
      console.error('Error creating incident:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      addToast(`Error creating incident: ${errorMessage}`, 'error');
    }
  };
  
  // State for individual pages
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callId] = useState('#482851');
  const [liveNotes, setLiveNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [hazards, setHazards] = useState([]);
  const [peopleTrapped, setPeopleTrapped] = useState('');
  const [injured, setInjured] = useState('');
  const [crowdSize, setCrowdSize] = useState('');
  const [emergencyScale, setEmergencyScale] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [nearestStation, setNearestStation] = useState('');
  const [unitsToDispatch, setUnitsToDispatch] = useState({
    engine: 1,
    ladder: 0,
    rescue: 0,
    hazmat: 0
  });
  const [eta, setEta] = useState('');
  const [incidentCommander, setIncidentCommander] = useState('');
  const [timeline, setTimeline] = useState([
    { id: 1, event: 'Call received', time: '10:30 AM' },
    { id: 2, event: 'Safety advice sent', time: '10:31 AM' }
  ]);
  const [newLogEntry, setNewLogEntry] = useState('');
  const [createdIncident, setCreatedIncident] = useState(null);

  // Handler functions for individual pages
  const handleNextPage = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackPage = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddLogEntry = () => {
    if (newLogEntry.trim()) {
      const newEntry = {
        id: timeline.length + 1,
        event: newLogEntry,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setTimeline([...timeline, newEntry]);
      setNewLogEntry('');
    }
  };

  const handleEndCall = () => {
    alert('Call ended successfully!');
    navigate('/call-operator');
  };


  // Render individual pages based on currentStep
  const renderPageContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Page1CallIntake
            callerName={callerName}
            setCallerName={setCallerName}
            callerPhone={callerPhone}
            setCallerPhone={setCallerPhone}
            callId={callId}
            liveNotes={liveNotes}
            setLiveNotes={setLiveNotes}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isOnHold={isOnHold}
            setIsOnHold={setIsOnHold}
            isTransferring={isTransferring}
            setIsTransferring={setIsTransferring}
            address={address}
            setAddress={setAddress}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            onNextPage={handleNextPage}
            addToast={addToast}
            onMuteToggle={handleMuteToggle}
            onHoldToggle={handleHoldToggle}
          />
        );
      case 2:
        return (
          <Page2IncidentDispatch
            incidentType={incidentType}
            setIncidentType={setIncidentType}
            hazards={hazards}
            setHazards={setHazards}
            peopleTrapped={peopleTrapped}
            setPeopleTrapped={setPeopleTrapped}
            injured={injured}
            setInjured={setInjured}
            crowdSize={crowdSize}
            setCrowdSize={setCrowdSize}
            emergencyScale={emergencyScale}
            setEmergencyScale={setEmergencyScale}
            priority={priority}
            setPriority={setPriority}
            onBackPage={handleBackPage}
            onDispatch={handleDispatch}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-white text-gray-900 overflow-hidden">
      {/* Emergency Mode Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center animate-pulse">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              EMERGENCY MODE ACTIVE
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          
          {/* Incident Details Display */}
          {createdIncident && (
            <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="text-sm">
                <div className="font-semibold text-green-800">Incident Created</div>
                <div className="text-green-600">
                  Type: {createdIncident.incidentType || 'Unknown'} | 
                  Priority: {createdIncident.priority || 'Medium'}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Emergency Timer</div>
              <div className="text-2xl font-bold text-red-600">{formatTime(currentTime)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Status</div>
              <div className={`text-lg font-bold ${
                operatorStatus === 'Available' ? 'text-green-600' : 
                operatorStatus === 'Mute' ? 'text-orange-600' : 
                operatorStatus === 'Hold' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {operatorStatus}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/call-operator')}
            className="border-gray-300 h-12 px-4"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="h-[calc(100vh-80px)]">
        {renderPageContent()}
      </div>
    </div>
  );
};

export default EmergencyModeFlow;