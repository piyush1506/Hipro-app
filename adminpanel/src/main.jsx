import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp.jsx';
import VendorPanel from './VendorPanel.jsx';
import LoginPage from './LoginPage.jsx';
import './index.css';

function AppRoot() {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') return { isAuthenticated: false, role: null };
    
    const hash = window.location.hash;
    const token = localStorage.getItem('hipro_auth_token');
    const savedRole = localStorage.getItem('hipro_user_role');

    // URL hash overrides for instant demo navigation
    if (hash === '#login') return { isAuthenticated: false, role: null };
    if (hash === '#vendor') return { isAuthenticated: true, role: 'VENDOR' };
    if (hash === '#admin') return { isAuthenticated: true, role: 'ADMIN' };

    if (token && savedRole) {
      return { isAuthenticated: true, role: savedRole };
    }

    // Default to LoginPage if unauthenticated
    return { isAuthenticated: false, role: null };
  });

  const handleLoginSuccess = (role, data) => {
    setAuthState({
      isAuthenticated: true,
      role
    });
    if (role === 'VENDOR') {
      window.location.hash = '#vendor';
    } else {
      window.location.hash = '#admin';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hipro_auth_token');
    localStorage.removeItem('hipro_user_role');
    localStorage.removeItem('hipro_user');
    localStorage.removeItem('hipro_vendor');
    window.location.hash = '#login';
    setAuthState({
      isAuthenticated: false,
      role: null
    });
  };

  const handleSwitchToVendor = () => {
    localStorage.setItem('hipro_user_role', 'VENDOR');
    window.location.hash = '#vendor';
    setAuthState({ isAuthenticated: true, role: 'VENDOR' });
  };

  const handleSwitchToAdmin = () => {
    localStorage.setItem('hipro_user_role', 'ADMIN');
    window.location.hash = '#admin';
    setAuthState({ isAuthenticated: true, role: 'ADMIN' });
  };

  // Render Login Page if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Vendor & Operator Portal if role is VENDOR
  if (authState.role === 'VENDOR') {
    return (
      <VendorPanel
        onSwitchToSuperAdmin={handleSwitchToAdmin}
        onLogout={handleLogout}
      />
    );
  }

  // Render Super Admin Console
  return (
    <AdminApp
      onSwitchToCustomerApp={() => {
        window.location.href = '/';
      }}
      onSwitchToVendor={handleSwitchToVendor}
      onLogout={handleLogout}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
