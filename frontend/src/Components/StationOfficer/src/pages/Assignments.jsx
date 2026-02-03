// Station Officer Assignments Page
// Updated for integration without React Router

import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '../../../../utils/notifications';
import EmergencyHeader from '../Components/EmergencyHeader.jsx';
import EmergencyBanner from '../Components/EmergencyBanner.jsx';
import VehicleAssignmentSection from '../Components/VehicleAssignmentSection.jsx';
import EquipmentSelectionSection from '../Components/EquipmentSelectionSection.jsx';
import AssignmentSummarySection from '../Components/AssignmentSummarySection.jsx';
import './Assignments.css';
import { AppContext } from '../context/AppContext.jsx';

function Assignments({ isEmergencyMode = true, onEmergencyModeChange, onNavigate }) {
  const navigate = useNavigate();
  const { setEmergencyMode } = useContext(AppContext);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [allSelectedVehicles, setAllSelectedVehicles] = useState(new Set()); // Track all vehicles ever selected
  const [selectedEquipment, setSelectedEquipment] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [dbVehicles, setDbVehicles] = useState([]);
  const [showVehicleAssignment, setShowVehicleAssignment] = useState(false);
  const [confirmedAssignments, setConfirmedAssignments] = useState([]);
  const [isAssignmentConfirmed, setIsAssignmentConfirmed] = useState(false);
  const [receivedConfirmedVehicles, setReceivedConfirmedVehicles] = useState([]);
  const [showReceivedVehiclesModal, setShowReceivedVehiclesModal] = useState(false);
  const socketRef = useRef(null);
  const [incidentData, setIncidentData] = useState(null);
  const [vehicleAssignments, setVehicleAssignments] = useState([]);
  const [assignedVehiclesFromOfficer, setAssignedVehiclesFromOfficer] = useState([]);

  // Vehicle assignment states

  // The app uses an internal navigator; avoid direct router calls here
  const API_BASE_URL = 'http://localhost:5000/api';

  // Clear assignments only when explicitly requested (not on mount/unmount)
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

  // Auto-clear old assignments (older than 1 minute)
  const clearOldAssignments = useCallback(async () => {
    try {
      console.log('🧹 Clearing old assignments (older than 1 minute)...');

      // Clear old emergency vehicle assignments
      const vehicleResponse = await fetch('http://localhost:5000/api/vehicle-officer/emergency-vehicle-assignments/clear-old', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanMinutes: 1 })
      });

      if (vehicleResponse.ok) {
        console.log('✅ Old vehicle assignments cleared');
      }

      // Clear old confirmed assignments
      const confirmedResponse = await fetch('http://localhost:5000/api/confirmed-assignments/clear-old', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanMinutes: 1 })
      });

      if (confirmedResponse.ok) {
        console.log('✅ Old confirmed assignments cleared');
      }

      // Refresh data after clearing
      fetchVehicleAssignments();
    } catch (error) {
      console.error('Error clearing old assignments:', error);
    }
  }, []);

  // Fetch inventory and inspection data on component mount
  useEffect(() => {
    fetchInventoryData();
    fetchDbVehicles();
    loadIncidentData();
    fetchVehicleAssignments();

    // Load assigned vehicle ids from Vehicle Officer confirmation (sessionStorage)
    try {
      const raw = sessionStorage.getItem('assignedVehiclesForIncident');
      if (raw) {
        const parsed = JSON.parse(raw);
        const ids = Array.isArray(parsed?.ids) ? parsed.ids : [];
        if (ids.length > 0) {
          // Auto select all assigned vehicles
          setSelectedVehicles(new Set(ids));
        }
      }
    } catch (_) {
      // ignore storage errors
    }

    // Set up auto-clear every 30 seconds
    const autoClearInterval = setInterval(clearOldAssignments, 30000);

    return () => clearInterval(autoClearInterval);
  }, [clearOldAssignments]);

  // Socket.IO for real-time vehicle assignments
  useEffect(() => {
    // Prevent multiple connections
    if (socketRef.current) {
      console.log('🔌 Socket already exists, skipping...');
      return;
    }

    const initSocket = async () => {
      try {
        const incidentKey = sessionStorage.getItem('activeIncidentKey') || 'latest';
        const resp = await fetch(`${API_BASE_URL.replace('/api', '')}/api/vehicle-officer/emergency-assignments/assigned-vehicle-types/${incidentKey}`);
        if (resp.ok) {
          const json = await resp.json();
          const ids = Array.isArray(json?.data?.vehicleTypeIds) ? json.data.vehicleTypeIds : [];
          if (ids.length > 0) {
            setAssignedVehicleIds(new Set(ids));
            setSelectedVehicles(new Set(ids));
          }
        }
        const io = (await import('socket.io-client')).default;
        const socket = io('http://localhost:5000', {
          forceNew: true,
          autoConnect: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('✅ Connected to emergency assignment socket');
        });

        socket.on('disconnect', () => {
          console.log('❌ Disconnected from emergency assignment socket');
        });

        socket.on('emergencyVehicleAssigned', (data) => {
          console.log('Vehicle assigned to emergency:', data);
          // Update assigned vehicle IDs
          setAssignedVehicleIds(prev => new Set([...prev, data.vehicleType]));

          // Show notification
          setSuccessMessage(`Vehicle ${data.vehicleName} assigned to emergency!`);
          setTimeout(() => setSuccessMessage(''), 5000);

          // Auto-select the assigned vehicle if it's not already selected
          if (selectedVehicle?.id !== data.vehicleType) {
            const vehicle = vehicleTypes.find(v => v.id === data.vehicleType);
            if (vehicle) {
              setSelectedVehicle(vehicle);
            }
          }
        });

        socket.on('vehicleAssignedToEmergency', (data) => {
          console.log('New vehicle assignment from vehicle officer:', data);

          // Show notification
          setSuccessMessage(`Vehicle ${data.vehicleName} assigned by Vehicle Officer!`);
          setTimeout(() => setSuccessMessage(''), 5000);

          // Refresh vehicle assignments
          fetchVehicleAssignments();
        });

        socket.on('incidentVehiclesConfirmed', (data) => {
          console.log('Incident vehicles confirmed by vehicle officer:', data);

          // Show notification
          setSuccessMessage(`${data.totalVehicles} vehicles confirmed by Vehicle Officer!`);
          setTimeout(() => setSuccessMessage(''), 5000);

          // Refresh vehicle assignments
          fetchVehicleAssignments();
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array to prevent reconnections

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showVehicleDropdown && !event.target.closest('.vehicle-dropdown-container')) {
        setShowVehicleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVehicleDropdown]);

  // Keep a set of assigned vehicle ids to filter dropdown
  const [assignedVehicleIds, setAssignedVehicleIds] = useState(new Set());

  // Emergency Vehicle Types with color coding
  const vehicleTypes = [
    { id: 'fire-engine-pumper', name: 'Fire Engine (Pumper/Tender)', category: 'Fire Suppression', color: 'red', icon: '🚒', description: 'Primary firefighting vehicle with water and equipment' },
    { id: 'water-tanker-bowser', name: 'Water Tanker (Water Bowser)', category: 'Water Supply', color: 'blue', icon: '🚛', description: 'Large capacity water carrier for rural operations' },
    { id: 'aerial-ladder-platform', name: 'Aerial Ladder Platform (Turntable Ladder)', category: 'Fire Suppression', color: 'red', icon: '🚒', description: 'Aerial platform with elevated firefighting capabilities' },
    { id: 'rescue-tender', name: 'Rescue Tender (Heavy Rescue Vehicle)', category: 'Technical Rescue', color: 'orange', icon: '🚑', description: 'Specialized rescue and extrication equipment' },
    { id: 'foam-tender', name: 'Foam Tender', category: 'Fire Suppression', color: 'red', icon: '🧯', description: 'Foam systems and concentrate for flammable liquid fires' },
    { id: 'hazmat-unit', name: 'Hazmat Unit', category: 'Hazardous Materials', color: 'yellow', icon: '⚠️', description: 'Hazardous materials response and decontamination' },
    { id: 'ba-support-vehicle', name: 'Breathing Apparatus Support Vehicle (BA Van)', category: 'Respiratory Support', color: 'purple', icon: '🫁', description: 'SCBA support, cylinders, compressors' },
    { id: 'ambulance-emu', name: 'Ambulance (Emergency Medical Unit)', category: 'Medical Response', color: 'green', icon: '🚑', description: 'Emergency medical services and patient transport' },
    { id: 'command-vehicle-icu', name: 'Command Vehicle (Incident Command Unit)', category: 'Command & Control', color: 'purple', icon: '🚙', description: 'Incident command and communications center' },
    { id: 'wildland-brush-truck', name: 'Wildland Fire Engine (Brush Truck)', category: 'Wildland Operations', color: 'orange', icon: '🌲', description: 'Wildland firefighting and rural operations' },
    { id: 'airport-crash-tender-arff', name: 'Airport Crash Tender (ARFF)', category: 'Airport Firefighting', color: 'red', icon: '✈️', description: 'Aircraft rescue and firefighting' },
    { id: 'utility-logistics', name: 'Utility/Logistics Vehicle', category: 'Logistics', color: 'blue', icon: '🚚', description: 'Support, tools, and logistics' },
    { id: 'rescue-boat-trailer', name: 'Rescue Boat (on trailer)', category: 'Water Rescue', color: 'blue', icon: '🚤', description: 'Water rescue operations and equipment' },
    { id: 'firefighting-helicopter', name: 'Firefighting Helicopter (Water Bucket)', category: 'Aerial Firefighting', color: 'yellow', icon: '🚁', description: 'Aerial water delivery operations' },
    { id: 'rescue-ems-helicopter', name: 'Rescue/EMS Helicopter', category: 'Aerial Medical/Rescue', color: 'green', icon: '🚁', description: 'Aerial rescue and medical transport' },
    { id: 'drone-unit', name: 'Drone Unit', category: 'UAS Operations', color: 'navy', icon: '🛸', description: 'Unmanned aerial support and reconnaissance' }
  ];

  // Map database vehicle to assignment vehicle format
  const mapDbVehicleToAssignmentVehicle = (dbVehicle) => {
    console.log('Mapping dbVehicle:', dbVehicle);
    const vtype = (dbVehicle?.Vtype || '').toLowerCase();
    const name = dbVehicle?.name || '';

    console.log('Vehicle type:', vtype, 'Name:', name);

    // Map database Vtype to assignment vehicle IDs
    let assignmentId = null;
    if (vtype === 'fire truck') assignmentId = 'fire-engine-pumper';
    else if (vtype === 'water tanker') assignmentId = 'water-tanker-bowser';
    else if (vtype === 'ladder truck') assignmentId = 'aerial-ladder-platform';
    else if (vtype === 'rescue vehicle') assignmentId = 'rescue-tender';
    else if (vtype === 'hazmat vehicle') assignmentId = 'hazmat-unit';
    else if (vtype === 'ambulance') assignmentId = 'ambulance-emu';
    else if (vtype === 'command vehicle') assignmentId = 'command-vehicle-icu';
    else if (vtype === 'medical response unit') assignmentId = 'ambulance-emu';
    else if (vtype === 'search & rescue vehicle') assignmentId = 'rescue-tender';
    else if (vtype === 'police car') assignmentId = 'command-vehicle-icu';

    console.log('Mapped to assignmentId:', assignmentId);

    if (!assignmentId) {
      console.log('No assignmentId found for vehicle type:', vtype);
      return null;
    }

    // Find the corresponding vehicle type from the hardcoded list
    const vehicleType = vehicleTypes.find(vt => vt.id === assignmentId);
    if (!vehicleType) {
      console.log('No vehicleType found for assignmentId:', assignmentId);
      return null;
    }

    const result = {
      ...vehicleType,
      dbVehicle: dbVehicle,
      dbId: dbVehicle._id,
      dbVehicleId: dbVehicle.vehicleId,
      dbName: name,
      dbVtype: dbVehicle.Vtype,
      dbStatus: dbVehicle.status
    };

    console.log('Final mapped vehicle:', result);
    return result;
  };

  // Create available vehicles list from database vehicles
  const availableVehicles = useMemo(() => {
    console.log('Processing dbVehicles:', dbVehicles);
    const mappedVehicles = dbVehicles
      .map(mapDbVehicleToAssignmentVehicle)
      .filter(Boolean);

    console.log('Mapped vehicles:', mappedVehicles);

    // Group by assignment ID to avoid duplicates
    const vehicleMap = new Map();
    mappedVehicles.forEach(vehicle => {
      if (!vehicleMap.has(vehicle.id)) {
        vehicleMap.set(vehicle.id, vehicle);
      }
    });

    const result = Array.from(vehicleMap.values());
    console.log('Final available vehicles:', result);

    // If no database vehicles are available, fallback to hardcoded vehicle types
    if (result.length === 0) {
      console.log('No database vehicles found, using fallback vehicle types');
      return vehicleTypes;
    }

    return result;
  }, [dbVehicles]);

  const fetchInventoryData = async () => {
    try {
      setDataLoading(true);
      setError(null);

      // Fetch inventory items and confirmed readiness inspections in parallel
      const [inventoryResponse, inspectionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/items`),
        fetch(`${API_BASE_URL}/inspections/confirmed-readiness`)
      ]);

      if (!inventoryResponse.ok || !inspectionsResponse.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const inventoryData = await inventoryResponse.json();
      const inspectionsData = await inspectionsResponse.json();

      setInventoryItems(inventoryData.data || []);
      setInspections(inspectionsData.data || []); // already latest Good/Fair with category
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Equipment availability may not be accurate.');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchDbVehicles = async () => {
    try {
      console.log('Fetching vehicles from:', `${API_BASE_URL.replace('/api', '')}/api/vehicle-officer/vehicles`);
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/vehicle-officer/vehicles`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched vehicles data:', data);
        setDbVehicles(data.vehicles || []);
      } else {
        console.error('Failed to fetch vehicles, status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const loadIncidentData = async () => {
    try {
      // First, try to get data from sessionStorage (from Staff Manager confirmation)
      const storedData = sessionStorage.getItem('emergencyIncidentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('📋 Loaded incident data from sessionStorage:', parsedData);
        console.log('👥 Staff assignments found:', parsedData.assignedStaff?.length || 0);
        setIncidentData(parsedData);
        return;
      }

      // Also check localStorage for recent staff assignments
      const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith('emergencyIncidentData_'));
      if (localStorageKeys.length > 0) {
        // Get the most recent one
        const latestKey = localStorageKeys.sort().pop();
        const latestData = JSON.parse(localStorage.getItem(latestKey));
        console.log('📋 Loaded incident data from localStorage:', latestData);
        console.log('👥 Staff assignments found:', latestData.assignedStaff?.length || 0);
        setIncidentData(latestData);
        return;
      }

      // Fallback: Fetch the most recent incident from API
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/incidents?page=1&limit=1`, {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        const incidents = data.incidents || [];

        if (incidents.length > 0) {
          setIncidentData(incidents[0]);
        }
      }
    } catch (err) {
      console.error('Error loading incident data:', err);
    }
  };

  const fetchVehicleAssignments = async () => {
    try {
      const url = `http://localhost:5000/api/vehicle-officer/emergency-vehicle-assignments/station-officer`;
      console.log('Fetching vehicle assignments from vehicle officers...');
      console.log('API URL:', url);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehicle assignments data received:', data);
        console.log('Assignments count:', data.assignments ? Object.keys(data.assignments).length : 0);

        // Process assignments to extract vehicles assigned by vehicle officers
        const assignments = data.assignments || {};
        const allAssignedVehicles = [];

        // Handle both object and array formats
        const assignmentList = Array.isArray(assignments) ? assignments : Object.values(assignments).flat();

        assignmentList.forEach(assignment => {
          if (assignment.assignedBy === 'Vehicle Officer' && assignment.status === 'Assigned') {
            const vehicleId = assignment.vehicleId?._id || assignment.vehicleId;

            allAssignedVehicles.push({
              id: assignment._id,
              vehicleId: vehicleId,
              name: assignment.vehicleName,
              type: assignment.vehicleType,
              category: assignment.vehicleType,
              status: assignment.status,
              assignedAt: assignment.assignedAt,
              assignedCrew: assignment.assignedCrew || [],
              emergencyId: assignment.emergencyId
            });
          }
        });


        // Filter to show only CURRENT emergency assignments (last 5 minutes)
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const currentAssignments = allAssignedVehicles.filter(vehicle => {
          const assignedTime = new Date(vehicle.assignedAt);
          return assignedTime >= fiveMinutesAgo;
        });

        // Remove duplicates based on vehicleId and name
        const uniqueAssignments = [];
        const seenVehicles = new Set();

        currentAssignments.forEach(vehicle => {
          const key = `${vehicle.vehicleId}-${vehicle.name}`;
          if (!seenVehicles.has(key)) {
            seenVehicles.add(key);
            uniqueAssignments.push(vehicle);
          }
        });

        setAssignedVehiclesFromOfficer(uniqueAssignments);
        console.log('🚒 Current vehicle assignments from Vehicle Officer:', uniqueAssignments.length);
        console.log('🚒 Unique vehicles:', uniqueAssignments.map(v => `${v.name} (${v.vehicleId})`));
        setVehicleAssignments(assignments);

        // Auto-select vehicles assigned by vehicle officers (only current emergency)
        if (uniqueAssignments.length > 0) {
          const vehicleIds = uniqueAssignments.map(v => v.vehicleId).filter(Boolean);

          if (vehicleIds.length > 0) {
            setSelectedVehicles(new Set(vehicleIds));
            setAllSelectedVehicles(new Set(vehicleIds));
          }
        } else {
          setSelectedVehicles(new Set());
          setAllSelectedVehicles(new Set());
        }
      } else {
        console.error('Failed to fetch vehicle assignments, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (err) {
      console.error('Error fetching vehicle assignments:', err);
    }
  };

  // Make fetchVehicleAssignments available globally for refresh button and set up periodic refresh
  useEffect(() => {
    window.fetchVehicleAssignments = fetchVehicleAssignments;

    // Set up periodic refresh every 30 seconds to ensure real-time updates
    const intervalId = setInterval(() => {
      fetchVehicleAssignments();
    }, 30000);

    return () => {
      delete window.fetchVehicleAssignments;
      clearInterval(intervalId);
    };
  }, []);

  // Sync selected vehicles when assignedVehiclesFromOfficer changes
  useEffect(() => {
    if (assignedVehiclesFromOfficer && assignedVehiclesFromOfficer.length > 0) {
      const vehicleIds = assignedVehiclesFromOfficer.map(v => v.vehicleId).filter(Boolean);

      if (vehicleIds.length > 0) {
        setSelectedVehicles(new Set(vehicleIds));
        setAllSelectedVehicles(new Set(vehicleIds));
      }
    }
  }, [assignedVehiclesFromOfficer]);

  // Handle confirming incident assignment
  const handleConfirmAssignment = async () => {
    if (selectedVehicles.size === 0) {
      alert('Please select at least one vehicle before confirming the incident.');
      return;
    }

    setLoading(true);
    try {
      // Prepare assignment data
      const assignmentData = {
        emergencyId: incidentData?.callId || incidentData?._id || 'emergency-' + Date.now(),
        incidentId: incidentData?._id,
        selectedVehicles: Array.from(selectedVehicles).map(vehicleId => {
          const vehicle = [...availableVehicles, ...assignedVehiclesFromOfficer].find(v =>
            v._id === vehicleId || v.vehicleId === vehicleId || v.id === vehicleId
          );
          return {
            vehicleId: vehicleId,
            vehicleName: vehicle?.name || vehicle?.Vtype || 'Unknown Vehicle',
            vehicleType: vehicle?.Vtype || vehicle?.type || 'Emergency Vehicle',
            assignedCrew: vehicle?.assignedCrew || []
          };
        }),
        selectedEquipment: Array.from(selectedEquipment).map(equipment => ({
          equipmentName: equipment,
          equipmentCategory: 'Emergency Equipment',
          quantity: 1
        })),
        location: incidentData?.location || 'Emergency Location',
        priority: incidentData?.priority || 'Medium',
        deploymentNotes: `Assignment confirmed by Station Officer for ${incidentData?.type || 'Emergency'} incident`
      };

      console.log('Confirming assignment:', assignmentData);

      const response = await fetch('http://localhost:5000/api/confirmed-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Assignment confirmed successfully:', result);

        // Emit Socket.IO event to notify Vehicle Officers about confirmed assignment
        try {
          const io = (await import('socket.io-client')).default;
          const socket = io('http://localhost:5000');

          const confirmedVehicles = Array.from(selectedVehicles).map(vehicleId => {
            const vehicle = [...availableVehicles, ...assignedVehiclesFromOfficer].find(v =>
              v._id === vehicleId || v.vehicleId === vehicleId || v.id === vehicleId
            );
            return vehicle ? {
              vehicleId: vehicleId,
              vehicleName: vehicle.name || vehicle.Vtype || 'Unknown Vehicle',
              vehicleType: vehicle.Vtype || vehicle.type || 'Emergency Vehicle',
              assignedCrew: vehicle.assignedCrew || []
            } : null;
          }).filter(Boolean);

          const confirmedEquipment = Array.from(selectedEquipment).map(equipment => ({
            equipmentName: equipment,
            equipmentCategory: 'Emergency Equipment',
            quantity: 1
          }));

          const eventData = {
            assignmentId: result.assignment._id,
            emergencyId: assignmentData.emergencyId,
            incidentId: assignmentData.incidentId,
            selectedVehicles: confirmedVehicles,
            selectedEquipment: confirmedEquipment,
            location: assignmentData.location,
            priority: assignmentData.priority,
            confirmedAt: new Date().toISOString(),
            confirmedBy: 'Station Officer'
          };

          socket.emit('assignmentConfirmed', eventData);
          console.log('✅ Assignment confirmation event emitted to Vehicle Officers');

          socket.disconnect();
        } catch (socketError) {
          console.error('❌ Failed to emit assignment confirmation event:', socketError);
        }

        setSuccessMessage('Incident confirmed! Vehicle Officer has been notified.');
        setTimeout(() => setSuccessMessage(''), 5000);

        // Clear selections after confirmation
        setSelectedVehicles(new Set());
        setSelectedEquipment(new Set());
        setAllSelectedVehicles(new Set());
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm assignment');
      }
    } catch (error) {
      console.error('Error confirming assignment:', error);
      setError('Failed to confirm assignment: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle ending emergency mode and navigating to home
  const handleEndEmergency = () => {
    setEmergencyMode(false);
    if (onEmergencyModeChange) onEmergencyModeChange(false);
    if (onNavigate) onNavigate('home');
    navigate('/station-officer');
  };

  // Map vehicle types to allowed inventory categories (for filtering Confirmed Readiness)
  const vehicleCategoryMap = {
    'fire-engine-pumper': [
      'Personal Protective Equipment (PPE)',
      'Respiratory Protection',
      'Hose & Water Delivery',
      'Ground Ladders',
      'Forcible Entry & Hand Tools',
      'Power Tools & Ventilation',
      'Apparatus Loadouts'
    ],
    'water-tanker-bowser': [
      'Water Supply & Rural Ops',
      'Hose & Water Delivery'
    ],
    'aerial-ladder-platform': [
      'Ground Ladders',
      'Power Tools & Ventilation',
      'Forcible Entry & Hand Tools',
      'Personal Protective Equipment (PPE)'
    ],
    'rescue-tender': [
      'Vehicle Extrication & Stabilization',
      'Rope & Technical Rescue',
      'Forcible Entry & Hand Tools',
      'Power Tools & Ventilation'
    ],
    'foam-tender': [
      'Hose & Water Delivery',
      'Apparatus Loadouts'
    ],
    'hazmat-unit': [
      'HazMat & Decontamination',
      'Communications',
      'Station & Facilities'
    ],
    'ba-support-vehicle': [
      'Respiratory Protection',
      'Personal Protective Equipment (PPE)'
    ],
    'ambulance-emu': [
      'EMS / Medical',
      'Communications'
    ],
    'command-vehicle-icu': [
      'Communications',
      'Station & Facilities'
    ],
    'wildland-brush-truck': [
      'Personal Protective Equipment (PPE)',
      'Hose & Water Delivery',
      'Water Supply & Rural Ops'
    ],
    'airport-crash-tender-arff': [
      'Hose & Water Delivery',
      'Personal Protective Equipment (PPE)',
      'Respiratory Protection'
    ],
    'utility-logistics': [
      'Station & Facilities',
      'Training & Consumables',
      'Communications'
    ],
    'logistics-support-vehicle': [
      'Station & Facilities',
      'Communications',
      'Apparatus Loadouts'
    ],
    'rescue-boat-trailer': [
      'Rope & Technical Rescue',
      'Water Supply & Rural Ops',
      'Personal Protective Equipment (PPE)'
    ],
    'firefighting-helicopter': [
      'Hose & Water Delivery',
      'Apparatus Loadouts'
    ],
    'rescue-ems-helicopter': [
      'EMS / Medical',
      'Communications'
    ],
    'drone-unit': [
      'Communications',
      'Training & Consumables'
    ]
  };

  // Equipment categories and items for each vehicle type (fallback list)
  const vehicleEquipment = {
    'fire-engine-pumper': {
      'Personal Protective Equipment (PPE)': ['Turnout Coat', 'Turnout Pants', 'Fire Helmet', 'Fire Boots', 'Fire Gloves', 'Nomex Hood'],
      'Respiratory Protection': ['SCBA Pack', 'SCBA Facepiece', 'Cylinder'],
      'Hose & Water Delivery': ['Attack Hose (by diameter/length)', 'Supply / LDH', 'Nozzles (smooth-bore, fog, CAFS)', 'Foam Eductors', 'Foam Concentrate (type/percent)', 'Hydrant Tools'],
      'Ground Ladders': ['Extension Ladder', 'Roof Ladder', 'A-Frame Ladder', 'Straight Ladder'],
      'Forcible Entry & Hand Tools': ['Halligan Tool', 'Axe', 'Sledgehammer', 'Crowbar', 'Bolt Cutters', 'Pry Bar', 'Chisel', 'Saw'],
      'Power Tools & Ventilation': ['Circular Saw', 'Reciprocating Saw', 'Drill', 'Ventilation Fan', 'Generator']
    },
    'water-tanker-bowser': {
      'Water Supply & Rural Ops': ['Portable Tanks', 'Rural Hydrant', 'Drafting Site', 'Water Shuttle'],
      'Hose & Water Delivery': ['Supply / LDH', 'Hard Suction', 'Strainers'],
      'Pump Equipment': ['Pump Equipment']
    },
    'aerial-ladder-platform': {
      'Ground Ladders': ['Extension Ladder', 'Roof Ladder', 'A-Frame Ladder', 'Straight Ladder'],
      'Forcible Entry & Hand Tools': ['Halligan Tool', 'Axe', 'Sledgehammer', 'Pry Bar'],
      'Power Tools & Ventilation': ['Circular Saw', 'Reciprocating Saw', 'Drill'],
      'Personal Protective Equipment (PPE)': ['Turnout Coat', 'Turnout Pants', 'Fire Helmet', 'Fire Boots']
    },
    'rescue-tender': {
      'Vehicle Extrication & Stabilization': ['Hydraulic Cutter', 'Hydraulic Spreader', 'Hydraulic Ram', 'Stabilization Jack', 'Cribbing', 'Winch', 'Chain'],
      'Rope & Technical Rescue': ['Static Rope', 'Dynamic Rope', 'Harness', 'Carabiner', 'Pulley', 'Descender', 'Ascender'],
      'Forcible Entry & Hand Tools': ['Halligan Tool', 'Axe', 'Sledgehammer', 'Bolt Cutters', 'Pry Bar', 'Chisel'],
      'Power Tools & Ventilation': ['Circular Saw', 'Reciprocating Saw', 'Drill']
    },
    'foam-tender': {
      'Hose & Water Delivery': ['Nozzles (smooth-bore, fog, CAFS)', 'Foam Eductors', 'Foam Concentrate (type/percent)'],
      'Apparatus Loadouts': ['Hose Load']
    },
    'hazmat-unit': {
      'HazMat & Decontamination': ['Level A Suit', 'Level B Suit', 'Level C Suit', 'Respirator', 'Decon Shower', 'Containment Boom', 'Absorbent Material'],
      'Communications': ['Mobile Radio', 'Base Station', 'Antenna', 'Battery', 'Charger', 'Headset'],
      'Station & Facilities': ['Containment Boom', 'Decon Shower']
    },
    'ba-support-vehicle': {
      'Respiratory Protection': ['SCBA Pack', 'SCBA Facepiece', 'Cylinder', 'Cascade/Compressor', 'Fill Station'],
      'Personal Protective Equipment (PPE)': ['Nomex Hood', 'Fire Gloves']
    },
    'ambulance-emu': {
      'EMS / Medical': ['Stretcher', 'Backboard', 'Cervical Collar', 'Oxygen Tank', 'Defibrillator', 'Medical Kit', 'Splint'],
      'Communications': ['Mobile Radio', 'Base Station', 'Antenna']
    },
    'command-vehicle-icu': {
      'Communications': ['Mobile Radio', 'Base Station', 'Antenna', 'Battery', 'Charger', 'Headset'],
      'Station & Facilities': ['Security System', 'HVAC System']
    },
    'wildland-brush-truck': {
      'Personal Protective Equipment (PPE)': ['Wildland Jacket', 'Wildland Pants'],
      'Hose & Water Delivery': ['Forestry Hose', 'Nozzles (smooth-bore, fog, CAFS)'],
      'Water Supply & Rural Ops': ['Portable Tanks', 'Water Source']
    },
    'airport-crash-tender-arff': {
      'Hose & Water Delivery': ['Nozzles (smooth-bore, fog, CAFS)', 'Foam Eductors', 'Foam Concentrate (type/percent)'],
      'Personal Protective Equipment (PPE)': ['Turnout Coat', 'Turnout Pants'],
      'Respiratory Protection': ['SCBA Pack', 'SCBA Facepiece']
    },
    'utility-logistics': {
      'Station & Facilities': ['Storage Compartment', 'Equipment Rack', 'Tool Mount', 'Laundry Equipment', 'Kitchen Equipment'],
      'Training & Consumables': ['Training Mannequin', 'Training Prop', 'Training Manual', 'Consumable Supplies'],
      'Communications': ['Radio', 'Video Equipment']
    },
    'rescue-boat-trailer': {
      'Rope & Technical Rescue': ['Static Rope', 'Harness', 'Carabiner', 'Pulley'],
      'Water Supply & Rural Ops': ['Water Rescue Suit'],
      'Personal Protective Equipment (PPE)': ['Life Jacket']
    },
    'firefighting-helicopter': {
      'Hose & Water Delivery': ['Nozzles (smooth-bore, fog, CAFS)'],
      'Apparatus Loadouts': ['Hose Load']
    },
    'rescue-ems-helicopter': {
      'EMS / Medical': ['Stretcher', 'Defibrillator', 'Medical Kit'],
      'Communications': ['Mobile Radio', 'Base Station']
    },
    'drone-unit': {
      'Communications': ['Radio'],
      'Training & Consumables': ['Simulation Device']
    }
  };

  // Build a map of the latest inspection per item
  const latestInspectionByItem = useMemo(() => {
    const map = new Map();
    inspections.forEach((ins) => {
      const name = (ins.itemName || '').trim();
      const prev = map.get(name);
      if (!prev || new Date(ins.date) > new Date(prev.date)) {
        map.set(name, ins);
      }
    });
    return map;
  }, [inspections]);

  const normalizeCategoryName = (name) => {
    if (!name) return name;
    const trimmed = name.trim();
    if (trimmed === 'PPE' || trimmed === 'Personal Protective Equipment') {
      return 'Personal Protective Equipment (PPE)';
    }
    return trimmed;
  };

  // Get items grouped by inventory category for the selected vehicles, using Confirmed Readiness as the master list
  const getVehicleItemsFromConfirmed = () => {
    if (selectedVehicles.size === 0) return {};

    // Combine allowed categories from all selected vehicles
    const allowedCategories = new Set();
    selectedVehicles.forEach(vehicleId => {
      (vehicleCategoryMap[vehicleId] || []).forEach(cat => allowedCategories.add(normalizeCategoryName(cat)));
    });

    // Map inventory itemName -> category for quick lookup
    const nameToCategory = new Map();
    inventoryItems.forEach((it) => {
      if (it && it.itemName) nameToCategory.set((it.itemName || '').trim(), normalizeCategoryName(it.category));
    });

    // Group confirmed readiness items (Good/Fair) by their inventory category
    const grouped = {};
    latestInspectionByItem.forEach((ins, name) => {
      if (!(ins.condition === 'Good' || ins.condition === 'Fair')) return; // only confirmed
      let cat = nameToCategory.get(name);
      if (!cat || !allowedCategories.has(cat)) return; // must belong to this vehicle's categories
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(name);
    });
    return grouped;
  };

  // Check if an item is available and ready
  const isItemAvailable = (rawName) => {
    const itemName = (rawName || '').trim();

    // Prefer latest inspection result if available
    const relevantInspections = inspections
      .filter((inspection) => (inspection.itemName || '').trim() === itemName)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (relevantInspections.length > 0) {
      const latest = relevantInspections[0];
      if (latest && (latest.condition === 'Good' || latest.condition === 'Fair')) {
        return true;
      }
    }

    // Fallback to inventory condition if inspections are empty or not Good/Fair
    const inventoryItem = inventoryItems.find((it) => (it.itemName || '').trim() === itemName);
    if (!inventoryItem) return false;

    return inventoryItem.condition === 'Good' || inventoryItem.condition === 'Fair';
  };

  // Get item display name with availability status
  const getItemDisplayName = (itemName) => {
    const available = isItemAvailable(itemName);
    return available ? itemName : `${itemName} (Not Available)`;
  };

  // Get vehicle type from vehicle ID
  const getVehicleTypeFromId = (vehicleId) => {
    // First check if it's already a vehicle type string
    if (vehicleCategoryMap[vehicleId]) {
      return vehicleId;
    }

    // Find vehicle in availableVehicles or assignedVehiclesFromOfficer
    const vehicle = [...availableVehicles, ...assignedVehiclesFromOfficer].find(v =>
      v._id === vehicleId || v.vehicleId === vehicleId || v.id === vehicleId
    );

    if (vehicle) {
      // Map vehicle names/types to category map keys
      const vehicleName = vehicle.name || vehicle.Vtype || vehicle.type || '';
      const normalizedName = vehicleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Try to find matching category
      for (const [key, categories] of Object.entries(vehicleCategoryMap)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          return key;
        }
      }

      // Fallback mappings for common vehicle types
      if (vehicleName.toLowerCase().includes('fire engine') || vehicleName.toLowerCase().includes('pumper')) {
        return 'fire-engine-pumper';
      } else if (vehicleName.toLowerCase().includes('water') || vehicleName.toLowerCase().includes('bowser')) {
        return 'water-tanker-bowser';
      } else if (vehicleName.toLowerCase().includes('aerial') || vehicleName.toLowerCase().includes('ladder')) {
        return 'aerial-ladder-platform';
      } else if (vehicleName.toLowerCase().includes('rescue')) {
        return 'rescue-tender';
      } else if (vehicleName.toLowerCase().includes('foam')) {
        return 'foam-tender';
      } else if (vehicleName.toLowerCase().includes('hazmat')) {
        return 'hazmat-unit';
      } else if (vehicleName.toLowerCase().includes('ambulance')) {
        return 'ambulance-emu';
      } else if (vehicleName.toLowerCase().includes('command')) {
        return 'command-vehicle-icu';
      } else if (vehicleName.toLowerCase().includes('wildland') || vehicleName.toLowerCase().includes('wild land')) {
        return 'wildland-brush-truck';
      } else if (vehicleName.toLowerCase().includes('logistics')) {
        return 'logistics-support-vehicle';
      }
    }

    return null;
  };

  // Compute render data driven by Confirmed Readiness and vehicle mapping
  const computedVehicleChecklist = useMemo(() => {
    if (selectedVehicles.size === 0) return {};
    const grouped = getVehicleItemsFromConfirmed();

    // Combine all allowed categories from currently selected vehicles
    const allCats = new Set();
    selectedVehicles.forEach(vehicleId => {
      const vehicleType = getVehicleTypeFromId(vehicleId);
      if (vehicleType && vehicleCategoryMap[vehicleType]) {
        vehicleCategoryMap[vehicleType].forEach(cat => allCats.add(normalizeCategoryName(cat)));
      }
    });

    // Build a quick reverse map from the fallback vehicleEquipment (category -> [names])
    const fallbackMap = {};
    selectedVehicles.forEach(vehicleId => {
      const vehicleType = getVehicleTypeFromId(vehicleId);
      const vehicleEquip = vehicleEquipment[vehicleId] || vehicleEquipment[vehicleType] || {};
      Object.entries(vehicleEquip).forEach(([cat, items]) => {
        if (!fallbackMap[cat]) fallbackMap[cat] = [];
        fallbackMap[cat].push(...items);
      });
    });

    const result = {};
    allCats.forEach((c) => {
      result[c] = grouped[c] || [];
    });

    // Fallback enrichment: if a category is empty, try adding any fallback items for currently selected vehicles
    for (const cat of allCats) {
      const fallbackItems = fallbackMap[cat] || [];
      const enriched = new Set(result[cat] || []);
      fallbackItems.forEach((name) => {
        if (!enriched.has(name) && isItemAvailable(name)) {
          enriched.add(name);
        }
      });
      result[cat] = Array.from(enriched);
    }
    return result;
  }, [selectedVehicles, inspections, inventoryItems]);

  // Handle vehicle selection (multiple choice)
  const handleVehicleToggle = (vehicleId) => {
    const newSelection = new Set(selectedVehicles);
    if (newSelection.has(vehicleId)) {
      newSelection.delete(vehicleId);
    } else {
      newSelection.add(vehicleId);
      // Add to all selected vehicles when selecting
      setAllSelectedVehicles(prev => new Set([...prev, vehicleId]));
    }
    setSelectedVehicles(newSelection);
    // Keep equipment selection when vehicles change - don't reset
    setSuccessMessage('');
    setError(null);
  };

  // Handle equipment selection
  const handleEquipmentToggle = (equipment) => {
    const newSelection = new Set(selectedEquipment);
    if (newSelection.has(equipment)) {
      newSelection.delete(equipment);
    } else {
      newSelection.add(equipment);
    }
    setSelectedEquipment(newSelection);
  };

  // Select all available equipment for the selected vehicles
  const handleSelectAllEquipment = () => {
    if (selectedVehicles.size === 0) return;

    // Get all available items from the computed checklist
    const allAvailableItems = [];
    Object.values(computedVehicleChecklist).forEach(categoryItems => {
      allAvailableItems.push(...categoryItems);
    });

    setSelectedEquipment(new Set(allAvailableItems));
  };


  // Clear all selections
  const handleClearAll = () => {
    setSelectedEquipment(new Set());
  };

  // Vehicle assignment functions
  const handleAddVehicle = (vehicle) => {
    if (!selectedVehicles.has(vehicle.id)) {
      setSelectedVehicles(prev => new Set([...prev, vehicle.id]));
    }
  };

  const handleRemoveVehicle = (vehicleId) => {
    setSelectedVehicles(prev => new Set([...prev].filter(id => id !== vehicleId)));
  };

  const handleConfirmVehicles = () => {
    if (selectedVehicles.size === 0) {
      alert('Please select at least one vehicle.');
      return;
    }

    // Show the confirmed vehicles modal
    setReceivedConfirmedVehicles(selectedVehicles.map(vehicleId => {
      const vehicle = availableVehicles.find(v => v.id === vehicleId);
      return vehicle ? {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        category: vehicle.type,
        icon: vehicle.icon,
        status: 'Assigned & Ready',
        confirmedAt: new Date().toISOString()
      } : null;
    }).filter(Boolean));
    setShowReceivedVehiclesModal(true);
    setShowVehicleAssignment(false);
  };

  // Get vehicle color class
  const getVehicleColorClass = (color) => {
    const colorMap = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'orange': 'bg-orange-500',
      'purple': 'bg-purple-500',
      'green': 'bg-green-500',
      'navy': 'bg-blue-800',
      'yellow': 'bg-yellow-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* Emergency Banner - Only show in emergency mode */}
      {isEmergencyMode && <EmergencyBanner message="EMERGENCY MODE ACTIVE - ASSIGNMENTS ON HIGH ALERT" />}

      {/* Vehicle Assignment Section */}
      {showVehicleAssignment && (
        <div className="bg-blue-50 border-b-2 border-blue-200 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Available Vehicles */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Available Vehicles ({availableVehicles.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{vehicle.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-800">{vehicle.name}</div>
                            <div className="text-sm text-gray-600">{vehicle.type}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddVehicle(vehicle)}
                          disabled={selectedVehicles.has(vehicle.id)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedVehicles.has(vehicle.id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                          {selectedVehicles.has(vehicle.id) ? 'Added' : 'ADD'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Vehicles */}
              <div>
                <h3 className="text-xl font-bold text-blue-800 mb-4">Selected Vehicles ({selectedVehicles.size})</h3>
                {selectedVehicles.size === 0 ? (
                  <div className="bg-white border border-blue-200 rounded-lg p-6 text-center text-gray-500">
                    No vehicles selected yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(selectedVehicles).map((vehicleId) => {
                      const vehicle = availableVehicles.find(v => v.id === vehicleId);
                      if (!vehicle) return null;
                      return (
                        <div key={vehicle.id} className="bg-white border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{vehicle.icon}</span>
                              <div>
                                <div className="font-semibold text-gray-800">{vehicle.name}</div>
                                <div className="text-sm text-gray-600">{vehicle.type}</div>
                              </div>
                              <button
                                onClick={() => handleRemoveVehicle(vehicleId)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={handleConfirmVehicles}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      CONFIRM VEHICLES ({selectedVehicles.size})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex-1 flex flex-col p-2 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full h-full">

          {/* Enhanced Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-4 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Three-Part Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">

            {/* Part 1: Vehicle Assignment Section */}
            <div className="xl:col-span-1 flex flex-col">
              <VehicleAssignmentSection
                assignedVehicles={receivedConfirmedVehicles}
                staffCount={incidentData?.assignedStaff?.length || 0}
                onVehicleToggle={handleVehicleToggle}
                selectedVehicles={selectedVehicles}
                availableVehicles={availableVehicles}
                assignedVehicleIds={assignedVehicleIds}
                getVehicleColorClass={getVehicleColorClass}
                incidentData={incidentData}
                assignedVehiclesFromOfficer={assignedVehiclesFromOfficer}
              />
            </div>

            {/* Part 2: Equipment Selection Section */}
            <div className="xl:col-span-1 flex flex-col">
              <EquipmentSelectionSection
                selectedVehicles={selectedVehicles}
                selectedEquipment={selectedEquipment}
                onEquipmentToggle={handleEquipmentToggle}
                onSelectAll={handleSelectAllEquipment}
                onClearAll={handleClearAll}
                computedVehicleChecklist={computedVehicleChecklist}
                isItemAvailable={isItemAvailable}
                getItemDisplayName={getItemDisplayName}
                dataLoading={dataLoading}
                availableVehicles={availableVehicles}
                vehicleCategoryMap={vehicleCategoryMap}
                assignedVehiclesFromOfficer={assignedVehiclesFromOfficer}
              />
            </div>

            {/* Part 3: Assignment Summary Section */}
            <div className="xl:col-span-1 flex flex-col">
              <AssignmentSummarySection
                selectedVehicles={selectedVehicles}
                selectedEquipment={selectedEquipment}
                availableVehicles={availableVehicles}
                getVehicleColorClass={getVehicleColorClass}
                onConfirmAssignment={handleConfirmAssignment}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>


      {/* Confirmed Assignments Display Modal */}
      {isAssignmentConfirmed && confirmedAssignments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 confirmed-assignments-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  Equipment Assignment Confirmed
                </h2>
                <button
                  onClick={() => setIsAssignmentConfirmed(false)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {confirmedAssignments.map((assignment, index) => (
                  <div key={assignment.assignmentId || index} className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 shadow-lg confirmed-assignment-card">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                        🚒
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{assignment.vehicle.name}</h3>
                            <p className="text-gray-600 font-medium">{assignment.vehicle.category}</p>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            CONFIRMED
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-700 mb-2">Assigned Equipment ({assignment.equipment.length} items):</h4>
                          <div className="flex flex-wrap gap-2">
                            {assignment.equipment.map((item, itemIndex) => (
                              <span key={itemIndex} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium equipment-badge">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Confirmed at: {new Date(assignment.confirmedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => {
                    setIsAssignmentConfirmed(false);
                    setSelectedVehicles(new Set());
                    setSelectedEquipment(new Set());
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close & Reset
                </button>
                <button
                  onClick={() => setIsAssignmentConfirmed(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue Assigning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Received Confirmed Vehicles Modal from Vehicle Officer */}
      {showReceivedVehiclesModal && receivedConfirmedVehicles.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 confirmed-assignments-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  Incident Confirmed - Assigned Vehicles
                </h2>
                <button
                  onClick={() => setShowReceivedVehiclesModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {receivedConfirmedVehicles.map((vehicle, index) => (
                  <div key={vehicle.id || index} className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 shadow-lg confirmed-assignment-card">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                        {vehicle.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{vehicle.name}</h3>
                            <p className="text-gray-600 font-medium">{vehicle.category}</p>
                          </div>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            CONFIRMED
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm text-gray-500 mb-2">
                            Status: {vehicle.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            Confirmed at: {new Date(vehicle.confirmedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => setShowReceivedVehiclesModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowReceivedVehiclesModal(false);
                    // Navigate to equipment assignment for these vehicles
                    if (receivedConfirmedVehicles.length > 0) {
                      const firstVehicle = receivedConfirmedVehicles[0];
                      // You can add logic here to auto-select the vehicle for equipment assignment
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Assign Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Mode Bottom Buttons */}
      <div className="bg-white border-t-2 border-red-500 shadow-lg p-2">
        <div className="flex justify-between items-center">
          {/* Exit Emergency Mode Button - Left */}
          <button
            onClick={handleEndEmergency}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
            <span>EXIT EMERGENCY</span>
          </button>

          {/* Emergency Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-bold text-sm">EMERGENCY ACTIVE</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>

          {/* Confirm Incident Button - Right */}
          <button
            onClick={handleConfirmAssignment}
            disabled={loading || selectedEquipment.size === 0}
            className={`px-4 py-2 font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 text-sm ${loading || selectedEquipment.size === 0
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>
              {loading ? 'CONFIRMING...' : 'CONFIRM INCIDENT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Assignments;
