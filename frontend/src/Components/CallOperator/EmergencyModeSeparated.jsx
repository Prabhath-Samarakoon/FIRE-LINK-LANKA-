import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Download, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import Page1CallIntake from './Page1CallIntake';
import Page2IncidentDispatch from './Page2IncidentDispatch';

const EmergencyModeSeparated = () => {
  // App state
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [callDuration, setCallDuration] = useState('00:00');
  const [operatorStatus, setOperatorStatus] = useState('Available');

  // Page 1 - Call Intake State
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callId] = useState(`#${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  const [liveNotes, setLiveNotes] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Page 2 - Incident & Dispatch State
  const [incidentType, setIncidentType] = useState('');
  const [hazards, setHazards] = useState([]);
  const [peopleTrapped, setPeopleTrapped] = useState(0);
  const [injured, setInjured] = useState(0);
  const [crowdSize, setCrowdSize] = useState('');
  const [emergencyScale, setEmergencyScale] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [nearestStation, setNearestStation] = useState('');
  const [unitsToDispatch, setUnitsToDispatch] = useState({
    engine: 0,
    ladder: 0,
    rescue: 0,
    hazmat: 0
  });
  const [eta, setEta] = useState('');
  const [incidentCommander, setIncidentCommander] = useState('');
  const [timeline, setTimeline] = useState([
    { id: 1, event: 'Call Received', time: new Date().toLocaleTimeString(), status: 'completed' },
  ]);
  const [newLogEntry, setNewLogEntry] = useState('');

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        const newSeconds = seconds + 1;
        if (newSeconds >= 60) {
          return `${minutes + 1}:00`;
        }
        return `${minutes}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'm') {
        setIsMuted(!isMuted);
      } else if (e.key.toLowerCase() === 'h') {
        setIsOnHold(!isOnHold);
      } else if (e.key.toLowerCase() === 't') {
        setIsTransferring(!isTransferring);
      } else if (e.key.toLowerCase() === 'e') {
        toggleSafetyAdvice('Evacuate immediately');
      } else if (e.key.toLowerCase() === 'k') {
        toggleSafetyAdvice('Keep away from hazards');
      } else if (e.key.toLowerCase() === 's') {
        handleSubmitDispatch();
      } else if (e.key.toLowerCase() === 'x') {
        handleEndCall();
      } else if (e.key.toLowerCase() === 'n' && currentPage === 1) {
        handleNextPage();
      } else if (e.key.toLowerCase() === 'b' && currentPage === 2) {
        handleBackPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMuted, isOnHold, isTransferring, currentPage]);

  // Validation
  const isPage1Valid = callerName && callerPhone && address;
  const isPage2Valid = incidentType && nearestStation && incidentCommander;
  const isSubmitValid = isPage1Valid && isPage2Valid;

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const toggleSafetyAdvice = (advice) => {
    setSafetyAdvice(prev => 
      prev.includes(advice) 
        ? prev.filter(a => a !== advice)
        : [...prev, advice]
    );
  };

  const handleNextPage = () => {
    if (isPage1Valid) {
      setCurrentPage(2);
      addToast('Switched to Incident & Dispatch', 'info');
    } else {
      addToast('Please fill in all required fields on Page 1', 'error');
    }
  };

  const handleBackPage = () => {
    setCurrentPage(1);
    addToast('Switched to Call Intake', 'info');
  };

  const handleAddLogEntry = () => {
    if (newLogEntry.trim()) {
      setTimeline(prev => [...prev, {
        id: Date.now(),
        event: newLogEntry,
        time: new Date().toLocaleTimeString(),
        status: 'completed'
      }]);
      setNewLogEntry('');
      addToast('Log entry added', 'success');
    }
  };

  const handleSubmitDispatch = () => {
    if (isSubmitValid) {
      addToast('Incident submitted and dispatched successfully!', 'success');
      setTimeline(prev => [...prev, {
        id: Date.now(),
        event: 'Units Dispatched',
        time: new Date().toLocaleTimeString(),
        status: 'completed'
      }]);
    } else {
      addToast('Please fill in all required fields on both pages', 'error');
    }
  };

  const handleEndCall = () => {
    setOperatorStatus('Wrap-up');
    addToast('Call ended', 'info');
  };

  const handleDownloadReport = () => {
    addToast('Report downloaded', 'success');
  };

  return (
    <div className="h-full w-full bg-white text-gray-900 overflow-hidden">
      {/* Main Content - No Navigation Bar */}
      <main className="h-full overflow-hidden">
        {currentPage === 1 ? (
          <Page1CallIntake
            callerName={callerName}
            setCallerName={setCallerName}
            callerPhone={callerPhone}
            setCallerPhone={setCallerPhone}
            callId={callId}
            liveNotes={liveNotes}
            setLiveNotes={setLiveNotes}
            address={address}
            setAddress={setAddress}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isOnHold={isOnHold}
            setIsOnHold={setIsOnHold}
            isTransferring={isTransferring}
            setIsTransferring={setIsTransferring}
            onNextPage={handleNextPage}
            addToast={addToast}
          />
        ) : (
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
            nearestStation={nearestStation}
            setNearestStation={setNearestStation}
            unitsToDispatch={unitsToDispatch}
            setUnitsToDispatch={setUnitsToDispatch}
            eta={eta}
            setEta={setEta}
            incidentCommander={incidentCommander}
            setIncidentCommander={setIncidentCommander}
            timeline={timeline}
            newLogEntry={newLogEntry}
            setNewLogEntry={setNewLogEntry}
            onBackPage={handleBackPage}
            onAddLogEntry={handleAddLogEntry}
          />
        )}
      </main>


      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyModeSeparated;
