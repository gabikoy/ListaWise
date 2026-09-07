import React from 'react';
import { LayoutDashboard, Users, FileSpreadsheet } from 'lucide-react';

export function MobileNav({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <nav
      style={{
        height: '66px',
        backgroundColor: 'var(--beige-surface)',
        borderTop: '1px solid var(--beige-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 4px',
        flexShrink: 0,
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--green-800)' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
              flex: 1,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--green-100)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background var(--transition-fast)',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.6 : 2} color={isActive ? 'var(--green-800)' : 'currentColor'} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                letterSpacing: '-0.1px',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
