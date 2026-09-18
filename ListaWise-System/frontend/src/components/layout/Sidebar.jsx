import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClockAlert,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export function Sidebar({ currentTab, onSelectTab, onOpenSettings }) {
  const { user, logout, isOwner } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Store overview & KPIs' },
    { id: 'customers', label: 'Customers & Ledger', icon: Users, desc: 'Credit balances & debts' },
    { id: 'overdue', label: 'Overdue Accounts', icon: ClockAlert, desc: '30+ days priority collection' },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldCheck, desc: 'AI customer scoring' },
    { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet, desc: 'Ledger export & aging' },
  ];

  return (
    <aside
      style={{
        width: '270px',
        backgroundColor: 'var(--green-950)',
        color: 'var(--text-on-green)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '28px 24px 22px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--green-600), var(--green-800))',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <span className="font-display" style={{ fontWeight: '700', fontSize: '18px', color: '#FFFFFF' }}>
              LW
            </span>
          </div>
          <div>
            <h1
              className="font-display"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                letterSpacing: '-0.4px',
                color: '#FFFFFF',
                lineHeight: '1.1',
              }}
            >
              ListaWise
            </h1>
            <div
              className="font-mono"
              style={{
                fontSize: '9px',
                color: 'var(--amber-border)',
                letterSpacing: '1.4px',
                marginTop: '3px',
                fontWeight: '600',
              }}
            >
              RECOVERY LEDGER
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ padding: '20px 14px', flex: 1, overflowY: 'auto' }}>
        <div
          className="font-mono"
          style={{
            fontSize: '9.5px',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '1.5px',
            padding: '0 12px 10px 12px',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          Main Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--green-800)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-on-green-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} color={isActive ? 'var(--green-400)' : 'currentColor'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: isActive ? '600' : '500' }}>
                    {item.label}
                  </div>
                </div>
                {isActive && <ChevronRight size={14} color="var(--green-400)" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
              {user?.name || user?.username}
            </span>
            <RoleBadge role={user?.role} />
          </div>
          <div
            className="font-mono"
            style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}
          >
            @{user?.username}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onOpenSettings}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'transparent',
              color: 'var(--text-on-green-subtle)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>

          <button
            onClick={() => logout('You have signed out.')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244, 114, 114, 0.3)',
              backgroundColor: 'rgba(196, 77, 77, 0.15)',
              color: '#FCA5A5',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(196, 77, 77, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(196, 77, 77, 0.15)')}
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
