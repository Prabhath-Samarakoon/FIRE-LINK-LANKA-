import React from 'react';
import { 
  ChevronLeft,
  Phone,
  PhoneOff,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select } from '../ui/select';

const Page3QuickActions = ({
  nearestStation,
  setNearestStation,
  unitsToDispatch,
  setUnitsToDispatch,
  eta,
  setEta,
  incidentCommander,
  setIncidentCommander,
  timeline,
  newLogEntry,
  setNewLogEntry,
  onAddLogEntry,
  onBackPage,
  onEndCall,
  onDispatch
}) => {
  const updateUnits = (unit, delta) => {
    setUnitsToDispatch(prev => ({
      ...prev,
      [unit]: Math.max(0, prev[unit] + delta)
    }));
  };


  return (
    <div className="h-full p-2 pb-16 bg-blue-50">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600">PAGE 3 - QUICK ACTIONS & DISPATCH</h1>
      </div>
      <div className="grid grid-cols-1 gap-3 h-full">
        {/* Resource & Dispatch Details */}
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 text-2xl">Resource & Dispatch Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-lg font-semibold mb-2">Nearest Station</label>
              <Select
                value={nearestStation}
                onChange={(e) => setNearestStation(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 h-12 text-lg"
              >
                <option value="">Select Station</option>
                <option value="Station A">Station A</option>
                <option value="Station B">Station B</option>
                <option value="Station C">Station C</option>
              </Select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Units to Dispatch</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(unitsToDispatch).map(([unit, count]) => (
                  <div key={unit} className="flex items-center justify-between p-2 bg-gray-100 rounded-xl">
                    <span className="text-lg capitalize font-semibold">{unit}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateUnits(unit, -1)}
                        className="border-gray-300 h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xl font-bold w-10 text-center">{count}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateUnits(unit, 1)}
                        className="border-gray-300 h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold mb-2">ETA (min)</label>
                <Input
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="15"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Assign Incident Commander</label>
                <Select
                  value={incidentCommander}
                  onChange={(e) => setIncidentCommander(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 h-12 text-lg"
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
        <Card className="bg-white border-gray-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 text-2xl">Timeline & Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
              {timeline.map((entry) => (
                <div key={entry.id} className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{entry.event}</div>
                    <div className="text-xs text-gray-900">{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLogEntry}
                onChange={(e) => setNewLogEntry(e.target.value)}
                placeholder="Add new log entry..."
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-12 text-lg"
              />
              <Button onClick={onAddLogEntry} size="lg" className="h-12 text-lg">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <Button
            variant="destructive"
            size="xl"
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700 text-white h-16 px-8 text-xl"
          >
            <PhoneOff className="h-6 w-6 mr-2" />
            End Call
          </Button>
          <Button
            variant="default"
            size="xl"
            onClick={onDispatch}
            className="bg-green-600 hover:bg-green-700 text-white h-16 px-8 text-xl"
          >
            <Phone className="h-6 w-6 mr-2" />
            Dispatch
          </Button>
        </div>
      </div>

      {/* Navigation Button - Back */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="lg"
          onClick={onBackPage}
          className="h-12 text-lg px-6 border-gray-300"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          ← Back to Incident Details
        </Button>
      </div>
    </div>
  );
};

export default Page3QuickActions;
