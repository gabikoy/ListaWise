import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Shield, Clock, Key, LogOut } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, changePassword, logout } = useAuth();
  const { error, success } = useToast();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      error('New password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (_) {
      // Toast already handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Settings & Security"
      subtitle={`Account configuration for @${user?.username}`}
      maxWidth="480px"
      footer={
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>
      }
    >
      <div>
        {/* Inactivity Policy Callout */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--green-50)',
            border: '1px solid var(--green-200)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Clock size={18} color="var(--green-800)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--green-950)' }}>
              15-Minute Inactivity Protection (FR-03)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px', lineHeight: '1.4' }}>
              Your session will automatically lock after 15 minutes of inactivity to protect store financial records.
            </p>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green-950)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={16} />
            <span>Change Password</span>
          </div>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 4 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={Lock}
            isLoading={isSubmitting}
            style={{ width: '100%', marginTop: '6px' }}
          >
            Update Password
          </Button>
        </form>

        {/* Sign Out Section */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light, #e2ded5)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green-950)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} />
            <span>Account Session</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout('You have signed out.');
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              touchAction: 'manipulation',
            }}
          >
            <LogOut size={16} />
            Sign Out of ListaWise
          </button>
        </div>
      </div>
    </Modal>
  );
}

