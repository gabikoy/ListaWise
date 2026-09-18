import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { RiskBadge } from '../components/common/Badge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export function RiskView({ onOpenCustomer }) {
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const loadRisk = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/risk');
      setRiskData(data);
    } catch (err) {
      error(err.message || 'Failed to load risk intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Analyzing customer credit risk...
      </div>
    );
  }

  const highRisk = riskData?.highRisk || [];
  const moderateRisk = riskData?.moderateRisk || [];
  const lowRisk = riskData?.lowRisk || [];
  const cleared = riskData?.cleared || [];

  return (
    <div>
      {/* Risk Scoring Logic Overview Banner */}
      <div
        className="lw-card"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          backgroundColor: 'var(--beige-subtle)',
          borderLeft: '4px solid var(--green-800)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--green-100)',
              color: 'var(--green-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Info size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green-950)' }}>
              Algorithmic Credit Risk Grading
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '2px', lineHeight: '1.5' }}>
              ListaWise evaluates payment behavior and days outstanding to protect your store's cash flow. Accounts &gt;30 days unpaid are automatically classified as <strong>High Risk</strong> to prevent uncollectible bad debt.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Risk Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* High Risk Column */}
        <div className="lw-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="var(--crimson-primary)" />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--crimson-text)' }}>
                High Risk ({highRisk.length})
              </h4>
            </div>
            <span className="badge badge-high-risk">Urgent Action</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Unpaid for &gt;30 days. Recommend halting new credit until balance is settled.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {highRisk.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                No high risk accounts!
              </div>
            ) : (
              highRisk.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCustomer(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--crimson-border)',
                    backgroundColor: 'var(--crimson-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--crimson-text)', marginTop: '2px' }}>
                      {c.days_outstanding} days overdue
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--crimson-primary)' }}>
                      ₱{c.balance?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Moderate & Low Risk Column */}
        <div className="lw-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--sage-primary)" />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--sage-text)' }}>
                Low Risk ({lowRisk.length})
              </h4>
            </div>
            <span className="badge badge-low-risk">Healthy Credit</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Active balances under 15–30 days. Reliable repayment pattern.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lowRisk.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                No active low-risk accounts.
              </div>
            ) : (
              lowRisk.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCustomer(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--sage-border)',
                    backgroundColor: 'var(--sage-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sage-text)', marginTop: '2px' }}>
                      {c.days_outstanding} days active
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green-950)' }}>
                      ₱{c.balance?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cleared Accounts */}
        <div className="lw-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="var(--green-600)" />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--green-950)' }}>
                Fully Settled ({cleared.length})
              </h4>
            </div>
            <span className="badge badge-forest">₱0 Balance</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Customers with zero outstanding utang.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cleared.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                No cleared accounts yet.
              </div>
            ) : (
              cleared.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCustomer(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--beige-border)',
                    backgroundColor: 'var(--beige-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-dark)' }}>
                    {c.name}
                  </div>
                  <span className="badge badge-low-risk" style={{ fontSize: '9.5px' }}>
                    Cleared
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
