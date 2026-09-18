import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { UserPlus, User, Phone, MapPin, CreditCard } from 'lucide-react';

export function AddCustomerModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter customer full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/customers', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        credit_limit: parseFloat(creditLimit) || 1000,
      });

      success(`Customer "${res.name}" registered successfully.`);
      setName('');
      setPhone('');
      setAddress('');
      setCreditLimit('1000');
      onSuccess(res);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to add customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      subtitle="Create a new store customer profile for digital utang tracking"
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={UserPlus}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Save Customer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Full Name <span style={{ color: 'var(--crimson-primary)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number (Optional)</label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. 0917-222-3344"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address / Purok / Barangay (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Block 4 Lot 12, Barangay San Roque"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Credit Limit (₱)</label>
          <input
            type="number"
            className="form-input font-mono"
            placeholder="1000"
            min="0"
            step="50"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
          />
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Default credit limit: ₱1,000.00
          </span>
        </div>
      </form>
    </Modal>
  );
}
