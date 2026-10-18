import React from 'react';
import { timeAgo } from '../lib/time.js';

export function ReportListItem({ report, onSelect, isSelected }) {
  const getSeverityMeta = (sev) => {
    switch (sev) {
      case 'high':
        return { color: '#DC2626', bg: '#FEF2F2', label: 'High', desc: 'Road impassable' };
      case 'medium':
        return { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium', desc: 'Knee-deep' };
      case 'low':
      default:
        return { color: '#EAB308', bg: '#FEFCE8', label: 'Low', desc: 'Ankle-deep' };
    }
  };

  const meta = getSeverityMeta(report.severity);
  const isVerified = report.status === 'verified';
  const count = report.confirmations_count ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`report-item-card p-3 mb-2 ${isSelected ? 'border-primary shadow-sm bg-light' : ''}`}
      onClick={() => onSelect(report)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(report);
        }
      }}
      aria-label={`Flood report at ${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)} - ${report.severity} severity`}
    >
      <div className="d-flex align-items-center justify-content-between mb-1">
        {/* Severity Indicator */}
        <div className="d-flex align-items-center gap-2">
          <span
            className="rounded-circle d-inline-block flex-shrink-0"
            style={{ width: '10px', height: '10px', backgroundColor: meta.color }}
          ></span>
          <span className="fw-semibold small text-dark" style={{ fontSize: '0.8125rem' }}>
            {meta.label} Severity
          </span>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            ({meta.desc})
          </span>
        </div>

        {/* Status indicator */}
        {isVerified ? (
          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
            <i className="bi bi-patch-check-fill"></i>
            <span>Verified</span>
          </span>
        ) : (
          <span className="badge bg-light text-secondary border d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
            <i className="bi bi-clock"></i>
            <span>Unverified</span>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-2 text-dark small text-truncate" style={{ fontSize: '0.85rem' }}>
        {report.description || 'No description provided for this road section.'}
      </p>

      {/* Footer Info: confirmations and time */}
      <div className="d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.75rem' }}>
        <div className="d-flex align-items-center gap-1">
          <i className="bi bi-people-fill text-secondary"></i>
          <span className="tabular-nums fw-medium">
            {count} / 3 confirmations
          </span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <i className="bi bi-calendar3"></i>
          <span>{timeAgo(report.created_at)}</span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="progress mt-2" style={{ height: '4px' }}>
        <div
          className={`progress-bar ${isVerified ? 'bg-success' : 'bg-primary'}`}
          role="progressbar"
          style={{ width: `${Math.min(100, (count / 3) * 100)}%` }}
          aria-valuenow={count}
          aria-valuemin="0"
          aria-valuemax="3"
        ></div>
      </div>
    </div>
  );
}
