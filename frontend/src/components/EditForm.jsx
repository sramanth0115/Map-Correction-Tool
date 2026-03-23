import React, { useState, useEffect } from 'react';

const ERROR_TYPE_LABELS = {
  wrong_road_name: 'Wrong Road Name',
  wrong_location: 'Wrong Location',
  missing_road: 'Missing Road',
  wrong_coordinates: 'Wrong Coordinates',
  wrong_business_name: 'Wrong Business Name',
  other: 'Other',
};

const STATUS_ICON = {
  pending: '⏳',
  corrected: '✅',
  flagged: '🚩',
  verified: '🔵',
};

export default function EditForm({ location, onSave }) {
  const [form, setForm] = useState({
    errorType: 'wrong_road_name',
    oldValue: '',
    newValue: '',
    lat: '',
    lng: '',
    analystNote: '',
  });

  useEffect(() => {
    if (location) {
      setForm({
        errorType: location.errorType || 'wrong_road_name',
        oldValue: location.oldValue || '',
        newValue: location.newValue || '',
        lat: String(location.lat || ''),
        lng: String(location.lng || ''),
        analystNote: location.analystNote || '',
      });
    }
  }, [location]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.newValue.trim()) {
      alert('Please fill in the correct value field');
      return;
    }
    onSave({
      ...form,
      lat: parseFloat(form.lat) || location.lat,
      lng: parseFloat(form.lng) || location.lng,
    });
  };

  if (!location) {
    return (
      <div className="no-selection">
        <div className="icon">🗺️</div>
        <h3>Select a Location</h3>
        <p>
          Click on any marker or road on the map to view its details and correct the error.
          <br /><br />
          <strong style={{ color: '#f39c12' }}>3 pre-loaded errors</strong> are visible on the map highlighted in red and amber.
        </p>
        <div style={{ marginTop: 16, fontSize: 12, lineHeight: 1.8 }}>
          <div>🔴 <span style={{ color: '#e74c3c' }}>Red</span> — Error needs fixing</div>
          <div>🟡 <span style={{ color: '#f39c12' }}>Amber</span> — Pending review</div>
          <div>🟢 <span style={{ color: '#2ecc71' }}>Green</span> — Corrected</div>
          <div>🔵 <span style={{ color: '#3498db' }}>Blue</span> — Verified</div>
        </div>
      </div>
    );
  }

  const isCorrected = location.status === 'corrected' || location.status === 'verified';

  return (
    <div className="edit-form">
      {/* Location Header */}
      <div className="location-header">
        <div className="location-id">{location.id}</div>
        <div className="location-title">{location.title}</div>
        <div className="location-desc">{location.description}</div>
        <div className={`status-badge ${location.status}`}>
          {STATUS_ICON[location.status]} {location.status.toUpperCase()}
        </div>
      </div>

      {isCorrected ? (
        <>
          <div className="already-corrected-msg">
            ✅ This issue has been corrected
          </div>
          <div className="form-group">
            <div className="form-label">Correction Applied</div>
            <div className="form-input" style={{ opacity: 0.7 }}>{location.newValue || '—'}</div>
          </div>
          {location.analystNote && (
            <div className="form-group">
              <div className="form-label">Analyst Note</div>
              <div className="form-input" style={{ opacity: 0.7 }}>{location.analystNote}</div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Error Type */}
          <div className="form-group">
            <label className="form-label">Error Type</label>
            <select
              className="form-select"
              value={form.errorType}
              onChange={e => handleChange('errorType', e.target.value)}
            >
              {Object.entries(ERROR_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Old Value */}
          <div className="form-group">
            <label className="form-label">Incorrect / Current Value</label>
            <input
              className="form-input"
              value={form.oldValue}
              onChange={e => handleChange('oldValue', e.target.value)}
              placeholder="What is wrong..."
            />
          </div>

          {/* New Value */}
          <div className="form-group">
            <label className="form-label">Correct Value ✱</label>
            <input
              className="form-input"
              value={form.newValue}
              onChange={e => handleChange('newValue', e.target.value)}
              placeholder="Enter the correct value..."
              style={{ borderColor: !form.newValue ? 'rgba(231,76,60,0.4)' : undefined }}
            />
          </div>

          {/* Coordinates */}
          <div className="form-group">
            <label className="form-label">Coordinates</label>
            <div className="coord-row">
              <input
                className="form-input"
                value={form.lat}
                onChange={e => handleChange('lat', e.target.value)}
                placeholder="Latitude"
                type="number"
                step="0.0001"
              />
              <input
                className="form-input"
                value={form.lng}
                onChange={e => handleChange('lng', e.target.value)}
                placeholder="Longitude"
                type="number"
                step="0.0001"
              />
            </div>
          </div>

          {/* Analyst Note */}
          <div className="form-group">
            <label className="form-label">Analyst Notes</label>
            <textarea
              className="form-textarea"
              value={form.analystNote}
              onChange={e => handleChange('analystNote', e.target.value)}
              placeholder="Add any additional notes about this correction..."
            />
          </div>

          {/* Save Button */}
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!form.newValue.trim()}
          >
            💾 Save Correction
          </button>
        </>
      )}
    </div>
  );
}
