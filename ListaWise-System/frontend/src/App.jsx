import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoginView } from './views/LoginView';
import { AppShell } from './components/layout/AppShell';

function MainRouter() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AppShell /> : <LoginView />;
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
