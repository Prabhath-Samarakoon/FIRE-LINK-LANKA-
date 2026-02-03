import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';

const FireBrigadeCallOperator = () => {
  // State for Page 1 - Call Intake
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
  const [callDuration, setCallDuration] = useState('00:00');
  const [operatorStatus, setOperatorStatus] = useState('Available');

  // State for Page 2 - Incident & Dispatch
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

  // Current page state
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);

  // Refs for focus management
  const callerNameRef = useRef(null);
  const addressRef = useRef(null);

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
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(!isMuted);
      } else if (e.key.toLowerCase() === 'h') {
        setIsOnHold(!isOnHold);
      } else if (e.key.toLowerCase() === 't') {
        setIsTransferring(!isTransferring);
      } else if (e.key.toLowerCase() === 's') {
        handleSubmitDispatch();
      } else if (e.key.toLowerCase() === 'x') {
        handleEndCall();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMuted, isOnHold, isTransferring]);

  // Validation
  const isPage1Valid = callerName && callerPhone && address;
  const isPage2Valid = incidentType && nearestStation && incidentCommander;

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

  const handleSubmitDispatch = () => {
    if (isPage1Valid && isPage2Valid) {
      addToast('Incident submitted and dispatched successfully!', 'success');
      setTimeline(prev => [...prev, {
        id: Date.now(),
        event: 'Units Dispatched',
        time: new Date().toLocaleTimeString(),
        status: 'completed'
      }]);
    } else {
      addToast('Please fill in all required fields', 'error');
    }
  };

  const handleEndCall = () => {
    setOperatorStatus('Wrap-up');
    addToast('Call ended', 'info');
  };

  const handleDownloadReport = () => {
    addToast('Report downloaded', 'success');
  };

  const Page1 = () => (
    <div className="h-screen w-full bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-fire-primary flex items-center justify-center">
            <Phone className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fire Brigade Call Operator</h1>
            <p className="text-xl text-gray-600">Call Intake & Safety Advice</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant={operatorStatus === 'Available' ? 'success' : 'warning'} className="text-lg px-4 py-2">
            {operatorStatus}
          </Badge>
          <div className="bg-gray-200 rounded-2xl px-4 py-2 text-2xl font-mono text-gray-900">
            ⏱ {callDuration}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)] p-6 gap-6">
        {/* Left Column - Caller Panel */}
        <div className="w-1/2 space-y-6">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 h-[400px] rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
              <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Caller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 h-full flex flex-col">
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Caller Name
                </label>
                <Input
                  ref={callerNameRef}
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Enter caller's full name"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Phone Number
                </label>
                <Input
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  placeholder="07X-XXXXXXX"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Call ID
                </label>
                <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 border-blue-200 text-blue-700 font-semibold">
                  {callId}
                </Badge>
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Live Notes
                </label>
                <Textarea
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  placeholder="Type quick notes while caller speaks..."
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-full resize-none transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Location, Safety Advice, Call Controls */}
        <div className="w-1/2 space-y-6">
          {/* Location Panel */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 h-[400px] rounded-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 rounded-t-xl">
              <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 h-full flex flex-col">
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Address / Landmark
                </label>
                <Input
                  ref={addressRef}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Town"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Coordinates
                </label>
                <div className="flex gap-2">
                  <Input
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="6.9271, 79.8612"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                  />
                  <Button variant="outline" size="icon" className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                    <Navigation className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex-1 w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 hover:border-gray-400 transition-all duration-200 hover:shadow-inner">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-lg font-medium">Map Placeholder</p>
                    <p className="text-sm text-gray-400 mt-1">Click to load interactive map</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleMarkFireLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-semibold"
                >
                  <MapPin className="h-6 w-6 mr-2" />
                  Mark Fire Location
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Footer Actions */}
      <footer className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl text-gray-600">
            Required: <span className="font-bold text-gray-900">Caller Name, Phone, Location</span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="info"
              size="xl"
              onClick={handleDownloadReport}
              disabled={!isPage1Valid}
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
              onClick={() => setCurrentPage(2)}
              disabled={!isPage1Valid}
            >
              <ChevronRight className="h-6 w-6 mr-2" />
              Next: Incident Details
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );

  const Page2 = () => (
    <div className="h-screen w-full bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-fire-primary flex items-center justify-center">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident & Dispatch</h1>
            <p className="text-xl text-gray-600">Resource Management & Timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="warning" className="text-lg px-4 py-2">
            {operatorStatus}
          </Badge>
          <div className="bg-gray-200 rounded-2xl px-4 py-2 text-2xl font-mono text-gray-900">
            ⏱ {callDuration}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)] p-6 gap-6">
        {/* Left Column - Incident Details, Resources, Timeline */}
        <div className="w-2/3 space-y-6">
          {/* Incident Details */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xl font-semibold mb-2 text-gray-700">Incident Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Building', 'Vehicle', 'Forest', 'HazMat'].map((type) => (
                    <Button
                      key={type}
                      variant={incidentType === type ? "default" : "outline"}
                      size="lg"
                      onClick={() => setIncidentType(type)}
                      className="border-gray-600"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xl font-semibold mb-2 text-gray-700">Possible Hazards</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Gas Cylinders', 'Chemicals', 'Explosives'].map((hazard) => (
                    <Button
                      key={hazard}
                      variant={hazards.includes(hazard) ? "warning" : "outline"}
                      size="lg"
                      onClick={() => toggleHazard(hazard)}
                      className="border-gray-600"
                    >
                      {hazard}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">People Trapped</label>
                  <Input
                    type="number"
                    value={peopleTrapped}
                    onChange={(e) => setPeopleTrapped(parseInt(e.target.value) || 0)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Injured</label>
                  <Input
                    type="number"
                    value={injured}
                    onChange={(e) => setInjured(parseInt(e.target.value) || 0)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Crowd Size</label>
                  <Select
                    value={crowdSize}
                    onChange={(e) => setCrowdSize(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                  >
                    <option value="">Select</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Very Large">Very Large</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Emergency Scale</label>
                  <Select
                    value={emergencyScale}
                    onChange={(e) => setEmergencyScale(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
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
                <label className="block text-xl font-semibold mb-2 text-gray-700">Priority</label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resources & Dispatch */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Resources & Dispatch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xl font-semibold mb-2 text-gray-700">Nearest Station</label>
                <Select
                  value={nearestStation}
                  onChange={(e) => setNearestStation(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Station</option>
                  <option value="Station 1">Station 1 - Colombo</option>
                  <option value="Station 2">Station 2 - Kandy</option>
                  <option value="Station 3">Station 3 - Galle</option>
                  <option value="Station 4">Station 4 - Jaffna</option>
                </Select>
              </div>

              <div>
                <label className="block text-xl font-semibold mb-2 text-gray-700">Units to Dispatch</label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(unitsToDispatch).map(([unit, count]) => (
                    <div key={unit} className="flex items-center justify-between">
                      <span className="text-lg capitalize">{unit}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setUnitsToDispatch(prev => ({
                            ...prev,
                            [unit]: Math.max(0, prev[unit] - 1)
                          }))}
                          className="border-gray-600"
                        >
                          -
                        </Button>
                        <span className="text-xl font-bold w-8 text-center">{count}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setUnitsToDispatch(prev => ({
                            ...prev,
                            [unit]: prev[unit] + 1
                          }))}
                          className="border-gray-600"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">ETA</label>
                  <Input
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="15 minutes"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                  />
                </div>
                <div>
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Incident Commander</label>
                  <Select
                    value={incidentCommander}
                    onChange={(e) => setIncidentCommander(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
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
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Timeline & Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold">{entry.event}</div>
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
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md"
                />
                <Button onClick={handleAddLogEntry} size="lg">
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer Actions */}
      <footer className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl text-gray-600">
            Required: <span className="font-bold text-gray-900">Incident Type, Station, Commander</span>
          </div>
          <div className="flex gap-4">
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
              disabled={!isPage2Valid}
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              Submit & Dispatch
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => setCurrentPage(1)}
              className="border-gray-600"
            >
              <ChevronLeft className="h-6 w-6 mr-2" />
              Back to Call Intake
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="relative">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-gray-900' :
              toast.type === 'error' ? 'bg-red-600 text-gray-900' :
              'bg-blue-600 text-gray-900'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 z-40 bg-gray-900 rounded-2xl p-4 text-sm">
        <div className="text-gray-900 font-semibold mb-2">Keyboard Shortcuts:</div>
        <div className="text-gray-600 space-y-1">
          <div>E - Evacuate SMS | K - Keep Away | M - Mute</div>
          <div>H - Hold | T - Transfer | S - Submit | X - End Call</div>
        </div>
      </div>

      {currentPage === 1 ? <Page1 /> : <Page2 />}
    </div>
  );
};

export default FireBrigadeCallOperator;
