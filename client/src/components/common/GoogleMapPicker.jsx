import React, { useEffect, useRef, useState } from 'react';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';
const isMapTilerActive = MAPTILER_API_KEY && MAPTILER_API_KEY !== 'YOUR_MAPTILER_API_KEY_HERE';

let leafletLoaded = false;
let leafletLoadPromise = null;

const loadLeaflet = () => {
  if (leafletLoaded && window.L) return Promise.resolve();
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    if (window.L) {
      leafletLoaded = true;
      resolve();
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      leafletLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Leaflet map library'));
    document.head.appendChild(script);
  });

  return leafletLoadPromise;
};

// Helper to preserve the user's typed house number (e.g. "50", "133/4") if geocoding only returns street level
const prependHouseNumber = (typedQuery, displayName) => {
  if (!typedQuery) return displayName;
  
  // Match any digits, letters, slashes, or dashes at the start of the query followed by a space
  const match = typedQuery.trim().match(/^([0-9a-zA-Z\/\-]+)\s+/);
  if (match) {
    const houseNum = match[1];
    const normDisplayName = displayName.toLowerCase();
    const normHouseNum = houseNum.toLowerCase();
    
    // Check if the displayName already contains this house number
    const alreadyHas = normDisplayName.startsWith(normHouseNum) || 
                     normDisplayName.includes(` ${normHouseNum} `) ||
                     normDisplayName.includes(` ${normHouseNum},`);
                     
    if (!alreadyHas) {
      return `${houseNum} ${displayName}`;
    }
  }
  return displayName;
};

/**
 * GoogleMapPicker - MapTiler implementation with Leaflet fallback.
 * Premium vector-style maps with MapTiler Streets style.
 */
const GoogleMapPicker = ({
  address = '',
  onAddressChange,
  latitude,
  longitude,
  onLocationChange,
  placeholder = 'Nhập địa chỉ để tìm kiếm...',
  className = '',
  readOnly = false,
  height = '300px',
  inputId = 'map-address-input',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(address);
  const [lastTypedTerm, setLastTypedTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Da Nang default coords
  const defaultCenter = { lat: 16.047079, lng: 108.206230 };

  // Update internal search term when parent address changes (only if not actively typing)
  useEffect(() => {
    if (address !== searchTerm) {
      setSearchTerm(address);
    }
  }, [address]);

  // Load Leaflet CSS and JS
  useEffect(() => {
    loadLeaflet()
      .then(() => setApiLoaded(true))
      .catch((err) => setLoadError(err.message));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!apiLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const hasCoords = latitude && longitude;
    const center = hasCoords
      ? [parseFloat(latitude), parseFloat(longitude)]
      : [defaultCenter.lat, defaultCenter.lng];

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, hasCoords ? 16 : 13);

    // Set MapTiler or OpenStreetMap Tile Layer
    const tileUrl = isMapTilerActive
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = isMapTilerActive
      ? '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: attribution
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom marker icon to render correctly without leaflet's default asset issues
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create marker
    const marker = L.marker(center, {
      draggable: !readOnly,
      icon: customIcon
    }).addTo(map);

    if (!readOnly) {
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        reverseGeocode(lat, lng);
      });
    }

    markerRef.current = marker;

    // Geocoding fallback: If coordinates are missing from database but address text is present,
    // automatically look up coordinates and position map marker
    if (!hasCoords && address && address.trim().length > 3) {
      const queryAddr = address;
      const url = isMapTilerActive
        ? `https://api.maptiler.com/geocoding/${encodeURIComponent(queryAddr)}.json?key=${MAPTILER_API_KEY}&country=vn&limit=1`
        : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryAddr)}&countrycodes=vn&addressdetails=1&limit=1`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          const results = isMapTilerActive
            ? (data.features || []).map(f => ({
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0]
              }))
            : data;

          if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            const pos = [lat, lng];
            
            marker.setLatLng(pos);
            map.setView(pos, 16);
          }
        })
        .catch(err => console.error("Auto geocoding fallback error:", err));
    }
  }, [apiLoaded]);

  // Handle updates to latitude/longitude from props
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;
    const pos = [parseFloat(latitude), parseFloat(longitude)];

    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    }
    mapInstanceRef.current.setView(pos, 16);
  }, [latitude, longitude]);

  // Reverse Geocoding via MapTiler / Nominatim
  const reverseGeocode = (lat, lng) => {
    const url = isMapTilerActive
      ? `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_API_KEY}`
      : `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setLastTypedTerm(''); // Prevent search trigger
        let displayAddr = '';
        let city = '';
        let district = '';
        
        if (isMapTilerActive) {
          if (data.features && data.features.length > 0) {
            const f = data.features[0];
            displayAddr = f.place_name;
            if (f.context) {
              f.context.forEach(c => {
                if (c.id.startsWith('city') || c.id.startsWith('province') || c.id.startsWith('region')) {
                  city = c.text;
                } else if (c.id.startsWith('district') || c.id.startsWith('county') || c.id.startsWith('municipality')) {
                  district = c.text;
                }
              });
            }
            onLocationChange?.({ lat, lng, address: displayAddr, city, district });
          } else {
            onLocationChange?.({ lat, lng, address: address || `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}` });
          }
        } else {
          if (data && data.display_name) {
            displayAddr = simplifyAddress(data);
            const addr = data.address || {};
            city = addr.city || addr.province || addr.state || '';
            district = addr.city_district || addr.district || addr.county || addr.suburb || '';
            onLocationChange?.({ lat, lng, address: displayAddr, city, district });
          } else {
            onLocationChange?.({ lat, lng, address: address || `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}` });
          }
        }
      })
      .catch(err => {
        console.error("Reverse geocode error:", err);
        onLocationChange?.({ lat, lng, address: address || `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      });
  };

  // Autocomplete suggestions search (debounced)
  useEffect(() => {
    if (readOnly || !searchTerm || searchTerm.length < 3 || searchTerm !== lastTypedTerm) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const url = isMapTilerActive
        ? `https://api.maptiler.com/geocoding/${encodeURIComponent(searchTerm)}.json?key=${MAPTILER_API_KEY}&country=vn&limit=5`
        : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=vn&addressdetails=1&limit=5`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (isMapTilerActive) {
            const list = (data.features || []).map(f => {
              let city = '';
              let district = '';
              if (f.context) {
                f.context.forEach(c => {
                  if (c.id.startsWith('city') || c.id.startsWith('province') || c.id.startsWith('region')) {
                    city = c.text;
                  } else if (c.id.startsWith('district') || c.id.startsWith('county') || c.id.startsWith('municipality')) {
                    district = c.text;
                  }
                });
              }
              return {
                display_name: f.place_name,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                city,
                district
              };
            });
            setSuggestions(list);
          } else {
            const list = data.map(item => {
              const addr = item.address || {};
              const city = addr.city || addr.province || addr.state || '';
              const district = addr.city_district || addr.district || addr.county || addr.suburb || '';
              return {
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                city,
                district
              };
            });
            setSuggestions(list);
          }
          setShowSuggestions(true);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm, readOnly, lastTypedTerm]);

  // Manual search trigger (on click or Enter key)
  const handleSearch = (termToSearch) => {
    const query = termToSearch || searchTerm;
    if (!query || query.length < 3) return;

    setIsSearching(true);
    const url = isMapTilerActive
      ? `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&country=vn&limit=5`
      : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&addressdetails=1&limit=5`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setIsSearching(false);
        const results = isMapTilerActive
          ? (data.features || []).map(f => {
              let city = '';
              let district = '';
              if (f.context) {
                f.context.forEach(c => {
                  if (c.id.startsWith('city') || c.id.startsWith('province') || c.id.startsWith('region')) {
                    city = c.text;
                  } else if (c.id.startsWith('district') || c.id.startsWith('county') || c.id.startsWith('municipality')) {
                    district = c.text;
                  }
                });
              }
              return {
                display_name: f.place_name,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                city,
                district
              };
            })
          : data.map(item => {
              const addr = item.address || {};
              const city = addr.city || addr.province || addr.state || '';
              const district = addr.city_district || addr.district || addr.county || addr.suburb || '';
              return {
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                city,
                district
              };
            });

        if (results && results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);

          // Automatically select and center on the first result
          const firstResult = results[0];
          const lat = parseFloat(firstResult.lat);
          const lng = parseFloat(firstResult.lon);
          let displayAddr = firstResult.display_name;
          
          displayAddr = prependHouseNumber(lastTypedTerm || searchTerm, displayAddr);

          setSearchTerm(displayAddr);
          setLastTypedTerm(''); // Prevent search loops
          onLocationChange?.({ lat, lng, address: displayAddr, city: firstResult.city, district: firstResult.district });

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
          }
        }
      })
      .catch(err => {
        console.error("Manual search error:", err);
        setIsSearching(false);
      });
  };

  // Select suggestion
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    let displayAddr = item.display_name;

    displayAddr = prependHouseNumber(lastTypedTerm || searchTerm, displayAddr);

    setSearchTerm(displayAddr);
    setLastTypedTerm(''); // Reset typed term
    setShowSuggestions(false);
    onLocationChange?.({ lat, lng, address: displayAddr, city: item.city, district: item.district });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  };

  // Simplifies Nominatim address output to sound more natural in Vietnamese
  const simplifyAddress = (item) => {
    if (!item.address) return item.display_name;
    const addr = item.address;
    const parts = [];
    
    // Road/Street
    if (addr.road) {
      if (addr.house_number) parts.push(`${addr.house_number} ${addr.road}`);
      else parts.push(addr.road);
    } else if (addr.suburb) {
      parts.push(addr.suburb);
    }
    
    // Ward/Quarter
    if (addr.quarter || addr.suburb) {
      parts.push(addr.quarter || addr.suburb);
    }
    
    // District
    if (addr.suburb && addr.suburb.includes('Quận')) {
      parts.push(addr.suburb);
    } else if (addr.district) {
      parts.push(addr.district);
    } else if (addr.city_district) {
      parts.push(addr.city_district);
    } else if (addr.county) {
      parts.push(addr.county);
    }
    
    // City
    if (addr.city) {
      parts.push(addr.city);
    } else if (addr.province) {
      parts.push(addr.province);
    } else if (addr.state) {
      parts.push(addr.state);
    }

    // Filter unique parts
    const uniqueParts = Array.from(new Set(parts)).filter(Boolean);
    return uniqueParts.length > 0 ? uniqueParts.join(', ') : item.display_name;
  };

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
    <div className="google-map-picker" style={{ position: 'relative' }}>
      {/* Search Input with Autocomplete (OpenStreetMap / MapTiler) */}
      {!readOnly && (
        <div style={{ position: 'relative', marginBottom: '12px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id={inputId}
              type="text"
              className={className}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                setLastTypedTerm(val);
                onAddressChange?.(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
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
            />
            
            {/* Map Pin SVG Icon */}
            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            style={{
              padding: '0 16px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#4338ca'}
            onMouseLeave={(e) => e.target.style.background = '#4f46e5'}
          >
            {isSearching ? 'Đang tìm...' : 'Tìm vị trí'}
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 9999,
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f3f4f6',
                    color: '#374151',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  📍 {item.display_name}
                </div>
              ))}
            </div>
          )}

          {/* Close suggestions on click outside */}
          {showSuggestions && (
            <div 
              onClick={() => setShowSuggestions(false)}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9998,
                background: 'transparent'
              }}
            />
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          background: '#f3f4f6',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
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
            Đang tải bản đồ...
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
          <span>📍 Tọa độ chính xác:</span>
          <span><strong>Vĩ độ (Lat):</strong> {parseFloat(latitude).toFixed(6)}</span>
          <span><strong>Kinh độ (Lng):</strong> {parseFloat(longitude).toFixed(6)}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        /* Leaflet marker CSS override to prevent global stylesheet conflicts from shifting the marker icon */
        .leaflet-container img.leaflet-marker-icon {
          max-width: none !important;
          max-height: none !important;
          width: 25px !important;
          height: 41px !important;
        }
        .leaflet-container img.leaflet-marker-shadow {
          max-width: none !important;
          max-height: none !important;
          width: 41px !important;
          height: 41px !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleMapPicker;
