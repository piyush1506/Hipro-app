import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
