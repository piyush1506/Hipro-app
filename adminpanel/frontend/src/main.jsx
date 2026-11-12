import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp.jsx';
import VendorPanel from './VendorPanel.jsx';
import LoginPage from './LoginPage.jsx';
import AdminLoginPage from './AdminLoginPage.jsx';
import VendorRegisterPage from './VendorRegisterPage.jsx';
import {
  clearLegacyRoleCache,
  clearStoredSession,
  getStaffPermissions,
  getStaffRoleName,
  isStaffRole,
  normalizeRoleName
} from './authUtils.js';
import './index.css';

// Intercept all API calls to attach JWT Bearer authorization header automatically
if (typeof window !== 'undefined' && !window.__hipro_fetch_intercepted__) {
  window.__hipro_fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async function (url, options = {}) {
    const token = localStorage.getItem('hipro_auth_token');
    if (token && typeof url === 'string' && (url.includes('/api/') || url.startsWith('/api'))) {
      const headers = new Headers(options.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      options = { ...options, headers };
    }
    return originalFetch(url, options);
  };
}

// Dedicated Admin Route (isolated from `/` and common `/admin` to prevent brute-force discovery)
const RAW_ADMIN_ROUTE = (import.meta.env.VITE_ADMIN_ROUTE || '/master-console').trim().toLowerCase();
const ADMIN_ROUTE = RAW_ADMIN_ROUTE.startsWith('/')
  ? (RAW_ADMIN_ROUTE.replace(/\/+$/, '') || '/master-console')
  : `/${RAW_ADMIN_ROUTE.replace(/\/+$/, '')}`;

const isAdminRouteMatch = (pathname, hash, search) => {
  const cleanPath = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  const cleanHash = (hash || '').toLowerCase();
  const routeSlug = ADMIN_ROUTE.replace(/^\//, '');
  return (
    cleanPath === ADMIN_ROUTE ||
    cleanHash === `#${routeSlug}` ||
    search.includes(`redirect=${encodeURIComponent(ADMIN_ROUTE)}`) ||
    search.includes(`redirect=${ADMIN_ROUTE}`)
  );
};

function AppRoot() {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, role: null, permissions: [], staff: null, isVerifying: false };
    }

    const token = localStorage.getItem('hipro_auth_token');
    return {
      isAuthenticated: false,
      role: null,
      permissions: [],
      staff: null,
      isVerifying: Boolean(token)
    };
  });

  // Production session verification: the server decides the role and permissions.
  // A cached role in localStorage is never trusted for authentication or routing.
  React.useEffect(() => {
    const token = localStorage.getItem('hipro_auth_token');
    if (!token) {
      setAuthState({ isAuthenticated: false, role: null, permissions: [], staff: null, isVerifying: false });
      return;
    }

    let cancelled = false;

    const verifyServerSession = async () => {
      const authHeaders = { Authorization: `Bearer ${token}` };

      try {
        const staffRes = await fetch('/api/v1/staff/me', {
          headers: authHeaders,
          cache: 'no-store'
        });

        if (staffRes.ok) {
          const data = await staffRes.json();
          const staff = data?.staff;
          const role = getStaffRoleName(staff);

          if (role) {
            clearLegacyRoleCache();
            if (!cancelled) {
              setAuthState({
                isAuthenticated: true,
                role,
                permissions: getStaffPermissions(staff),
                staff,
                isVerifying: false
              });
            }
            return;
          }
        }

        // A staff token is rejected by /staff/me. Check whether this is a valid vendor session.
        const vendorRes = await fetch('/api/v1/vendors/my-jobs', {
          headers: authHeaders,
          cache: 'no-store'
        });

        if (vendorRes.ok) {
          clearLegacyRoleCache();
          if (!cancelled) {
            setAuthState({
              isAuthenticated: true,
              role: 'VENDOR',
              permissions: [],
              staff: null,
              isVerifying: false
            });
          }
          return;
        }

        console.warn('Invalid, expired, or deactivated session. Resetting authentication.');
        clearStoredSession();
        if (!cancelled) {
          setAuthState({ isAuthenticated: false, role: null, permissions: [], staff: null, isVerifying: false });
        }
      } catch (err) {
        // Fail closed for the UI. Keep the token so a later reload can retry when the server is reachable.
        console.error('Session verification failed:', err);
        if (!cancelled) {
          setAuthState({ isAuthenticated: false, role: null, permissions: [], staff: null, isVerifying: false });
        }
      }
    };

    verifyServerSession();
    return () => { cancelled = true; };
  }, []);

  // Determine portal by URL: `/` -> Vendor Portal (Default), `/register` -> Vendor Onboarding, `/master-console` -> Dedicated Admin Terminal
  const [targetPortal, setTargetPortal] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (isAdminRouteMatch(path, hash, search)) {
        if (search.includes('redirect=')) {
          try {
            window.history.replaceState(null, '', ADMIN_ROUTE);
          } catch (e) {}
        }
        return 'admin';
      }

      if (path.includes('/register') || hash.includes('register')) return 'register';
    }
    return 'vendor';
  });

  // Listen for navigation changes (popstate & hashchange)
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (isAdminRouteMatch(path, hash, search)) {
        setTargetPortal('admin');
      } else if (path.includes('/register') || hash.includes('register')) {
        setTargetPortal('register');
      } else {
        setTargetPortal('vendor');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigatePortal = (portal) => {
    if (typeof window !== 'undefined') {
      try {
        if (portal === 'register') window.history.pushState(null, '', '/register');
        else if (portal === 'admin') window.history.pushState(null, '', ADMIN_ROUTE);
        else window.history.pushState(null, '', '/');
      } catch (e) {}
    }
    setTargetPortal(portal);
  };

  const handleLoginSuccess = (role, data) => {
    // Some legacy callers pass only the response payload. Normalize both shapes.
    const payload = data || (role && typeof role === 'object' ? role : null);
    const staff = payload?.staff || null;
    const normalizedRole = normalizeRoleName(role) ||
      getStaffRoleName(staff) ||
      (payload?.vendor ? 'VENDOR' : '');

    if (!normalizedRole) {
      clearStoredSession();
      setAuthState({ isAuthenticated: false, role: null, permissions: [], staff: null, isVerifying: false });
      return;
    }

    clearLegacyRoleCache();
    setAuthState({
      isAuthenticated: true,
      role: normalizedRole,
      permissions: isStaffRole(normalizedRole) ? getStaffPermissions(staff) : [],
      staff: isStaffRole(normalizedRole) ? staff : null,
      isVerifying: false
    });

    // Staff always land in the protected operations console, never in the vendor portal.
    if (isStaffRole(normalizedRole)) {
      setTargetPortal('admin');
      if (typeof window !== 'undefined') {
        try {
          window.history.replaceState(null, '', ADMIN_ROUTE);
        } catch (e) {}
      }
    } else if (normalizedRole === 'VENDOR') {
      setTargetPortal('vendor');
      if (typeof window !== 'undefined') {
        try {
          window.history.replaceState(null, '', '/');
        } catch (e) {}
      }
    }
  };

  const handleLogout = (nextView = 'vendor') => {
    clearStoredSession();
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', nextView === 'admin' ? ADMIN_ROUTE : '/');
      } catch (e) {}
    }
    setAuthState({
      isAuthenticated: false,
      role: null,
      permissions: [],
      staff: null,
      isVerifying: false
    });
    setTargetPortal(nextView);
  };

  if (authState.isVerifying) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0B63F6] rounded-full animate-spin"></div>
          <div className="text-xs font-semibold text-slate-500">Verifying production session…</div>
        </div>
      </div>
    );
  }

  // Dedicated Admin & Staff Route (`/master-console`)
  if (targetPortal === 'admin') {
    if (!authState.isAuthenticated || !isStaffRole(authState.role)) {
      return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    return (
      <AdminApp
        currentUserRole={authState.role}
        initialPermissions={authState.permissions}
        initialStaff={authState.staff}
        onSwitchToCustomerApp={() => {
          window.location.href = '/';
        }}
        onSwitchToVendor={() => {
          handleLogout('vendor');
        }}
        onLogout={() => handleLogout('admin')}
      />
    );
  }

  const [selectedRegisterCategory, setSelectedRegisterCategory] = useState('Services');

  // Root & Vendor Routes (`/`, `/vendor`, `/login`, `/register`)
  if (!authState.isAuthenticated || authState.role !== 'VENDOR') {
    if (targetPortal === 'register') {
      return (
        <VendorRegisterPage
          initialCategory={selectedRegisterCategory}
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={() => navigatePortal('vendor')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={(cat) => {
          if (cat) setSelectedRegisterCategory(cat);
          navigatePortal('register');
        }}
      />
    );
  }

  // Authenticated: Render Vendor & Operator Portal
  return (
    <VendorPanel
      onLogout={() => handleLogout('vendor')}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
