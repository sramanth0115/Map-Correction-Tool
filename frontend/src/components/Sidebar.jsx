import React from 'react';
import EditForm from './EditForm';
import CorrectionLog from './CorrectionLog';
import StatsPanel from './StatsPanel';
import DistanceCalculator from './DistanceCalculator';

export default function Sidebar({
  selectedLocation,
  activeTab,
  onTabChange,
  onSaveCorrection,
  correctionLog,
  stats,
  analystName,
}) {
  const tabs = [
    { key: 'edit', label: '✏️ Edit' },
    { key: 'log', label: `📋 Log (${correctionLog.length})` },
    { key: 'stats', label: '📊 Stats' },
    { key: 'distance', label: '📐 Calc' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`sidebar-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {activeTab === 'edit' && (
          <EditForm
            location={selectedLocation}
            onSave={onSaveCorrection}
            analystName={analystName}
          />
        )}
        {activeTab === 'log' && (
          <CorrectionLog log={correctionLog} />
        )}
        {activeTab === 'stats' && (
          <StatsPanel stats={stats} correctionLog={correctionLog} analystName={analystName} />
        )}
        {activeTab === 'distance' && (
          <DistanceCalculator />
        )}
      </div>
    </aside>
  );
}
