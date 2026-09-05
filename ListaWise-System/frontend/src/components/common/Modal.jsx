import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px 28px',
            borderBottom: '1px solid var(--beige-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              className="font-display"
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--green-950)',
                letterSpacing: '-0.3px',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 28px 22px 28px',
              borderTop: '1px solid var(--beige-border-subtle)',
              backgroundColor: 'var(--beige-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              borderBottomLeftRadius: 'var(--radius-xl)',
              borderBottomRightRadius: 'var(--radius-xl)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
