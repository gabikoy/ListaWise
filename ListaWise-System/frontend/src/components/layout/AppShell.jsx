import React, { useState, useEffect } from 'react';
import { MobileNav } from './MobileNav';
import { DashboardView } from '../../views/DashboardView';
import { CustomersView } from '../../views/CustomersView';
import { OverdueView } from '../../views/OverdueView';
import { RiskView } from '../../views/RiskView';
import { ReportsView } from '../../views/ReportsView';
import { SettingsModal } from '../../views/SettingsModal';
import { CustomerDrawer } from '../customer/CustomerDrawer';
import { AddCustomerModal } from '../customer/AddCustomerModal';
import { ChatbotWidget } from '../chatbot/ChatbotWidget';

export function AppShell() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    // Auto-refresh in background every 30s to recalculate real-time daily metrics
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 30000);

    // Auto-refresh when user switches back to the app
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const handleOpenCustomer = (id) => {
    setSelectedCustomerId(id);
  };

  const handleCloseCustomer = () => {
    setSelectedCustomerId(null);
  };

  return (
    <div className="app-container">
      {/* Mobile App Device Viewport */}
      <div className="mobile-app-frame">
        {/* Scrollable Mobile Page Body */}
        <div className={`mobile-content ${currentTab === 'dashboard' ? 'dashboard-content' : ''}`} key={refreshKey}>
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenCustomer={handleOpenCustomer}
              onOpenAddCustomer={() => setShowAddCustomer(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              onOpenCustomer={handleOpenCustomer}
              onOpenAddCustomer={() => setShowAddCustomer(true)}
            />
          )}

          {currentTab === 'overdue' && (
            <OverdueView onOpenCustomer={handleOpenCustomer} />
          )}

          {currentTab === 'risk' && (
            <RiskView onOpenCustomer={handleOpenCustomer} />
          )}

          {currentTab === 'reports' && <ReportsView />}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
        <ChatbotWidget />
      </div>

      {/* Slide-Up Bottom Sheets & Modals */}
      {selectedCustomerId && (
        <CustomerDrawer
          customerId={selectedCustomerId}
          isOpen={!!selectedCustomerId}
          onClose={handleCloseCustomer}
          onCustomerUpdated={() => handleRefresh()}
          onCustomerDeleted={() => {
            handleCloseCustomer();
            handleRefresh();
          }}
        />
      )}

      {showAddCustomer && (
        <AddCustomerModal
          isOpen={showAddCustomer}
          onClose={() => setShowAddCustomer(false)}
          onSuccess={() => handleRefresh()}
        />
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
}
