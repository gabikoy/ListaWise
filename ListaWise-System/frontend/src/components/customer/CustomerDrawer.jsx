import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Calendar,
  CreditCard,
  History,
  Receipt,
  Phone,
  MapPin,
  Clock,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { RiskBadge, TransactionBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { AddDebtModal } from './AddDebtModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { SmsReminderModal } from './SmsReminderModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

export function CustomerDrawer({
  customerId,
  isOpen,
  onClose,
  onCustomerUpdated,
  onCustomerDeleted,
}) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('debts'); // 'debts' | 'payments' | 'history'

  // Modals state
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSms, setShowSms] = useState(false);

  const { isOwner } = useAuth();
  const { success, error } = useToast();

  const loadCustomer = async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const data = await api.get(`/customers/${customerId}`);
      setCustomer(data);
    } catch (err) {
      error(err.message || 'Failed to load customer profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomer();
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleDeleteDebt = async (debtId) => {
    if (!window.confirm('Delete this debt record? The balance will be adjusted accordingly.')) return;
    try {
      const res = await api.delete(`/debts/${debtId}`);
      success('Debt record deleted.');
      setCustomer(res.customerSummary);
      if (onCustomerUpdated) onCustomerUpdated(res.customerSummary);
    } catch (err) {
      error(err.message || 'Failed to delete debt.');
    }
  };

  const handleDeletePayment = async (payId) => {
    if (!window.confirm('Delete this payment record? The balance will be adjusted accordingly.')) return;
    try {
      const res = await api.delete(`/payments/${payId}`);
      success('Payment record removed.');
      setCustomer(res.customerSummary);
      if (onCustomerUpdated) onCustomerUpdated(res.customerSummary);
    } catch (err) {
      error(err.message || 'Failed to delete payment.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${customer?.name}" and all their debt/payment records?`
      )
    )
      return;

    try {
      await api.delete(`/customers/${customer.id}`);
      success(`Customer "${customer.name}" deleted.`);
      if (onCustomerDeleted) onCustomerDeleted(customer.id);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to delete customer.');
    }
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const debts = customer?.debts || [];
  const payments = customer?.payments || [];
  const history = customer?.history || [];

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{ justifyContent: 'flex-end', padding: 0 }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            height: '100%',
            backgroundColor: 'var(--beige-surface)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '18px 16px 16px 16px',
              backgroundColor: 'var(--green-950)',
              color: '#FFFFFF',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--green-800)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  {customer?.name
                    ? customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : '?'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2
                      className="font-display"
                      style={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.3px' }}
                    >
                      {customer?.name || 'Loading...'}
                    </h2>
                    {customer && <RiskBadge risk={customer.risk} />}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text-on-green-subtle)' }}>
                    {customer?.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={13} /> {customer.phone}
                      </span>
                    )}
                    {customer?.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {customer.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn-ghost"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Financial Summary Strip */}
            {customer && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginTop: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-green-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Utang
                  </div>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                    ₱{customer.total_debt?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-green-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Paid
                  </div>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--green-400)' }}>
                    ₱{customer.total_paid?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-green-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Net Balance
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: customer.balance > 0 ? '#FCA5A5' : 'var(--green-400)',
                    }}
                  >
                    ₱{customer.balance?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-green-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Days Overdue
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: customer.days_outstanding >= 30 ? 'var(--amber-border)' : '#FFFFFF',
                    }}
                  >
                    {customer.days_outstanding} d
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Toolbar */}
          {customer && (
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--beige-subtle)',
                borderBottom: '1px solid var(--beige-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                {isOwner && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={PlusCircle}
                    onClick={() => setShowAddDebt(true)}
                  >
                    Add Utang
                  </Button>
                )}
                <Button
                  variant="success"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => setShowPayment(true)}
                >
                  Record Payment
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={MessageSquare}
                  onClick={() => setShowSms(true)}
                >
                  SMS Reminder
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handlePrintStatement}
                  className="btn btn-secondary btn-sm"
                  title="Print Statement of Account"
                >
                  <Printer size={14} />
                </button>
                {isOwner && (
                  <button
                    onClick={handleDeleteCustomer}
                    className="btn btn-danger btn-sm"
                    title="Delete Customer Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--beige-border)',
              backgroundColor: 'var(--beige-surface)',
            }}
          >
            {[
              { id: 'debts', label: `Debts (${debts.length})`, icon: Receipt },
              { id: 'payments', label: `Payments (${payments.length})`, icon: CreditCard },
              { id: 'history', label: `Timeline (${history.length})`, icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '13px',
                    border: 'none',
                    borderBottom: isActive ? '2.5px solid var(--green-800)' : '2.5px solid transparent',
                    backgroundColor: 'transparent',
                    color: isActive ? 'var(--green-900)' : 'var(--text-muted)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', backgroundColor: 'var(--beige-canvas)' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Loading ledger records...
              </div>
            ) : (
              <>
                {/* ── Debts Tab ── */}
                {activeTab === 'debts' && (
                  <div>
                    {debts.length === 0 ? (
                      <div className="lw-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Receipt size={36} color="var(--text-light)" style={{ margin: '0 auto 10px auto' }} />
                        <div style={{ fontWeight: '600', color: 'var(--text-mid)' }}>No active debts recorded</div>
                        <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Click "Add Utang" above to record store credit.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {debts.map((item) => (
                          <div
                            key={item.id}
                            className="lw-card"
                            style={{
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderLeft: '4px solid var(--crimson-primary)',
                            }}
                          >
                            <div>
                              <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--crimson-primary)' }}>
                                +₱{Number(item.amount).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: '500', marginTop: '2px' }}>
                                {item.description || 'Grocery credit'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {new Date(item.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>

                            {isOwner && (
                              <button
                                onClick={() => handleDeleteDebt(item.id)}
                                className="btn-ghost"
                                style={{ color: 'var(--crimson-primary)', padding: '6px', border: 'none', cursor: 'pointer' }}
                                title="Void/Delete this debt"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Payments Tab ── */}
                {activeTab === 'payments' && (
                  <div>
                    {payments.length === 0 ? (
                      <div className="lw-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CreditCard size={36} color="var(--text-light)" style={{ margin: '0 auto 10px auto' }} />
                        <div style={{ fontWeight: '600', color: 'var(--text-mid)' }}>No payments recorded yet</div>
                        <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Click "Record Payment" above when receiving cash or GCash.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {payments.map((item) => (
                          <div
                            key={item.id}
                            className="lw-card"
                            style={{
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderLeft: '4px solid var(--sage-primary)',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--sage-primary)' }}>
                                  -₱{Number(item.amount).toFixed(2)}
                                </span>
                                <span className="badge badge-low-risk" style={{ fontSize: '9.5px' }}>
                                  {item.payment_method || 'Cash'}
                                </span>
                              </div>
                              {item.notes && (
                                <div style={{ fontSize: '13px', color: 'var(--text-dark)', marginTop: '2px' }}>
                                  {item.notes}
                                </div>
                              )}
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {new Date(item.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>

                            {isOwner && (
                              <button
                                onClick={() => handleDeletePayment(item.id)}
                                className="btn-ghost"
                                style={{ color: 'var(--crimson-primary)', padding: '6px', border: 'none', cursor: 'pointer' }}
                                title="Void/Delete this payment"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Timeline Audit History Tab (FR-10) ── */}
                {activeTab === 'history' && (
                  <div>
                    {history.length === 0 ? (
                      <div className="lw-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <History size={36} color="var(--text-light)" style={{ margin: '0 auto 10px auto' }} />
                        <div style={{ fontWeight: '600', color: 'var(--text-mid)' }}>No transaction history</div>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', paddingLeft: '18px' }}>
                        {/* Vertical line indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '7px',
                            top: '8px',
                            bottom: '8px',
                            width: '2px',
                            backgroundColor: 'var(--beige-border-dark)',
                          }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {history.map((tx, idx) => {
                            const isDebt = tx.type === 'debt';
                            return (
                              <div key={tx.id || idx} style={{ position: 'relative' }}>
                                {/* Timeline Dot */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: '-16px',
                                    top: '16px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: isDebt ? 'var(--crimson-primary)' : 'var(--sage-primary)',
                                    border: '2px solid #FFFFFF',
                                    boxShadow: '0 0 0 2px var(--beige-border)',
                                  }}
                                />

                                <div className="lw-card" style={{ padding: '14px 18px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <TransactionBadge type={tx.type} />
                                      <span
                                        className="font-mono"
                                        style={{
                                          fontSize: '15px',
                                          fontWeight: '700',
                                          color: isDebt ? 'var(--crimson-primary)' : 'var(--sage-primary)',
                                        }}
                                      >
                                        {isDebt ? '+' : '-'}₱{Number(tx.amount).toFixed(2)}
                                      </span>
                                    </div>

                                    {tx.running_balance !== undefined && (
                                      <span
                                        className="font-mono"
                                        style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}
                                      >
                                        Running Balance: <strong>₱{Number(tx.running_balance).toFixed(2)}</strong>
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '13px', color: 'var(--text-dark)', marginTop: '6px' }}>
                                    {tx.note}
                                  </div>

                                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
                                    {new Date(tx.created_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      {showAddDebt && (
        <AddDebtModal
          isOpen={showAddDebt}
          onClose={() => setShowAddDebt(false)}
          customer={customer}
          onSuccess={(updated) => {
            setCustomer(updated);
            if (onCustomerUpdated) onCustomerUpdated(updated);
          }}
        />
      )}

      {showPayment && (
        <RecordPaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          customer={customer}
          onSuccess={(updated) => {
            setCustomer(updated);
            if (onCustomerUpdated) onCustomerUpdated(updated);
          }}
        />
      )}

      {showSms && (
        <SmsReminderModal
          isOpen={showSms}
          onClose={() => setShowSms(false)}
          customer={customer}
        />
      )}
    </>
  );
}
