import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  variant = 'default', // 'default' | 'forest' | 'amber' | 'crimson'
  onClick,
}) {
  let iconBg = 'var(--green-50)';
  let iconColor = 'var(--green-800)';
  let borderColor = 'var(--beige-border)';

  if (variant === 'forest') {
    iconBg = 'var(--green-100)';
    iconColor = 'var(--green-900)';
  } else if (variant === 'amber') {
    iconBg = 'var(--amber-light)';
    iconColor = 'var(--amber-primary)';
    borderColor = 'var(--amber-border)';
  } else if (variant === 'crimson') {
    iconBg = 'var(--crimson-light)';
    iconColor = 'var(--crimson-primary)';
    borderColor = 'var(--crimson-border)';
  }

  return (
    <div
      className="lw-card"
      onClick={onClick}
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: variant !== 'default' ? `4px solid ${iconColor}` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: 'var(--text-muted)',
            }}
          >
            {title}
          </span>
          <div
            className="font-display"
            style={{
              fontSize: '28px',
              fontWeight: '600',
              color: variant === 'crimson' ? 'var(--crimson-primary)' : 'var(--text-dark)',
              marginTop: '4px',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--beige-border-subtle)' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{subtitle}</span>

        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '12px',
              fontWeight: '600',
              color:
                trendType === 'positive'
                  ? 'var(--sage-primary)'
                  : trendType === 'negative'
                  ? 'var(--crimson-primary)'
                  : 'var(--text-muted)',
            }}
          >
            {trendType === 'positive' && <ArrowUpRight size={14} />}
            {trendType === 'negative' && <ArrowDownRight size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
