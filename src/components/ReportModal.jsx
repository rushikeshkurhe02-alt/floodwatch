import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

export function ReportModal({
  show,
  coordinates,
  onClose,
  onSubmit,
}) {
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!coordinates) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      await onSubmit({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        severity,
        description,
      });
      // Reset form
      setDescription('');
      setSeverity('medium');
    } catch (err) {
      // Caller handles error notification and keeps modal open
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <div>
          <Modal.Title className="fs-5 brand-font text-dark d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt-fill text-primary"></i>
            <span>Report Flooded Road</span>
          </Modal.Title>
          <div className="text-muted small mt-1">
            Pin dropped at{' '}
            <span className="font-monospace text-dark fw-medium">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </span>
          </div>
        </div>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          {/* Severity selector cards */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small mb-2">
              Water Depth &amp; Severity <span className="text-danger">*</span>
            </label>
            <div className="d-flex flex-column gap-2">
              {/* Low Severity */}
              <div
                className={`severity-card ${severity === 'low' ? 'active-low' : ''}`}
                onClick={() => setSeverity('low')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{ width: '14px', height: '14px', backgroundColor: '#FACC15' }}
                    ></span>
                    <div>
                      <div className="fw-semibold text-dark small">Low — Ankle-deep</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Passable for cars and pedestrians with care
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="severity"
                    checked={severity === 'low'}
                    onChange={() => setSeverity('low')}
                    className="form-check-input"
                  />
                </div>
              </div>

              {/* Medium Severity */}
              <div
                className={`severity-card ${severity === 'medium' ? 'active-medium' : ''}`}
                onClick={() => setSeverity('medium')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{ width: '14px', height: '14px', backgroundColor: '#F59E0B' }}
                    ></span>
                    <div>
                      <div className="fw-semibold text-dark small">Medium — Knee-deep</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Risky for two-wheelers and sedans; slow crawl
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="severity"
                    checked={severity === 'medium'}
                    onChange={() => setSeverity('medium')}
                    className="form-check-input"
                  />
                </div>
              </div>

              {/* High Severity */}
              <div
                className={`severity-card ${severity === 'high' ? 'active-high' : ''}`}
                onClick={() => setSeverity('high')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle"
                      style={{ width: '14px', height: '14px', backgroundColor: '#DC2626' }}
                    ></span>
                    <div>
                      <div className="fw-semibold text-danger small">High — Road Impassable</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Submerged road, vehicle stall danger, avoid route
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="severity"
                    checked={severity === 'high'}
                    onChange={() => setSeverity('high')}
                    className="form-check-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="report-desc" className="form-label fw-semibold text-dark small mb-0">
                Road / Landmark Details <span className="text-muted fw-normal">(optional)</span>
              </label>
              <span className="small text-muted tabular-nums" style={{ fontSize: '0.75rem' }}>
                {description.length} / 200
              </span>
            </div>
            <textarea
              id="report-desc"
              rows={3}
              maxLength={200}
              className="form-control"
              placeholder="e.g. Underpass completely flooded near Ferguson College Rd, water flowing rapidly"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              style={{ fontSize: '0.875rem' }}
            ></textarea>
            <div className="form-text small" style={{ fontSize: '0.75rem' }}>
              Your report requires 3 independent community confirmations before it is marked Verified.
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0">
          <button
            type="button"
            className="btn btn-sm btn-light border"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary px-3 d-flex align-items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Submitting report...</span>
              </>
            ) : (
              <>
                <i className="bi bi-send-fill"></i>
                <span>Publish Report</span>
              </>
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
