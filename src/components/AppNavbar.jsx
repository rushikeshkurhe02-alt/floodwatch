import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';

export function AppNavbar({ onOpenAuth, onToggleMobileReports, mobileReportsOpen, onStartPinDrop, isPinDropMode }) {
  const { user, signOut, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Truncate email for display: e.g. "alexander.smith@gmail.com" -> "alexander...com"
  const formatEmail = (email) => {
    if (!email) return 'User';
    if (email.length <= 20) return email;
    const parts = email.split('@');
    if (parts.length === 2) {
      const name = parts[0].slice(0, 10);
      return `${name}...@${parts[1]}`;
    }
    return `${email.slice(0, 16)}...`;
  };

  return (
    <header className="app-navbar d-flex align-items-center justify-content-between px-3 px-md-4">
      {/* Brand & Tagline Zone */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{ width: '36px', height: '36px', background: 'var(--fw-primary)' }}
          >
            <i className="bi bi-droplet-half fs-5"></i>
          </div>
          <div>
            <span className="brand-font fs-5 text-dark tracking-tight">FloodWatch</span>
            <span className="d-none d-xl-inline text-muted small ms-2 ps-2 border-start border-2">
              Community-verified flood reports
            </span>
          </div>
        </div>
      </div>

      {/* Action & User Zone */}
      <div className="d-flex align-items-center gap-2">
        {/* Direct Download ZIP button */}
        <a
          href="/floodwatch-source.zip"
          download="floodwatch-source.zip"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          title="Download Project ZIP file"
        >
          <i className="bi bi-file-earmark-zip-fill text-primary"></i>
          <span className="small">ZIP</span>
        </a>

        {/* Mobile toggle button for report drawer */}
        <button
          className="btn btn-sm btn-outline-secondary d-lg-none d-flex align-items-center gap-1"
          onClick={onToggleMobileReports}
          aria-label="Toggle reports sidebar"
        >
          <i className="bi bi-list-columns-reverse"></i>
          <span className="small">Reports</span>
        </button>

        {/* Desktop Pin Drop Trigger */}
        <button
          className={`btn btn-sm d-none d-md-flex align-items-center gap-2 ${
            isPinDropMode ? 'btn-danger' : 'btn-primary'
          }`}
          onClick={onStartPinDrop}
        >
          <i className={`bi ${isPinDropMode ? 'bi-x-circle' : 'bi-geo-alt-fill'}`}></i>
          <span>{isPinDropMode ? 'Cancel Pin Drop' : 'Report Flooded Road'}</span>
        </button>

        {isAuthenticated ? (
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="user-menu-dropdown"
              className="d-flex align-items-center gap-2 border bg-white py-1 px-2 rounded-3 text-dark"
              style={{ fontSize: '0.875rem' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary"
                style={{ width: '28px', height: '28px' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
              <span className="d-none d-sm-inline font-monospace small">
                {formatEmail(user?.email)}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm border-0 py-2" style={{ minWidth: '220px' }}>
              <div className="px-3 py-2 border-bottom">
                <p className="mb-0 text-muted small">Signed in as</p>
                <p className="mb-0 fw-semibold text-truncate small">{user?.email}</p>
                <div className="mt-1">
                  <span className="badge bg-light text-success border border-success-subtle small">
                    <i className="bi bi-shield-check me-1"></i>Verified Contributor
                  </span>
                </div>
              </div>
              <Dropdown.Item onClick={handleLogout} className="text-danger pt-2">
                <i className="bi bi-box-arrow-right me-2"></i>Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <button
            onClick={() => onOpenAuth('Please log in to help your neighbourhood.')}
            className="btn btn-sm btn-outline-primary fw-medium px-3 py-1.5"
          >
            <i className="bi bi-person-circle me-1"></i>
            <span>Log In</span>
          </button>
        )}
      </div>
    </header>
  );
}
