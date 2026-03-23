import React from 'react';

const ERROR_TYPE_LABELS = {
  wrong_road_name: 'Road Name',
  wrong_location: 'Location',
  missing_road: 'Missing Road',
  wrong_coordinates: 'Coordinates',
  wrong_business_name: 'Business Name',
  other: 'Other',
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  });
}

export default function CorrectionLog({ log }) {
  if (log.length === 0) {
    return (
      <div className="log-empty">
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📋</div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>No corrections yet</div>
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          Corrections will appear here after you save them from the Edit tab.
          <br /><br />
          Start by clicking a marker on the map.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 12, color: '#9099b8' }}>
        Showing <strong style={{ color: '#e8eaf6' }}>{log.length}</strong> correction{log.length !== 1 ? 's' : ''}
      </div>
      {log.map(entry => (
        <div key={entry.id} className="log-entry">
          <div className="log-entry-header">
            <span className="log-loc-id">{entry.locationId}</span>
            <span className="log-timestamp">{formatTime(entry.timestamp)}</span>
          </div>

          <div className="log-change">
            <span className="log-old">{entry.oldValue || '—'}</span>
            <span className="log-arrow">→</span>
            <span className="log-new">{entry.newValue}</span>
          </div>

          <div className="log-meta">
            <span className="log-type-badge">
              {ERROR_TYPE_LABELS[entry.errorType] || entry.errorType}
            </span>
            <span className="log-analyst">👤 {entry.analystName}</span>
            <span className={`status-badge ${entry.status}`} style={{ fontSize: 10, padding: '2px 6px' }}>
              ✅ {entry.status}
            </span>
          </div>

          {entry.notes && (
            <div style={{
              marginTop: 8, fontSize: 11, color: '#9099b8',
              background: '#0f0f23', padding: '6px 8px',
              borderRadius: 4, borderLeft: '2px solid #4f8ef7',
            }}>
              💬 {entry.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
