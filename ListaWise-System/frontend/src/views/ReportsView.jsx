import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function ReportsView() {
  const [report, setReport] = useState(null);
  const { error } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/reports/summary')
      .then(setReport)
      .catch((err) => error(err.message || 'Failed to load report summary.'));
  }, []);

  if (!report) return <div style={{ textAlign: 'center', padding: 60, color: '#78958d' }}>Generating summary report...</div>;

  const totals = report.agingTotals;
  const total = report.totalOutstanding || 1;
  const buckets = [
    ['Current (0–15 Days)', totals.current_0_15, '#28ae63'],
    ['Aging (16–30 Days)', totals.aging_16_30, '#17633f'],
    ['Overdue (31–60 Days)', totals.aging_31_60, '#f2a52b'],
    ['Critical (>60 Days)', totals.aging_over_60, '#c83e36'],
  ];
  const outstandingCustomers = Object.values(report.aging || {})
    .flat()
    .filter((customer) => customer.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div style={{ margin: '-16px -16px 0', minHeight: '100%', background: '#f8f5ef' }}>
      <header style={{ background: '#17633f', color: '#fff', padding: '58px 20px 17px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20 }}>Summary Report</h1>
          <p style={{ margin: '3px 0 0', fontSize: 11, opacity: 0.75 }}>As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <button type="button" onClick={() => logout('You have signed out.')} aria-label="Log out" style={{ background: 'transparent', border: 0, color: '#fff', padding: 6, cursor: 'pointer' }}><LogOut size={17} /></button>
      </header>
      <main style={{ padding: '14px 4px 80px' }}>
        <section style={{ background: '#fff', border: '1px solid #ead8b8', borderRadius: 15, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ color: '#78958d', fontSize: 11, marginBottom: 14 }}>OVERALL SUMMARY</div>
          <div style={{ display: 'grid', gap: 10, color: '#17633f', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Outstanding Utang</span><strong>₱{report.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Customers</span><strong>{report.totalCustomers}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Overdue &gt;30 days</span><strong>{report.aging.aging_31_60.length + report.aging.aging_over_60.length}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Overdue &gt;60 days</span><strong>{report.aging.aging_over_60.length}</strong></div>
          </div>
        </section>
        <section style={{ background: '#fff', border: '1px solid #ead8b8', borderRadius: 15, padding: '16px 18px' }}>
          <div style={{ color: '#78958d', fontSize: 11, marginBottom: 12 }}>RISK DISTRIBUTION</div>
          <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
            {buckets.map(([label, amount, color]) => <div key={label} title={label} style={{ width: `${(amount / total) * 100}%`, background: color }} />)}
          </div>
          <div style={{ display: 'grid', gap: 9 }}>{buckets.map(([label, amount, color]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color }}><span>{label}</span><strong>₱{amount.toFixed(2)}</strong></div>)}</div>
        </section>
        <section style={{ marginTop: 14 }}>
          <h2 style={{ margin: '0 0 10px', color: '#17633f', fontSize: 14 }}>Top Outstanding Balances</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {outstandingCustomers.map((customer, index) => (
              <div key={customer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #ead8b8', borderRadius: 14, background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, color: '#78958d', fontSize: 11, textAlign: 'center' }}>{index + 1}</span>
                  <div>
                    <strong style={{ display: 'block', color: '#174d3d', fontSize: 12 }}>{customer.name}</strong>
                    <span style={{ color: '#78958d', fontSize: 10 }}>{customer.days_outstanding || 0} days overdue</span>
                  </div>
                </div>
                <strong style={{ color: '#174d3d', fontSize: 13 }}>₱{customer.balance.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
