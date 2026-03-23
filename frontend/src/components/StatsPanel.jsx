import React from 'react';

const TYPE_LABELS = {
  wrong_road_name: 'Wrong Road Name',
  wrong_location: 'Wrong Location',
  missing_road: 'Missing Road',
  wrong_coordinates: 'Wrong Coordinates',
  wrong_business_name: 'Wrong Business Name',
  other: 'Other',
};

export default function StatsPanel({ stats, correctionLog, analystName }) {
  const completionPct = stats.total > 0
    ? Math.round((stats.corrected / stats.total) * 100)
    : 0;

  const accuracyRate = correctionLog.length > 0 ? 98 : 0; // simulated

  return (
    <div className="stats-panel">
      {/* Overview cards */}
      <div>
        <div className="section-title">📊 Overview</div>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-card corrected">
            <div className="stat-value">{stats.corrected}</div>
            <div className="stat-label">Corrected</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card flagged">
            <div className="stat-value">{stats.flagged}</div>
            <div className="stat-label">Flagged</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar-wrap">
        <div className="progress-label">
          <span>Completion Progress</span>
          <span style={{ color: '#2ecc71', fontWeight: 700 }}>{completionPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Error type breakdown */}
      {Object.keys(stats.byType).length > 0 && (
        <div>
          <div className="section-title">🔍 By Error Type</div>
          <div className="type-breakdown">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="type-row">
                <span className="type-name">{TYPE_LABELS[type] || type}</span>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyst performance */}
      <div>
        <div className="section-title">👤 Analyst Performance — {analystName}</div>
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="accuracy-value">{accuracyRate}%</div>
            <div className="accuracy-label">Accuracy Rate (Simulated)</div>
          </div>
          <div className="stat-card corrected">
            <div className="stat-value">{correctionLog.length}</div>
            <div className="stat-label">Corrections</div>
          </div>
          <div className="stat-card total">
            <div className="stat-value">
              {correctionLog.length > 0
                ? Math.round(correctionLog.length / Math.max(1, (Date.now() - new Date(correctionLog[correctionLog.length - 1]?.timestamp || Date.now()).getTime()) / 3600000))
                : 0}
            </div>
            <div className="stat-label">Per Hour</div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div style={{
        background: 'rgba(79,142,247,0.08)',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 8,
        padding: 12,
        fontSize: 11,
        color: '#9099b8',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: '#4f8ef7' }}>ℹ️ About This Tool</strong><br />
        This simulates the real workflow used by GIS analysts at mapping companies like Google Maps, MapMyIndia, HERE Technologies, and TomTom.
        Each correction is logged with a full audit trail.
      </div>
    </div>
  );
}
