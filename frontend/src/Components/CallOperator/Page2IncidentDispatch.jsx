import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Ambulance,
  ShieldAlert,
  Power,
  Radio,
  Hospital
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select } from '../ui/select';

const Page2IncidentDispatch = ({
  incidentType,
  setIncidentType,
  hazards,
  setHazards,
  peopleTrapped,
  setPeopleTrapped,
  injured,
  setInjured,
  crowdSize,
  setCrowdSize,
  emergencyScale,
  setEmergencyScale,
  priority,
  setPriority,
  onBackPage,
  onDispatch
}) => {
  // Validation state
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const toggleHazard = (hazard) => {
    setHazards(prev => 
      prev.includes(hazard) 
        ? prev.filter(h => h !== hazard)
        : [...prev, hazard]
    );
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!incidentType) {
      newErrors.incidentType = 'Please select an incident type';
    }

    if (peopleTrapped < 0) {
      newErrors.peopleTrapped = 'Number of people trapped cannot be negative';
    }

    if (injured < 0) {
      newErrors.injured = 'Number of injured cannot be negative';
    }

    if (!crowdSize) {
      newErrors.crowdSize = 'Please select crowd size';
    }

    if (!emergencyScale) {
      newErrors.emergencyScale = 'Please select emergency scale';
    }

    if (!priority) {
      newErrors.priority = 'Please select priority level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form whenever inputs change
  useEffect(() => {
    const valid = validateForm();
    setIsValid(valid);
  }, [incidentType, peopleTrapped, injured, crowdSize, emergencyScale, priority]);

  const handleDispatch = () => {
    if (validateForm()) {
      onDispatch();
    } else {
      alert('Please fix the validation errors before dispatching');
    }
  };

  return (
    <div className="h-full p-1 pb-16">
      <div className="grid grid-cols-1 gap-2 h-full">
        {/* Main Content - Incident Details */}
        <div className="space-y-2 overflow-y-auto">
          {/* Incident Details */}
          <Card className="bg-white border-gray-300 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 text-lg">Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Incident Type *</label>
                <div className="grid grid-cols-4 gap-1">
                  {['Building', 'Vehicle', 'Forest', 'HazMat'].map((type) => (
                    <Button
                      key={type}
                      variant={incidentType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIncidentType(type)}
                      className={`h-8 text-sm ${
                        incidentType === type 
                          ? 'bg-blue-600 text-white' 
                          : errors.incidentType 
                            ? 'border-red-500 text-red-700' 
                            : 'border-gray-300'
                      }`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                {errors.incidentType && (
                  <p className="text-red-500 text-xs mt-1">{errors.incidentType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Possible Hazards</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Gas Cylinders', 'Chemicals', 'Explosives'].map((hazard) => (
                    <Button
                      key={hazard}
                      variant={hazards.includes(hazard) ? "warning" : "outline"}
                      size="sm"
                      onClick={() => toggleHazard(hazard)}
                      className="border-gray-300 h-8 text-sm"
                    >
                      {hazard}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">People Trapped</label>
                  <Input
                    type="number"
                    value={peopleTrapped}
                    onChange={(e) => setPeopleTrapped(parseInt(e.target.value) || 0)}
                    min="0"
                    className={`bg-white text-gray-900 h-8 text-sm ${
                      errors.peopleTrapped ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.peopleTrapped && (
                    <p className="text-red-500 text-xs mt-1">{errors.peopleTrapped}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Injured</label>
                  <Input
                    type="number"
                    value={injured}
                    onChange={(e) => setInjured(parseInt(e.target.value) || 0)}
                    min="0"
                    className={`bg-white text-gray-900 h-8 text-sm ${
                      errors.injured ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.injured && (
                    <p className="text-red-500 text-xs mt-1">{errors.injured}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Crowd Size *</label>
                  <Select
                    value={crowdSize}
                    onChange={(e) => setCrowdSize(e.target.value)}
                    className={`bg-white text-gray-900 h-8 text-sm ${
                      errors.crowdSize ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Very Large">Very Large</option>
                  </Select>
                  {errors.crowdSize && (
                    <p className="text-red-500 text-xs mt-1">{errors.crowdSize}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Emergency Scale *</label>
                  <Select
                    value={emergencyScale}
                    onChange={(e) => setEmergencyScale(e.target.value)}
                    className={`bg-white text-gray-900 h-8 text-sm ${
                      errors.emergencyScale ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - High</option>
                    <option value="4">4 - Critical</option>
                    <option value="5">5 - Emergency</option>
                  </Select>
                  {errors.emergencyScale && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyScale}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Priority *</label>
                <div className="grid grid-cols-4 gap-1">
                  {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                    <Button
                      key={p}
                      variant={priority === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriority(p)}
                      className={`h-8 text-sm ${
                        priority === p 
                          ? 'bg-blue-600 text-white' 
                          : errors.priority 
                            ? 'border-red-500 text-red-700' 
                            : 'border-gray-300'
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                {errors.priority && (
                  <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
                )}
              </div>
            </CardContent>
          </Card>


        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between z-50">
        <Button
          variant="outline"
          size="lg"
          onClick={onBackPage}
          className="h-12 text-lg px-6 border-gray-300"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          ← Back to Call Intake
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={handleDispatch}
          disabled={!isValid}
          className={`h-12 text-lg px-6 ${
            isValid 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Dispatch
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Page2IncidentDispatch;
