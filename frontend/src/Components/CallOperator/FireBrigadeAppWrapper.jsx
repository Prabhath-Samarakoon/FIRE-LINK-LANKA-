import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Download, 
  CheckCircle, 
  XCircle,
  Home,
  Truck
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import Page1CallIntake from './Page1CallIntake';
import Page2IncidentDispatch from './Page2IncidentDispatch';
import Page3QuickActions from './Page3QuickActions';

const FireBrigadeAppWrapper = () => {
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
  const [fireLocation, setFireLocation] = useState(null);
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
    setCurrentPage(2);
    addToast('Switched to Incident & Dispatch', 'info');
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

  const handleDispatch = () => {
    addToast('Emergency units dispatched successfully!', 'success');
    setTimeline(prev => [...prev, {
      id: Date.now(),
      event: 'Emergency Units Dispatched',
      time: new Date().toLocaleTimeString(),
      status: 'completed'
    }]);
  };

  const handleDownloadReport = () => {
    addToast('Report downloaded', 'success');
  };

  console.log('Current page:', currentPage);
  console.log('Page 3 should render:', currentPage === 3);

  return (
    <div className="h-screen w-screen bg-white text-gray-900 overflow-hidden">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-fire-primary flex items-center justify-center">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-8 w-8 text-blue-600" />
              Call Operator Console
            </h1>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="lg"
            onClick={() => setCurrentPage(1)}
            className="border-gray-300"
          >
            Page 1: Call Intake
          </Button>
          <Button
            variant={currentPage === 2 ? "default" : "outline"}
            size="lg"
            onClick={() => setCurrentPage(2)}
            className="border-gray-300"
          >
            Page 2: Incident & Dispatch
          </Button>
          <Button
            variant={currentPage === 3 ? "default" : "outline"}
            size="lg"
            onClick={() => setCurrentPage(3)}
            className="border-gray-300"
          >
            Page 3: Quick Actions
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              console.log('DEBUG: Manually setting page to 3');
              setCurrentPage(3);
            }}
            className="ml-4"
          >
            DEBUG: Force Page 3
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/call-operator'}
            className="border-gray-300 h-12 px-4"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </Button>
          <Badge variant={operatorStatus === 'Available' ? 'success' : 'warning'} className="text-lg px-4 py-2">
            {operatorStatus}
          </Badge>
          <div className="bg-gray-200 rounded-2xl px-4 py-2 text-2xl font-mono text-gray-900">
            ⏱ {callDuration}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)] overflow-hidden">
        {currentPage === 1 && (
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
            fireLocation={fireLocation}
            setFireLocation={setFireLocation}
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
        )}
        {currentPage === 2 && (
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
        )}
        
        {/* Always visible debug info */}
        <div className="fixed top-20 right-4 bg-yellow-100 border-2 border-yellow-500 p-2 rounded-lg z-50">
          <p className="text-sm font-bold">DEBUG INFO:</p>
          <p className="text-xs">Current Page: {currentPage}</p>
          <p className="text-xs">Page 3 Condition: {currentPage === 3 ? 'TRUE' : 'FALSE'}</p>
          <p className="text-xs">Time: {new Date().toLocaleTimeString()}</p>
          <button 
            onClick={() => {
              console.log('DEBUG: Setting page to 3');
              setCurrentPage(3);
            }}
            className="mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded"
          >
            FORCE PAGE 3
          </button>
        </div>
      </main>

      {/* Bottom Right Actions - Persistent */}
      <footer className="absolute bottom-4 right-4 flex gap-4 z-50">
        <Button
          variant="info"
          size="xl"
          onClick={handleDownloadReport}
        >
          <Download className="h-6 w-6 mr-2" />
          Download Report
        </Button>
        <Button
          variant="destructive"
          size="xl"
          onClick={handleEndCall}
        >
          <XCircle className="h-6 w-6 mr-2" />
          End Call
        </Button>
        <Button
          variant="success"
          size="xl"
          onClick={handleSubmitDispatch}
          disabled={!isSubmitValid}
        >
          <CheckCircle className="h-6 w-6 mr-2" />
          Submit & Dispatch
        </Button>
      </footer>

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

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 z-40 bg-gray-900 rounded-2xl p-4 text-sm">
        <div className="text-white font-semibold mb-2">Keyboard Shortcuts:</div>
        <div className="text-gray-300 space-y-1">
          <div>M-Mute | H-Hold | T-Transfer | E-Evacuate | K-Keep Away</div>
          <div>S-Submit | X-End Call | N-Next | B-Back</div>
        </div>
      </div>
    </div>
  );
};

export default FireBrigadeAppWrapper;
