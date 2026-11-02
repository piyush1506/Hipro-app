import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp.jsx';
import VendorPanel from './VendorPanel.jsx';
import LoginPage from './LoginPage.jsx';
import './index.css';

function AppRoot() {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') return { isAuthenticated: false, role: null };
    
    const token = localStorage.getItem('hipro_auth_token');
    const savedRole = localStorage.getItem('hipro_user_role');

    // Strict Security: Unauthenticated sessions are ALWAYS redirected to Login Page.
    // No URL hash bypasses (#admin or #vendor) are allowed without a verified JWT token.
    if (token && savedRole) {
      return { isAuthenticated: true, role: savedRole };
    }

    return { isAuthenticated: false, role: null };
  });

  const handleLoginSuccess = (role, data) => {
    setAuthState({
      isAuthenticated: true,
      role
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('hipro_auth_token');
    localStorage.removeItem('hipro_user_role');
    localStorage.removeItem('hipro_user');
    localStorage.removeItem('hipro_vendor');
    window.location.hash = '';
    setAuthState({
      isAuthenticated: false,
      role: null
    });
  };

  const handleSwitchToVendor = () => {
    // Only allow role switching if authenticated
    if (localStorage.getItem('hipro_auth_token')) {
      localStorage.setItem('hipro_user_role', 'VENDOR');
      setAuthState({ isAuthenticated: true, role: 'VENDOR' });
    }
  };

  const handleSwitchToAdmin = () => {
    // Only allow if authenticated
    if (localStorage.getItem('hipro_auth_token')) {
      localStorage.setItem('hipro_user_role', 'ADMIN');
      setAuthState({ isAuthenticated: true, role: 'ADMIN' });
    }
  };

  // Render Login Page if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Vendor & Operator Portal if verified role is VENDOR
  if (authState.role === 'VENDOR') {
    return (
      <VendorPanel
        onSwitchToSuperAdmin={handleSwitchToAdmin}
        onLogout={handleLogout}
      />
    );
  }

  // Render Super Admin Console if verified role is ADMIN
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
