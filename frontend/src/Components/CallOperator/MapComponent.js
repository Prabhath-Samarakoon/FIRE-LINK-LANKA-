import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Search, MapPin, Navigation } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default location - Fire Service Department Kandy
const KANDY_FIRE_SERVICE = [7.2905, 80.6337];

// Well-known Sri Lankan locations for fallback
const SRI_LANKAN_LOCATIONS = {
  'kandy': [7.2905, 80.6337],
  'kandy lake': [7.2939, 80.6406],
  'temple of the tooth': [7.2942, 80.6414],
  'colombo': [6.9271, 79.8612],
  'colombo city': [6.9271, 79.8612],
  'galle face green': [6.9271, 79.8612],
  'independence square': [6.9049, 79.8607],
  'galle': [6.0329, 80.2170],
  'anuradhapura': [8.3114, 80.4037],
  'polonnaruwa': [7.9403, 81.0000],
  'nuwara eliya': [6.9497, 80.7891],
  'sigiriya': [7.9569, 80.7597]
};

// Known places for guaranteed search results (from VehicleOfficer MapPage.js)
const KNOWN_PLACES = [
  { name: "Temple of the Sacred Tooth Relic", coordinates: [7.293627, 80.641350], type: "Religious" },
  { name: "Kandy Lake (Kiri Muhuda)", coordinates: [7.2931, 80.6400], type: "Natural" },
  { name: "Wales Park (Royal Palace Park)", coordinates: [7.2917, 80.6391], type: "Park" },
  { name: "Royal Botanical Gardens, Peradeniya", coordinates: [7.271959, 80.595339], type: "Garden" },
  { name: "Ceylon Tea Museum, Hantana", coordinates: [7.2960, 80.6510], type: "Museum" },
  { name: "National Hospital, Kandy", coordinates: [7.28652, 80.63142], type: "Hospital" },
  { name: "Teaching Hospital, Peradeniya", coordinates: [7.2620, 80.6000], type: "Hospital" },
  { name: "University of Peradeniya", coordinates: [7.2568, 80.5980], type: "University" },
  { name: "SLIIT Kandy", coordinates: [7.2671, 80.5972], type: "University" },
  { name: "Open University of Sri Lanka (Kandy Center)", coordinates: [7.3040, 80.6460], type: "University" },
  { name: "St. Anthony's College, Kandy", coordinates: [7.2920, 80.6425], type: "School" },
  { name: "Dharmaraja College, Kandy", coordinates: [7.2885, 80.6388], type: "School" },
  { name: "Kandy City Centre", coordinates: [7.2955, 80.6357], type: "Shopping Center" },
  { name: "Kandy Railway Station", coordinates: [7.2900, 80.6330], type: "Transport" },
  { name: "Kandy Clock Tower", coordinates: [7.2930, 80.6390], type: "Landmark" },
  { name: "Udawatta Kele Sanctuary", coordinates: [7.2898, 80.6407], type: "Nature / Sanctuary" },
  { name: "Gadaladeniya Vihara", coordinates: [7.2833, 80.6750], type: "Religious" },
  { name: "Lankatilaka Vihara", coordinates: [7.2911, 80.6755], type: "Religious" },
  { name: "Sri Maha Bodhi Viharaya (Bahirawakanda Statue)", coordinates: [7.2935, 80.6340], type: "Religious" },
  { name: "Meera Makam Mosque", coordinates: [7.2932, 80.6378], type: "Religious" },
  { name: "Kadugannawa Ambalama", coordinates: [7.1840, 80.5690], type: "Historical" },
  { name: "International Buddhist Museum", coordinates: [7.2938, 80.6411], type: "Museum" },
  { name: "Asgiriya Stadium", coordinates: [7.2970, 80.6240], type: "Sports" },
  { name: "Pallekele International Cricket Stadium", coordinates: [7.2748, 80.7200], type: "Sports" },
  { name: "Ampitiya Temple", coordinates: [7.2930, 80.6200], type: "Religious" },
  { name: "Mahaweli Reach Hotel", coordinates: [7.2690, 80.6330], type: "Hotel / Accommodation" },
  { name: "Kandy Yatch Club", coordinates: [7.2890, 80.6450], type: "Leisure / Club" },
  { name: "Peradeniya Botanical Gardens Entrance", coordinates: [7.2700, 80.6010], type: "Entrance / Landmark" },
  { name: "Kadugannawa Railway Tunnel", coordinates: [7.2100, 80.5430], type: "Transport / Landmark" },
  { name: "Hantana Mountain Viewpoint", coordinates: [7.3000, 80.6500], type: "Viewpoint / Nature" },
  { name: "Mahaweli River Bank (Ampitiya)", coordinates: [7.2850, 80.6350], type: "Natural / River" },
  { name: "Kandy Golf Club", coordinates: [7.2700, 80.6200], type: "Sport / Leisure" },
  { name: "Kandy Municipal Council Office", coordinates: [7.2930, 80.6390], type: "Government" },
  { name: "Post Office Kandy", coordinates: [7.2950, 80.6360], type: "Service" },
  { name: "Kandy Fire Station", coordinates: [7.2934, 80.6367], type: "Emergency" },
  { name: "Kandy Police Headquarters", coordinates: [7.2925, 80.6355], type: "Law Enforcement" },
  { name: "Kandy District Court", coordinates: [7.2980, 80.6350], type: "Government" },
  { name: "Kandy Library", coordinates: [7.2915, 80.6440], type: "Education / Public" },
  { name: "Bahirawakanda Buddha Temple", coordinates: [7.2900, 80.6350], type: "Religious" },
  { name: "Upper Lake Road Viewpoint", coordinates: [7.3000, 80.6420], type: "Viewpoint" },
  { name: "Mahaweli Centre / University Drive", coordinates: [7.2710, 80.5970], type: "University / Research" },
  { name: "Sri Lanka Planetarium (Kandy)", coordinates: [7.2970, 80.6390], type: "Science / Education" },
  { name: "Boralanda Estate", coordinates: [7.2200, 80.5700], type: "Agriculture / Estate" },
  { name: "Katugastota Bridge", coordinates: [7.3050, 80.6350], type: "Transport / Bridge" },
  { name: "Galpotta Junction", coordinates: [7.3100, 80.6500], type: "Junction / Town" },
  { name: "Madawala Wellness Centre", coordinates: [7.2300, 80.5900], type: "Health / Wellness" },
  { name: "Sirimalwatta Public Market", coordinates: [7.2950, 80.6440], type: "Market" },
  { name: "Upper Hantana Viewpoint", coordinates: [7.3000, 80.6550], type: "Viewpoint / Nature" },
  { name: "Fire Brigade Kandy (Suduhumpala West)", coordinates: [7.28161, 80.62272], type: "Emergency" },
  { name: "Fire Service Department Kandy (Bogambara)", coordinates: [7.29178, 80.63527], type: "Emergency" },
  { name: "Kandy War Cemetery", coordinates: [7.28168, 80.608291], type: "Landmark" },
  { name: "Rajawella, Digana", coordinates: [7.2999385, 80.7358344], type: "Township / Suburb" },
  // Additional Colombo locations
  { name: "Colombo Fort Railway Station", coordinates: [6.9344, 79.8428], type: "Transport" },
  { name: "Galle Face Green, Colombo", coordinates: [6.9271, 79.8612], type: "Park" },
  { name: "Independence Square, Colombo", coordinates: [6.9049, 79.8607], type: "Monument" }
];

// Fire location marker icon
const fireIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fire station marker icon
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
    }
  });
  return null;
}

// Map wrapper component that handles proper initialization
function MapWrapper({ center, zoom, children, onMapReady, mapRef }) {
  const map = useMap();
  
  useEffect(() => {
    let cancelled = false;
    let timer;
    if (map && onMapReady) {
      // Wait for map to be fully loaded before calling ready callback
      const checkMapReady = () => {
        if (cancelled) return;
        if (map._loaded && map._container) {
          onMapReady(map);
        } else {
          timer = setTimeout(checkMapReady, 50);
        }
      };
      checkMapReady();
    }
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [map, onMapReady]);

  useEffect(() => {
    if (map && mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  return children;
}

const MapComponent = ({ 
  fireLocation, 
  setFireLocation, 
  address, 
  setAddress, 
  coordinates, 
  setCoordinates,
  onMarkFireLocation 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState(KANDY_FIRE_SERVICE);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showPopupMap, setShowPopupMap] = useState(false);
  const [popupCenter, setPopupCenter] = useState(KANDY_FIRE_SERVICE);
  const mapRef = useRef(null);
  const popupMapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Helper function to safely update map view
  const safeSetView = useCallback((map, coords, zoom = 16) => {
    if (!map || typeof map.setView !== 'function') return;
    try {
      const containerReady = !!map._container;
      const loaded = !!map._loaded;
      const panesReady = !!(map._panes && map._panes.mapPane);
      const sizeReady = !!map._size;
      if (containerReady && loaded && panesReady && sizeReady) {
        map.setView(coords, zoom);
      } else {
        setTimeout(() => safeSetView(map, coords, zoom), 120);
      }
    } catch (error) {
      console.log('Error setting map view:', error);
    }
  }, []);

  // Reverse geocoding - convert coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      if (data.display_name) {
        // Extract the most relevant parts of the address
        const parts = data.display_name.split(', ');
        const relevantParts = parts.slice(0, 3).join(', ');
        return relevantParts;
      }
      
      return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.log("Reverse geocoding failed:", error);
      return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Enhanced geocoding with multiple providers (from VehicleOfficer MapPage.js)
  const geocode = async (query) => {
    const text = (query ?? '').toString();
    if (!text.trim()) return [];
    
    console.log('Geocoding search for:', text);
    const results = [];
    
    // 0) Add known POIs if the query matches
    const qlower = text.toLowerCase();
    for (const kp of KNOWN_PLACES) {
      if (!kp || !kp.name) continue;
      const kpName = kp.name.toLowerCase();
      
      // More flexible matching - check if query contains any word from the place name or vice versa
      const queryWords = qlower.split(/\s+/).filter(w => w.length > 0);
      const placeWords = kpName.split(/\s+/).filter(w => w.length > 0);
      
      const hasMatch = queryWords.some(qWord => 
        placeWords.some(pWord => pWord.includes(qWord) || qWord.includes(pWord))
      ) || qlower.includes('sliit') || qlower.includes('pallekele') || qlower.includes('balagolla') ||
          qlower.includes('colombo') || qlower.includes('kandy');
      
      if (hasMatch) {
        results.push({ 
          coords: kp.coordinates, 
          name: kp.name,
          type: kp.type 
        });
      }
    }

    // 1) Nominatim (OpenStreetMap) - Free
    try {
      const searchQuery = text.includes('Sri Lanka') ? text : `${text}, Sri Lanka`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&countrycodes=lk&addressdetails=1`
      );
      const data = await response.json();
      
      data.forEach(item => {
        if (item.lat && item.lon) {
          results.push({
            coords: [parseFloat(item.lat), parseFloat(item.lon)],
            name: item.display_name,
            type: item.type || 'Location'
          });
        }
      });
    } catch (error) {
      console.log("Nominatim geocoding failed:", error);
    }

    // 2) Photon (Komoot) - Free alternative
    try {
      const searchQuery = text.includes('Sri Lanka') ? text : `${text}, Sri Lanka`;
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=8&lang=en&lat=7.2905&lon=80.6337&radius=50000`
      );
      const data = await response.json();
      
      if (data.features) {
        data.features.forEach(feature => {
          if (feature.geometry && feature.geometry.coordinates) {
            const [lon, lat] = feature.geometry.coordinates;
            results.push({
              coords: [lat, lon],
              name: feature.properties.name || feature.properties.display_name || 'Unknown Location',
              type: feature.properties.type || 'Location'
            });
          }
        });
      }
    } catch (error) {
      console.log("Photon geocoding failed:", error);
    }

    // Remove duplicates and return
    const unique = results.filter((item, index, self) => 
      index === self.findIndex(t => 
        t.coords[0] === item.coords[0] && t.coords[1] === item.coords[1]
      )
    );
    
    // Sort by relevance - exact matches first, then partial matches
    const sorted = unique.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === qlower) return -1;
      if (bName === qlower) return 1;
      
      // Starts with query gets second priority
      if (aName.startsWith(qlower) && !bName.startsWith(qlower)) return -1;
      if (bName.startsWith(qlower) && !aName.startsWith(qlower)) return 1;
      
      // Contains query gets third priority
      if (aName.includes(qlower) && !bName.includes(qlower)) return -1;
      if (bName.includes(qlower) && !aName.includes(qlower)) return 1;
      
      // Alphabetical order for same priority
      return aName.localeCompare(bName);
    });
    
    console.log('Geocoding results:', sorted);
    return sorted.slice(0, 10);
  };

  // Handle map click to mark fire location
  const handleMapClick = useCallback(async (location) => {
    // Open popup map centered where user clicked, so selection happens there
    try {
      setPopupCenter(location);
      setShowPopupMap(true);
    } catch (error) {
      console.error('Error opening popup map:', error);
    }
  }, []);

  // Handle popup map click
  const handlePopupMapClick = useCallback(async (location) => {
    const [lat, lng] = location;
    
    try {
      const address = await reverseGeocode(lat, lng);
      
      if (setFireLocation) {
        setFireLocation(location);
      }
      if (setCoordinates) {
        setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
      if (setAddress) {
        setAddress(address);
      }
      setSearchQuery(address);
      
      // Center main map on selected location
      if (mapReady && mapInstance) {
        safeSetView(mapInstance, location, 16);
      }
      
      // Center popup map on selected location
      if (mapReady && popupMapRef.current) {
        safeSetView(popupMapRef.current, location, 16);
      }
      
      // Call the parent's mark fire location function
      if (onMarkFireLocation) {
        onMarkFireLocation(location, address);
      }
      
      // Stop any running animations before unmounting the popup map
      if (popupMapRef.current && typeof popupMapRef.current.stop === 'function') {
        try { popupMapRef.current.stop(); } catch (_) {}
      }
      // Close popup after selection
      setShowPopupMap(false);
    } catch (error) {
      console.error('Error handling popup map click:', error);
    }
  }, [setFireLocation, setCoordinates, setAddress, onMarkFireLocation]);

  // Get current location - Google Maps style (from VehicleOfficer MapPage.js)
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      
      // Force fresh GPS reading with maximum accuracy
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          console.log("GPS Position received:", pos.coords);
          console.log("Accuracy:", pos.coords.accuracy, "meters");
          
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          
          // Get address from coordinates using reverse geocoding
          try {
            const address = await reverseGeocode(newPos[0], newPos[1]);
            if (setAddress) {
              setAddress(address);
            }
            if (setCoordinates) {
              setCoordinates(`${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}`);
            }
            if (setFireLocation) {
              setFireLocation(newPos);
            }
            setSearchQuery(address);
            
            if (mapReady && mapInstance) {
              safeSetView(mapInstance, newPos, 16);
            }
          } catch (error) {
            console.error('Error getting current location:', error);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Location error:", error);
          // Show user-friendly error message
          let errorMessage = "Location access denied";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please allow location access in your browser settings";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable - check GPS settings";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out - try again";
              break;
            default:
              errorMessage = "Location access denied - check browser settings";
              break;
          }
          setSearchQuery(`❌ ${errorMessage}`);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,  // Force high accuracy
          timeout: 60000,            // 60 seconds for mobile GPS
          maximumAge: 0              // Force fresh reading (no cache)
        }
      );
    } else {
      setSearchQuery("❌ Geolocation not supported by this browser");
      setIsLoading(false);
    }
  }, [setAddress, setCoordinates, setFireLocation]);

  // Clear fire location
  const clearFireLocation = useCallback(() => {
    if (setFireLocation) {
      setFireLocation(null);
    }
    if (setAddress) {
      setAddress('');
    }
    if (setCoordinates) {
      setCoordinates('');
    }
    setSearchQuery('');
    
    if (mapReady && mapInstance) {
      safeSetView(mapInstance, KANDY_FIRE_SERVICE, 12);
    }
  }, [setFireLocation, setAddress, setCoordinates]);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const results = await geocode(query);
        setSearchResults(results);
        setShowSearchResults(true);
        // If popup is open, keep it centered on the latest suggestion
        if (showPopupMap && results.length > 0) {
          setPopupCenter(results[0].coords);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); // 300ms delay

    setSearchTimeout(timeout);
  }, [searchTimeout, showPopupMap]);

  // Handle address search with suggestions (from VehicleOfficer MapPage.js)
  const handleAddressSearch = useCallback(async (query) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Select search result
  const selectSearchResult = useCallback(async (result) => {
    const [lat, lng] = result.coords;
    
    if (setFireLocation) {
      setFireLocation(result.coords);
    }
    if (setCoordinates) {
      setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
    if (setAddress) {
      setAddress(result.name);
    }
    setSearchQuery(result.name);
    setShowSearchResults(false);
    setPopupCenter(result.coords);
    
    // Center map on selected location
    if (mapReady && mapInstance) {
      safeSetView(mapInstance, result.coords, 16);
    }
    // Intentionally do not call onMarkFireLocation to avoid popup/toast
  }, [setFireLocation, setCoordinates, setAddress, onMarkFireLocation]);

  // Auto-search when address changes and update map
  useEffect(() => {
    if (address && address.trim() && address !== searchQuery) {
      setSearchQuery(address);
      
      // If address is provided, try to geocode it and update the map
      const geocodeAddress = async () => {
        setIsGeocoding(true);
        try {
          console.log('Starting geocoding for address:', address);
          const results = await geocode(address.trim());
          console.log('Geocoding results received:', results);
          
          if (results.length > 0) {
            const firstResult = results[0];
            const [lat, lng] = firstResult.coords;
            
            console.log('Using first result:', firstResult);
            console.log('Coordinates:', lat, lng);
            
            // Update coordinates if setCoordinates is available
            if (setCoordinates) {
              setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              console.log('Coordinates updated in form');
            }
            
            // Update fire location if setFireLocation is available
            if (setFireLocation) {
              setFireLocation(firstResult.coords);
              console.log('Fire location updated');
            }
            
            // Update the map center to show the address location
            if (mapReady && mapInstance) {
              console.log('Updating map view to:', firstResult.coords);
              safeSetView(mapInstance, firstResult.coords, 16);
            } else {
              console.log('Map not ready, scheduling delayed update');
              // If map is not ready, wait a bit and try again
              setTimeout(() => {
                if (mapInstance) {
                  console.log('Delayed map update to:', firstResult.coords);
                  safeSetView(mapInstance, firstResult.coords, 16);
                }
              }, 1000);
            }
          } else {
            console.log('No results found for address:', address);
            // Try predefined coordinates
            const addressKey = address.toLowerCase().trim();
            if (SRI_LANKAN_LOCATIONS[addressKey]) {
              console.log('Using predefined coordinates for:', addressKey);
              const coords = SRI_LANKAN_LOCATIONS[addressKey];
              const [lat, lng] = coords;
              
              if (setCoordinates) {
                setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              }
              if (setFireLocation) {
                setFireLocation(coords);
              }
              if (mapReady && mapInstance) {
                safeSetView(mapInstance, coords, 16);
              }
            }
          }
        } catch (error) {
          console.log('Error geocoding address:', error);
        } finally {
          setIsGeocoding(false);
        }
      };
      
      // Add a small delay to prevent too many API calls
      const timeoutId = setTimeout(geocodeAddress, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [address, searchQuery, setCoordinates, setFireLocation, mapReady, mapInstance]);

  // Handle map ready callback
  const handleMapReady = useCallback((map) => {
    if (map) {
      // Wait for map to be fully loaded before setting it as ready
      const checkMapLoaded = () => {
        if (map._loaded && map._container) {
          setMapInstance(map);
          setMapReady(true);
        } else {
          setTimeout(checkMapLoaded, 50);
        }
      };
      checkMapLoaded();
    }
  }, []);

  // Open popup map
  const openPopupMap = useCallback(async () => {
    // Determine target coordinates before opening popup
    let targetCoords = fireLocation;
    let targetName = address || searchQuery;

    if (!targetCoords) {
      if (searchResults && searchResults.length > 0) {
        targetCoords = searchResults[0].coords;
        targetName = searchResults[0].name || targetName;
      } else if ((searchQuery && searchQuery.trim()) || (address && address.trim())) {
        const query = (searchQuery && searchQuery.trim()) ? searchQuery : address;
        try {
          const results = await geocode(query);
          if (results && results.length > 0) {
            targetCoords = results[0].coords;
            targetName = results[0].name || targetName;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (targetCoords) {
      setPopupCenter(targetCoords);
      if (setFireLocation) setFireLocation(targetCoords);
      const [lat, lng] = targetCoords;
      if (setCoordinates) setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      if (targetName && setAddress) setAddress(targetName);
    }

    setShowPopupMap(true);
  }, [fireLocation, searchResults, searchQuery, address, setFireLocation, setCoordinates, setAddress, geocode]);

  // Keep popup map centered on the selected location while open
  useEffect(() => {
    if (showPopupMap && popupMapRef.current) {
      const coords = fireLocation || popupCenter;
      if (coords) {
        safeSetView(popupMapRef.current, coords, 16);
      }
    }
  }, [showPopupMap, fireLocation, popupCenter, safeSetView]);

  // Close popup map
  const closePopupMap = useCallback(() => {
    setShowPopupMap(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative max-w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleAddressSearch(e.target.value);
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking on them
              setTimeout(() => setShowSearchResults(false), 200);
            }}
            placeholder="Search location..."
            className="w-full h-9 rounded-full bg-white pl-4 pr-10 text-sm focus:outline-none"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {/* Search Results Dropdown (inline, not overlay) */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  selectSearchResult(result);
                }}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                    <p className="text-xs text-gray-500">{result.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls removed as map is hidden */}

      {/* Map removed per request */}

      {/* Instructions removed as map is hidden */}

      {/* Big map removed per request */}
    </div>
  );
};

export default MapComponent;
