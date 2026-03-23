import React, { useState, useCallback } from 'react';
import MapView from './components/Map';
import Sidebar from './components/Sidebar';
import './App.css';

// ─── Pre-loaded test cases ───────────────────────────────────────────────────
const INITIAL_LOCATIONS = [
  {
    id: 'LOC-001',
    type: 'road',
    errorType: 'wrong_road_name',
    title: 'Wrong Road Name',
    description: 'Road is labelled "Main Rd" — correct name is "Main Road"',
    oldValue: 'Main Rd',
    newValue: '',
    lat: 17.385,
    lng: 78.4867,
    status: 'pending',
    analystNote: '',
  },
  {
    id: 'LOC-002',
    type: 'marker',
    errorType: 'wrong_location',
    title: 'Wrong Business Location',
    description: 'ABC Cafe marker is placed at wrong coordinates',
    oldValue: 'Lat: 17.3900, Lng: 78.4900',
    newValue: '',
    lat: 17.39,
    lng: 78.49,
    correctedLat: 17.3950,
    correctedLng: 78.4850,
    status: 'pending',
    analystNote: '',
  },
  {
    id: 'LOC-003',
    type: 'missing_road',
    errorType: 'missing_road',
    title: 'Missing Road',
    description: 'Newly constructed road not present on map',
    oldValue: 'Road not on map',
    newValue: '',
    lat: 17.375,
    lng: 78.478,
    points: [
      [17.375, 78.478],
      [17.377, 78.482],
      [17.379, 78.486],
    ],
    status: 'pending',
    analystNote: '',
  },
];

export default function App() {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setSidebarTab] = useState('edit'); // 'edit' | 'log' | 'stats' | 'distance'
  const [correctionLog, setCorrectionLog] = useState([]);
  const [mode, setMode] = useState('select'); // 'select' | 'edit' | 'add_road' | 'flag'
  const [analystName, setAnalystName] = useState('GIS Analyst');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [mouseCoords, setMouseCoords] = useState({ lat: 0, lng: 0 });
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSelectLocation = useCallback((loc) => {
    setSelectedLocation(loc);
    setSidebarTab('edit');
  }, []);

  const handleSaveCorrection = useCallback((formData) => {
    const now = new Date();
    const updatedLocation = {
      ...selectedLocation,
      ...formData,
      status: 'corrected',
    };

    // Update location in state
    setLocations(prev =>
      prev.map(l => l.id === selectedLocation.id ? updatedLocation : l)
    );

    // Add to correction log
    const logEntry = {
      id: `LOG-${String(correctionLog.length + 1).padStart(3, '0')}`,
      locationId: selectedLocation.id,
      errorType: formData.errorType,
      oldValue: formData.oldValue,
      newValue: formData.newValue,
      analystName: analystName,
      timestamp: now.toISOString(),
      status: 'corrected',
      notes: formData.analystNote,
    };

    setCorrectionLog(prev => [logEntry, ...prev]);

    // Save to backend (non-blocking)
    fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: selectedLocation.id,
        errorType: formData.errorType,
        oldValue: formData.oldValue,
        newValue: formData.newValue,
        lat: formData.lat,
        lng: formData.lng,
        analystName,
        notes: formData.analystNote,
        status: 'corrected',
      }),
    }).catch(() => {}); // silent fail if backend is down

    setSelectedLocation(updatedLocation);
    showNotification(`✅ Correction saved for ${selectedLocation.id}`);
  }, [selectedLocation, correctionLog.length, analystName, showNotification]);

  const handleAddRoad = useCallback((points) => {
    if (points.length < 2) {
      showNotification('Please add at least 2 points to draw a road', 'error');
      return;
    }

    const newRoad = {
      id: `LOC-${String(locations.length + 1).padStart(3, '0')}`,
      type: 'added_road',
      errorType: 'missing_road',
      title: 'Added Road',
      description: 'Newly drawn road segment',
      oldValue: 'Road not on map',
      newValue: 'Road added by analyst',
      lat: points[0][0],
      lng: points[0][1],
      points: points,
      status: 'corrected',
      analystNote: '',
    };

    setLocations(prev => [...prev, newRoad]);

    const logEntry = {
      id: `LOG-${String(correctionLog.length + 1).padStart(3, '0')}`,
      locationId: newRoad.id,
      errorType: 'missing_road',
      oldValue: 'Road not on map',
      newValue: `Road drawn with ${points.length} points`,
      analystName: analystName,
      timestamp: new Date().toISOString(),
      status: 'corrected',
      notes: `Start: ${points[0][0].toFixed(4)},${points[0][1].toFixed(4)} → End: ${points[points.length-1][0].toFixed(4)},${points[points.length-1][1].toFixed(4)}`,
    };

    setCorrectionLog(prev => [logEntry, ...prev]);
    setDrawingPoints([]);
    setMode('select');
    showNotification(`✅ Road added successfully as ${newRoad.id}`);
  }, [locations.length, correctionLog.length, analystName, showNotification]);

  const handleMarkerDrag = useCallback((locationId, newLat, newLng) => {
    setLocations(prev =>
      prev.map(l => l.id === locationId ? { ...l, lat: newLat, lng: newLng } : l)
    );
    if (selectedLocation && selectedLocation.id === locationId) {
      setSelectedLocation(prev => ({ ...prev, lat: newLat, lng: newLng }));
    }
  }, [selectedLocation]);

  const handleFlagError = useCallback((latlng) => {
    const newFlag = {
      id: `LOC-${String(locations.length + 1).padStart(3, '0')}`,
      type: 'marker',
      errorType: 'other',
      title: 'Flagged Error',
      description: 'Error flagged by analyst for review',
      oldValue: '',
      newValue: '',
      lat: latlng.lat,
      lng: latlng.lng,
      status: 'flagged',
      analystNote: '',
    };
    setLocations(prev => [...prev, newFlag]);
    showNotification(`🚩 Error flagged at ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
  }, [locations.length, showNotification]);

  const stats = {
    total: locations.length,
    corrected: locations.filter(l => l.status === 'corrected').length,
    pending: locations.filter(l => l.status === 'pending').length,
    flagged: locations.filter(l => l.status === 'flagged').length,
    byType: locations.reduce((acc, l) => {
      acc[l.errorType] = (acc[l.errorType] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🗺️</span>
            <div>
              <h1>Map Data Correction Tool</h1>
              <p>GIS Error Detection & Resolution Platform</p>
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="toolbar">
            {[
              { key: 'select', icon: '🖱️', label: 'Select' },
              { key: 'edit', icon: '✏️', label: 'Edit' },
              { key: 'add_road', icon: '🛣️', label: 'Add Road' },
              { key: 'flag', icon: '🚩', label: 'Flag Error' },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`tool-btn ${mode === key ? 'active' : ''}`}
                onClick={() => {
                  setMode(key);
                  if (key !== 'add_road') setDrawingPoints([]);
                }}
                title={label}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="header-right">
          <div className="analyst-input">
            <label>👤 Analyst:</label>
            <input
              type="text"
              value={analystName}
              onChange={e => setAnalystName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="stats-mini">
            <span className="stat-pill corrected">✅ {stats.corrected}</span>
            <span className="stat-pill pending">⏳ {stats.pending}</span>
            <span className="stat-pill flagged">🚩 {stats.flagged}</span>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Main Layout */}
      <div className="main-layout">
        <div className="map-container">
          <MapView
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            mode={mode}
            drawingPoints={drawingPoints}
            setDrawingPoints={setDrawingPoints}
            onAddRoad={handleAddRoad}
            onMarkerDrag={handleMarkerDrag}
            onFlagError={handleFlagError}
            onMouseMove={setMouseCoords}
          />
          <div className="coord-bar">
            <span>📍 Lat: <strong>{mouseCoords.lat.toFixed(5)}</strong></span>
            <span>Lng: <strong>{mouseCoords.lng.toFixed(5)}</strong></span>
            <span className="mode-badge">Mode: <strong>{mode.replace('_', ' ').toUpperCase()}</strong></span>
            {mode === 'add_road' && (
              <span className="drawing-hint">
                🛣️ Click on map to add road points ({drawingPoints.length} points)
                {drawingPoints.length >= 2 && (
                  <button
                    className="confirm-road-btn"
                    onClick={() => handleAddRoad(drawingPoints)}
                  >
                    ✅ Confirm Road
                  </button>
                )}
                {drawingPoints.length > 0 && (
                  <button
                    className="cancel-road-btn"
                    onClick={() => setDrawingPoints([])}
                  >
                    ❌ Clear
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        <Sidebar
          selectedLocation={selectedLocation}
          activeTab={activeTab}
          onTabChange={setSidebarTab}
          onSaveCorrection={handleSaveCorrection}
          correctionLog={correctionLog}
          stats={stats}
          analystName={analystName}
        />
      </div>
    </div>
  );
}
