import React, { useState, useEffect } from 'react';
import { ClockAlert, MessageSquare, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SmsReminderModal } from '../components/customer/SmsReminderModal';
import { RecordPaymentModal } from '../components/customer/RecordPaymentModal';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export function OverdueView({ onOpenCustomer }) {
  const [overdueList, setOverdueList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSms, setShowSms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const loadOverdue = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/overdue');
      setOverdueList(data);
    } catch (err) {
      error(err.message || 'Failed to load overdue accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverdue();
  }, []);

  const totalOverdueBalance = overdueList.reduce((sum, c) => sum + (c.balance || 0), 0);
  const over60Days = overdueList.filter((c) => (c.days_outstanding || 0) >= 60);

  const handleOpenSms = (cust, e) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setShowSms(true);
  };

  const handleOpenPayment = (cust, e) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setShowPayment(true);
  };

  return (
    <div>
      {/* KPI Overdue Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          className="lw-card"
          style={{
            padding: '20px',
            borderLeft: '4px solid var(--amber-primary)',
          }}
        >
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Total Overdue Balance
          </div>
          <div className="font-display" style={{ fontSize: '26px', fontWeight: '700', color: 'var(--crimson-primary)', marginTop: '4px' }}>
            ₱{totalOverdueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {overdueList.length} delinquent accounts
          </div>
        </div>

        <div
          className="lw-card"
          style={{
            padding: '20px',
            borderLeft: '4px solid var(--crimson-primary)',
          }}
        >
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Critical (&gt;60 Days Unpaid)
          </div>
          <div className="font-display" style={{ fontSize: '26px', fontWeight: '700', color: 'var(--crimson-primary)', marginTop: '4px' }}>
            {over60Days.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Immediate collection required
          </div>
        </div>
      </div>

      {/* Overdue Accounts List */}
      <div className="lw-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--green-950)' }}>
            Accounts Overdue (&gt;30 Days)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Prioritized collection watchlist sorted by longest unpaid store credit
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Loading overdue records...
          </div>
        ) : overdueList.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-mid)' }}>
              🎉 All accounts are up to date!
            </div>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              No customer debts are older than 30 days.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overdueList.map((cust) => {
              const isOver60 = cust.days_outstanding >= 60;
              return (
                <div
                  key={cust.id}
                  onClick={() => onOpenCustomer(cust.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isOver60 ? 'var(--crimson-border)' : 'var(--amber-border)'}`,
                    backgroundColor: isOver60 ? 'var(--crimson-light)' : 'var(--amber-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isOver60 ? 'var(--crimson-primary)' : 'var(--amber-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      {cust.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)' }}>
                          {cust.name}
                        </span>
                        <RiskBadge risk={cust.risk} size="sm" />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '3px' }}>
                        Phone: {cust.phone || 'No phone'} · Address: {cust.address || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Balance & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="font-mono"
                        style={{ fontSize: '17px', fontWeight: '800', color: 'var(--crimson-primary)' }}
                      >
                        ₱{cust.balance?.toFixed(2)}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: isOver60 ? 'var(--crimson-text)' : 'var(--amber-text)',
                        }}
                      >
                        {cust.days_outstanding} days unpaid
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => handleOpenSms(cust, e)}
                        className="btn btn-secondary btn-sm"
                        title="Send SMS Reminder"
                        style={{ backgroundColor: '#FFFFFF' }}
                      >
                        <MessageSquare size={14} color="var(--green-800)" />
                        <span>SMS</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenPayment(cust, e)}
                        className="btn btn-success btn-sm"
                        title="Record Payment"
                      >
                        <CheckCircle2 size={14} />
                        <span>Pay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSms && selectedCustomer && (
        <SmsReminderModal
          isOpen={showSms}
          onClose={() => setShowSms(false)}
          customer={selectedCustomer}
        />
      )}

      {showPayment && selectedCustomer && (
        <RecordPaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          customer={selectedCustomer}
          onSuccess={() => loadOverdue()}
        />
      )}
    </div>
  );
}
