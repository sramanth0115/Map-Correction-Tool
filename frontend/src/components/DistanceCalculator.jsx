import React, { useState } from 'react';

// Haversine formula — calculates great-circle distance between two lat/lng points
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = d => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const PRESETS = [
  {
    label: 'LOC-001 → LOC-002 (Test Case Distance)',
    lat1: 17.385, lon1: 78.4867, lat2: 17.39, lon2: 78.49,
  },
  {
    label: 'Hyderabad → Mumbai',
    lat1: 17.385, lon1: 78.4867, lat2: 19.0760, lon2: 72.8777,
  },
  {
    label: 'Delhi → Bangalore',
    lat1: 28.6139, lon1: 77.2090, lat2: 12.9716, lon2: 77.5946,
  },
];

export default function DistanceCalculator() {
  const [lat1, setLat1] = useState('17.3850');
  const [lon1, setLon1] = useState('78.4867');
  const [lat2, setLat2] = useState('17.3900');
  const [lon2, setLon2] = useState('78.4900');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const a = parseFloat(lat1), b = parseFloat(lon1);
    const c = parseFloat(lat2), d = parseFloat(lon2);
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
      alert('Please enter valid coordinates');
      return;
    }
    const dist = haversine(a, b, c, d);
    setResult(dist);
  };

  const applyPreset = (p) => {
    setLat1(String(p.lat1));
    setLon1(String(p.lon1));
    setLat2(String(p.lat2));
    setLon2(String(p.lon2));
    setResult(null);
  };

  return (
    <div className="distance-calc">
      <div style={{
        background: 'rgba(79,142,247,0.08)',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 8,
        padding: 12,
        fontSize: 12,
        color: '#9099b8',
        lineHeight: 1.6,
      }}>
        📐 <strong style={{ color: '#4f8ef7' }}>Distance Calculator</strong><br />
        Uses the Haversine formula to calculate the real-world distance between two coordinate points on Earth's surface.
      </div>

      {/* Quick presets */}
      <div>
        <div className="calc-section-title">Quick Presets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '7px 10px',
                color: 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.borderColor = '#4f8ef7'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >
              📍 {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Point A */}
      <div>
        <div className="calc-section-title">📍 Point A</div>
        <div className="coord-row">
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={lat1}
              onChange={e => setLat1(e.target.value)}
              placeholder="e.g. 17.3850"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={lon1}
              onChange={e => setLon1(e.target.value)}
              placeholder="e.g. 78.4867"
            />
          </div>
        </div>
      </div>

      {/* Point B */}
      <div>
        <div className="calc-section-title">📍 Point B</div>
        <div className="coord-row">
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={lat2}
              onChange={e => setLat2(e.target.value)}
              placeholder="e.g. 17.3900"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={lon2}
              onChange={e => setLon2(e.target.value)}
              placeholder="e.g. 78.4900"
            />
          </div>
        </div>
      </div>

      <button className="calc-btn" onClick={calculate}>
        🔢 Calculate Distance
      </button>

      {result !== null && (
        <div className="distance-result">
          <div className="distance-value">
            {result < 1
              ? <>{(result * 1000).toFixed(0)}<span className="distance-unit"> m</span></>
              : <>{result.toFixed(3)}<span className="distance-unit"> km</span></>
            }
          </div>
          <div className="distance-label">
            Straight-line distance (great circle)
            {result < 1 && <><br /><span style={{ fontSize: 14, color: '#4f8ef7' }}>≈ {(result * 1000).toFixed(0)} metres</span></>}
          </div>
        </div>
      )}

      <div className="formula-note">
        <strong>Haversine Formula:</strong><br />
        a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlon/2)<br />
        c = 2 × atan2(√a, √(1−a))<br />
        d = R × c &nbsp;&nbsp; (R = 6371 km, Earth's radius)<br /><br />
        This is the standard formula used in GPS navigation systems and professional GIS software to measure distances on the Earth's curved surface.
      </div>
    </div>
  );
}
