import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MapPage.css';
import apiService from '../../services/api';
import useGoogleMaps from '../../hooks/useGoogleMaps';
import GoogleMapsErrorBoundary from '../GoogleMapsErrorBoundary';
import '../GoogleMapsErrorBoundary.css';
import io from 'socket.io-client';

// Default location - Fire Service Department Kandy
const KANDY_FIRE_SERVICE = { lat: 7.2905, lng: 80.6337 };
const DEFAULT_ORIGIN_TEXT = "Fire Service Department Kandy, Mosque Road, Bogambara, Bahirawakanda, Kandy, Kandy District, Central Province, 20000, Sri Lanka";

// Known places for guaranteed search results
const KNOWN_PLACES = [
  { name: "Temple of the Sacred Tooth Relic", coordinates: { lat: 7.293627, lng: 80.641350 }, type: "Religious" },
  { name: "Kandy Lake (Kiri Muhuda)", coordinates: { lat: 7.2931, lng: 80.6400 }, type: "Natural" },
  { name: "Wales Park (Royal Palace Park)", coordinates: { lat: 7.2917, lng: 80.6391 }, type: "Park" },
  { name: "Royal Botanical Gardens, Peradeniya", coordinates: { lat: 7.271959, lng: 80.595339 }, type: "Garden" },
  { name: "Ceylon Tea Museum, Hantana", coordinates: { lat: 7.2960, lng: 80.6510 }, type: "Museum" },
  { name: "National Hospital, Kandy", coordinates: { lat: 7.28652, lng: 80.63142 }, type: "Hospital" },
  { name: "Teaching Hospital, Peradeniya", coordinates: { lat: 7.2620, lng: 80.6000 }, type: "Hospital" },
  { name: "University of Peradeniya", coordinates: { lat: 7.2568, lng: 80.5980 }, type: "University" },
  { name: "SLIIT Kandy", coordinates: { lat: 7.2671, lng: 80.5972 }, type: "University" },
  { name: "Open University of Sri Lanka (Kandy Center)", coordinates: { lat: 7.3040, lng: 80.6460 }, type: "University" },
  { name: "St. Anthony's College, Kandy", coordinates: { lat: 7.2920, lng: 80.6425 }, type: "School" },
  { name: "Dharmaraja College, Kandy", coordinates: { lat: 7.2885, lng: 80.6388 }, type: "School" },
  { name: "Kandy City Centre", coordinates: { lat: 7.2955, lng: 80.6357 }, type: "Shopping Center" },
  { name: "Kandy Railway Station", coordinates: { lat: 7.2900, lng: 80.6330 }, type: "Transport" },
  { name: "Kandy Clock Tower", coordinates: { lat: 7.2930, lng: 80.6390 }, type: "Landmark" },
  { name: "Udawatta Kele Sanctuary", coordinates: { lat: 7.2898, lng: 80.6407 }, type: "Nature / Sanctuary" },
  { name: "Gadaladeniya Vihara", coordinates: { lat: 7.2833, lng: 80.6750 }, type: "Religious" },
  { name: "Lankatilaka Vihara", coordinates: { lat: 7.2911, lng: 80.6755 }, type: "Religious" },
  { name: "Sri Maha Bodhi Viharaya (Bahirawakanda Statue)", coordinates: { lat: 7.2935, lng: 80.6340 }, type: "Religious" },
  { name: "Meera Makam Mosque", coordinates: { lat: 7.2932, lng: 80.6378 }, type: "Religious" },
  { name: "Kadugannawa Ambalama", coordinates: { lat: 7.1840, lng: 80.5690 }, type: "Historical" },
  { name: "International Buddhist Museum", coordinates: { lat: 7.2938, lng: 80.6411 }, type: "Museum" },
  { name: "Asgiriya Stadium", coordinates: { lat: 7.2970, lng: 80.6240 }, type: "Sports" },
  { name: "Pallekele International Cricket Stadium", coordinates: { lat: 7.2748, lng: 80.7200 }, type: "Sports" },
  { name: "Ampitiya Temple", coordinates: { lat: 7.2930, lng: 80.6200 }, type: "Religious" },
  { name: "Mahaweli Reach Hotel", coordinates: { lat: 7.2690, lng: 80.6330 }, type: "Hotel / Accommodation" },
  { name: "Kandy Yatch Club", coordinates: { lat: 7.2890, lng: 80.6450 }, type: "Leisure / Club" },
  { name: "Peradeniya Botanical Gardens Entrance", coordinates: { lat: 7.2700, lng: 80.6010 }, type: "Entrance / Landmark" },
  { name: "Kadugannawa Railway Tunnel", coordinates: { lat: 7.2100, lng: 80.5430 }, type: "Transport / Landmark" },
  { name: "Hantana Mountain Viewpoint", coordinates: { lat: 7.3000, lng: 80.6500 }, type: "Viewpoint / Nature" },
  { name: "Mahaweli River Bank (Ampitiya)", coordinates: { lat: 7.2850, lng: 80.6350 }, type: "Natural / River" },
  { name: "Kandy Golf Club", coordinates: { lat: 7.2700, lng: 80.6200 }, type: "Sport / Leisure" },
  { name: "Kandy Municipal Council Office", coordinates: { lat: 7.2930, lng: 80.6390 }, type: "Government" },
  { name: "Post Office Kandy", coordinates: { lat: 7.2950, lng: 80.6360 }, type: "Service" },
  { name: "Kandy Fire Station", coordinates: { lat: 7.2934, lng: 80.6367 }, type: "Emergency" },
  { name: "Kandy Police Headquarters", coordinates: { lat: 7.2925, lng: 80.6355 }, type: "Law Enforcement" },
  { name: "Kandy District Court", coordinates: { lat: 7.2980, lng: 80.6350 }, type: "Government" },
  { name: "Kandy Library", coordinates: { lat: 7.2915, lng: 80.6440 }, type: "Education / Public" },
  { name: "Bahirawakanda Buddha Temple", coordinates: { lat: 7.2900, lng: 80.6350 }, type: "Religious" },
  { name: "Upper Lake Road Viewpoint", coordinates: { lat: 7.3000, lng: 80.6420 }, type: "Viewpoint" },
  { name: "Mahaweli Centre / University Drive", coordinates: { lat: 7.2710, lng: 80.5970 }, type: "University / Research" },
  { name: "Sri Lanka Planetarium (Kandy)", coordinates: { lat: 7.2970, lng: 80.6390 }, type: "Science / Education" },
  { name: "Boralanda Estate", coordinates: { lat: 7.2200, lng: 80.5700 }, type: "Agriculture / Estate" },
  { name: "Katugastota Bridge", coordinates: { lat: 7.3050, lng: 80.6350 }, type: "Transport / Bridge" },
  { name: "Galpotta Junction", coordinates: { lat: 7.3100, lng: 80.6500 }, type: "Junction / Town" },
  { name: "Madawala Wellness Centre", coordinates: { lat: 7.2300, lng: 80.5900 }, type: "Health / Wellness" },
  { name: "Sirimalwatta Public Market", coordinates: { lat: 7.2950, lng: 80.6440 }, type: "Market" },
  { name: "Upper Hantana Viewpoint", coordinates: { lat: 7.3000, lng: 80.6550 }, type: "Viewpoint / Nature" },
  { name: "Fire Brigade Kandy (Suduhumpala West)", coordinates: { lat: 7.28161, lng: 80.62272 }, type: "Emergency" },
  { name: "Fire Service Department Kandy (Bogambara)", coordinates: { lat: 7.29178, lng: 80.63527 }, type: "Emergency" },
  { name: "Kandy War Cemetery", coordinates: { lat: 7.28168, lng: 80.608291 }, type: "Landmark" },
  { name: "Rajawella, Digana", coordinates: { lat: 7.2999385, lng: 80.7358344 }, type: "Township / Suburb" }
];

// Helper to calculate distance in km between two lat/lng points
const calculateDistance = (p1, p2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(p2.lat - p1.lat);
  const dLng = deg2rad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

function MapPage() {
  // State management
  const [socket, setSocket] = useState(null);
  const [originText, setOriginText] = useState("📍 Detecting your location… or click 'My Location'");
  const [origin, setOrigin] = useState(null);
  const [destinationText, setDestinationText] = useState("");
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsAccuracyM, setGpsAccuracyM] = useState(null);

  const [liveTracking, setLiveTracking] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Vehicle tracking states
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTracking, setVehicleTracking] = useState(false);
  const [vehicleUpdateInterval, setVehicleUpdateInterval] = useState(null);

  // Vehicle dropdown states
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  // Fetch available vehicles from database
  const [availableVehicles, setAvailableVehicles] = useState([]);

  // Emergency Mode states
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [confirmedAssignments, setConfirmedAssignments] = useState([]);

  // Google Maps hook
  const {
    map,
    services,
    isLoaded: mapLoaded,
    isLoading: mapLoading,
    error: mapError,
    setMapCenter,
    setMapZoom,
    addMarker,
    updateMarker,
    removeMarker,
    clearMarkers,
    showInfoWindow,
    closeInfoWindow
  } = useGoogleMaps('google-map');

  // Other refs
  const dropdownRef = useRef(null);
  const watchIdRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const lastGoodPosRef = useRef(null); // { lat, lng, accuracy }
  const accuracyCircleRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const [trafficOn, setTrafficOn] = useState(false);

  // Load vehicles from database
  const loadVehicles = useCallback(async () => {
    try {
      const response = await apiService.getVehicleOfficerVehicles();
      console.log('API Response:', response);
      if (response && response.vehicles) {
        console.log('Vehicles from API:', response.vehicles);
        const mappedVehicles = response.vehicles.map(vehicle => {
          console.log('Vehicle data:', vehicle);
          return {
            id: vehicle.vehicleId || vehicle._id,
            name: vehicle.name,
            status: vehicle.status,
            maintenanceStatus: vehicle.maintenanceStatus,
            type: vehicle.Vtype
          };
        });

        // Fetch active maintenance requests and build a set of affected vehicles
        let activeMaintenanceVehicles = new Set();
        try {
          const res = await fetch('http://localhost:5000/api/vehicle-officer/maintenance-requests');
          if (res && res.ok) {
            const data = await res.json();
            const requests = data.maintenanceRequests || [];
            const ACTIVE_STATES = new Set(['pending', 'approved', 'in progress', 'started']);
            for (const req of requests) {
              const status = String(req.status || 'Pending').toLowerCase();
              if (ACTIVE_STATES.has(status)) {
                if (req.vehicleName) activeMaintenanceVehicles.add(String(req.vehicleName));
                if (req.vehicleId) activeMaintenanceVehicles.add(String(req.vehicleId));
              }
            }
          }
        } catch (e) {
          console.warn('Failed to load maintenance requests for filtering:', e);
        }

        // Exclude vehicles under maintenance, critical repairs, or with active maintenance requests
        const filteredVehicles = mappedVehicles.filter(v => {
          const status = String(v.status || '').toLowerCase();
          const maint = String(v.maintenanceStatus || '').toLowerCase();
          const blockedByRequest = activeMaintenanceVehicles.has(String(v.name)) || activeMaintenanceVehicles.has(String(v.id));
          return status !== 'under maintenance' && maint !== 'under repair' && maint !== 'critical' && !blockedByRequest;
        });
        console.log('Filtered vehicles (available for deployment):', filteredVehicles);
        setAvailableVehicles(filteredVehicles);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Refresh vehicles when maintenance state changes elsewhere in the app
  useEffect(() => {
    const handler = () => loadVehicles();
    window.addEventListener('maintenanceChanged', handler);
    return () => window.removeEventListener('maintenanceChanged', handler);
  }, [loadVehicles]);

  // Load assigned vehicles for Emergency Mode (Vehicle Officer's own assignments)
  const loadAssignedVehicles = useCallback(async () => {
    try {
      console.log('🔄 Loading Vehicle Officer assigned vehicles...');
      const response = await fetch('http://localhost:5000/api/vehicle-officer/emergency-vehicle-assignments');
      if (response.ok) {
        const data = await response.json();
        const assignments = data.assignments || [];

        console.log('📋 Raw assignments from API:', assignments);

        // Filter assignments made by this Vehicle Officer
        const myAssignments = assignments.filter(assignment =>
          assignment.assignedBy === 'Vehicle Officer' &&
          assignment.status === 'Assigned'
        );

        console.log('🚒 My assignments:', myAssignments);

        // Convert to vehicle format for display
        const assignedVehicles = myAssignments.map(assignment => ({
          id: assignment._id,
          vehicleId: assignment.vehicleId?._id || assignment.vehicleId,
          name: assignment.vehicleName,
          type: assignment.vehicleType,
          status: assignment.status,
          assignedAt: assignment.assignedAt,
          assignedCrew: assignment.assignedCrew || [],
          emergencyId: assignment.emergencyId
        }));

        // Filter to show only CURRENT emergency assignments (last 5 minutes)
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const currentAssignments = assignedVehicles.filter(vehicle => {
          const assignedTime = new Date(vehicle.assignedAt);
          return assignedTime >= fiveMinutesAgo;
        });

        setAssignedVehicles(currentAssignments);
        console.log('🔄 Vehicle Officer assigned vehicles refreshed:', currentAssignments.length);
        console.log('🚒 Current assigned vehicles:', currentAssignments);
      } else {
        console.error('Failed to load assigned vehicles, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading assigned vehicles:', error);
    }
  }, []);

  // Load confirmed assignments
  const loadConfirmedAssignments = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/confirmed-assignments/map');
      if (response.ok) {
        const data = await response.json();
        const assignments = data.assignments || [];

        console.log('📋 Confirmed assignments loaded:', assignments.length, assignments);
        setConfirmedAssignments(assignments);

        // Don't override assignedVehicles - keep them separate
        // assignedVehicles shows Vehicle Officer's assignments
        // confirmedAssignments shows Station Officer's confirmations
      } else {
        console.warn('Failed to load confirmed assignments:', response.status);
      }
    } catch (error) {
      console.error('Error loading confirmed assignments:', error);
    }
  }, []);


  // Toggle Emergency Mode
  const toggleEmergencyMode = useCallback(() => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);

    if (newMode) {
      // Load assigned vehicles when entering Emergency Mode
      loadAssignedVehicles();
      loadConfirmedAssignments();
    } else {
      // Clear assigned vehicles when exiting Emergency Mode
      setAssignedVehicles([]);
      setConfirmedAssignments([]);
    }
  }, [emergencyMode, loadAssignedVehicles, loadConfirmedAssignments]);

  // Clear all assignments on logout/refresh
  const clearAllAssignments = useCallback(async () => {
    try {
      // Clear emergency vehicle assignments
      await fetch('http://localhost:5000/api/vehicle-officer/emergency-vehicle-assignments/clear-all', {
        method: 'DELETE'
      });

      // Clear confirmed assignments
      await fetch('http://localhost:5000/api/confirmed-assignments/clear-all', {
        method: 'DELETE'
      });

      console.log('All assignments cleared');
    } catch (error) {
      console.error('Error clearing assignments:', error);
    }
  }, []);

  // Initialize Socket.IO connection with error handling and performance optimization
  useEffect(() => {
    let newSocket = null;

    try {
      newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false // Reuse existing connection if available
      });

      setSocket(newSocket);

      // Listen for new confirmed assignments from Station Officer
      newSocket.on('assignmentConfirmed', (data) => {
        console.log('🚨 New assignment confirmed by Station Officer:', data);
        console.log('📋 Assignment data:', data);

        // Reload confirmed assignments to get the latest data
        loadConfirmedAssignments();

        // Also reload assigned vehicles to update the dropdown
        loadAssignedVehicles();

        // Show notification to user
        if (window.confirm) {
          alert(`Assignment confirmed! ${data.selectedVehicles?.length || 0} vehicles with equipment are ready for deployment.`);
        }

        console.log('🔄 Vehicle tracking card will be updated with confirmed vehicles');
      });

      // Handle connection errors
      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, [loadConfirmedAssignments]);
  // Clear assignments on component unmount (logout/refresh)
  useEffect(() => {
    return () => {
      clearAllAssignments();
    };
  }, [clearAllAssignments]);




  // Update origin marker - Optimized for live tracking
  const updateOriginMarker = useCallback(() => {
    if (!map || !window.google || !origin) return;

    // If marker exists, update it instead of recreating
    if (originMarkerRef.current) {
      const newOptions = {
        icon: {
          url: liveTracking
            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        },
        animation: liveTracking ? window.google.maps.Animation.BOUNCE : null,
        title: liveTracking ? 'Live Tracking' : 'Current Location'
      };

      updateMarker(originMarkerRef.current, origin, newOptions);
    } else {
      // Create new marker if it doesn't exist
      originMarkerRef.current = addMarker(origin, {
        title: liveTracking ? 'Live Tracking' : 'Current Location',
        icon: {
          url: liveTracking
            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        },
        animation: liveTracking ? window.google.maps.Animation.BOUNCE : null,
        optimized: false // Disable optimization for better animation
      });
    }

    // Add click listener for info window
    if (originMarkerRef.current) {
      // Remove existing listeners to prevent duplicates
      window.google.maps.event.clearListeners(originMarkerRef.current, 'click');

      originMarkerRef.current.addListener('click', () => {
        const content = `
          <div style="padding: 10px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #dc2626;">
              ${liveTracking ? '🟢 Live Tracking' : '🚒 Current Location'}
            </h3>
            <p style="margin: 0; color: #374151;">${originText}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
              Lat: ${origin.lat.toFixed(6)}, Lng: ${origin.lng.toFixed(6)}
            </p>
            ${liveTracking ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #10b981;">🟢 Live tracking active</p>' : ''}
          </div>
        `;
        showInfoWindow(content, origin);
      });
    }
  }, [map, origin, originText, liveTracking, addMarker, updateMarker, showInfoWindow]);

  // Update destination marker
  const updateDestinationMarker = useCallback(() => {
    if (!map || !window.google || !destination) return;

    // Remove existing destination marker
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }

    // Add new destination marker
    destinationMarkerRef.current = addMarker(destination, {
      title: 'Emergency Location',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Add click listener for info window
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.addListener('click', () => {
        const content = `
          <div style="padding: 10px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1e40af;">🎯 Emergency Location</h3>
            <p style="margin: 0; color: #374151;">${destinationText}</p>
          </div>
        `;
        showInfoWindow(content, destination);
      });
    }
  }, [map, destination, destinationText, addMarker, showInfoWindow]);

  // Reverse geocoding using Google Geocoding API
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      if (services && services.geocoder) {
        return new Promise((resolve, reject) => {
          services.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0].formatted_address);
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
      } else {
        return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.log("Reverse geocoding failed:", error);
      return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, [services]);

  // Enhanced geocoding with Google Places API
  const geocode = useCallback(async (query) => {
    const text = (query ?? '').toString();
    if (!text.trim()) return [];

    const aggregated = [];

    // 1) Local known places (instant, synchronous)
    const qlower = text.toLowerCase();
    for (const kp of KNOWN_PLACES) {
      if (!kp || !kp.name) continue;
      const kpName = kp.name.toLowerCase();
      const queryWords = qlower.split(/\s+/).filter(Boolean);
      const placeWords = kpName.split(/\s+/).filter(Boolean);
      const hasMatch = queryWords.some(qWord => placeWords.some(pWord => pWord.includes(qWord) || qWord.includes(pWord)));
      if (hasMatch) aggregated.push({ coords: kp.coordinates, name: kp.name, type: kp.type });
    }

    // 2) Google Places APIs (async) – wait for both Autocomplete and TextSearch
    if (services && services.placesService && window.google?.maps?.places) {
      try {
        const bounds = new window.google.maps.LatLngBounds(
          { lat: 5.9, lng: 79.7 }, // SW Sri Lanka
          { lat: 9.9, lng: 81.9 }  // NE Sri Lanka
        );

        const autoPromise = new Promise((resolve) => {
          const svc = new window.google.maps.places.AutocompleteService();
          svc.getPlacePredictions(
            {
              input: text,
              bounds,
              componentRestrictions: { country: 'lk' },
              types: ['geocode', 'establishment']
            },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                resolve(
                  predictions.slice(0, 7).map(p => ({
                    coords: null,
                    name: p.description,
                    type: (p.types && p.types[0]) || 'place',
                    placeId: p.place_id
                  }))
                );
              } else {
                resolve([]);
              }
            }
          );
        });

        const textSearchPromise = new Promise((resolve) => {
          services.placesService.textSearch(
            { query: text, bounds },
            (places, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && places) {
                resolve(
                  places.map(place => place.geometry?.location ? ({
                    coords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
                    name: place.formatted_address || place.name,
                    type: (place.types && place.types[0]) || 'place'
                  }) : null).filter(Boolean)
                );
              } else {
                resolve([]);
              }
            }
          );
        });

        const [autoResults, textResults] = await Promise.all([autoPromise, textSearchPromise]);
        aggregated.push(...autoResults, ...textResults);
      } catch (err) {
        console.warn('Places API lookup failed:', err);
      }
    }

    // 3) Dedupe and return top 10
    const seen = new Set();
    const unique = [];
    for (const r of aggregated) {
      const key = r.placeId ? `pid:${r.placeId}` : `ll:${r.coords?.lat?.toFixed(6)},${r.coords?.lng?.toFixed(6)}`;
      if (!seen.has(key)) { seen.add(key); unique.push(r); }
      if (unique.length >= 10) break;
    }
    return unique;
  }, [services]);

  // Update map center when origin changes
  useEffect(() => {
    if (map && origin) {
      setMapCenter(origin);
      updateOriginMarker();
    }
  }, [map, origin, setMapCenter, updateOriginMarker]);

  // On first load, try to get device location. Fallback to fire station if denied/unavailable
  useEffect(() => {
    if (!origin) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setOrigin(p);
            try {
              const addr = await reverseGeocode(p.lat, p.lng);
              setOriginText(`📍 ${addr}`);
            } catch {
              setOriginText(`📍 (${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})`);
            }
          },
          () => {
            setOrigin(KANDY_FIRE_SERVICE);
            setOriginText("📍 Fire Station (default)");
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        setOrigin(KANDY_FIRE_SERVICE);
        setOriginText("📍 Fire Station (default)");
      }
    }
  }, [origin, reverseGeocode]);

  // Update map center when destination changes
  useEffect(() => {
    if (map && destination) {
      updateDestinationMarker();
    }
  }, [map, destination, updateDestinationMarker]);

  // Initialize layer instances lazily when toggled
  useEffect(() => {
    if (!map || !window.google) return;
    const g = window.google.maps;
    if (trafficOn) {
      if (!trafficLayerRef.current) trafficLayerRef.current = new g.TrafficLayer();
      trafficLayerRef.current.setMap(map);
    } else if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }
  }, [map, trafficOn]);

  // Transit and Bicycling toggles removed per request

  // Restore persisted tracking/map state on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vehicleMapState') || '{}');
      if (saved.origin && saved.origin.lat && saved.origin.lng) setOrigin(saved.origin);
      if (typeof saved.originText === 'string') setOriginText(saved.originText);
      if (saved.destination && saved.destination.lat && saved.destination.lng) setDestination(saved.destination);
      if (typeof saved.destinationText === 'string') setDestinationText(saved.destinationText);
      if (saved.route) setRoute(saved.route);
      if (typeof saved.distanceKm === 'number') setDistanceKm(saved.distanceKm);
      if (typeof saved.durationMin === 'number') setDurationMin(saved.durationMin);
      if (Array.isArray(saved.vehicles)) setVehicles(saved.vehicles);
    } catch { }
  }, []);

  // Persist whenever relevant state changes
  useEffect(() => {
    const payload = {
      origin, originText, destination, destinationText, route, distanceKm, durationMin, vehicles
    };
    try { localStorage.setItem('vehicleMapState', JSON.stringify(payload)); } catch { }
  }, [origin, originText, destination, destinationText, route, distanceKm, durationMin, vehicles]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVehicleDropdown(false);
      }
    };

    if (showVehicleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVehicleDropdown]);

  // Live tracking with Google Maps - Enhanced for real-time movement
  useEffect(() => {
    if (liveTracking) {
      if (navigator.geolocation) {
        console.log("Starting live tracking...");

        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const c = pos?.coords || {};
            const accuracy = Number(c.accuracy || 9999);
            const raw = { lat: Number(c.latitude), lng: Number(c.longitude) };
            const clamped = {
              lat: Math.max(-90, Math.min(90, raw.lat)),
              lng: Math.max(-180, Math.min(180, raw.lng))
            };

            // Drop clearly bad fixes
            if (!isFinite(clamped.lat) || !isFinite(clamped.lng)) return;
            if (accuracy > 150) return; // ignore very rough fixes

            // Compare with last good
            const last = lastGoodPosRef.current;
            const toMeters = (km) => Math.round(km * 1000);
            const distFromLast = last ? toMeters(calculateDistance(last, clamped)) : null;

            // Accept if: first fix, or much better accuracy, or real movement
            const accuracyImproved = last ? (last.accuracy - accuracy) >= 15 : true;
            const movedMeaningfully = distFromLast ? distFromLast >= 8 : true; // faster responsiveness
            if (!accuracyImproved && !movedMeaningfully) return;

            // Smooth position (EMA) to reduce jitter, weight by accuracy
            let next = clamped;
            if (last) {
              // Speed up response: increase alpha so we converge faster to new fixes
              const alpha = accuracy <= 25 ? 0.85 : 0.6;
              next = {
                lat: last.lat * (1 - alpha) + clamped.lat * alpha,
                lng: last.lng * (1 - alpha) + clamped.lng * alpha
              };
            }

            lastGoodPosRef.current = { ...next, accuracy };

            // Update origin state
            setOrigin(next);

            // Update origin text (no spam: only when accuracy improves or every ~10s)
            try {
              const address = await reverseGeocode(next.lat, next.lng);
              setOriginText(`📍 Live: ${address}`);
            } catch (error) {
              setOriginText(`📍 Live (${next.lat.toFixed(6)}, ${next.lng.toFixed(6)})`);
            }

            // Update map center smoothly
            if (map) {
              map.panTo(next);
              if (map.getZoom() < 16) map.setZoom(16);
            }

            // Update accuracy circle
            if (window.google && map && isFinite(accuracy)) {
              const g = window.google.maps;
              if (!accuracyCircleRef.current) {
                accuracyCircleRef.current = new g.Circle({
                  strokeColor: '#4285F4',
                  strokeOpacity: 0.6,
                  strokeWeight: 1,
                  fillColor: '#4285F4',
                  fillOpacity: 0.15,
                  map,
                  center: next,
                  radius: Math.max(5, accuracy)
                });
              } else {
                accuracyCircleRef.current.setCenter(next);
                accuracyCircleRef.current.setRadius(Math.max(5, accuracy));
                accuracyCircleRef.current.setMap(map);
              }
            }

            // Force marker update
            setTimeout(() => updateOriginMarker(), 80);
          },
          (error) => {
            console.error("Live tracking error:", error);
            let errorMessage = "Location tracking failed";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied - please enable in browser settings";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location unavailable - check GPS settings";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
            }
            setOriginText(`❌ ${errorMessage}`);
            setLiveTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          }
        );
      } else {
        console.error("Geolocation not supported");
        setOriginText("❌ Geolocation not supported by this browser");
        setLiveTracking(false);
      }
    } else if (watchIdRef.current !== null) {
      console.log("Stopping live tracking...");
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      lastGoodPosRef.current = null;

      // Update marker to show it's no longer live
      setTimeout(() => {
        updateOriginMarker();
      }, 100);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [liveTracking, map, setMapCenter, reverseGeocode, updateOriginMarker]);

  // Enhanced route calculation using Google Directions API
  const fetchRoute = useCallback(async () => {
    if (!origin || !destination || !services || !services.directionsService || !window.google) {
      console.warn('Missing required components for route calculation');
      return;
    }

    setIsLoading(true);
    try {
      const travelMode = (window.google && window.google.maps && window.google.maps.TravelMode && window.google.maps.TravelMode.DRIVING) ? window.google.maps.TravelMode.DRIVING : 'DRIVING';
      const request = {
        origin: origin,
        destination: destination,
        travelMode,
        avoidHighways: false,
        avoidTolls: false,
        provideRouteAlternatives: false,
        optimizeWaypoints: false
      };

      services.directionsService.route(request, (result, status) => {
        try {
          if (status === 'OK' && result && result.routes && result.routes[0]) {
            const route = result.routes[0];
            const leg = route.legs[0];

            setRoute(route);
            setDistanceKm((leg.distance.value / 1000).toFixed(1));
            setDurationMin(Math.round(leg.duration.value / 60));

            // Prefer custom polyline (more reliable rendering in some embedded cases)
            if (routePolylineRef.current) {
              routePolylineRef.current.setMap(null);
              routePolylineRef.current = null;
            }
            const path = [];
            route.overview_path?.forEach(ll => path.push({ lat: ll.lat(), lng: ll.lng() }));
            if (path.length && window.google) {
              routePolylineRef.current = new window.google.maps.Polyline({
                path,
                strokeColor: '#ff3b3b',
                strokeOpacity: 0.95,
                strokeWeight: 6,
                map
              });
              // Fit to bounds
              const bounds = new window.google.maps.LatLngBounds();
              path.forEach(p => bounds.extend(p));
              map.fitBounds(bounds);
            } else if (services.directionsRenderer) {
              services.directionsRenderer.setDirections(result);
            }

            // Add destination marker
            updateDestinationMarker();
          } else {
            console.error('Directions request failed:', status);
            alert('Failed to calculate route. Please try again.');
          }
        } catch (error) {
          console.error('Error processing route result:', error);
          alert('Failed to process route. Please try again.');
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      alert('Failed to calculate route. Please try again.');
      setIsLoading(false);
    }
  }, [origin, destination, services, updateDestinationMarker]);

  // Get current user location (robust, always clears loading, maximizes accuracy)
  const getMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setOriginText("❌ Geolocation not supported by this browser");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setGpsAccuracyM(null);

    let bestCoords = null;
    let hardTimeoutId = null;

    const stop = () => {
      if (watchIdRef.current !== null) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch { }
        watchIdRef.current = null;
      }
      if (hardTimeoutId) {
        clearTimeout(hardTimeoutId);
        hardTimeoutId = null;
      }
    };

    const finalize = async (coords) => {
      stop();
      try {
        const position = { lat: coords.latitude, lng: coords.longitude };
        setGpsAccuracyM(coords.accuracy ? Math.round(coords.accuracy) : null);
        try {
          const address = await reverseGeocode(position.lat, position.lng);
          setOriginText(`📍 ${address}`);
        } catch {
          setOriginText(`📍 My Location (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`);
        }
        setOrigin(position);
        if (map) setMapCenter(position, 16);

        // Draw/update accuracy circle to mirror Google Maps UX
        if (window.google && map && typeof coords.accuracy === 'number') {
          const g = window.google.maps;
          if (!accuracyCircleRef.current) {
            accuracyCircleRef.current = new g.Circle({
              strokeColor: '#4285F4',
              strokeOpacity: 0.6,
              strokeWeight: 1,
              fillColor: '#4285F4',
              fillOpacity: 0.15,
              map,
              center: position,
              radius: Math.max(5, Number(coords.accuracy))
            });
          } else {
            accuracyCircleRef.current.setCenter(position);
            accuracyCircleRef.current.setRadius(Math.max(5, Number(coords.accuracy)));
            accuracyCircleRef.current.setMap(map);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Hard timeout to guarantee we never get stuck in loading
    hardTimeoutId = setTimeout(() => {
      if (bestCoords) {
        finalize(bestCoords);
      } else {
        setIsLoading(false);
        setOriginText('❌ Unable to acquire location in time. Please try again outdoors.');
        stop();
      }
    }, 10000);

    // Start high-accuracy watch and accept the best fix; finish early when very accurate
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const c = pos.coords || {};
          if (!bestCoords || (c.accuracy && bestCoords.accuracy && c.accuracy < bestCoords.accuracy)) {
            bestCoords = c;
          }
          // Finish early if accuracy is excellent (<= 15m)
          if (c.accuracy && c.accuracy <= 15) {
            finalize(c);
          }
        },
        (error) => {
          console.error('Location error:', error);
          if (bestCoords) finalize(bestCoords);
          else {
            setIsLoading(false);
            setOriginText('❌ Location error. Please enable GPS/Location permissions.');
            stop();
          }
        },
        // Faster refresh: allow small cache and reduce timeout
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
      );
    } catch (e) {
      console.error('Failed to start geolocation watch:', e);
      setIsLoading(false);
      setOriginText('❌ Geolocation failed to start.');
      stop();
    }
  }, [map, setMapCenter, reverseGeocode]);

  // Event handlers
  const handleOriginChange = useCallback(async (e) => {
    const value = e.target.value;
    setOriginText(value);
    setShowOriginSuggestions(true);

    if (value.trim()) {
      const suggestions = await geocode(value);
      setOriginSuggestions(suggestions);
    } else {
      setOriginSuggestions([]);
    }
  }, [geocode]);

  const handleDestinationChange = useCallback(async (e) => {
    const value = e.target.value;
    setDestinationText(value);
    setShowDestinationSuggestions(true);

    if (value.trim()) {
      const suggestions = await geocode(value);
      setDestinationSuggestions(suggestions);
    } else {
      setDestinationSuggestions([]);
    }
  }, [geocode]);

  const selectOriginSuggestion = useCallback(async (suggestion) => {
    let coords = suggestion.coords;

    // If coords is null but placeId exists, geocode it
    if (!coords && suggestion.placeId && services && services.geocoder) {
      try {
        const geocodeResult = await new Promise((resolve, reject) => {
          services.geocoder.geocode({ placeId: suggestion.placeId }, (results, status) => {
            if (status === 'OK' && results[0] && results[0].geometry) {
              resolve({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              });
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
        coords = geocodeResult;
      } catch (error) {
        console.log("Geocoding failed for suggestion:", error);
        return;
      }
    }

    if (coords) {
      setOrigin(coords);
      setOriginText(suggestion.name);
      setShowOriginSuggestions(false);
      setOriginSuggestions([]);

      if (map) {
        setMapCenter(coords);
      }
    }
  }, [map, setMapCenter, services]);

  const selectDestinationSuggestion = useCallback(async (suggestion) => {
    let coords = suggestion.coords;

    // If coords is null but placeId exists, geocode it
    if (!coords && suggestion.placeId && services && services.geocoder) {
      try {
        const geocodeResult = await new Promise((resolve, reject) => {
          services.geocoder.geocode({ placeId: suggestion.placeId }, (results, status) => {
            if (status === 'OK' && results[0] && results[0].geometry) {
              resolve({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              });
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
        coords = geocodeResult;
      } catch (error) {
        console.log("Geocoding failed for suggestion:", error);
        return;
      }
    }

    if (coords) {
      setDestination(coords);
      setDestinationText(suggestion.name);
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  }, [services]);

  const handleEmergencyRoute = useCallback(async () => {
    // Ensure we have coordinates for destination – geocode text if needed
    if (!destination && destinationText && services?.geocoder) {
      try {
        const coords = await new Promise((resolve, reject) => {
          services.geocoder.geocode({ address: `${destinationText}, Sri Lanka` }, (res, status) => {
            if (status === 'OK' && res[0]?.geometry?.location) {
              resolve({ lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() });
            } else {
              reject(new Error('Geocode failed'));
            }
          });
        });
        setDestination(coords);
      } catch (e) {
        console.warn('Destination geocode failed:', e);
      }
    }
    fetchRoute();
  }, [fetchRoute, destination, destinationText, services]);

  // Auto-search incident location from confirmed assignments
  const autoSearchIncidentLocation = useCallback(async (assignment) => {
    if (assignment && assignment.location) {
      setDestinationText(assignment.location);

      // Geocode the location and set destination
      if (services?.geocoder) {
        try {
          const coords = await new Promise((resolve, reject) => {
            services.geocoder.geocode({ address: `${assignment.location}, Sri Lanka` }, (res, status) => {
              if (status === 'OK' && res[0]?.geometry?.location) {
                resolve({ lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() });
              } else {
                reject(new Error('Geocoding failed'));
              }
            });
          });
          setDestination(coords);

          // Automatically calculate route after setting destination
          setTimeout(() => {
            handleEmergencyRoute();
          }, 500);
        } catch (error) {
          console.error('Error geocoding incident location:', error);
          // Still try to trigger route calculation
          setTimeout(() => {
            handleEmergencyRoute();
          }, 500);
        }
      }
    }
  }, [services, handleEmergencyRoute]);

  const handleClear = useCallback(() => {
    setDestinationText("");
    setDestination(null);
    setRoute(null);
    setDistanceKm(0);
    setDurationMin(0);
    setShowDestinationSuggestions(false);
    setDestinationSuggestions([]);

    // Reset to default origin
    setOrigin(KANDY_FIRE_SERVICE);
    setOriginText(DEFAULT_ORIGIN_TEXT);

    // Clear persisted state
    try { localStorage.removeItem('vehicleMapState'); } catch { }

    if (map) {
      setMapCenter(KANDY_FIRE_SERVICE, 12);
    }

    // Clear directions
    if (services && services.directionsRenderer) {
      services.directionsRenderer.setDirections({ routes: [] });
    }

    // Remove custom route polyline if present
    if (routePolylineRef.current) {
      try { routePolylineRef.current.setMap(null); } catch { }
      routePolylineRef.current = null;
    }

    // Remove destination marker
    if (destinationMarkerRef.current) {
      try { destinationMarkerRef.current.setMap(null); } catch { }
      destinationMarkerRef.current = null;
    }

    // Remove accuracy circle
    if (accuracyCircleRef.current) {
      try { accuracyCircleRef.current.setMap(null); } catch { }
      accuracyCircleRef.current = null;
    }

    // Clear markers except origin (we will explicitly recreate origin marker next)
    clearMarkers();
    // Reset cached origin marker ref since it was removed by clearMarkers
    originMarkerRef.current = null;

    // Recreate origin marker immediately
    setTimeout(() => {
      updateOriginMarker();
    }, 0);
  }, [map, setMapCenter, services, clearMarkers, updateOriginMarker]);

  const toggleLiveTracking = useCallback(() => {
    setLiveTracking(!liveTracking);
  }, [liveTracking]);

  const toggleTraffic = useCallback(() => setTrafficOn(v => !v), []);
  // Removed transit/bicycling toggles per request

  const resetToDefaultLocation = useCallback(() => {
    setOrigin(KANDY_FIRE_SERVICE);
    setOriginText(DEFAULT_ORIGIN_TEXT);

    if (map) {
      setMapCenter(KANDY_FIRE_SERVICE, 12);
    }
  }, [map, setMapCenter]);

  // Vehicle tracking functions
  const addVehicle = useCallback((vehicleName, initialLocation) => {
    const newVehicle = {
      id: Date.now(),
      name: vehicleName,
      location: initialLocation,
      status: 'Deployed',
      lastUpdate: new Date().toLocaleTimeString()
    };
    setVehicles(prev => [...prev, newVehicle]);
  }, []);

  const startVehicleTracking = useCallback(() => {
    setVehicleTracking(true);
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Deployed') {
          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;
          return {
            ...v,
            location: { lat: v.location.lat + latChange, lng: v.location.lng + lngChange },
            lastUpdate: new Date().toLocaleTimeString()
          };
        }
        return v;
      }));
    }, 5000);
    setVehicleUpdateInterval(interval);
  }, []);

  const stopVehicleTracking = useCallback(() => {
    setVehicleTracking(false);
    if (vehicleUpdateInterval) {
      clearInterval(vehicleUpdateInterval);
      setVehicleUpdateInterval(null);
    }
  }, [vehicleUpdateInterval]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(3));
  }, []);

  const deployVehicle = useCallback(async (vehicleName) => {
    if (origin && destination) {
      try {
        const distance = calculateDistance(origin, destination);

        const vehicle = availableVehicles.find(v => v.name === vehicleName);
        if (!vehicle) {
          console.error('Vehicle not found:', vehicleName);
          return;
        }

        const currentTripData = await apiService.getVehicleTrip(vehicle.id);
        const currentTripA = currentTripData.tripA ?? 0;
        const currentTripB = currentTripData.tripB ?? 200;
        const currentTripC = currentTripData.tripC ?? 1000;

        const newTripA = (parseFloat(currentTripA) + distance).toFixed(3);
        const newTripB = (parseFloat(currentTripB) + distance).toFixed(3);
        const newTripC = (parseFloat(currentTripC) + distance).toFixed(3);

        await apiService.updateVehicleTrip(vehicle.id, {
          tripA: parseFloat(newTripA),
          tripB: parseFloat(newTripB),
          tripC: parseFloat(newTripC),
          distance: distance,
          origin: {
            lat: origin.lat,
            lng: origin.lng,
            address: originText
          },
          destination: {
            lat: destination.lat,
            lng: destination.lng,
            address: destinationText
          }
        });

        addVehicle(vehicleName, origin);

        window.dispatchEvent(new CustomEvent('vehicleDeployed', {
          detail: {
            vehicleId: vehicle.id,
            distance: distance,
            tripA: newTripA,
            tripB: newTripB,
            tripC: newTripC
          }
        }));

        console.log(`Vehicle ${vehicleName} deployed! Distance: ${distance}km`);
      } catch (error) {
        console.error('Error deploying vehicle:', error);
        alert(`Failed to deploy vehicle: ${error.response?.data?.message || error.message}`);
      }
    } else {
      alert('Please set both origin and destination before deploying vehicle.');
    }
  }, [origin, destination, availableVehicles, calculateDistance, originText, destinationText, addVehicle]);

  return (
    <div className="map-page">
      <div className="map-header">
        <div className="header-content">
          <div className="brand-title">
            <span className="flag-badge" role="img" aria-label="Sri Lanka flag" title="Sri Lanka">🇱🇰</span>
            <h1 className="brand-text">Sri Lanka</h1>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`tracking-btn ${liveTracking ? 'active' : ''}`}
            onClick={toggleLiveTracking}
            title="Toggle Live GPS Tracking"
          >
            {liveTracking ? '🛑 Stop Tracking' : '📍 Live Track'}
            {liveTracking && <span className="live-indicator">●</span>}
          </button>

          <button
            onClick={getMyLocation}
            className="control-btn"
            title="Get My Current Location"
            disabled={isLoading}
          >
            📍 My Location
          </button>

          <button
            onClick={resetToDefaultLocation}
            className="control-btn"
            title="Reset to Fire Station"
            style={{ backgroundColor: '#f97316', color: 'white' }}
          >
            🚒 Fire Station
          </button>

          <button
            onClick={() => {
              if (route && route.bounds) {
                map?.fitBounds(route.bounds);
              }
            }}
            className="control-btn"
            title="Focus on Route"
            disabled={!route}
          >
            🎯 Focus Route
          </button>

          <button
            onClick={handleClear}
            className="control-btn"
            title="Clear All"
            style={{ backgroundColor: '#ef4444', color: 'white' }}
          >
            🗑️ Clear
          </button>

          <button
            onClick={toggleTraffic}
            className={`control-btn ${trafficOn ? 'active' : ''}`}
            title="Toggle Traffic Layer"
          >
            🚦 Traffic
          </button>
          {/* Transit and Bicycling buttons removed per request */}
        </div>
      </div>

      <div className="map-content">
        {/* Left Control Panel */}
        <div className="control-panel">
          <div className="panel-section">
            <h3>📍 Current Location</h3>

            <div className="input-with-suggestions">
              <input
                className="modern-input"
                value={originText}
                onChange={handleOriginChange}
                placeholder="Enter current location..."
                onFocus={() => setShowOriginSuggestions(true)}
              />
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {originSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => selectOriginSuggestion(suggestion)}>
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="location-actions">
              <button
                onClick={getMyLocation}
                className="location-action-btn"
                disabled={isLoading}
              >
                {isLoading ? "🔄 Getting Location..." : "📍 My Location"}
              </button>
              {gpsAccuracyM !== null && (
                <div className="accuracy-badge" title="Reported GPS accuracy">
                  ± {gpsAccuracyM} m
                </div>
              )}
            </div>
          </div>

          <div className="panel-section">
            <h3>🎯 Emergency Destination</h3>
            <div className="input-with-suggestions">
              <input
                className="modern-input"
                value={destinationText}
                onChange={handleDestinationChange}
                placeholder="Enter emergency location..."
                onFocus={() => setShowDestinationSuggestions(true)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmergencyRoute()}
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {destinationSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => selectDestinationSuggestion(suggestion)}>
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="primary-btn"
              onClick={handleEmergencyRoute}
              disabled={isLoading || !destinationText.trim()}
            >
              {isLoading ? "🔄 Calculating Route..." : "🚨 Get Emergency Route"}
            </button>
            <button className="secondary-btn" onClick={handleClear}>
              ✖ Clear Route
            </button>
          </div>

          {(distanceKm || durationMin) && (
            <div className="route-stats">
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                  <div className="stat-value">{distanceKm} km</div>
                  <div className="stat-label">Distance</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-value">{durationMin} min</div>
                  <div className="stat-label">Response Time</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚨</div>
                <div className="stat-content">
                  <div className="stat-value">Active</div>
                  <div className="stat-label">Status</div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Management Section */}
          <div className="vehicle-management">
            <div className="vehicle-tracking-header">
              <h3>🚒 Vehicle Tracking</h3>
              <div className="emergency-mode-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={emergencyMode}
                    onChange={toggleEmergencyMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className={`mode-label ${emergencyMode ? 'emergency' : 'default'}`}>
                  {emergencyMode ? '🚨 Emergency Mode' : '📋 Default Mode'}
                </span>
              </div>
            </div>

            {/* Vehicle Selection Dropdown */}
            <div className="vehicle-selection">
              <div className="dropdown-container" ref={dropdownRef}>
                <button
                  className="dropdown-toggle"
                  onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                >
                  <span>{selectedVehicle || 'Select Vehicle'}</span>
                  <span className={`dropdown-arrow ${showVehicleDropdown ? 'open' : ''}`}>▼</span>
                </button>

                {showVehicleDropdown && (
                  <div className="dropdown-menu">
                    {(emergencyMode ? assignedVehicles : availableVehicles).map(vehicle => (
                      <div
                        key={vehicle.id}
                        className={`dropdown-item ${selectedVehicle === vehicle.name ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedVehicle(vehicle.name);
                          setShowVehicleDropdown(false);
                        }}
                      >
                        <div className="vehicle-option">
                          <span className="vehicle-name">{vehicle.name}</span>
                          <span className="vehicle-type">{vehicle.type}</span>
                          <span className={`vehicle-status ${(vehicle.status || '').toLowerCase()}`}>{vehicle.status}</span>
                          {emergencyMode && (
                            <span className="emergency-badge">🚨 ASSIGNED</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {emergencyMode && assignedVehicles.length === 0 && (
                      <div className="dropdown-item no-assignments">
                        <div className="vehicle-option">
                          <span className="no-assignments-text">No vehicles assigned for current emergency</span>
                        </div>
                      </div>
                    )}

                    {/* Display confirmed vehicles from Station Officer */}
                    {emergencyMode && confirmedAssignments.length > 0 && (
                      <div className="dropdown-item confirmed-assignments-section">
                        <div className="vehicle-option">
                          <div className="confirmed-header">
                            <span className="confirmed-title">🚨 Confirmed by Station Officer</span>
                          </div>
                          {confirmedAssignments.map(assignment => {
                            console.log('📋 Rendering assignment:', assignment);
                            return (
                              <div key={assignment._id} className="assignment-group">
                                <div className="assignment-info">
                                  <span className="assignment-location">📍 {assignment.location}</span>
                                  <span className="assignment-time">
                                    {new Date(assignment.confirmedAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="confirmed-vehicles-list">
                                  {assignment.selectedVehicles.map(vehicle => {
                                    console.log('🚒 Rendering vehicle:', vehicle);
                                    return (
                                      <div
                                        key={vehicle.vehicleId}
                                        className="confirmed-vehicle-item clickable"
                                        onClick={() => {
                                          setSelectedVehicle(vehicle.vehicleName);
                                          setShowVehicleDropdown(false);
                                        }}
                                      >
                                        <span className="vehicle-name">🚒 {vehicle.vehicleName}</span>
                                        <span className="vehicle-type">{vehicle.vehicleType}</span>
                                        <span className="confirmed-status">✅ Confirmed</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Debug info */}
                    {emergencyMode && (
                      <div className="dropdown-item debug-info" style={{ fontSize: '10px', color: '#666', padding: '4px' }}>
                        Debug: emergencyMode={emergencyMode ? 'true' : 'false'},
                        confirmedAssignments={confirmedAssignments.length},
                        assignedVehicles={assignedVehicles.length}
                        <br />
                        Last update: {new Date().toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )
                }
              </div>

              <button
                className="deploy-btn"
                onClick={() => {
                  if (selectedVehicle) {
                    deployVehicle(selectedVehicle);
                    setSelectedVehicle('');
                  }
                }}
                disabled={!selectedVehicle}
              >
                🚀 Deploy Vehicle
              </button>
            </div>

            {/* Vehicle List */}
            {
              vehicles.length > 0 && (
                <div className="vehicle-list">
                  <h4>Deployed Vehicles ({vehicles.length})</h4>
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-item">
                      <div className="vehicle-info">
                        <span className="vehicle-name">{vehicle.name}</span>
                        <span className="vehicle-status">{vehicle.status}</span>
                        <span className="vehicle-time">{vehicle.lastUpdate}</span>
                      </div>
                      <button
                        className="track-vehicle-btn"
                        onClick={() => {
                          if (map) {
                            setMapCenter(vehicle.location, 15);
                          }
                        }}
                      >
                        📍 Focus
                      </button>
                    </div>
                  ))}
                </div>
              )
            }

            {/* Tracking Controls */}
            <div className="tracking-controls">
              <button
                className={`tracking-btn ${vehicleTracking ? 'active' : ''}`}
                onClick={vehicleTracking ? stopVehicleTracking : startVehicleTracking}
              >
                {vehicleTracking ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
              </button>
              <button
                className="clear-vehicles-btn"
                onClick={() => setVehicles([])}
              >
                🗑️ Clear
              </button >
            </div>

            {/* Confirmed Assignments Section - Only in Emergency Mode */}
            {
              emergencyMode && confirmedAssignments.length > 0 && (
                <div className="confirmed-assignments-section">
                  <h4>🚨 Confirmed Emergency Assignments</h4>
                  <div className="assignments-list">
                    {confirmedAssignments.map(assignment => (
                      <div key={assignment._id} className="assignment-card">
                        <div className="assignment-header">
                          <span className="emergency-id">Emergency ID: {assignment.emergencyId}</span>
                          <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                            {assignment.status}
                          </span>
                        </div>
                        <div className="assignment-details">
                          <div className="detail-row">
                            <span className="label">Location:</span>
                            <span className="value">{assignment.location}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Priority:</span>
                            <span className="value">{assignment.priority}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Vehicles:</span>
                            <span className="value">{assignment.selectedVehicles.length} assigned</span>
                          </div>
                        </div>
                        <div className="assignment-actions">
                          <button
                            className="view-map-btn"
                            onClick={() => autoSearchIncidentLocation(assignment)}
                          >
                            🗺️ View on Map
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Right Map Panel */}
        < div className="map-panel" >
          <GoogleMapsErrorBoundary>
            {mapLoading && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading Google Maps...</p>
              </div>
            )}
            {mapError && (
              <div className="map-error">
                <div className="error-icon">⚠️</div>
                <h3>Map Loading Error</h3>
                <p>{mapError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="retry-btn"
                >
                  Retry
                </button>
              </div>
            )}
            <div
              id="google-map"
              style={{
                height: "100%",
                width: "100%",
                display: mapLoading || mapError ? 'none' : 'block'
              }}
            ></div>
          </GoogleMapsErrorBoundary>
        </div >

      </div >
    </div >
  );
}

export default MapPage;