import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Users,
  ClockAlert,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Receipt,
  CreditCard,
  PlusCircle,
  MessageSquare,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';
import { RiskBadge } from '../components/common/Badge';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function DashboardView({
  onOpenCustomer,
  onOpenAddCustomer,
  onNavigateTab,
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();
  const { logout } = useAuth();

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res);
    } catch (err) {
      error(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#F5F0E6' }}>
        Loading store ledger metrics...
      </div>
    );
  }

  const longest = data?.longestOutstanding || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a5739', display: 'flex', flexDirection: 'column' }}>
      
      {/* Solid Green Upper Area (No header bar, no logos, just green) */}
      <div style={{ padding: '24px', paddingBottom: '20px', color: '#FFFFFF', position: 'relative' }}>
      <button type="button" onClick={() => logout('You have signed out.')} aria-label="Log out" style={{ position: 'absolute', top: 22, right: 20, background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}>
        <LogOut size={17} />
      </button>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
          Sunday, September 6
        </div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' }}>Good day, Admin!</h1>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>Here's your store's credit overview</p>
        <div style={{
          backgroundColor: '#FFFFFF',
          color: '#0a5739',
          borderRadius: '16px',
          padding: '20px',
          marginTop: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#668078', letterSpacing: '0.5px', fontWeight: '600' }}>
            TOTAL OUTSTANDING UTANG
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', margin: '8px 0 4px 0' }}>
            ₱{(data?.totalOutstanding || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '14px', color: '#668078' }}>
            Across {data?.activeCustomers || 0} customers
          </div>
        </div>
      </div>

      {/* The beige surface starts below the green hero and balance card. */}
      <div style={{ 
        backgroundColor: '#F5F0E6', 
        borderTopLeftRadius: '28px', 
        borderTopRightRadius: '28px', 
        flex: 1, 
        padding: '20px',
        paddingBottom: '100px', // Space for bottom nav
        minHeight: '80vh'
      }}>
        
        {/* Two Mini Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* High Risk Card */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '12px', 
            padding: '16px',
            border: '1px solid #EAD5D5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C0392B', fontSize: '12px', fontWeight: '600' }}>
              <ShieldAlert size={14} /> High Risk
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#C0392B', marginTop: '8px' }}>
              {data?.highRiskCount || 0}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>customers</div>
          </div>

          {/* Overdue Card */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '12px', 
            padding: '16px',
            border: '1px solid #E8D9B0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B8860B', fontSize: '12px', fontWeight: '600' }}>
              <ClockAlert size={14} /> Overdue
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#B8860B', marginTop: '8px' }}>
              {data?.overdueCount || 0}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>&gt;30 days unpaid</div>
          </div>
        </div>

        {/* Priority Collections Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0a5739', fontWeight: '700' }}>Priority Collections</h3>
          <button 
            onClick={() => onNavigateTab('overdue')} 
            style={{ color: '#0a5739', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        {/* Customer List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {longest.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#888', backgroundColor: 'white', borderRadius: '12px' }}>
              No outstanding balances! All debts are paid.
            </div>
          ) : (
            longest.map((cust) => (
              <div
                key={cust.id}
                onClick={() => onOpenCustomer(cust.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid #EAE4D8'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#E8F5E9',
                      color: '#0a5739',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    {cust.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#333' }}>
                      {cust.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {cust.days_outstanding} days overdue
                      </span>
                      <RiskBadge risk={cust.risk} size="sm" />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: '800', color: '#C0392B' }}>
                    ₱{cust.balance?.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}