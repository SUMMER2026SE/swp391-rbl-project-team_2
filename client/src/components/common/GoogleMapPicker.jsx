import React, { useEffect, useRef, useState, useCallback } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsLoaded = false;
let googleMapsLoadPromise = null;

const loadGoogleMapsScript = () => {
  if (googleMapsLoaded && window.google?.maps) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        googleMapsLoaded = true;
        resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=vi`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};

/**
 * GoogleMapPicker - Reusable component for address autocomplete + map marker selection.
 *
 * Props:
 * - address: string - Current address value
 * - onAddressChange: (address: string) => void - Called when address text changes
 * - latitude: number|null - Current latitude
 * - longitude: number|null - Current longitude
 * - onLocationChange: ({ lat, lng, address }) => void - Called when location is selected/dragged
 * - placeholder: string - Input placeholder
 * - className: string - Extra CSS class for the input
 * - readOnly: boolean - If true, shows map only (no autocomplete editing)
 * - height: string - Map container height (default: '300px')
 * - inputId: string - HTML id for the input element
 */
const GoogleMapPicker = ({
  address = '',
  onAddressChange,
  latitude,
  longitude,
  onLocationChange,
  placeholder = 'Enter address...',
  className = '',
  readOnly = false,
  height = '300px',
  inputId = 'google-map-address-input',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Default center: Da Nang, Vietnam
  const defaultCenter = { lat: 16.047079, lng: 108.206230 };

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    loadGoogleMapsScript()
      .then(() => setApiLoaded(true))
      .catch((err) => setLoadError(err.message));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstanceRef.current) return;

    const center = (latitude && longitude)
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : defaultCenter;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: (latitude && longitude) ? 16 : 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Add marker
    if (latitude && longitude) {
      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: !readOnly,
        animation: window.google.maps.Animation.DROP,
        title: readOnly ? address : 'Drag to adjust location',
      });

      if (!readOnly) {
        marker.addListener('dragend', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          // Reverse geocode the new position
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              onLocationChange?.({
                lat,
                lng,
                address: results[0].formatted_address,
              });
            } else {
              onLocationChange?.({ lat, lng, address: address });
            }
          });
        });
      }

      markerRef.current = marker;
    }

    setMapReady(true);
  }, [apiLoaded]);

  // Update marker when lat/lng props change
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    const pos = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        draggable: !readOnly,
        animation: window.google.maps.Animation.DROP,
      });

      if (!readOnly) {
        marker.addListener('dragend', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              onLocationChange?.({
                lat,
                lng,
                address: results[0].formatted_address,
              });
            } else {
              onLocationChange?.({ lat, lng, address });
            }
          });
        });
      }

      markerRef.current = marker;
    }

    mapInstanceRef.current.panTo(pos);
    mapInstanceRef.current.setZoom(16);
  }, [latitude, longitude]);

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!apiLoaded || !inputRef.current || readOnly || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'vn' },
      fields: ['formatted_address', 'geometry', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const formattedAddress = place.formatted_address || place.name || '';

      onLocationChange?.({ lat, lng, address: formattedAddress });

      // Update map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
        mapInstanceRef.current.setZoom(16);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [apiLoaded, readOnly]);

  if (loadError) {
    return (
      <div style={{
        padding: '16px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        fontSize: '14px',
      }}>
        ⚠️ {loadError}
      </div>
    );
  }

  return (
    <div className="google-map-picker">
      {/* Address Input with Autocomplete */}
      {!readOnly && (
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className={className}
            placeholder={placeholder}
            value={address}
            onChange={(e) => onAddressChange?.(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <MapPinIcon style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!apiLoaded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
            fontSize: '14px',
            gap: '8px',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Loading map...
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {latitude && longitude && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px',
          padding: '8px 12px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          fontSize: '13px',
          color: '#166534',
        }}>
          <span>📍</span>
          <span><strong>Lat:</strong> {parseFloat(latitude).toFixed(6)}</span>
          <span><strong>Lng:</strong> {parseFloat(longitude).toFixed(6)}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .google-map-picker .pac-container {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-top: 4px;
          font-family: inherit;
          z-index: 10000;
        }
        .google-map-picker .pac-item {
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
        }
        .google-map-picker .pac-item:hover {
          background: #f0f9ff;
        }
      `}</style>
    </div>
  );
};

// Simple inline MapPin SVG icon
const MapPinIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default GoogleMapPicker;
