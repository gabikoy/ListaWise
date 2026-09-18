import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '../api/client';
import { useToast } from './ToastContext';
import { Clock, ShieldAlert } from 'lucide-react';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes (FR-03)
const WARNING_THRESHOLD_MS = 60 * 1000; // Show warning 60 seconds before logout

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('lw_auth_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lw_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const { success, error, info } = useToast();
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Inactivity activity updater
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showInactivityWarning) {
      setShowInactivityWarning(false);
    }
  }, [showInactivityWarning]);

  // Logout handler
  const logout = useCallback((reason = '') => {
    localStorage.removeItem('lw_auth_token');
    localStorage.removeItem('lw_auth_user');
    setToken(null);
    setUser(null);
    setShowInactivityWarning(false);
    if (reason) {
      info(reason);
    }
  }, [info]);

  // Login handler
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('lw_auth_token', res.token);
      localStorage.setItem('lw_auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      lastActivityRef.current = Date.now();
      success(`Welcome back, ${res.user.name || res.user.username}!`);
      return res;
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async ({ username, password, name, role = 'owner' }) => {
    setIsLoading(true);
    try {
      const res = await api.post('/register', { username, password, name, role });
      localStorage.setItem('lw_auth_token', res.token);
      localStorage.setItem('lw_auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      lastActivityRef.current = Date.now();
      success(`Welcome to ListaWise, ${res.user.name || res.user.username}!`);
      return res;
    } catch (err) {
      error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      success('Password updated successfully.');
      return res;
    } catch (err) {
      error(err.message || 'Failed to update password.');
      throw err;
    }
  };

  // Listen for 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      logout('Your session has expired. Please sign in again.');
    };
    window.addEventListener('lw-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lw-unauthorized', handleUnauthorized);
  }, [logout]);

  // Track user interaction events
  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleEvent = () => recordActivity();

    events.forEach((evt) => window.addEventListener(evt, handleEvent, { passive: true }));

    // Periodic check for inactivity
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        logout('Logged out due to 15 minutes of inactivity (Security Policy).');
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setShowInactivityWarning(true);
        setSecondsRemaining(Math.max(1, Math.floor(remainingMs / 1000)));
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleEvent));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token, recordActivity, logout]);

  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn: !!token,
        isOwner,
        isLoading,
        login,
        register,
        logout,
        changePassword,
        recordActivity,
      }}
    >
      {children}

      {/* Inactivity Warning Dialog (FR-03) */}
      {showInactivityWarning && (
        <div className="modal-backdrop">
          <div className="modal-sheet" style={{ maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--amber-light)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--amber-primary)',
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--green-950)' }}>
                  Session Expiring Soon
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Automatic logout in{' '}
                  <span
                    className="font-mono"
                    style={{ fontWeight: '700', color: 'var(--crimson-primary)', fontSize: '14px' }}
                  >
                    {secondsRemaining}s
                  </span>
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-mid)', marginBottom: '22px', lineHeight: '1.5' }}>
              For store security, ListaWise automatically signs you out after 15 minutes of inactivity. Would you like to remain signed in?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => logout('Signed out by user.')}
              >
                Sign Out Now
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={recordActivity}
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
