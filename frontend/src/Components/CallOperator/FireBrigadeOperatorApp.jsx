import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Square, 
  Trash2, 
  MapPin, 
  Navigation, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  Send, 
  Download, 
  CheckCircle, 
  XCircle,
  Home,
  AlertTriangle,
  Users,
  UserCheck,
  Clock,
  Shield,
  Zap,
  Radio,
  Ambulance,
  ShieldAlert,
  Power,
  Hospital,
  Bell,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';

const FireBrigadeOperatorApp = () => {
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


  const toggleHazard = (hazard) => {
    setHazards(prev => 
      prev.includes(hazard) 
        ? prev.filter(h => h !== hazard)
        : [...prev, hazard]
    );
  };


  const handleRecord = () => {
    setIsRecording(!isRecording);
    addToast(isRecording ? 'Recording stopped' : 'Recording started', 'info');
  };

  const handleDeleteRecording = () => {
    addToast('Recording deleted', 'info');
  };

  const handleMarkFireLocation = () => {
    addToast('Fire location marked on map', 'info');
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

  const updateUnits = (unit, delta) => {
    setUnitsToDispatch(prev => ({
      ...prev,
      [unit]: Math.max(0, prev[unit] + delta)
    }));
  };

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
        {currentPage === 1 ? <Page1CallIntake /> : <Page2IncidentDispatch />}
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
      <div className="fixed bottom-4 left-4 z-40 bg-white rounded-2xl p-4 text-sm shadow-md border border-gray-200">
        <div className="text-gray-900 font-semibold mb-2">Keyboard Shortcuts:</div>
        <div className="text-gray-600 space-y-1">
          <div>M-Mute | H-Hold | T-Transfer | E-Evacuate | K-Keep Away</div>
          <div>S-Submit | X-End Call | N-Next | B-Back</div>
        </div>
      </div>
    </div>
  );

  // Page 1 - Call Intake Component
  function Page1CallIntake() {
    return (
      <div className="h-full p-8">
        <div className="grid grid-cols-[1.1fr_1.4fr] gap-8 h-full">
          {/* Left Column - Caller Panel */}
          <div className="space-y-8">
            <Card className="bg-white border-gray-300 h-full shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-3xl">Caller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-xl font-semibold mb-2">Caller Name</label>
                  <Input
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="Enter caller's full name"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-14 text-xl"
                  />
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2">Phone</label>
                  <Input
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="07X-XXXXXXX"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-14 text-xl"
                  />
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2">Call ID</label>
                  <Badge variant="outline" className="text-xl px-4 py-2">
                    {callId}
                  </Badge>
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2">Live Notes</label>
                  <Textarea
                    value={liveNotes}
                    onChange={(e) => setLiveNotes(e.target.value)}
                    placeholder="Type quick notes while caller speaks..."
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[200px] text-xl"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="icon"
                      onClick={handleRecord}
                      className="h-16 w-16 rounded-full"
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                      {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDeleteRecording}
                      className="h-16 w-16 rounded-full border-gray-600"
                      title="Delete Recording"
                    >
                      <Trash2 className="h-8 w-8" />
                    </Button>
                  </div>
                  <div className="text-lg text-gray-400">
                    {isRecording ? 'Recording...' : 'Ready to record'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Location, Safety Advice, Call Controls */}
          <div className="space-y-8">
            {/* Location Panel */}
            <Card className="bg-white border-gray-300 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-3xl">Location Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xl font-semibold mb-2">Address / Landmark</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House No, Street, Town"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-14 text-xl"
                  />
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2">Coordinates (optional)</label>
                  <div className="flex gap-2">
                    <Input
                      value={coordinates}
                      onChange={(e) => setCoordinates(e.target.value)}
                      placeholder="6.9271, 79.8612"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-14 text-xl"
                    />
                    <Button variant="outline" size="icon" className="border-gray-600 h-14 w-14">
                      <Navigation className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="h-32 w-full rounded-2xl border-2 border-dashed border-gray-600 bg-gray-700 flex items-center justify-center mb-4">
                    <div className="text-center text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-xl">Map Placeholder</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="xl"
                    onClick={handleMarkFireLocation}
                    className="w-full h-16 text-xl"
                  >
                    <MapPin className="h-6 w-6 mr-2" />
                    Mark Fire Location
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Navigation Button - Bottom Left */}
        <div className="absolute bottom-6 left-6">
          <Button
            variant="default"
            size="xl"
            onClick={handleNextPage}
            disabled={!isPage1Valid}
            className="h-16 text-xl px-8"
          >
            Next → Incident & Dispatch
            <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Page 2 - Incident & Dispatch Component
  function Page2IncidentDispatch() {
    return (
      <div className="h-full p-6">
        <div className="grid grid-cols-[2fr_1fr] gap-6 h-full">
          {/* Left Column - Incident Details, Resources, Timeline */}
          <div className="space-y-6">
            {/* Incident Details */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-3xl">Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-xl font-semibold mb-3 text-gray-700">Incident Type</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Building', 'Vehicle', 'Forest', 'HazMat'].map((type) => (
                      <Button
                        key={type}
                        variant={incidentType === type ? "default" : "outline"}
                        size="xl"
                        onClick={() => setIncidentType(type)}
                        className="border-gray-600 h-16 text-xl"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-semibold mb-3">Possible Hazards</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Gas Cylinders', 'Chemicals', 'Explosives'].map((hazard) => (
                      <Button
                        key={hazard}
                        variant={hazards.includes(hazard) ? "warning" : "outline"}
                        size="xl"
                        onClick={() => toggleHazard(hazard)}
                        className="border-gray-600 h-16 text-xl"
                      >
                        {hazard}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xl font-semibold mb-2">People Trapped</label>
                    <Input
                      type="number"
                      value={peopleTrapped}
                      onChange={(e) => setPeopleTrapped(parseInt(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-semibold mb-2">Injured</label>
                    <Input
                      type="number"
                      value={injured}
                      onChange={(e) => setInjured(parseInt(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xl font-semibold mb-2">Crowd Size</label>
                    <Select
                      value={crowdSize}
                      onChange={(e) => setCrowdSize(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                    >
                      <option value="">Select</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Very Large">Very Large</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xl font-semibold mb-2">Emergency Scale</label>
                    <Select
                      value={emergencyScale}
                      onChange={(e) => setEmergencyScale(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                    >
                      <option value="">Select</option>
                      <option value="1">1 - Low</option>
                      <option value="2">2 - Medium</option>
                      <option value="3">3 - High</option>
                      <option value="4">4 - Critical</option>
                      <option value="5">5 - Emergency</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-xl font-semibold mb-2">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                      <Button
                        key={p}
                        variant={priority === p ? "default" : "outline"}
                        size="lg"
                        onClick={() => setPriority(p)}
                        className="border-gray-600 h-14 text-xl"
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources & Dispatch */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-3xl">Resources & Dispatch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xl font-semibold mb-2">Nearest Station</label>
                  <Select
                    value={nearestStation}
                    onChange={(e) => setNearestStation(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                  >
                    <option value="">Select Station</option>
                    <option value="Station 1">Station 1 - Colombo</option>
                    <option value="Station 2">Station 2 - Kandy</option>
                    <option value="Station 3">Station 3 - Galle</option>
                    <option value="Station 4">Station 4 - Jaffna</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xl font-semibold mb-3">Units to Dispatch</label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(unitsToDispatch).map(([unit, count]) => (
                      <div key={unit} className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                        <span className="text-xl capitalize font-semibold">{unit}</span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateUnits(unit, -1)}
                            className="border-gray-600 h-10 w-10"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-2xl font-bold w-12 text-center">{count}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateUnits(unit, 1)}
                            className="border-gray-600 h-10 w-10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xl font-semibold mb-2">ETA (min)</label>
                    <Input
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      placeholder="15"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-14 text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-semibold mb-2">Assign Incident Commander</label>
                    <Select
                      value={incidentCommander}
                      onChange={(e) => setIncidentCommander(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-14 text-xl"
                    >
                      <option value="">Select Commander</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Sarah Johnson">Sarah Johnson</option>
                      <option value="Mike Wilson">Mike Wilson</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Logs */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-3xl">Timeline & Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-xl">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-xl font-semibold">{entry.event}</div>
                        <div className="text-sm text-gray-400">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLogEntry}
                    onChange={(e) => setNewLogEntry(e.target.value)}
                    placeholder="Add new log entry..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-14 text-xl"
                  />
                  <Button onClick={handleAddLogEntry} size="lg" className="h-14 text-xl">
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Navigation Button - Bottom Left */}
        <div className="absolute bottom-6 left-6">
          <Button
            variant="outline"
            size="xl"
            onClick={handleBackPage}
            className="h-16 text-xl px-8 border-gray-600"
          >
            <ChevronLeft className="h-6 w-6 mr-2" />
            ← Back to Call Intake
          </Button>
        </div>
      </div>
    );
  }
};

export default FireBrigadeOperatorApp;
