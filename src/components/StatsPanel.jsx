import React from 'react';

export function StatsPanel({
  stats,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
}) {
  const { total, verified, unverified, highSeverity } = stats;

  return (
    <div className="mb-3">
      {/* 2x2 Stats Grid */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-xs">
            <div className="text-muted small fw-medium mb-1">Total Reports</div>
            <div className="fs-3 fw-bold text-dark tabular-nums tracking-tight">
              {total}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Neighborhood roads
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-xs border-success-subtle">
            <div className="text-success small fw-semibold mb-1 d-flex align-items-center gap-1">
              <i className="bi bi-patch-check-fill"></i>
              <span>Verified (3+)</span>
            </div>
            <div className="fs-3 fw-bold text-success tabular-nums tracking-tight">
              {verified}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Community confirmed
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-xs">
            <div className="text-muted small fw-medium mb-1 d-flex align-items-center gap-1">
              <i className="bi bi-hourglass-split"></i>
              <span>Awaiting</span>
            </div>
            <div className="fs-3 fw-bold text-secondary tabular-nums tracking-tight">
              {unverified}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Needs &lt;3 votes
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="p-3 bg-white rounded-3 border h-100 shadow-xs border-danger-subtle">
            <div className="text-danger small fw-semibold mb-1 d-flex align-items-center gap-1">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>High Severity</span>
            </div>
            <div className="fs-3 fw-bold text-danger tabular-nums tracking-tight">
              {highSeverity}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Impassable roads
            </div>
          </div>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="bg-white p-2 rounded-3 border shadow-xs">
        {/* Status Filter */}
        <div className="mb-2">
          <label className="text-muted small fw-semibold d-block mb-1 px-1">
            Status Filter
          </label>
          <div className="btn-group w-100" role="group" aria-label="Filter by verification status">
            <button
              type="button"
              className={`btn btn-sm ${
                statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All ({total})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                statusFilter === 'verified' ? 'btn-success' : 'btn-outline-secondary'
              }`}
              onClick={() => setStatusFilter('verified')}
            >
              <i className="bi bi-check2-circle me-1"></i>
              Verified
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                statusFilter === 'unverified' ? 'btn-secondary' : 'btn-outline-secondary'
              }`}
              onClick={() => setStatusFilter('unverified')}
            >
              <i className="bi bi-clock me-1"></i>
              Awaiting
            </button>
          </div>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="text-muted small fw-semibold d-block mb-1 px-1">
            Severity Filter
          </label>
          <div className="btn-group w-100" role="group" aria-label="Filter by severity level">
            <button
              type="button"
              className={`btn btn-sm ${
                severityFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'
              }`}
              onClick={() => setSeverityFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                severityFilter === 'high' ? 'btn-danger' : 'btn-outline-secondary'
              }`}
              onClick={() => setSeverityFilter('high')}
            >
              High
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                severityFilter === 'medium' ? 'btn-warning text-dark' : 'btn-outline-secondary'
              }`}
              onClick={() => setSeverityFilter('medium')}
            >
              Med
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                severityFilter === 'low' ? 'btn-warning' : 'btn-outline-secondary'
              }`}
              onClick={() => setSeverityFilter('low')}
            >
              Low
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
