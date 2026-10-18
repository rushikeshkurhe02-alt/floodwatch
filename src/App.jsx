import React, { useState, useMemo, useCallback } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { isConfigured } from './lib/supabase.js';
import { useAuth } from './context/AuthContext.jsx';
import { useReports } from './hooks/useReports.js';
import { AppNavbar } from './components/AppNavbar.jsx';
import { InfoBanner } from './components/InfoBanner.jsx';
import { StatsPanel } from './components/StatsPanel.jsx';
import { MapView } from './components/MapView.jsx';
import { ReportListItem } from './components/ReportListItem.jsx';
import { ReportModal } from './components/ReportModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ToastHost } from './components/ToastHost.jsx';
import { SetupScreen } from './components/SetupScreen.jsx';

export default function App() {
  // If Supabase credentials are missing, render friendly full-page setup screen
  if (!isConfigured) {
    return <SetupScreen />;
  }

  return <FloodWatchMain />;
}

function FloodWatchMain() {
  const { isAuthenticated } = useAuth();

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback(({ type = 'info', message }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime hook for reports with verification callback
  const {
    reports,
    userConfirmations,
    loading,
    error,
    recentlyVerifiedId,
    refreshReports,
    createReport,
    confirmReport,
  } = useReports({
    onReportVerified: (verifiedReport) => {
      addToast({
        type: 'success',
        message: 'A flood report just received 3 confirmations and is now Verified!',
      });
    },
  });

  // UI state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  const [temporaryPin, setTemporaryPin] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [triggerInvalidate, setTriggerInvalidate] = useState(0);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'

  // Open Auth modal with optional intent message
  const handleOpenAuth = (message = '') => {
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  // Start pin drop mode
  const handleStartPinDrop = () => {
    if (!isAuthenticated) {
      handleOpenAuth('Please log in to report a flooded road.');
      return;
    }
    if (isPinDropMode) {
      setIsPinDropMode(false);
      setTemporaryPin(null);
      return;
    }
    setIsPinDropMode(true);
    setTemporaryPin(null);
    setMobileDrawerOpen(false); // Close drawer if open on mobile so user sees map
  };

  // Map clicked during pin drop mode
  const handleMapClick = (coords) => {
    if (!isPinDropMode) return;
    setTemporaryPin(coords);
    setReportModalOpen(true);
  };

  // Cancel pin drop mode
  const handleCancelPinDrop = () => {
    setIsPinDropMode(false);
    setTemporaryPin(null);
  };

  // Submit report from ReportModal
  const handleReportSubmit = async (reportData) => {
    try {
      const created = await createReport(reportData);
      setReportModalOpen(false);
      setIsPinDropMode(false);
      setTemporaryPin(null);

      addToast({
        type: 'success',
        message: 'Report submitted! Thank you for alerting your community.',
      });

      // Fly map to new report
      setFlyTarget({ lat: created.latitude, lng: created.longitude });
      setSelectedReport(created);
    } catch (err) {
      // Show exact database error in toast and keep modal open
      addToast({
        type: 'danger',
        message: err.message || 'Failed to submit report. Please try again.',
      });
      throw err;
    }
  };

  // Confirm report
  const handleConfirmReport = async (reportId) => {
    try {
      await confirmReport(reportId);
      addToast({
        type: 'success',
        message: 'Report confirmed! Thank you for verifying road safety.',
      });
    } catch (err) {
      addToast({
        type: 'danger',
        message: err.message || 'Failed to confirm report.',
      });
      throw err;
    }
  };

  // When user selects a report in list
  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setFlyTarget({ lat: report.latitude, lng: report.longitude });
    setMobileDrawerOpen(false);
  };

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter === 'verified' && r.status !== 'verified') return false;
      if (statusFilter === 'unverified' && r.status === 'verified') return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      return true;
    });
  }, [reports, statusFilter, severityFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = reports.length;
    const verified = reports.filter((r) => r.status === 'verified').length;
    const unverified = total - verified;
    const highSeverity = reports.filter((r) => r.severity === 'high').length;
    return { total, verified, unverified, highSeverity };
  }, [reports]);

  // Sidebar content (rendered in desktop left column and mobile offcanvas)
  const sidebarContent = (
    <div className="d-flex flex-column h-100 p-3 custom-scrollbar" style={{ overflowY: 'auto' }}>
      <InfoBanner />

      <StatsPanel
        stats={stats}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
      />

      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-semibold text-dark mb-0 small">
          Road Reports ({filteredReports.length})
        </h6>
        {reports.length > 0 && (
          <button
            className="btn btn-sm btn-link p-0 text-muted small text-decoration-none"
            onClick={refreshReports}
            title="Refresh list"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <p className="text-muted small mb-0">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger p-3 small mb-0">
          <div className="fw-semibold mb-1">Failed to load reports</div>
          <div className="mb-2 text-danger-emphasis">{error}</div>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={refreshReports}
          >
            Retry
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-4 text-center bg-white rounded-3 border my-auto">
          <div className="text-muted mb-2">
            <i className="bi bi-shield-check fs-1 text-primary-subtle" style={{ color: 'var(--fw-primary)' }}></i>
          </div>
          <h6 className="fw-semibold text-dark mb-1">No flooding reported</h6>
          <p className="text-muted small mb-3">
            {reports.length === 0
              ? 'Stay safe, stay alert. Be the first to report waterlogging in your neighbourhood.'
              : 'No reports match the selected filters.'}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleStartPinDrop}
          >
            <i className="bi bi-geo-alt-fill me-1"></i>
            Report Flooded Road
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column">
          {filteredReports.map((report) => (
            <ReportListItem
              key={report.id}
              report={report}
              isSelected={selectedReport?.id === report.id}
              onSelect={handleSelectReport}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Navbar */}
      <AppNavbar
        onOpenAuth={handleOpenAuth}
        onToggleMobileReports={() => {
          setMobileDrawerOpen(true);
          setTriggerInvalidate((prev) => prev + 1);
        }}
        mobileReportsOpen={mobileDrawerOpen}
        onStartPinDrop={handleStartPinDrop}
        isPinDropMode={isPinDropMode}
      />

      {/* Main Viewport */}
      <div className="app-viewport d-flex flex-grow-1 position-relative">
        {/* Desktop Left Sidebar (>= 992px) */}
        <aside
          className="d-none d-lg-block border-end bg-light flex-shrink-0"
          style={{ width: '380px', height: '100%', overflow: 'hidden' }}
        >
          {sidebarContent}
        </aside>

        {/* Map View Area */}
        <main className="flex-grow-1 position-relative h-100">
          <MapView
            reports={filteredReports}
            selectedReport={selectedReport}
            flyTarget={flyTarget}
            isPinDropMode={isPinDropMode}
            temporaryPin={temporaryPin}
            onMapClick={handleMapClick}
            onCancelPinDrop={handleCancelPinDrop}
            userConfirmations={userConfirmations}
            recentlyVerifiedId={recentlyVerifiedId}
            onConfirmReport={handleConfirmReport}
            onOpenAuth={handleOpenAuth}
            onShowToast={addToast}
            triggerInvalidate={triggerInvalidate}
          />

          {/* Mobile Bottom Floating Action Buttons (< 992px) */}
          <div className="d-lg-none">
            {/* Floating Reports List Button (Bottom Left) */}
            <button
              type="button"
              className="btn btn-fab position-absolute"
              style={{ bottom: '24px', left: '16px', padding: '0.65rem 1.1rem' }}
              onClick={() => {
                setMobileDrawerOpen(true);
                setTriggerInvalidate((prev) => prev + 1);
              }}
              aria-label="View flood reports"
            >
              <i className="bi bi-list-ul"></i>
              <span className="small">Reports ({filteredReports.length})</span>
            </button>

            {/* Floating Report Flood Button (Bottom Right) */}
            <button
              type="button"
              className="btn btn-fab position-absolute"
              style={{
                bottom: '24px',
                right: '16px',
                padding: '0.65rem 1.25rem',
                background: isPinDropMode ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : undefined,
              }}
              onClick={handleStartPinDrop}
              aria-label="Report flooded road"
            >
              <i className={`bi ${isPinDropMode ? 'bi-x-circle' : 'bi-plus-lg'}`}></i>
              <span className="small">{isPinDropMode ? 'Cancel' : 'Report Flood'}</span>
            </button>
          </div>
        </main>
      </div>

      {/* Mobile Offcanvas Drawer (< 992px) */}
      <Offcanvas
        show={mobileDrawerOpen}
        onHide={() => {
          setMobileDrawerOpen(false);
          setTriggerInvalidate((prev) => prev + 1);
        }}
        placement="start"
        style={{ width: '85%', maxWidth: '380px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fs-6 fw-bold brand-font text-dark d-flex align-items-center gap-2">
            <i className="bi bi-droplet-half text-primary"></i>
            <span>Community Flood Reports</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {sidebarContent}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Report Modal */}
      <ReportModal
        show={reportModalOpen}
        coordinates={temporaryPin}
        onClose={() => {
          setReportModalOpen(false);
          setTemporaryPin(null);
          setIsPinDropMode(false);
        }}
        onSubmit={handleReportSubmit}
      />

      {/* Auth Modal */}
      <AuthModal
        show={authModalOpen}
        customMessage={authModalMessage}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(mode) => {
          addToast({
            type: 'success',
            message: mode === 'signup'
              ? 'Account created! Welcome to FloodWatch.'
              : 'Signed in successfully.',
          });
        }}
      />

      {/* Toast Notification Host */}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
