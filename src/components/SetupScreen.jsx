import React, { useState } from 'react';
import { defaultUrl, setRuntimeCredentials } from '../lib/supabase.js';

export function SetupScreen() {
  const [url, setUrl] = useState(defaultUrl || '');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState('');

  const handleConnect = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setError('Please provide both the Supabase URL and Anon Key.');
      return;
    }
    if (!url.trim().startsWith('http')) {
      setError('The Supabase URL must start with https://');
      return;
    }
    if (anonKey.trim() === 'PASTE_KEY_HERE') {
      setError('Please replace PASTE_KEY_HERE with your actual Supabase Anon Key.');
      return;
    }
    setError('');
    setRuntimeCredentials(url, anonKey);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <header className="app-navbar d-flex align-items-center justify-content-between px-4 bg-white border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{ width: '36px', height: '36px', background: 'var(--fw-primary)' }}
          >
            <i className="bi bi-droplet-half fs-5"></i>
          </div>
          <div>
            <span className="brand-font fs-5 text-dark">FloodWatch</span>
            <span className="text-muted small ms-2 ps-2 border-start border-2">Setup</span>
          </div>
        </div>

        <a
          href="/floodwatch-source.zip"
          download="floodwatch-source.zip"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          title="Download Project ZIP file"
        >
          <i className="bi bi-file-earmark-zip-fill text-primary"></i>
          <span className="small">Download ZIP</span>
        </a>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-4">
        <div className="card shadow-sm border-0" style={{ maxWidth: '640px', width: '100%', borderRadius: '16px' }}>
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-3"
                style={{ width: '64px', height: '64px' }}
              >
                <i className="bi bi-database-fill-gear fs-2"></i>
              </div>
              <h2 className="brand-font fs-4 text-dark mb-1">Connect Your Supabase Project</h2>
              <p className="text-muted small mb-0">
                FloodWatch requires a Supabase instance to store community flood reports, manage RLS, and stream live verification updates.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Quick in-browser connection form */}
            <form onSubmit={handleConnect} className="mb-4">
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">
                    Supabase Project URL (<code>VITE_SUPABASE_URL</code>)
                  </label>
                  {defaultUrl && (
                    <span className="badge bg-success-subtle text-success border border-success-subtle small" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-check-circle me-1"></i>Found in .env
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  Supabase Anon Public Key (<code>VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  autoFocus={Boolean(defaultUrl)}
                  required
                />
                <div className="form-text small" style={{ fontSize: '0.75rem' }}>
                  Paste your project anon public key here to connect directly.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-plug-fill"></i>
                <span>Connect &amp; Launch FloodWatch</span>
              </button>
            </form>

            <hr className="my-4 text-muted opacity-25" />

            {/* Instructions for .env file setup */}
            <div>
              <h6 className="fw-semibold text-dark mb-2 small d-flex align-items-center gap-2">
                <i className="bi bi-terminal-fill text-secondary"></i>
                <span>Or configure via environment variables</span>
              </h6>
              <p className="text-muted small mb-2">
                Your <code>.env</code> file in the project root:
              </p>
              <pre
                className="p-3 bg-dark text-light rounded-3 small mb-2 font-monospace"
                style={{ fontSize: '0.8rem', userSelect: 'all' }}
              >
{`VITE_SUPABASE_URL=${defaultUrl || 'https://jfwbfdrguqktelxecvfo.supabase.co'}
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here`}
              </pre>
              <p className="text-muted small mb-0">
                After saving your actual key to <code>.env</code>, restart Vite (<code>npm run dev</code>).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
