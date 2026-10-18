import React, { useState } from 'react';

export function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="position-absolute bg-white rounded-3 border shadow-sm p-2"
      style={{
        bottom: '24px',
        left: '20px',
        zIndex: 1000,
        maxWidth: '240px',
        fontSize: '0.75rem',
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <span className="fw-bold text-dark d-flex align-items-center gap-1">
          <i className="bi bi-info-circle text-primary"></i>
          <span>Map Legend</span>
        </span>
        <button
          className="btn btn-sm btn-link p-0 text-muted"
          aria-label={isOpen ? 'Collapse legend' : 'Expand legend'}
        >
          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-up'}`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 pt-2 border-top">
          {/* Severity Colors */}
          <div className="mb-2">
            <span className="text-muted fw-semibold d-block mb-1">Severity Levels</span>
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block"
                  style={{ width: '12px', height: '12px', backgroundColor: '#DC2626' }}
                ></span>
                <span className="text-dark">High — Impassable</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block"
                  style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B' }}
                ></span>
                <span className="text-dark">Medium — Knee-deep</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block"
                  style={{ width: '12px', height: '12px', backgroundColor: '#FACC15' }}
                ></span>
                <span className="text-dark">Low — Ankle-deep</span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <span className="text-muted fw-semibold d-block mb-1">Verification</span>
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block border"
                  style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#16A34A',
                    borderColor: '#16A34A',
                    borderWidth: '2px',
                  }}
                ></span>
                <span className="text-dark fw-medium">Verified (3+ votes)</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-inline-block"
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'rgba(107, 114, 128, 0.4)',
                    border: '1.5px dashed #6B7280',
                  }}
                ></span>
                <span className="text-muted">Unverified (&lt;3 votes)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
