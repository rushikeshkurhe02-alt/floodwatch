import React from 'react';

export function ToastHost({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fw-toast-container d-flex flex-column gap-2" role="region" aria-live="polite">
      {toasts.map((toast) => {
        const bgClass = toast.type === 'danger'
          ? 'bg-danger text-white'
          : toast.type === 'success'
          ? 'bg-success text-white'
          : toast.type === 'warning'
          ? 'bg-warning text-dark'
          : 'bg-dark text-white';

        const iconClass = toast.type === 'danger'
          ? 'bi-exclamation-octagon-fill'
          : toast.type === 'success'
          ? 'bi-check-circle-fill'
          : toast.type === 'warning'
          ? 'bi-exclamation-triangle-fill'
          : 'bi-info-circle-fill';

        return (
          <div
            key={toast.id}
            className={`toast show border-0 align-items-center ${bgClass}`}
            role="alert"
            aria-atomic="true"
            style={{ minWidth: '280px' }}
          >
            <div className="d-flex p-2 align-items-center">
              <div className="fs-5 me-2 d-flex align-items-center">
                <i className={`bi ${iconClass}`}></i>
              </div>
              <div className="toast-body p-0 flex-grow-1" style={{ fontSize: '0.875rem' }}>
                {toast.message}
              </div>
              <button
                type="button"
                className={`btn-close ms-2 me-1 ${toast.type === 'warning' ? '' : 'btn-close-white'}`}
                aria-label="Close"
                onClick={() => onDismiss(toast.id)}
              ></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
