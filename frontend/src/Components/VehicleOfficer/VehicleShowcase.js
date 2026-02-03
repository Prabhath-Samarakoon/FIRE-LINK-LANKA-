import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './VehicleShowcase.css';

const VehicleShowcase = () => {
  const { vehicleType } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripData, setTripData] = useState({});

  // For animating initial fill on mount / vehicle change, if needed
  const [animateSeed, setAnimateSeed] = useState(0);
  const [animateKey, setAnimateKey] = useState(0);

  // Format helper
  const fmtPct = (val) => {
    const n = Number(val ?? 0);
    return isFinite(n) ? n.toFixed(2) : '0.00';
  };

  // Active vehicle index (must be declared before effects using it)
  const [activeIndex, setActiveIndex] = useState(0);

  // Smooth navigation with animation (declare early for effects)
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track previous Trip B per vehicle (by originalId or id)
  const [prevTripBByVehicleId, setPrevTripBByVehicleId] = useState({});

  // Cache of resource info by vehicleId (string)
  const [resourceByVehicleId, setResourceByVehicleId] = useState({});

  // Guard map: vehicles whose initial reconciliation has been applied
  const [initReconciledById, setInitReconciledById] = useState({});

  // Water tank interactive state
  const [isDraggingWater, setIsDraggingWater] = useState(false);
  const [waterLevel, setWaterLevel] = useState(100);

  // Initialize water level from vehicle data
  useEffect(() => {
    if (vehicles[activeIndex]?.waterLevel !== undefined) {
      console.log('Setting water level from vehicle data:', vehicles[activeIndex].waterLevel);
      setWaterLevel(vehicles[activeIndex].waterLevel);
    } else {
      console.log('Setting default water level: 100%');
      setWaterLevel(100); // Default to 100% if no data
    }
  }, [vehicles, activeIndex]);

  // Debug water level changes
  useEffect(() => {
    console.log('Water level changed to:', waterLevel);
  }, [waterLevel]);

  // Water tank interaction handlers for draggable arrow
  const handleArrowMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingWater(true);
    updateWaterLevelFromArrow(e);
  };

  const handleArrowMouseMove = (e) => {
    if (isDraggingWater) {
      updateWaterLevelFromArrow(e);
    }
  };

  const handleArrowMouseUp = () => {
    setIsDraggingWater(false);
  };

  const updateWaterLevelFromArrow = (e) => {
    const tankContainer = document.querySelector('.tank-container-large');
    if (!tankContainer) return;

    const rect = tankContainer.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, ((rect.height - y) / rect.height) * 100));
    
    console.log('Water level updated:', percentage); // Debug log
    setWaterLevel(percentage);
    
    // Update the vehicle data
    setVehicles(prev => prev.map((vehicle, index) => 
      index === activeIndex ? { ...vehicle, waterLevel: percentage } : vehicle
    ));
  };

  // Quick increment/decrement buttons (10%)
  const handleQuickAdjust = (direction) => {
    const increment = direction === 'up' ? 10 : -10;
    const newLevel = Math.max(0, Math.min(100, waterLevel + increment));
    
    console.log('Water level updated:', newLevel); // Debug log
    setWaterLevel(newLevel);
    
    // Update the vehicle data
    setVehicles(prev => prev.map((vehicle, index) => 
      index === activeIndex ? { ...vehicle, waterLevel: newLevel } : vehicle
    ));
  };

  // Fine increment/decrement buttons (1%)
  const handleFineAdjust = (direction) => {
    const increment = direction === 'up' ? 1 : -1;
    const newLevel = Math.max(0, Math.min(100, waterLevel + increment));
    
    console.log('Water level updated:', newLevel); // Debug log
    setWaterLevel(newLevel);
    
    // Update the vehicle data
    setVehicles(prev => prev.map((vehicle, index) => 
      index === activeIndex ? { ...vehicle, waterLevel: newLevel } : vehicle
    ));
  };

  // Add global mouse events for dragging
  useEffect(() => {
    if (isDraggingWater) {
      document.addEventListener('mousemove', handleArrowMouseMove);
      document.addEventListener('mouseup', handleArrowMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleArrowMouseMove);
        document.removeEventListener('mouseup', handleArrowMouseUp);
      };
    }
  }, [isDraggingWater]);

  // Add keyboard support for 1% control
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newLevel = Math.max(0, Math.min(100, waterLevel + 1));
        setWaterLevel(newLevel);
        setVehicles(prev => prev.map((vehicle, index) => 
          index === activeIndex ? { ...vehicle, waterLevel: newLevel } : vehicle
        ));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newLevel = Math.max(0, Math.min(100, waterLevel - 1));
        setWaterLevel(newLevel);
        setVehicles(prev => prev.map((vehicle, index) => 
          index === activeIndex ? { ...vehicle, waterLevel: newLevel } : vehicle
        ));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [waterLevel, activeIndex, vehicles]);

  

  // Load resource info for all vehicles
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    
    const loadResourceData = async () => {
      for (const v of vehicles) {
        const vid = v.vehicleId || v.name || v.id;
        if (!vid || resourceByVehicleId[vid]) continue; // skip if no ID or already cached
        
        try {
          const res = await apiService.getResourceManagementByVehicle(vid);
          const list = res?.resourceManagement || res?.data || [];
          const record = Array.isArray(list) ? list[0] : list; // pick latest
          setResourceByVehicleId(prev => ({ ...prev, [vid]: record }));
          
          // If backend has a stored currentFuelLevel, reflect it in UI immediately
          if (record && typeof record.currentFuelLevel === 'number') {
            setVehicles(prev => prev.map((veh) => {
              const key = veh.vehicleId || veh.name || veh.id;
              if (key !== vid) return veh;
              return { ...veh, fuelLevel: record.currentFuelLevel };
            }));
          }
        } catch (e) {
          // silently ignore
        }
      }
    };
    
    loadResourceData();
  }, [vehicles, resourceByVehicleId]);

  // Helper: robustly parse fuelConsumption strings like "15-25 L/100km", "18 L/100 km", "N/A"
  const parseFuelConsumptionLPer100Km = (value) => {
    if (!value || typeof value !== 'string') return null;
    const lower = value.toLowerCase().replace(/,/g, '.');
    const matchRange = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/);
    if (matchRange) {
      const a = parseFloat(matchRange[1]);
      const b = parseFloat(matchRange[2]);
      if (isFinite(a) && isFinite(b)) return (a + b) / 2;
    }
    const matchSingle = lower.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (matchSingle) {
      const n = parseFloat(matchSingle[1]);
      if (isFinite(n)) return n;
    }
    return null;
  };

  // Helper: get fuel tank capacity from resource record or fallback
  const getFuelTankCapacityLiters = (vehicle) => {
    const vid = vehicle.vehicleId || vehicle.name || vehicle.id;
    const record = vid ? resourceByVehicleId[vid] : null;
    if (record && typeof record.fuelCapacity === 'number' && record.fuelCapacity > 0) return record.fuelCapacity;
    const fallback = 100;
    if (typeof vehicle.fuelCapacity === 'number' && vehicle.fuelCapacity > 0) return vehicle.fuelCapacity;
    return fallback;
  };

  // Persist updated fuel level to backend ResourceManagement (best-effort)
  const persistFuelLevel = async (vehicle, newFuelLevel) => {
    const vid = vehicle.vehicleId || vehicle.name || vehicle.id;
    const record = vid ? resourceByVehicleId[vid] : null;
    const recordId = record?._id;
    if (!recordId) return; // no resource record yet; we won't persist
    try {
      await apiService.updateResourceFuelLevel({ recordId, newFuelLevel, type: 'Consumption', amount: 0 });
    } catch (e) {
      // best-effort; ignore
    }
  };

  // Helper: get effective trip km (prefer Trip B if > 0, else Trip A)
  const getEffectiveTripKm = (vehicle) => {
    const tb = Number(vehicle?.tripB ?? 0);
    const ta = Number(vehicle?.tripA ?? 0);
    return tb > 0 ? tb : ta;
  };

  // Initialize prevTrip map when vehicles load/change
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    setPrevTripBByVehicleId((prev) => {
      const next = { ...prev };
      vehicles.forEach((v, idx) => {
        const key = v.originalId || v.id || idx;
        if (next[key] === undefined) next[key] = getEffectiveTripKm(v);
      });
      return next;
    });
  }, [vehicles]);

  // Initial reconciliation: prioritize ResourceManagement data over trip-based calculation
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    let changed = false;
    const updated = vehicles.map((v, i) => {
      const vKey = v.originalId || v.id || i;
      if (initReconciledById[vKey]) return v;
      
      // Check if we have ResourceManagement data for this vehicle
      const vid = v.vehicleId || v.name || v.id;
      const resourceRecord = vid ? resourceByVehicleId[vid] : null;
      
      if (resourceRecord && typeof resourceRecord.currentFuelLevel === 'number') {
        // Use ResourceManagement data as source of truth
        const resourceFuel = resourceRecord.currentFuelLevel;
        const currentFuel = Number(v.fuelLevel ?? 100);
        if (Math.abs(currentFuel - resourceFuel) > 0.1) {
          changed = true;
          setInitReconciledById(prev => ({ ...prev, [vKey]: true }));
          return { ...v, fuelLevel: resourceFuel };
        } else {
          setInitReconciledById(prev => ({ ...prev, [vKey]: true }));
          return v;
        }
      }
      
      // Skip trip-based calculation for initial reconciliation
      // This prevents historical trip data from causing 0% fuel display
      // Fuel consumption will be handled by real-time deployment tracking
      setInitReconciledById(prev => ({ ...prev, [vKey]: true }));
      return v;
    });
    if (changed) setVehicles(updated);
  }, [vehicles, resourceByVehicleId, initReconciledById]);

  // Watch active vehicle trip and decrement fuelLevel per-vehicle accordingly
  useEffect(() => {
    const active = vehicles[activeIndex];
    if (!active) return;
    const key = active.originalId || active.id || activeIndex;
    const currentTrip = getEffectiveTripKm(active);
    const prevTrip = prevTripBByVehicleId[key];
    if (prevTrip === undefined) return;

    // If effective trip decreased (reset), just sync and return
    if (currentTrip < prevTrip) {
      setPrevTripBByVehicleId((prev) => ({ ...prev, [key]: currentTrip }));
      return;
    }

    const deltaKm = currentTrip - prevTrip;
    if (deltaKm <= 0) return;

    const lPer100 = parseFuelConsumptionLPer100Km(active.fuelConsumption);
    if (!lPer100) {
      setPrevTripBByVehicleId((prev) => ({ ...prev, [key]: currentTrip }));
      return;
    }

    const litersUsed = (lPer100 / 100) * deltaKm;
    const tankLiters = getFuelTankCapacityLiters(active);
    const percentDrop = tankLiters > 0 ? (litersUsed / tankLiters) * 100 : 0;

    if (percentDrop > 0) {
      setVehicles((prevList) => prevList.map((v, i) => {
        const vKey = v.originalId || v.id || i;
        if (vKey !== key) return v;
        const newFuelLevel = Math.max(0, (v.fuelLevel ?? 0) - percentDrop);
        persistFuelLevel(v, newFuelLevel);
        return { ...v, fuelLevel: newFuelLevel };
      }));
    }

    setPrevTripBByVehicleId((prev) => ({ ...prev, [key]: currentTrip }));
  }, [vehicles, activeIndex, prevTripBByVehicleId]);

  

  // Fetch vehicles from backend
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getVehicleOfficerVehicles();
      const backendVehicles = response.vehicles || [];
      const showcaseVehicles = backendVehicles.map((vehicle, index) => {
        const vehicleTypeSlug = vehicle.Vtype?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
        const vehicleNameSlug = vehicle.name?.toLowerCase().replace(/\s+/g, '-') || `vehicle-${index}`;
        const vehicleId = `${vehicleTypeSlug}-${vehicleNameSlug}`;
        const backendVehicleId = vehicle.vehicleId || vehicle.vehicleId?.toString?.() || '';
        // Compute initial expected fuel from trips (fallback tank 100L here; detailed resource will adjust later)
        const effectiveTripKm = (vehicle.tripB && vehicle.tripB > 0) ? vehicle.tripB : (vehicle.tripA || 0);
        const lPer100Init = vehicle.fuelConsumption && vehicle.fuelConsumption.trim() !== '' ? (function(v){
          const lower=v.toLowerCase().replace(/,/g,'.');
          const r=lower.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/); if(r){const a=parseFloat(r[1]); const b=parseFloat(r[2]); if(isFinite(a)&&isFinite(b)) return (a+b)/2;}
          const s=lower.match(/([0-9]+(?:\.[0-9]+)?)/); if(s){const n=parseFloat(s[1]); if(isFinite(n)) return n;}
          return null;
        })(vehicle.fuelConsumption) : null;
        const tankLitersInit = typeof vehicle.fuelCapacity === 'number' && vehicle.fuelCapacity>0 ? vehicle.fuelCapacity : 100;
        const expectedFuelFromTrips = (lPer100Init && tankLitersInit>0 && effectiveTripKm>0) ? Math.max(0, 100 - ((lPer100Init/100)*effectiveTripKm / tankLitersInit)*100) : null;
        const backendFuelLevel = vehicle.fuelLevel ?? 100;
        const initialFuelLevel = expectedFuelFromTrips!=null ? Math.min(backendFuelLevel, expectedFuelFromTrips) : backendFuelLevel;
        return {
          id: vehicleId,
          vehicleId: backendVehicleId,
          originalId: vehicle._id,
          name: vehicle.name?.toUpperCase() || 'UNKNOWN VEHICLE',
          description: `${vehicle.Vtype} - ${vehicle.name}`,
          image: getVehicleShowcaseImage(vehicle.Vtype, vehicle.name),
          crewCapacity: vehicle.maxCrew || 0,
          waterLevel: vehicle.waterLevel || 0,
          fuelLevel: initialFuelLevel,
          engineCapacity: vehicle.engineCapacity && vehicle.engineCapacity.trim() !== '' ? vehicle.engineCapacity : 'N/A',
          fuelType: vehicle.fuelType || 'Diesel',
          fuelConsumption: vehicle.fuelConsumption && vehicle.fuelConsumption.trim() !== '' ? vehicle.fuelConsumption : 'N/A',
          waterCapacity: vehicle.waterCapacity || vehicle.Capacity || 'N/A',
          yearBuilt: vehicle.year || vehicle.yearBuilt || 'N/A',
          status: vehicle.status || 'Available',
          condition: vehicle.condition || 'Good',
          maintenanceStatus: vehicle.maintenanceStatus || 'Good',
          tripA: vehicle.tripA ?? 0,
          tripB: vehicle.tripB ?? 500,
          tripC: vehicle.tripC ?? 1000,
          deploymentHistory: vehicle.deploymentHistory || [],
          ...getVehicleCapabilities(vehicle.Vtype, vehicle)
        };
      });
      setVehicles(showcaseVehicles);
    } catch (error) {
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  // Listen for vehicle updates
  useEffect(() => {
    const handleVehicleUpdate = () => {
      fetchVehicles();
    };
    const handleVehicleDeployed = (e) => {
      const { vehicleId, tripA, tripB, tripC } = e.detail || {};
      if (!vehicleId) return;
      setVehicles(prev => prev.map(v => {
        const idMatch = v.vehicleId && String(v.vehicleId) === String(vehicleId);
        return idMatch ? {
          ...v,
          tripA: Number(tripA ?? v.tripA ?? 0),
          tripB: Number(tripB ?? v.tripB ?? 0),
          tripC: Number(tripC ?? v.tripC ?? 0)
        } : v;
      }));
    };
    window.addEventListener('vehicleAdded', handleVehicleUpdate);
    window.addEventListener('vehicleUpdated', handleVehicleUpdate);
    window.addEventListener('vehicleDeleted', handleVehicleUpdate);
    window.addEventListener('vehicleDeployed', handleVehicleDeployed);
    return () => {
      window.removeEventListener('vehicleAdded', handleVehicleUpdate);
      window.removeEventListener('vehicleUpdated', handleVehicleUpdate);
      window.removeEventListener('vehicleDeleted', handleVehicleUpdate);
      window.removeEventListener('vehicleDeployed', handleVehicleDeployed);
    };
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Single consolidated resourceFuelUpdated event handler
  useEffect(() => {
    const handler = async (e) => {
      const { vehicleId, vehicleName, fuelLevel } = e.detail || {};
      
      // Only update if this is a refill event (fuelLevel === 100)
      // For consumption events, let the real-time tracking handle it
      if (fuelLevel === 100) {
        // This is a refill - update the specific vehicle
        setVehicles(prev => prev.map(v => {
          const idMatch = (vehicleId && v.vehicleId && String(v.vehicleId) === String(vehicleId));
          const nameMatch = vehicleName && v.name && v.name.toLowerCase() === String(vehicleName).toLowerCase();
          const match = idMatch || nameMatch;
          return match ? { ...v, fuelLevel: 100 } : v;
        }));
        setAnimateKey(k => k + 1);
        
        // Reset trip baseline for refilled vehicle only
        setPrevTripBByVehicleId(prev => {
          const next = { ...prev };
          const idx = vehicles.findIndex(v => 
            (vehicleId && v.vehicleId && String(v.vehicleId) === String(vehicleId)) || 
            (vehicleName && v.name && v.name.toLowerCase() === String(vehicleName).toLowerCase())
          );
          if (idx !== -1) {
            const key = vehicles[idx].originalId || vehicles[idx].id || idx;
            next[key] = getEffectiveTripKm(vehicles[idx]);
          }
          return next;
        });
      }
    };
    window.addEventListener('resourceFuelUpdated', handler);
    return () => window.removeEventListener('resourceFuelUpdated', handler);
  }, [vehicles]);



  // Polling fallback to ensure Showcase reflects full after completion
  useEffect(() => {
    let timer = null;
    const onFuelUpdated = () => {
      // Briefly poll the backend vehicle to ensure we have new fuel value
      if (!vehicles[activeIndex]) return;
      const id = vehicles[activeIndex].originalId;
      if (!id) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try { const res = await apiService.getVehicleOfficerVehicleById(id); const v = res.vehicle || {}; setVehicles(prev => prev.map((pv,i)=> i===activeIndex ? { ...pv, fuelLevel: v.fuelLevel ?? pv.fuelLevel } : pv)); } catch {}
      }, 300);
    };
    window.addEventListener('resourceFuelUpdated', onFuelUpdated);
    return () => { window.removeEventListener('resourceFuelUpdated', onFuelUpdated); clearTimeout(timer); };
  }, [vehicles, activeIndex]);

  // Get vehicle showcase image based on type and name
  const getVehicleShowcaseImage = (vehicleType, vehicleName) => {
    const imageMap = {
      'Fire Truck': '/images/showcase/fire-engine-pumper.png',
      'Water Tanker': '/images/showcase/water-bowser.png',
      'Rescue Vehicle': '/images/showcase/rescue-tender.png',
      'Command Vehicle': '/images/showcase/fire-command-suv.png',
      'Ambulance': '/images/showcase/ambulance.png',
      'Police Car': '/images/showcase/fire-engine-pumper.png',
      'Ladder Truck': '/images/showcase/aerial-ladder-platform.png',
      'Hazmat Vehicle': '/images/showcase/hazmat-truck.png',
      'Medical Response Unit': '/images/showcase/fire-engine-pumper.png',
      'Search & Rescue Vehicle': '/images/showcase/wild-land-truck.png'
    };
    
    // Handle special cases for vehicles that might have different names
    if (vehicleName && typeof vehicleName === 'string') {
      const lowerName = vehicleName.toLowerCase();
      
      // Check for foam tender variations
      if (lowerName.includes('foam')) {
        return '/images/showcase/foam-tender.png';
      }
      
      // Check for logistics truck variations
      if (lowerName.includes('logistics') || lowerName.includes('support') || lowerName.includes('utility')) {
        return '/images/showcase/logistics-truck.png';
      }
      
      // Check for wildland tender variations
      if (lowerName.includes('wildland') || lowerName.includes('wild') || lowerName.includes('brush')) {
        return '/images/showcase/wild-land-truck.png';
      }
    }
    
    // Fallback to vehicle type mapping
    if (vehicleType && typeof vehicleType === 'string') {
      const lowerType = vehicleType.toLowerCase();
      
      // Check for foam tender variations in type
      if (lowerType.includes('foam')) {
        return '/images/showcase/foam-tender.png';
      }
      
      // Check for logistics truck variations in type
      if (lowerType.includes('logistics') || lowerType.includes('support') || lowerType.includes('utility')) {
        return '/images/showcase/logistics-truck.png';
      }
      
      // Check for wildland tender variations in type
      if (lowerType.includes('wildland') || lowerType.includes('wild') || lowerType.includes('brush')) {
        return '/images/showcase/wild-land-truck.png';
      }
    }
    
    return imageMap[vehicleType] || '/images/showcase/fire-engine-pumper.png';
  };

  // Get vehicle-specific capabilities
  const getVehicleCapabilities = (vehicleType, vehicle) => {
    const capabilities = {};
    
    switch (vehicleType) {
      case 'Ladder Truck':
        capabilities.maxHeight = '32m';
        capabilities.platformCapacity = '300kg';
        break;
      case 'Fire Truck':
        capabilities.pumpPressure = '10 Bar';
        capabilities.waterCapacity = vehicle.Capacity + 'L';
        break;
      case 'Rescue Vehicle':
        capabilities.equipmentLoad = '2.5 Ton';
        capabilities.rescueTools = 'Full Set';
        break;
      case 'Hazmat Vehicle':
        capabilities.protectionLevel = 'Level A';
        capabilities.detectionSystems = 'Multi-Gas';
        break;
      case 'Water Tanker':
        capabilities.deliveryRate = '2000L/min';
        capabilities.waterCapacity = vehicle.Capacity + 'L';
        break;
      case 'Command Vehicle':
        capabilities.communication = 'Multi-Band';
        capabilities.commandSystems = 'Full Suite';
        break;
      case 'Search & Rescue Vehicle':
        capabilities.terrainCapability = '4WD';
        capabilities.waterCapacity = vehicle.Capacity + 'L';
        break;
      case 'Ambulance':
        capabilities.patientCapacity = '2';
        capabilities.medicalEquipment = 'Full ICU';
        break;
      case 'Police Car':
        capabilities.responseTime = '< 3 min';
        capabilities.communication = 'Multi-Band';
        break;
      case 'Medical Response Unit':
        capabilities.patientCapacity = '4';
        capabilities.medicalEquipment = 'Advanced Life Support';
        break;
    }
    
    return capabilities;
  };

  // Find current vehicle or default to first
  useEffect(() => {
    if (vehicles.length > 0) {
      if (vehicleType) {
        const index = vehicles.findIndex(v => v.id === vehicleType);
        console.log('Looking for vehicle:', { vehicleType, vehicles: vehicles.map(v => v.id), foundIndex: index });
        if (index !== -1) {
          setActiveIndex(index);
        } else {
          // If vehicleType doesn't match, default to first vehicle and update URL
          console.log('Vehicle not found, defaulting to first vehicle');
          setActiveIndex(0);
          navigate(`/vehicle-officer/vehicle-showcase/${vehicles[0].id}`, { replace: true });
        }
      } else {
        // No vehicleType provided, default to first vehicle
        console.log('No vehicleType provided, defaulting to first vehicle');
        setActiveIndex(0);
        if (vehicles.length > 0) {
          navigate(`/vehicle-officer/vehicle-showcase/${vehicles[0].id}`, { replace: true });
        }
      }
    }
  }, [vehicleType, vehicles, navigate]);

  // Handle next/prev
  const handleNext = () => {
    if (vehicles.length === 0) return;
    const nextIndex = (activeIndex + 1) % vehicles.length;
    setActiveIndex(nextIndex);
    navigate(`/vehicle-officer/vehicle-showcase/${vehicles[nextIndex].id}`, { replace: true });
  };

  const handlePrev = () => {
    if (vehicles.length === 0) return;
    const prevIndex = activeIndex === 0 ? vehicles.length - 1 : activeIndex - 1;
    setActiveIndex(prevIndex);
    navigate(`/vehicle-officer/vehicle-showcase/${vehicles[prevIndex].id}`, { replace: true });
  };

  const smoothNavigate = (direction) => {
    if (isTransitioning || vehicles.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === 'next') handleNext(); else handlePrev();
      setIsTransitioning(false);
    }, 150);
  };

  // Trip selection state (shared across controls and meter)
  const [selectedTrip, setSelectedTrip] = useState('A');

  const handleBackToVehicles = () => { navigate('/vehicle-officer/vehicles'); };
  const handleBackToDetails = () => {
    if (window.history.length > 1) window.history.back(); else navigate('/vehicle-officer/vehicles');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') smoothNavigate('prev');
      else if (event.key === 'ArrowRight') smoothNavigate('next');
      else if (event.key === 'Escape') handleBackToDetails();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, vehicles, isTransitioning]);

  // Loading state
  if (loading) {
    return (
      <div className="vehicle-showcase-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicle showcase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="vehicle-showcase-container">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={fetchVehicles} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  // No vehicles state
  if (vehicles.length === 0) {
    return (
      <div className="vehicle-showcase-container">
        <div className="empty-container">
          <p>🚗 No vehicles found</p>
          <button onClick={() => navigate('/vehicle-officer/add-vehicle')} className="add-vehicle-btn">
            Add Vehicle
          </button>
        </div>
      </div>
    );
  }

  // Left-side stacked tanks panel
  const leftTankStack = (
    <div className="left-tank-stack">
      <div className={`left-tank-box fuel ${Number(vehicles[activeIndex]?.fuelLevel || 0) <= 30 ? 'low-focus' : ''}`}>
        <div className="tank-header" style={{ position: 'relative' }}>
          <span className="tank-title">Fuel Tank</span>
          <span className="tank-percentage">{fmtPct(vehicles[activeIndex]?.fuelLevel)}%</span>
          {Number(vehicles[activeIndex]?.fuelLevel || 0) <= 30 && (
            <span className="low-indicator" title="Low fuel">
              <span className="bulb-red" /> LOW FUEL
            </span>
          )}
        </div>
        <div className="tank-visual">
          <div className="tank-container-large">
            <div 
              key={animateKey}
              className="tank-liquid-large fuel animated-fill"
              style={{ height: `${vehicles[activeIndex]?.fuelLevel || 0}%`, '--level': `${vehicles[activeIndex]?.fuelLevel || 0}%` }}
            >
              <div className="liquid-wave-large"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="left-tank-box water">
        <div className="tank-header">
          <span className="tank-title">Water Tank</span>
          <span className="tank-percentage" style={{ color: waterLevel > 50 ? '#4CAF50' : waterLevel > 25 ? '#FF9800' : '#F44336' }}>
            {fmtPct(waterLevel)}%
          </span>
        </div>
        <div className="tank-visual">
          <div className="tank-container-large">
            <div 
              className="tank-liquid-large water animated-fill"
              style={{ height: `${waterLevel}%`, '--level': `${waterLevel}%` }}
            >
              <div className="liquid-wave-large"></div>
            </div>
          </div>
          {vehicles[activeIndex]?.waterCapacity && (
            <div className="tank-capacity-large">{vehicles[activeIndex]?.waterCapacity}</div>
          )}
          {/* Draggable white arrow indicator outside the tank */}
          <div 
            className="water-level-indicator draggable-arrow"
            style={{ 
              top: `${100 - waterLevel}%`,
              transform: 'translateY(-50%)'
            }}
            onMouseDown={handleArrowMouseDown}
            title="Drag to adjust water level | Use ↑↓ keys for 1% changes"
          >
            <div className="arrow-head"></div>
          </div>
          {/* All control buttons in single vertical column */}
          <div className="all-controls">
            <button 
              className="quick-btn quick-up"
              onClick={() => handleQuickAdjust('up')}
              title="Increase by 10%"
            >
              +10
            </button>
            <button 
              className="quick-btn quick-down"
              onClick={() => handleQuickAdjust('down')}
              title="Decrease by 10%"
            >
              -10
            </button>
            <button 
              className="fine-btn fine-up"
              onClick={() => handleFineAdjust('up')}
              title="Increase by 1%"
            >
              +1
            </button>
            <button 
              className="fine-btn fine-down"
              onClick={() => handleFineAdjust('down')}
              title="Decrease by 1%"
            >
              -1
            </button>
          </div>
          <div className="tank-instruction">Drag arrow to adjust | Use ↑↓ keys or +1/-1 buttons for 1% changes | +10/-10 for quick changes</div>
        </div>
      </div>
    </div>
  );

  // vehicle-showcase-slide
  const vehicleSlide = (
    <div className="vehicle-showcase-slide">
      {vehicles.map((vehicle, index) => (
        <div 
          key={vehicle.id} 
          className={`showcase-item ${index === activeIndex ? 'active' : ''}`}
        >
          <div className="showcase-image">
            <img src={vehicle.image} alt={vehicle.name} />
          </div>
          <div className="showcase-content">
            <div className="showcase-title">
              <h1>{vehicle.name}</h1>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Full Vehicle Details Panel
  const vehicleDetailsPanel = (
    <div className="vehicle-details-full-panel">
      <div className="panel-content">
        <div className="panel-header">
          <h2>Vehicle Specifications</h2>
          <div className="vehicle-status">
            <span className="status-indicator active"></span>
            <span>Operational</span>
          </div>
        </div>

        <div className="details-grid">
          {/* Crew and Basic Info */}
          <div className="details-section">
            <h3>Crew & Basic Info</h3>
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <span className="card-label">Crew Capacity</span>
                  <span className="card-value">{vehicles[activeIndex]?.crewCapacity || 0} members</span>
                </div>
              </div>
              <div className="info-card">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <span className="card-label">Year Built</span>
                  <span className="card-value">{vehicles[activeIndex]?.yearBuilt || 'N/A'}</span>
                </div>
              </div>
              <div className="info-card">
                <div className="card-icon">🔧</div>
                <div className="card-content">
                  <span className="card-label">Engine</span>
                  <span className="card-value">{vehicles[activeIndex]?.engineCapacity && vehicles[activeIndex].engineCapacity.trim() !== '' ? vehicles[activeIndex].engineCapacity : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tank monitors moved to left-tank-stack */}

          {/* Engine Specifications */}
          <div className="details-section">
            <h3>Engine Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-value">{vehicles[activeIndex]?.fuelType || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Fuel Consumption</span>
                <span className="spec-value">{vehicles[activeIndex]?.fuelConsumption && vehicles[activeIndex].fuelConsumption.trim() !== '' ? vehicles[activeIndex].fuelConsumption : 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Engine Capacity</span>
                <span className="spec-value">{vehicles[activeIndex]?.engineCapacity && vehicles[activeIndex].engineCapacity.trim() !== '' ? vehicles[activeIndex].engineCapacity : 'N/A'}</span>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );

  // Standalone Trip Meter Panel - Orange LCD Style
  const tripMeterPanel = (
    <div className="trip-container">
      <LcdTripMeter
        vehicle={vehicles[activeIndex]}
        selectedTrip={selectedTrip}
        onSelectTrip={setSelectedTrip}
        onReset={async (tripKey) => {
          try {
            const active = vehicles[activeIndex];
            if (!active) return;
            if (tripKey === 'C') return; // not resettable
            if (tripKey === 'B') {
              const ok = window.confirm('Reset Trip B?');
              if (!ok) return;
            }
            const payload = { ...(tripKey==='A'?{tripA:0}:{tripB:0}) };
            await apiService.updateVehicleTrip(active.originalId, payload);
            setAnimateSeed(prev => prev + 1);
            setVehicles(prev => prev.map((v, i) => {
              if (i !== activeIndex) return v;
              return { ...v, ...(tripKey==='A'?{tripA:0}:{tripB:0}) };
            }));
          } catch (e) {
            console.error('Failed to reset trip:', e);
          }
        }}
      />
    </div>
  );

  // showcase-directional
  const directionalButtons = (
    <div className="showcase-directional">
      <button 
        id="prev" 
        className={`arrow-btn ${isTransitioning ? 'disabled' : ''}`}
        aria-label="Previous" 
        onClick={() => smoothNavigate('prev')}
        disabled={isTransitioning}
      >
        <span className="arrow left">
          <span className="arrow-top"></span>
          <span className="arrow-bottom"></span>
        </span>
      </button>
      <button 
        id="next" 
        className={`arrow-btn ${isTransitioning ? 'disabled' : ''}`}
        aria-label="Next" 
        onClick={() => smoothNavigate('next')}
        disabled={isTransitioning}
      >
        <span className="arrow right">
          <span className="arrow-top"></span>
          <span className="arrow-bottom"></span>
        </span>
      </button>
    </div>
  );

  // vehicle-counter
  const vehicleCounter = (
    <div className="vehicle-counter">
      {activeIndex + 1} / {vehicles.length}
    </div>
  );
  
  // Navigation hints
  const navigationHints = (
    <div className="navigation-hints">
      <div className="hint">← → Arrow keys to navigate</div>
      <div className="hint">ESC to go back</div>
    </div>
  );

  return (
    <div className="vehicle-showcase-container">
      <div className="floating-actions">
        <button className="panel-btn back" onClick={handleBackToDetails} aria-label="Back">
          <span className="icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="btn-text">Back</span>
        </button>
        <button className="panel-btn add" onClick={() => navigate('/vehicle-officer/add-vehicle')} aria-label="Add vehicle">
          <span className="icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="btn-text">Add</span>
        </button>
        <button className="panel-btn update" onClick={() => navigate('/vehicle-officer/vehicles')} aria-label="Update vehicles">
          <span className="icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1 1-4 11.5-11.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </span>
          <span className="btn-text">Update</span>
        </button>
      </div>
      <div className="showcase-main-container">
        {leftTankStack}
        {vehicleSlide}
        {vehicleDetailsPanel}
        {tripMeterPanel}
        {directionalButtons}
        {vehicleCounter}
        {navigationHints}
      </div>
    </div>
  );
};

export default VehicleShowcase;

// Local LCD-styled Trip Meter (orange)
const LcdTripMeter = ({ vehicle, selectedTrip, onSelectTrip, onReset }) => {
  const tripA = vehicle?.tripA ?? 0;
  const tripB = vehicle?.tripB ?? 200;
  const tripC = vehicle?.tripC ?? 1000; // Trip C is persisted and never reset
  const value = selectedTrip === 'A' ? tripA : selectedTrip === 'B' ? tripB : tripC;

  // Format value to XXX.XXX (3 decimals) and split into parts for LCD digits
  const formatted = Number.parseFloat(value).toFixed(3);
  const [whole, decimals] = formatted.split('.');

  return (
    <div className="lcd-panel">
      <div className="lcd-header">
        <div className="lcd-title">TRIP</div>
        <div className="lcd-indicators" role="tablist" aria-label="Trip selector">
          {['A','B','C'].map((t) => (
            <button
              key={t}
              className={`lcd-pill ${selectedTrip === t ? 'active' : ''}`}
              onClick={() => onSelectTrip && onSelectTrip(t)}
              aria-pressed={selectedTrip === t}
            >
              {t}
            </button>
          ))}
          <button
            className={`lcd-reset ${selectedTrip === 'C' ? 'disabled' : ''}`}
            onClick={() => {
              if (selectedTrip === 'C') return; // not resettable
              if (selectedTrip === 'A') {
                onReset && onReset('A'); // instant, no confirm
                return;
              }
              // Trip B: ask confirmation
              const confirmed = window.confirm('Reset Trip B?');
              if (confirmed && onReset) onReset('B');
            }}
            disabled={selectedTrip === 'C'}
            title={selectedTrip === 'C' ? 'Trip C cannot be reset' : `Reset Trip ${selectedTrip}`}
          >
            RESET
          </button>
        </div>
      </div>

      <div className="lcd-display" aria-live="polite" aria-label={`Trip ${selectedTrip} distance`}>
        <div className="lcd-row">
          {whole.split('').map((ch, idx) => (
            <span key={`w-${idx}`} className="digit-box">
              <span className="digit">{ch}</span>
            </span>
          ))}
          <span className="digit-dot">.</span>
          {decimals.split('').map((ch, idx) => (
            <span key={`d-${idx}`} className="digit-box small">
              <span className="digit small">{ch}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="lcd-subdisplay">
        <div className="lcd-unit">TRIP {selectedTrip}</div>
        <div className="lcd-unit">KM</div>
      </div>
    </div>
  );
};