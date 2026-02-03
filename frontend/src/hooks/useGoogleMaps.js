import { useState, useEffect, useRef, useCallback } from 'react';

const useGoogleMaps = (mapContainerId) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const servicesRef = useRef({});
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Track whether we have appended the script tag already
  const scriptAppendedRef = useRef(false);

  const loadGoogleMapsScript = useCallback(async (apiKey) => {
    // If already available, return immediately
    if (window.google && window.google.maps) return;
    if (scriptAppendedRef.current) {
      // Wait until script finishes loading
      await new Promise((resolve, reject) => {
        const check = () => {
          if (window.google && window.google.maps) resolve();
          else setTimeout(check, 200);
        };
        setTimeout(check, 0);
        // Optional timeout safeguard
        setTimeout(() => reject(new Error('Google Maps script load timeout')), 30000);
      });
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=places,geometry,visualization`;
    script.onerror = () => console.error('Google Maps script failed to load');
    document.head.appendChild(script);
    scriptAppendedRef.current = true;

    await new Promise((resolve, reject) => {
      script.onload = () => resolve();
      setTimeout(() => reject(new Error('Google Maps script load timeout')), 30000);
    });
  }, []);

  // Initialize map only once (after API is ready)
  const initializeMap = useCallback(() => {
    try {
      if (!window.google || !window.google.maps || typeof window.google.maps.Map !== 'function') {
        throw new Error('Google Maps API not fully initialized');
      }

      const mapElement = document.getElementById(mapContainerId);
      if (!mapElement) {
        throw new Error('Map container not found');
      }

      if (!mapRef.current) {
        const g = window.google.maps;
        mapRef.current = new g.Map(mapElement, {
          center: { lat: 7.2905, lng: 80.6337 },
          zoom: 12,
          mapTypeId: (g.MapTypeId && g.MapTypeId.ROADMAP) || 'roadmap',
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: g.MapTypeControlStyle?.HORIZONTAL_BAR,
            position: g.ControlPosition?.TOP_CENTER,
          },
          zoomControl: true,
          zoomControlOptions: { position: g.ControlPosition?.RIGHT_CENTER },
          streetViewControl: true,
          streetViewControlOptions: { position: g.ControlPosition?.RIGHT_CENTER },
          fullscreenControl: true,
          fullscreenControlOptions: { position: g.ControlPosition?.RIGHT_CENTER },
          scaleControl: true,
          rotateControl: true,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] },
            { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'on' }] }
          ]
        });

        servicesRef.current = {
          directionsService: new g.DirectionsService(),
          directionsRenderer: null,
          geocoder: new g.Geocoder(),
          placesService: (g.places ? new g.places.PlacesService(mapRef.current) : null),
          streetViewService: new g.StreetViewService(),
          infoWindow: new g.InfoWindow()
        };
        infoWindowRef.current = servicesRef.current.infoWindow;
      }

      setIsLoaded(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Google Maps initialization error:', err);
      setError(err.message || 'Failed to initialize Google Maps');
      setIsLoading(false);
      setIsLoaded(false);
    }
  }, [mapContainerId]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
          if (!cancelled) initializeMap();
          return;
        }

        const envApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const fallbackApiKey = 'AIzaSyCYgLMGrp-EwbteVoFJBRzcKAbKMKfhEh4';
        const apiKey = envApiKey || fallbackApiKey;
        if (!envApiKey) console.warn('REACT_APP_GOOGLE_MAPS_API_KEY not set. Using fallback key from previous setup.');

        setIsLoading(true);
        setError(null);

        // Attempt to load the script with simple retry
        let attempts = 0;
        const tryLoad = async () => {
          attempts += 1;
          try {
            await loadGoogleMapsScript(apiKey);
            if (!window.google || !window.google.maps) throw new Error('Google Maps core not available after load');
          } catch (e) {
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, attempts * 1000));
              return tryLoad();
            }
            throw e;
          }
        };

        await tryLoad();
        if (!cancelled) initializeMap();
      } catch (e) {
        if (!cancelled) {
          console.error('Google Maps API load error:', e);
          setError('Google Maps failed to load. Check API key and network.');
          setIsLoading(false);
          setIsLoaded(false);
        }
      }
    };

    start();
    return () => { cancelled = true; };
  }, [initializeMap, loadGoogleMapsScript]);

  // Map control functions
  const setMapCenter = useCallback((center, zoom = null) => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      if (zoom !== null) {
        mapRef.current.setZoom(zoom);
      }
    }
  }, []);

  const setMapZoom = useCallback((zoom) => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, []);

  const addMarker = useCallback((position, options = {}) => {
    if (mapRef.current && window.google) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        optimized: false, // Disable optimization for better animation
        ...options
      });
      markersRef.current.push(marker);
      return marker;
    }
    return null;
  }, []);

  const updateMarker = useCallback((marker, newPosition, newOptions = {}) => {
    if (marker && window.google) {
      marker.setPosition(newPosition);
      if (newOptions.icon) marker.setIcon(newOptions.icon);
      if (newOptions.animation !== undefined) marker.setAnimation(newOptions.animation);
      if (newOptions.title) marker.setTitle(newOptions.title);
    }
    return marker;
  }, []);

  const removeMarker = useCallback((marker) => {
    if (marker && marker.setMap) {
      marker.setMap(null);
      const index = markersRef.current.indexOf(marker);
      if (index > -1) {
        markersRef.current.splice(index, 1);
      }
    }
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  const showInfoWindow = useCallback((content, position) => {
    if (infoWindowRef.current && mapRef.current) {
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.setPosition(position);
      infoWindowRef.current.open(mapRef.current);
    }
  }, []);

  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    clearMarkers();
    if (servicesRef.current.directionsRenderer) {
      servicesRef.current.directionsRenderer.setMap(null);
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [clearMarkers]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    map: mapRef.current,
    services: servicesRef.current,
    isLoaded,
    isLoading,
    error,
    setMapCenter,
    setMapZoom,
    addMarker,
    updateMarker,
    removeMarker,
    clearMarkers,
    showInfoWindow,
    closeInfoWindow,
    cleanup
  };
};

export default useGoogleMaps;