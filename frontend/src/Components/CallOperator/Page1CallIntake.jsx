import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Navigation, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import MapComponent from './MapComponent';
import './Page1CallIntake.css';

const Page1CallIntake = ({ 
  callerName, 
  setCallerName, 
  callerPhone, 
  setCallerPhone, 
  callId, 
  liveNotes, 
  setLiveNotes, 
  address, 
  setAddress, 
  coordinates, 
  setCoordinates, 
  fireLocation,
  setFireLocation,
  isMuted, 
  setIsMuted, 
  isOnHold, 
  setIsOnHold, 
  isTransferring, 
  setIsTransferring, 
  onNextPage, 
  addToast,
  onMuteToggle,
  onHoldToggle
}) => {
  // Validation state
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation functions
  const validatePhone = (phone) => {
    // Accept either 0XXXXXXXXX or 94XXXXXXXXX (Sri Lankan numbers)
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^(94|0)?[0-9]{9}$/;
    return phoneRegex.test(digitsOnly);
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

    if (!callerPhone.trim()) {
      newErrors.callerPhone = 'Phone number is required';
    } else if (!validatePhone(callerPhone)) {
      newErrors.callerPhone = 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Please provide a more specific address';
    }

    if (coordinates && !validateCoordinates(coordinates)) {
      newErrors.coordinates = 'Please enter valid coordinates (e.g., 6.9271, 79.8612)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form whenever inputs change, but only show errors for touched fields
  useEffect(() => {
    const newErrors = {};
    
    // Only validate and show errors for fields that have been touched
    if (touched.callerName) {
      if (!callerName.trim()) {
        newErrors.callerName = 'Caller name is required';
      } else if (callerName.trim().length < 2) {
        newErrors.callerName = 'Caller name must be at least 2 characters';
      }
    }

    if (touched.callerPhone) {
      if (!callerPhone.trim()) {
        newErrors.callerPhone = 'Phone number is required';
      } else if (!validatePhone(callerPhone)) {
        newErrors.callerPhone = 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)';
      }
    }

    if (touched.address) {
      if (!address.trim()) {
        newErrors.address = 'Address is required';
      } else if (address.trim().length < 5) {
        newErrors.address = 'Please provide a more specific address';
      }
    }

    if (touched.coordinates && coordinates && !validateCoordinates(coordinates)) {
      newErrors.coordinates = 'Please enter valid coordinates (e.g., 6.9271, 79.8612)';
    }

    setErrors(newErrors);
    
    // Check if form is valid (all required fields filled and no errors)
    const valid = callerName.trim() && callerPhone.trim() && address.trim() && 
                  validatePhone(callerPhone) && address.trim().length >= 5 &&
                  (!coordinates || validateCoordinates(coordinates));
    setIsValid(valid);
  }, [callerName, callerPhone, address, coordinates, touched]);

  const handleNext = () => {
    if (validateForm()) {
      onNextPage();
    } else {
      addToast('Please fix the validation errors before proceeding', 'error');
    }
  };



  const handleMarkFireLocation = () => {
    addToast('Fire location marked on map', 'info');
  };

  const handleNextClick = () => {
    onNextPage();
  };

  return (
    <div className="Page1CallIntake min-h-screen bg-gray-50 p-4" style={{backgroundColor: '#f9fafb'}}>
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Left Column - Caller Panel */}
        <div className="space-y-4">
          <Card className="caller-card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 h-[400px] rounded-xl" style={{backgroundColor: '#ffffff', border: '2px solid #3b82f6'}}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl pb-1 px-4 pt-3">
              <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Caller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2 h-full flex flex-col">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Caller Name *
                </label>
                <Input
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, callerName: true }))}
                  placeholder="Enter caller's full name"
                  style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db'}}
                  data-override-styles="true"
                  className={`h-9 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md ${
                    errors.callerName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.callerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.callerName}</p>
                )}
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Phone *
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={callerPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setCallerPhone(digits);
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, callerPhone: true }))}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                    if (allowedKeys.includes(e.key)) return;
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="07XXXXXXXXX"
                  style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db'}}
                  data-override-styles="true"
                  className={`h-9 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md ${
                    errors.callerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.callerPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.callerPhone}</p>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Live Notes
                </label>
                <Textarea
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  placeholder="Type quick notes while caller speaks..."
                  style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db'}}
                  data-override-styles="true"
                  className="flex-1 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md resize-none"
                  autoComplete="off"
                  spellCheck="true"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Location and Safety Advice */}
        <div className="space-y-4">
          {/* Location Panel */}
          <Card className="location-card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 h-[400px] rounded-xl" style={{backgroundColor: '#ffffff', border: '2px solid #10b981'}}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 rounded-t-xl pb-2 px-4 pt-4">
              <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3 h-full flex flex-col">
              <div className="flex-1 flex flex-col">
                <div className="relative flex-1 w-full rounded border border-gray-300 bg-white overflow-hidden">
                  <MapComponent
                    fireLocation={fireLocation}
                    setFireLocation={setFireLocation}
                    address={address}
                    setAddress={setAddress}
                    coordinates={coordinates}
                    setCoordinates={setCoordinates}
                    onMarkFireLocation={handleMarkFireLocation}
                  />
                </div>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Address / Landmark *
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                  placeholder="House No, Street, Town"
                  style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db'}}
                  data-override-styles="true"
                  className={`h-8 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md ${
                    errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Coordinates
                </label>
                <Input
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, coordinates: true }))}
                  placeholder="Latitude, Longitude"
                  readOnly
                  style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db'}}
                  data-override-styles="true"
                  className={`h-8 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 focus:shadow-md ${
                    errors.coordinates ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.coordinates && (
                  <p className="text-red-500 text-xs mt-1">{errors.coordinates}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
      
      {/* Fixed Bottom Right Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="default"
          size="lg"
          onClick={handleNext}
          disabled={!isValid}
          style={{backgroundColor: isValid ? '#dc2626' : '#9ca3af', color: '#ffffff', border: '3px solid #fbbf24'}}
          className={`next-button px-8 py-4 justify-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-semibold text-lg ${
            isValid 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-400 cursor-not-allowed text-white'
          }`}
        >
          Next → Incident & Dispatch
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
      
    </div>
  );
};

export default Page1CallIntake;
