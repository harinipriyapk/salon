import { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import React from 'react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      setSuccess('Signed in successfully!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(formData);
      setSuccess('Account created successfully!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setBusy(true);
    setError('');
    try {
      await demoLogin(role);
      setSuccess(`Signed in as demo ${role}!`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card vintage-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-header">
          <span className="vintage-tag">Parlour Portal</span>
          <h2>{tab === 'login' ? 'Client & Admin Sign In' : 'Create an Account'}</h2>
          <p>Access your reservations, manage WhatsApp alerts, and leave verified feedback.</p>
        </div>

        {/* Quick Demo Credentials Banner */}
        <div className="demo-credentials-box">
          <div className="demo-box-title">
            <Sparkles size={14} /> Quick Demo Access:
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="button-demo"
              onClick={() => handleQuickDemo('customer')}
              disabled={busy}
            >
              Demo Customer (Alice)
            </button>
            <button
              type="button"
              className="button-demo button-demo-admin"
              onClick={() => handleQuickDemo('admin')}
              disabled={busy}
            >
              Demo Admin (Manager)
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
          >
            New Client Registration
          </button>
        </div>

        {error && (
          <div className="form-message error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="form-message success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <label>
              <span>Email Address</span>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alice@example.com or admin@velvetvine.com"
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>

            <button type="submit" className="button button-dark submit-button" disabled={busy}>
              {busy ? 'Authenticating...' : 'Sign In to Parlour'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <label>
              <span>Full Name</span>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Clara Oswald"
                  required
                />
              </div>
            </label>

            <div className="form-row">
              <label>
                <span>Email Address</span>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="clara@example.com"
                    required
                  />
                </div>
              </label>

              <label>
                <span>WhatsApp Phone</span>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    required
                  />
                </div>
              </label>
            </div>

            <label>
              <span>Password (6+ characters)</span>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  minLength={6}
                  required
                />
              </div>
            </label>

            <button type="submit" className="button button-dark submit-button" disabled={busy}>
              {busy ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

