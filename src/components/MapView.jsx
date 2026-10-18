import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ReportMarker } from './ReportMarker.jsx';
import { Legend } from './Legend.jsx';

const PUNE_COORDINATES = [18.5204, 73.8567];
const DEFAULT_ZOOM = 13;

// Map click & keyboard event listener helper
function MapEvents({ isPinDropMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isPinDropMode && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Controller component to smoothly fly to coordinates when requested
function MapController({ flyTarget, triggerInvalidate }) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 16, {
        duration: 1.2,
      });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    // Invalidate map size to prevent gray tiles on layout change
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [triggerInvalidate, map]);

  return null;
}

export function MapView({
  reports,
  selectedReport,
  flyTarget,
  isPinDropMode,
  temporaryPin,
  onMapClick,
  onCancelPinDrop,
  userConfirmations,
  recentlyVerifiedId,
  onConfirmReport,
  onOpenAuth,
  onShowToast,
  triggerInvalidate,
}) {
  const [locating, setLocating] = useState(false);
  const [userLocationTarget, setUserLocationTarget] = useState(null);

  // Handle escape key to cancel pin drop mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPinDropMode) {
        onCancelPinDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinDropMode, onCancelPinDrop]);

  // Geolocation handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      onShowToast({
        type: 'warning',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocationTarget({ lat: latitude, lng: longitude });
        onShowToast({
          type: 'info',
          message: 'Centered on your current location.',
        });
      },
      (error) => {
        setLocating(false);
        let msg = 'Could not access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access was denied in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        onShowToast({
          type: 'warning',
          message: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const activeFlyTarget = flyTarget || userLocationTarget;

  return (
    <div className={`map-container-wrapper ${isPinDropMode ? 'pin-drop-active' : ''}`}>
      {/* Pin Drop Mode Banner Notification */}
      {isPinDropMode && (
        <div className="pin-drop-banner alert alert-primary d-flex align-items-center justify-content-between gap-3 mb-0 py-2 px-3 border shadow">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
            <span className="fw-semibold small text-dark">
              Tap the flooded road on the map to drop a pin
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancelPinDrop}
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Floating Map Controls (Locate Me) */}
      <div
        className="position-absolute d-flex flex-column gap-2"
        style={{ top: '16px', right: '16px', zIndex: 1000 }}
      >
        <button
          type="button"
          className="map-control-btn"
          onClick={handleLocateMe}
          disabled={locating}
          title="Center on my location"
          aria-label="Locate me"
        >
          {locating ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
          ) : (
            <i className="bi bi-crosshair fs-5"></i>
          )}
        </button>
      </div>

      {/* Map Element */}
      <MapContainer
        center={PUNE_COORDINATES}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="map-element"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapEvents isPinDropMode={isPinDropMode} onMapClick={onMapClick} />
        <MapController flyTarget={activeFlyTarget} triggerInvalidate={triggerInvalidate} />

        {/* Temporary Pulsing Pin Marker */}
        {temporaryPin && (
          <CircleMarker
            center={[temporaryPin.lat, temporaryPin.lng]}
            pathOptions={{
              color: '#0E7490',
              fillColor: '#0284C7',
              fillOpacity: 0.9,
              weight: 3,
              radius: 12,
              className: 'temp-pin-pulse',
            }}
          />
        )}

        {/* Existing Flood Reports */}
        {reports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            isSelected={selectedReport?.id === report.id}
            isRecentlyVerified={recentlyVerifiedId === report.id}
            hasConfirmed={userConfirmations.has(report.id)}
            onConfirm={onConfirmReport}
            onOpenAuth={onOpenAuth}
          />
        ))}
      </MapContainer>

      {/* Pinned Map Legend */}
      <Legend />
    </div>
  );
}
