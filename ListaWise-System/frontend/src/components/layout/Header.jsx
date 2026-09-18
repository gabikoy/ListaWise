import React from 'react';
import { UserPlus, Settings, RefreshCw, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export function Header({
  title,
  onOpenAddCustomer,
  onOpenSettings,
  onRefresh,
  isRefreshing,
}) {
  const { user, isOwner } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      style={{
        padding: '14px 16px',
        backgroundColor: 'var(--green-950)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Brand & User Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--green-500), var(--green-800))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '15px',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          }}
        >
          LW
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-display" style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.1' }}>
              {title || 'ListaWise'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-on-green-subtle)', marginTop: '2px' }}>
            {user?.name || user?.username} · <span style={{ color: 'var(--amber-border)' }}>{today}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}

        {isOwner && onOpenAddCustomer && (
          <button
            onClick={onOpenAddCustomer}
            style={{
              background: 'var(--green-700)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: '#FFFFFF',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <UserPlus size={14} />
            <span>+Add</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-on-green-subtle)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
