import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Copy, Send, Check } from 'lucide-react';

export function SmsReminderModal({ isOpen, onClose, customer }) {
  const [templateType, setTemplateType] = useState('polite');
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  if (!customer) return null;

  const name = customer.name;
  const balance = (customer.balance || 0).toFixed(2);
  const days = customer.days_outstanding || 0;
  const phone = customer.phone || '';

  const templates = {
    polite: `Magandang araw po ${name}! Paalala lang po mula sa tindahan ukol sa inyong natitirang balance na ₱${balance} (${days} days). Maraming salamat po sa inyong suporta!`,
    followup: `Kumusta po ${name}? Nais po sana naming mag-follow up ukol sa inyong utang sa tindahan na nagkakahalaga ng ₱${balance} (${days} days overdue). Pwede po kayo magbayad via Cash o GCash. Salamat po!`,
    urgent: `URGENT NOTICE: Magandang araw po ${name}. Ang inyong tindahan balance na ₱${balance} ay ${days} days nang overdue. Pakisettle po agad upang mapanatili ang inyong credit account. Maraming salamat.`,
  };

  const messageText = templates[templateType];

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const smsUri = phone ? `sms:${phone.replace(/[^0-9]/g, '')}?body=${encodeURIComponent(messageText)}` : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SMS / Message Reminder Generator"
      subtitle={`Generate payment reminder for ${customer.name}`}
      maxWidth="520px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          {phone && (
            <a
              href={smsUri}
              className="btn btn-success"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noreferrer"
            >
              <Send size={15} />
              <span>Open in SMS</span>
            </a>
          )}
        </>
      }
    >
      <div>
        {/* Template Selector Chips */}
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            Choose Reminder Tone
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'polite', label: 'Polite (Standard)' },
              { id: 'followup', label: 'Follow-up (30+ Days)' },
              { id: 'urgent', label: 'Urgent Notice (60+ Days)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateType(t.id)}
                className={`btn btn-sm ${templateType === t.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '11.5px', padding: '8px 4px' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Message Preview</label>
            {phone && (
              <span className="font-mono" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                To: {phone}
              </span>
            )}
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--beige-subtle)',
              border: '1.5px solid var(--beige-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--text-dark)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {messageText}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          💡 <em>Tip:</em> You can copy this message and send it directly via SMS, Viber, Messenger, or WhatsApp to the customer.
        </div>
      </div>
    </Modal>
  );
}
