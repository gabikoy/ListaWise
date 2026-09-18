import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export function RiskBadge({ risk, size = 'md' }) {
  const isHigh = risk === 'HIGH';
  const isMod = risk === 'MODERATE';
  const isLow = risk === 'LOW';

  let badgeClass = 'badge-neutral';
  let label = 'NO DEBT';
  let Icon = ShieldCheck;

  if (isHigh) {
    badgeClass = 'badge-high-risk';
    label = 'HIGH RISK';
    Icon = ShieldAlert;
  } else if (isMod) {
    badgeClass = 'badge-moderate-risk';
    label = 'MODERATE RISK';
    Icon = AlertTriangle;
  } else if (isLow) {
    badgeClass = 'badge-low-risk';
    label = 'LOW RISK';
    Icon = ShieldCheck;
  }

  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span className={`badge ${badgeClass}`} style={size === 'sm' ? { fontSize: '9.5px', padding: '2px 6px' } : {}}>
      <Icon size={iconSize} />
      <span>{label}</span>
    </span>
  );
}

export function TransactionBadge({ type }) {
  const isDebt = type === 'debt' || type === 'credit';
  return (
    <span
      className={`badge ${isDebt ? 'badge-high-risk' : 'badge-low-risk'}`}
      style={{ fontSize: '10px', padding: '3px 7px' }}
    >
      {isDebt ? 'CREDIT / UTANG' : 'PAYMENT'}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isOwner = role === 'owner' || role === 'admin';
  return (
    <span
      className={`badge ${isOwner ? 'badge-forest' : 'badge-neutral'}`}
      style={{ fontSize: '9.5px', padding: '2px 7px' }}
    >
      {isOwner ? 'STORE OWNER' : 'STAFF'}
    </span>
  );
}
