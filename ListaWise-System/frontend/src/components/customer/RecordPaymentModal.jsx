import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { CheckCircle2, Banknote, Smartphone, CreditCard } from 'lucide-react';

export function RecordPaymentModal({ isOpen, onClose, customer, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!customer) return null;

  const currentBalance = customer.balance || 0;

  const handlePayFull = () => {
    setAmount(currentBalance.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      error('Please enter a valid payment amount greater than ₱0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/customers/${customer.id}/payments`, {
        amount: numAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || `${paymentMethod} payment`,
      });

      const newBal = res.customerSummary.balance;
      success(
        newBal <= 0
          ? `Fully settled! Balance is now ₱0.00.`
          : `Recorded payment of ₱${numAmount.toFixed(2)}. Remaining balance: ₱${newBal.toFixed(2)}.`
      );

      setAmount('');
      setNotes('');
      onSuccess(res.customerSummary);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      subtitle={`Receiving payment from ${customer.name}`}
      maxWidth="500px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="success"
            icon={CheckCircle2}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Confirm Payment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Outstanding Balance Banner */}
        <div
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--sage-light)',
            border: '1px solid var(--sage-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--sage-text)', fontWeight: '600', textTransform: 'uppercase' }}>
              Current Outstanding Balance
            </div>
            <div
              className="font-display"
              style={{ fontSize: '26px', fontWeight: '700', color: 'var(--green-950)', marginTop: '2px' }}
            >
              ₱{currentBalance.toFixed(2)}
            </div>
          </div>

          {currentBalance > 0 && (
            <button
              type="button"
              onClick={handlePayFull}
              className="btn btn-sm font-mono"
              style={{
                backgroundColor: 'var(--sage-primary)',
                color: 'white',
                fontSize: '11.5px',
              }}
            >
              Pay Full ₱{currentBalance.toFixed(2)}
            </button>
          )}
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">
            Payment Amount (PHP ₱) <span style={{ color: 'var(--crimson-primary)' }}>*</span>
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

        {/* Payment Method Selector */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'Cash', label: 'Cash', icon: Banknote },
              { id: 'GCash', label: 'GCash', icon: Smartphone },
              { id: 'Bank', label: 'Bank Transfer', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${isSelected ? 'var(--green-800)' : 'var(--beige-border)'}`,
                    backgroundColor: isSelected ? 'var(--green-50)' : 'var(--beige-surface)',
                    color: isSelected ? 'var(--green-900)' : 'var(--text-mid)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--green-800)' : 'var(--text-muted)'} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes / Reference */}
        <div className="form-group">
          <label className="form-label">Notes / Reference No. (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder={paymentMethod === 'GCash' ? 'e.g. Ref #1029384756' : 'e.g. Partial cash payment'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
