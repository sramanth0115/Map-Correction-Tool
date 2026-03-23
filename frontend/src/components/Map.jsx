import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  pending: '#f39c12',
  corrected: '#2ecc71',
  flagged: '#e74c3c',
  verified: '#3498db',
};

const ERROR_ICONS = {
  wrong_road_name: '🛣️',
  wrong_location: '📍',
  missing_road: '➕',
  wrong_coordinates: '📡',
  wrong_business_name: '🏪',
  other: '⚠️',
};

function createMarkerIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">${emoji}</span>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export default function MapView({
  locations,
  selectedLocation,
  onSelectLocation,
  mode,
  drawingPoints,
  setDrawingPoints,
  onAddRoad,
  onMarkerDrag,
  onFlagError,
  onMouseMove,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef({});
  const drawingPolylineRef = useRef(null);
  const drawingMarkersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [17.385, 78.4867],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('mousemove', (e) => {
      onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;
  }, [onMouseMove]);

  // Handle map click based on mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e) => {
      if (mode === 'add_road') {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        setDrawingPoints(prev => [...prev, newPoint]);

        // Add a small circle for each point
        const circle = L.circleMarker(newPoint, {
          radius: 5,
          color: '#f39c12',
          fillColor: '#f39c12',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        drawingMarkersRef.current.push(circle);
      } else if (mode === 'flag') {
        onFlagError(e.latlng);
      }
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [mode, setDrawingPoints, onFlagError]);

  // Draw the in-progress polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawingPolylineRef.current) {
      map.removeLayer(drawingPolylineRef.current);
      drawingPolylineRef.current = null;
    }

    // Clear old drawing markers if points were cleared
    if (drawingPoints.length === 0) {
      drawingMarkersRef.current.forEach(m => map.removeLayer(m));
      drawingMarkersRef.current = [];
    }

    if (drawingPoints.length >= 2) {
      drawingPolylineRef.current = L.polyline(drawingPoints, {
        color: '#f39c12',
        weight: 3,
        dashArray: '8 4',
        opacity: 0.9,
      }).addTo(map);
    }
  }, [drawingPoints]);

  // Render all locations on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers and polylines
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    Object.values(polylinesRef.current).forEach(p => map.removeLayer(p));
    markersRef.current = {};
    polylinesRef.current = {};

    locations.forEach(loc => {
      const color = STATUS_COLORS[loc.status] || '#9b59b6';
      const emoji = ERROR_ICONS[loc.errorType] || '❓';

      if (loc.type === 'missing_road' || loc.type === 'added_road') {
        const isAdded = loc.type === 'added_road';
        const polyline = L.polyline(loc.points, {
          color: isAdded ? '#2ecc71' : '#e74c3c',
          weight: isAdded ? 4 : 3,
          dashArray: isAdded ? null : '10 6',
          opacity: 0.9,
        }).addTo(map);

        const popupHtml = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-size: 11px; color: #9099b8; margin-bottom: 2px;">${loc.id}</div>
            <div style="font-size: 14px; font-weight: 700; color: #e8eaf6; margin-bottom: 4px;">${loc.title}</div>
            <div style="font-size: 11px; color: #9099b8;">${loc.description}</div>
            <div style="margin-top: 8px;">
              <span style="background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; border: 1px solid ${color}44;">
                ${loc.status.toUpperCase()}
              </span>
            </div>
          </div>`;

        polyline.bindPopup(popupHtml);
        polyline.on('click', () => onSelectLocation(loc));
        polylinesRef.current[loc.id] = polyline;

        // Also show a midpoint marker
        const midIdx = Math.floor(loc.points.length / 2);
        const midPoint = loc.points[midIdx];
        const icon = createMarkerIcon(color, emoji);
        const marker = L.marker(midPoint, { icon }).addTo(map);
        marker.on('click', () => onSelectLocation(loc));
        markersRef.current[loc.id + '_mid'] = marker;

      } else {
        const icon = createMarkerIcon(color, emoji);
        const marker = L.marker([loc.lat, loc.lng], {
          icon,
          draggable: mode === 'edit',
        }).addTo(map);

        const popupHtml = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-size: 11px; color: #9099b8; margin-bottom: 2px;">${loc.id}</div>
            <div style="font-size: 14px; font-weight: 700; color: #e8eaf6; margin-bottom: 4px;">${loc.title}</div>
            <div style="font-size: 11px; color: #9099b8; margin-bottom: 4px;">${loc.description}</div>
            <div style="font-size: 11px; color: #9099b8;">
              ${loc.oldValue ? `<div>⚠️ Error: <em>${loc.oldValue}</em></div>` : ''}
            </div>
            <div style="margin-top: 8px;">
              <span style="background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; border: 1px solid ${color}44;">
                ${loc.status.toUpperCase()}
              </span>
            </div>
          </div>`;

        marker.bindPopup(popupHtml);
        marker.on('click', () => onSelectLocation(loc));
        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMarkerDrag(loc.id, lat, lng);
        });

        markersRef.current[loc.id] = marker;
      }
    });
  }, [locations, mode, onSelectLocation, onMarkerDrag]);

  // Pan to selected location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;
    map.setView([selectedLocation.lat, selectedLocation.lng], 15, { animate: true });

    // Open popup
    const marker = markersRef.current[selectedLocation.id];
    if (marker) marker.openPopup();
  }, [selectedLocation]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: 'calc(100% - 36px)',
        cursor: mode === 'add_road' ? 'crosshair' :
                mode === 'flag' ? 'cell' :
                mode === 'edit' ? 'move' : 'default',
      }}
    />
  );
}
