import React, { useState } from 'react';
import { Modal, Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';

export function AuthModal({ show, onClose, customMessage, onSuccess }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Basic validation rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setErrorMsg('');

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setSubmitting(true);
      if (tab === 'login') {
        await signIn({ email, password });
      } else {
        await signUp({ email, password });
      }
      onClose();
      if (onSuccess) onSuccess(tab);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchTab = (newTab) => {
    setTab(newTab);
    setErrorMsg('');
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom-0 pb-1">
        <Modal.Title className="fs-5 brand-font text-dark d-flex align-items-center gap-2">
          <i className="bi bi-shield-check text-primary"></i>
          <span>Community Sign In</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-1 pb-3">
        {customMessage && (
          <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2">
            <i className="bi bi-info-circle-fill fs-6 flex-shrink-0"></i>
            <div>{customMessage}</div>
          </div>
        )}

        <Nav variant="tabs" className="mb-3">
          <Nav.Item className="flex-fill text-center">
            <Nav.Link
              active={tab === 'login'}
              onClick={() => handleSwitchTab('login')}
              className="fw-semibold text-dark"
            >
              Log In
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill text-center">
            <Nav.Link
              active={tab === 'signup'}
              onClick={() => handleSwitchTab('signup')}
              className="fw-semibold text-dark"
            >
              Create Account
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-start gap-2">
            <i className="bi bi-exclamation-octagon-fill fs-6 flex-shrink-0 mt-1"></i>
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">
              Email Address
            </label>
            <input
              type="email"
              className={`form-control form-control-sm ${
                touched.email && !isEmailValid ? 'is-invalid' : touched.email && isEmailValid ? 'is-valid' : ''
              }`}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              autoComplete="email"
              required
            />
            <div className="invalid-feedback small">
              Please enter a valid email address.
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">
              Password
            </label>
            <input
              type="password"
              className={`form-control form-control-sm ${
                touched.password && !isPasswordValid ? 'is-invalid' : touched.password && isPasswordValid ? 'is-valid' : ''
              }`}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <div className="invalid-feedback small">
              Password must be at least 6 characters long.
            </div>
          </div>

          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>{tab === 'login' ? 'Logging in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <i className={`bi ${tab === 'login' ? 'bi-box-arrow-in-right' : 'bi-person-plus-fill'}`}></i>
                  <span>{tab === 'login' ? 'Sign In to FloodWatch' : 'Register for FloodWatch'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
