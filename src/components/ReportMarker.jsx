import React, { useRef, useEffect, useState } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { timeAgo } from '../lib/time.js';
import { useAuth } from '../context/AuthContext.jsx';

export function ReportMarker({
  report,
  isSelected,
  isRecentlyVerified,
  hasConfirmed,
  onConfirm,
  onOpenAuth,
}) {
  const markerRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  const isVerified = report.status === 'verified';
  const isReporter = isAuthenticated && user?.id && user.id === report.user_id;
  const count = report.confirmations_count ?? 0;

  // Severity color mapping
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'high':
        return '#DC2626'; // Red
      case 'medium':
        return '#F59E0B'; // Amber
      case 'low':
      default:
        return '#FACC15'; // Yellow
    }
  };

  const getSeverityLabel = (sev) => {
    switch (sev) {
      case 'high':
        return { name: 'High', detail: 'Road impassable' };
      case 'medium':
        return { name: 'Medium', detail: 'Knee-deep' };
      case 'low':
      default:
        return { name: 'Low', detail: 'Ankle-deep' };
    }
  };

  const fillColor = getSeverityColor(report.severity);
  const severityMeta = getSeverityLabel(report.severity);

  // Styling based on verified vs unverified
  const markerOptions = isVerified
    ? {
        color: '#16A34A', // Thick green border
        weight: 4,
        fillColor: fillColor,
        fillOpacity: 0.85,
        radius: isRecentlyVerified ? 18 : 14,
        className: isRecentlyVerified ? 'verified-pulse-ring' : '',
      }
    : {
        color: '#6B7280', // Grey dashed border
        weight: 2,
        dashArray: '4 4',
        fillColor: fillColor,
        fillOpacity: 0.4,
        radius: 11,
      };

  const handleConfirmClick = async () => {
    if (!isAuthenticated) {
      onOpenAuth('Please log in to help your neighbourhood.');
      return;
    }
    if (isVerified || isReporter || hasConfirmed || confirming) {
      return;
    }

    try {
      setConfirming(true);
      await onConfirm(report.id);
    } catch (err) {
      // Error is caught and toasted by parent hook
    } finally {
      setConfirming(false);
    }
  };

  // Determine confirmation button state & tooltip explanation
  let confirmDisabled = false;
  let confirmReason = '';

  if (isVerified) {
    confirmDisabled = true;
    confirmReason = 'Already verified by the community';
  } else if (isReporter) {
    confirmDisabled = true;
    confirmReason = "You can't confirm your own report";
  } else if (hasConfirmed) {
    confirmDisabled = true;
    confirmReason = 'You already confirmed this report';
  }

  return (
    <CircleMarker
      ref={markerRef}
      center={[report.latitude, report.longitude]}
      pathOptions={markerOptions}
    >
      <Popup maxWidth={300} minWidth={240} className="custom-popup">
        <div className="p-1">
          {/* Header Badges */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span
              className="badge px-2 py-1"
              style={{
                backgroundColor: fillColor,
                color: report.severity === 'low' ? '#0F172A' : '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              <i className="bi bi-water me-1"></i>
              {severityMeta.name} ({severityMeta.detail})
            </span>

            {isVerified ? (
              <span
                className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-patch-check-fill"></i>
                <span>Verified</span>
              </span>
            ) : (
              <span
                className="badge bg-light text-secondary border d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-clock"></i>
                <span>Unverified</span>
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-2">
            <p className="mb-0 text-dark" style={{ fontSize: '0.875rem' }}>
              {report.description || <em className="text-muted">No description provided</em>}
            </p>
          </div>

          {/* Time & Coordinates */}
          <div className="d-flex align-items-center justify-content-between text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
            <span>
              <i className="bi bi-clock-history me-1"></i>
              Reported {timeAgo(report.created_at)}
            </span>
            <span className="font-monospace text-muted">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </span>
          </div>

          {/* Confirmations Progress Bar */}
          <div className="mb-3 p-2 bg-light rounded-2 border">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small fw-semibold text-secondary" style={{ fontSize: '0.75rem' }}>
                Confirmations
              </span>
              <span
                className={`small fw-bold tabular-nums ${
                  isVerified ? 'text-success' : 'text-primary'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {count} / 3 {isVerified ? '(Target Reached)' : 'required'}
              </span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
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

          {/* Action Button */}
          <div>
            {!isAuthenticated ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleConfirmClick}
              >
                <i className="bi bi-check2-circle"></i>
                <span>Log in to confirm</span>
              </button>
            ) : confirmDisabled ? (
              <button
                type="button"
                className="btn btn-sm btn-light text-muted border w-100 d-flex align-items-center justify-content-center gap-1"
                disabled
                title={confirmReason}
              >
                <i className="bi bi-shield-check text-muted"></i>
                <span className="small">{confirmReason}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleConfirmClick}
                disabled={confirming}
              >
                {confirming ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg fs-6"></i>
                    <span>Confirm this report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
