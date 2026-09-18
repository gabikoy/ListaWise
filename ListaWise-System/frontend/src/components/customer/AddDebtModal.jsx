import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RiskBadge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { PlusCircle, AlertTriangle, ShoppingBag } from 'lucide-react';

export function AddDebtModal({ isOpen, onClose, customer, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [confirmedHighRisk, setConfirmedHighRisk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!customer) return null;

  const isHighRisk = customer.risk === 'HIGH';
  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleAddQuickAmount = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      error('Please enter a valid credit amount greater than ₱0.');
      return;
    }

    if (isHighRisk && !confirmedHighRisk) {
      error('Please check the high-risk confirmation box to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/customers/${customer.id}/debts`, {
        amount: numAmount,
        description: description.trim() || 'Store grocery credit',
      });

      success(`Added ₱${numAmount.toFixed(2)} utang for ${customer.name}.`);
      setAmount('');
      setDescription('');
      setConfirmedHighRisk(false);
      onSuccess(res.customerSummary);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to record debt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Store Credit / Utang"
      subtitle={`Recording new credit for ${customer.name}`}
      maxWidth="500px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={PlusCircle}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Confirm & Record Utang
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Customer Summary Banner */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--beige-subtle)',
            border: '1px solid var(--beige-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>
              {customer.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Current Balance: <strong className="font-mono" style={{ color: 'var(--crimson-primary)' }}>₱{(customer.balance || 0).toFixed(2)}</strong>
            </div>
          </div>
          <RiskBadge risk={customer.risk} />
        </div>

        {/* High Risk Alert Box */}
        {isHighRisk && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--crimson-light)',
              border: '1px solid var(--crimson-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              gap: '12px',
            }}
          >
            <AlertTriangle size={20} color="var(--crimson-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--crimson-text)' }}>
                High-Risk Account Warning
              </div>
              <p style={{ fontSize: '12px', color: 'var(--crimson-text)', marginTop: '2px', lineHeight: '1.4' }}>
                This customer has <strong>{customer.days_outstanding || 0} days</strong> of unpaid overdue balance.
              </p>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--crimson-text)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={confirmedHighRisk}
                  onChange={(e) => setConfirmedHighRisk(e.target.checked)}
                />
                <span>I approve extending additional credit to this customer</span>
              </label>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">
            Amount (PHP ₱) <span style={{ color: 'var(--crimson-primary)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span
              className="font-mono"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-muted)',
              }}
            >
              ₱
            </span>
            <input
              type="number"
              className="form-input font-mono"
              style={{ paddingLeft: '34px', fontSize: '18px', fontWeight: '700' }}
              placeholder="0.00"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAddQuickAmount(q)}
              className="btn btn-secondary btn-sm font-mono"
              style={{ padding: '4px 10px', fontSize: '11.5px' }}
            >
              +₱{q}
            </button>
          ))}
          {amount && (
            <button
              type="button"
              onClick={() => setAmount('')}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 8px', fontSize: '11.5px' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Description / Goods List */}
        <div className="form-group">
          <label className="form-label">Items Purchased / Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 1 sack Rice, 1L Cooking Oil, 2 Canned Sardines"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
