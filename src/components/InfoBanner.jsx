import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'floodwatch_trust_banner_dismissed_v1';

export function InfoBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setDismissed(false);
      }
    } catch (e) {
      // Safe fallback if localStorage is disabled or restricted
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // Ignore
    }
  };

  if (dismissed) return null;

  return (
    <div
      className="alert alert-dismissible fade show p-3 mb-3 border-0 shadow-sm"
      style={{
        backgroundColor: '#E0F2FE',
        color: '#0369A1',
        borderRadius: '12px',
      }}
      role="alert"
    >
      <div className="d-flex align-items-start gap-2">
        <i className="bi bi-shield-lock-fill fs-5 mt-n1 flex-shrink-0" style={{ color: '#0284C7' }}></i>
        <div className="small pe-3">
          <strong className="d-block mb-1" style={{ color: '#0C4A6E' }}>How trust works</strong>
          A report is marked <strong>Verified</strong> only after 3 independent residents confirm it.
          Nobody can confirm their own report, and duplicate or spam reports are blocked automatically.
        </div>
        <button
          type="button"
          className="btn-close btn-close-sm ms-auto"
          aria-label="Dismiss trust info"
          onClick={handleDismiss}
          style={{ padding: '0.6rem' }}
        ></button>
      </div>
    </div>
  );
}
