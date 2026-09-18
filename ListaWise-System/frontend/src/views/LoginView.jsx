import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  User,
  Store,
  ArrowRight,
  UserPlus,
  X,
} from 'lucide-react';

export function LoginView() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login Form
  const [loginUser, setLoginUser] = useState('owner');
  const [loginPass, setLoginPass] = useState('owner123');

  // Register Form
  const [regStoreName, setRegStoreName] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regRole, setRegRole] = useState('owner');

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');

  // Sign Up Modal State
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpStoreName, setSignUpStoreName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { error } = useToast();

  const handleFillDemo = (user, pass) => {
    setLoginUser(user);
    setLoginPass(pass);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) {
      error('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginUser.trim(), loginPass);
    } catch (_) {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword) {
      error('Username and password are required.');
      return;
    }

    if (regPassword.length < 4) {
      error('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPass) {
      error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: regUsername.trim(),
        password: regPassword,
        name: regStoreName.trim() ? `${regStoreName.trim()} (${regFullName.trim() || regUsername})` : regFullName.trim() || regUsername,
        role: regRole,
      });
    } catch (_) {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpModalSubmit = async (e) => {
    e.preventDefault();
    if (!signUpUsername.trim() || !signUpPassword) {
      error('Username and password are required.');
      return;
    }
    
    // Placeholder for your actual signup logic
    setIsSubmitting(true);
    try {
      await register({
        username: signUpUsername.trim(),
        password: signUpPassword,
        name: signUpStoreName.trim() || signUpUsername,
        role: 'owner',
      });
      // Close modal on success
      setShowSignUpModal(false);
    } catch (_) {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a5739',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Mobile Shell Frame */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0a5739',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px -8px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02)',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '640px',
        }}
      >
        {/* Mobile App Header Bar */}
        <div
          style={{
            padding: '40px 24px 24px 24px',
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <img
            src="/logo.png"
            alt="ListaWise Logo"
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 8px auto',
              display: 'block',
            }}
          />

          <h1
            style={{
              fontSize: '32px',
              fontFamily: 'Georgia, serif',
              fontWeight: '700',
              color: '#FFFFFF',
              margin: '12px 0 0 0',
              lineHeight: '1.2',
            }}
          >
            ListaWise
          </h1>

          <div
            className="font-mono"
            style={{ fontSize: '14px', color: '#FFFFFF', marginTop: '8px', fontWeight: '500' }}
          >
            Digital Utang Management
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {mode === 'login' ? (
            /* ── ONE SOLID BEIGE BOX ── */
            <div style={{ 
              backgroundColor: '#F5F0E6', 
              borderRadius: '20px', 
              padding: '24px', 
              marginTop: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h2 style={{ margin: 0, color: '#0a5739', fontSize: '18px', fontWeight: 'bold' }}>
                  Store Owner Log In
                </h2>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#0a5739' }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '36px', backgroundColor: '#ffffff', color: '#333', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      placeholder="Enter username"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#0a5739' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '36px', backgroundColor: '#ffffff', color: '#333', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      placeholder="Enter password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  style={{ width: '100%', marginTop: '12px', backgroundColor: '#0a5739', color: 'white', border: 'none' }}
                >
                  Log In
                </Button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#888' }}>
                  Demo: owner / owner123
                </div>
              </form>
            </div>
          ) : (
            /* ── REGISTER FORM IN A BEIGE BOX ── */
            <div style={{ 
              backgroundColor: '#F5F0E6', 
              borderRadius: '20px', 
              padding: '24px', 
              marginTop: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <form onSubmit={handleRegisterSubmit}>
                {/* ... (Your other register form fields can go here) ... */}
              </form>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center', color: '#FFFFFF', fontSize: '14px' }}>
            <span 
              style={{ cursor: 'pointer', marginRight: '16px' }}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </span>
            <span 
              style={{ cursor: 'pointer', marginLeft: '16px' }}
              onClick={() => setShowSignUpModal(true)}
            >
              Sign Up
            </span>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotPassword && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            style={{
              backgroundColor: '#F5F0E6', borderRadius: '20px', padding: '24px',
              width: '90%', maxWidth: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, color: '#0a5739', fontSize: '20px', fontWeight: 'bold' }}>Forgot Password?</h3>
              <span style={{ cursor: 'pointer', color: '#0a5739' }} onClick={() => setShowForgotPassword(false)}>
                <X size={24} />
              </span>
            </div>
            <div style={{ height: '3px', width: '80px', backgroundColor: '#0a5739', marginBottom: '16px' }}></div>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0a5739', lineHeight: '1.5' }}>
              Enter your registered username to continue.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#0a5739', marginBottom: '6px' }}>Username</label>
              <input type="text" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} placeholder="Enter your username" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff', boxSizing: 'border-box' }} />
            </div>
            <button type="button" style={{ width: '100%', padding: '12px', backgroundColor: '#0a5739', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE ACCOUNT / SIGN UP MODAL ── */}
      {showSignUpModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowSignUpModal(false)}
        >
          <div
            style={{
              backgroundColor: '#F5F0E6', borderRadius: '20px', padding: '24px',
              width: '90%', maxWidth: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: '#0a5739', fontSize: '20px', fontWeight: 'bold' }}>Create Account</h3>
              <span style={{ cursor: 'pointer', color: '#0a5739' }} onClick={() => setShowSignUpModal(false)}>
                <X size={24} />
              </span>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0a5739', lineHeight: '1.5' }}>
              Register your sari-sari store to get started with ListaWise.
            </p>

            <form onSubmit={handleSignUpModalSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#0a5739', marginBottom: '6px' }}>Store Name</label>
                <input
                  type="text"
                  value={signUpStoreName}
                  onChange={(e) => setSignUpStoreName(e.target.value)}
                  placeholder="e.g. Aling Maria's Store"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#0a5739', marginBottom: '6px' }}>Username</label>
                <input
                  type="text"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  placeholder="Choose a username"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#0a5739', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#0a5739', color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}