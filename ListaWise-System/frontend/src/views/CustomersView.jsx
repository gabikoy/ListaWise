import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LogOut, Plus, Search } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function CustomersView({ onOpenCustomer, onOpenAddCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const { isOwner, logout } = useAuth();
  const { error } = useToast();

  useEffect(() => {
    api.get('/customers')
      .then(setCustomers)
      .catch((err) => error(err.message || 'Failed to load customers.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCustomers = useMemo(() => customers
    .filter((customer) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query
        || customer.name.toLowerCase().includes(query)
        || customer.phone?.includes(query)
        || customer.address?.toLowerCase().includes(query);
      const matchesRisk = riskFilter === 'ALL' || customer.risk === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => b.balance - a.balance), [customers, searchQuery, riskFilter]);

  return (
    <div style={{ margin: '-16px -16px 0', minHeight: '100%', background: '#f8f5ef' }}>
      <header style={{ background: '#17633f', color: '#fff', padding: '58px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20 }}>Customers</h1>
            <p style={{ margin: '3px 0 0', fontSize: 11, opacity: 0.75 }}>{customers.length} registered</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => logout('You have signed out.')} aria-label="Log out" style={{ background: 'transparent', border: 0, color: '#fff', padding: 6, cursor: 'pointer' }}>
              <LogOut size={17} />
            </button>
            {isOwner && (
              <button type="button" onClick={onOpenAddCustomer} aria-label="Add customer" style={{ width: 36, height: 36, border: 0, borderRadius: '50%', background: '#f2a52b', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <Plus size={22} />
              </button>
            )}
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 14 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8da59d' }} />
          <input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search customer..." aria-label="Search customer" style={{ width: '100%', boxSizing: 'border-box', border: 0, borderRadius: 11, padding: '11px 12px 11px 38px', outline: 0, background: '#f8f5ef', color: '#174d3d', fontSize: 12 }} />
        </div>
      </header>

      <div style={{ background: '#edf6f2', padding: '12px 20px 10px', display: 'flex', gap: 8 }}>
        {[['ALL', 'All'], ['HIGH', 'High Risk'], ['LOW', 'Low Risk']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setRiskFilter(id)} style={{ border: `1px solid ${riskFilter === id ? '#17633f' : '#cce4d9'}`, borderRadius: 999, padding: '5px 13px', background: riskFilter === id ? '#17633f' : '#fff', color: riskFilter === id ? '#fff' : '#17633f', fontSize: 11, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      <main style={{ padding: '10px 20px 80px' }}>
        {isLoading ? <div style={{ textAlign: 'center', padding: 60, color: '#78958d' }}>Loading customers...</div> : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#78958d' }}>No customers found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {filteredCustomers.map((customer) => {
              const highRisk = customer.risk === 'HIGH';
              return (
                <button key={customer.id} type="button" onClick={() => onOpenCustomer(customer.id)} style={{ width: '100%', textAlign: 'left', padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid #ead8b8', borderRadius: 15, background: '#fff' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span style={{ width: 40, height: 40, borderRadius: '50%', background: highRisk ? '#fde5e5' : '#edf7f2', color: highRisk ? '#c83e36' : '#17633f', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {customer.name.split(' ').map((name) => name[0]).slice(0, 2).join('')}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#174d3d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {customer.name} {highRisk && <AlertTriangle size={12} color="#c83e36" fill="#c83e36" />}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 10, color: '#78958d' }}>
                        {customer.days_outstanding || 0} days · {customer.transaction_count || 0} transactions
                      </span>
                    </span>
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <strong style={{ display: 'block', color: '#174d3d', fontSize: 14 }}>₱{customer.balance?.toFixed(2)}</strong>
                    <span style={{ display: 'block', color: '#78958d', fontSize: 10, marginTop: 2 }}>balance</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
