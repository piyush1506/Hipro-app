import React, { useState } from 'react';
import {
  ShieldCheck, HardHat, Mail, Lock, Phone, ArrowRight,
  Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, Compass,
  Briefcase, KeyRound, Building2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'https://app.hindustanprojects.in');

export default function LoginPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'vendor'

  // Admin form
  const [adminEmail, setAdminEmail] = useState('admin@hipro.in');
  const [adminPassword, setAdminPassword] = useState('hipro@admin2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Vendor form
  const [vendorContact, setVendorContact] = useState('+91 98290 88801');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleAdminSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('hipro_auth_token', data.token);
        localStorage.setItem('hipro_user_role', 'ADMIN');
        localStorage.setItem('hipro_user', JSON.stringify(data.user));
        setSuccessMsg('Authentication successful! Loading Super Admin console...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess('ADMIN', data);
        }, 500);
      } else {
        setError(data.message || 'Invalid credentials. Check your email and password.');
      }
    } catch (err) {
      // Local demo fallback if backend is offline
      if (adminEmail === 'admin@hipro.in' && adminPassword === 'hipro@admin2026') {
        const demoData = {
          token: 'demo_admin_jwt_token',
          user: { id: 'super_admin_01', email: adminEmail, role: 'ADMIN', name: 'Super Administrator' }
        };
        localStorage.setItem('hipro_auth_token', demoData.token);
        localStorage.setItem('hipro_user_role', 'ADMIN');
        localStorage.setItem('hipro_user', JSON.stringify(demoData.user));
        if (onLoginSuccess) onLoginSuccess('ADMIN', demoData);
      } else {
        setError('Network error connecting to auth server. Try demo credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: vendorContact, email: vendorContact }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('hipro_auth_token', data.token);
        localStorage.setItem('hipro_user_role', 'VENDOR');
        localStorage.setItem('hipro_vendor', JSON.stringify(data.vendor));
        setSuccessMsg(`Welcome ${data.vendor?.name}! Opening vendor portal...`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess('VENDOR', data);
        }, 500);
      } else {
        setError(data.message || 'Vendor record not found. Try a registered demo phone number.');
      }
    } catch (err) {
      // Local demo fallback
      const demoVendor = {
        id: 'v_adv_01',
        vendorId: 'v_adv_01',
        name: 'Captain Arvind Negi',
        businessName: 'Himalayan Sky Gliders & Air Safari',
        phone: vendorContact,
        role: 'VENDOR'
      };
      localStorage.setItem('hipro_auth_token', 'demo_vendor_jwt_token');
      localStorage.setItem('hipro_user_role', 'VENDOR');
      localStorage.setItem('hipro_vendor', JSON.stringify(demoVendor));
      if (onLoginSuccess) onLoginSuccess('VENDOR', { vendor: demoVendor });
    } finally {
      setLoading(false);
    }
  };

  const setVendorPreset = (phone, name) => {
    setVendorContact(phone);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-danger-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-danger-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-brand-500/20 border border-white/10">
            H
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-2">
              Hipro Gateway
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold border border-white/10">
                v2.6 Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Unified Operations & Partner Access</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted RBAC</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/40">
          {/* Persona Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setError(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-brand-400 dark:text-brand-600' : ''}`} />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('vendor'); setError(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'vendor'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HardHat className={`w-4 h-4 ${activeTab === 'vendor' ? 'text-danger-400 dark:text-danger-600' : ''}`} />
              <span>Vendor & Partner</span>
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
              {activeTab === 'admin' ? 'Super Admin Portal' : 'Vendor & Operator Desk'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'admin'
                ? 'Sign in with your master administrative credentials.'
                : 'Access your assigned customer bookings, quotes, and dispatch.'}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-600 dark:text-danger-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SUPER ADMIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@hipro.in"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-medium transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Enter Super Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VENDOR & OPERATOR FORM */}
          {activeTab === 'vendor' && (
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vendor Phone / Operator ID
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    placeholder="+91 98290 88801 or vendor ID"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger-500/30 focus:border-danger-500 font-medium transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your registered mobile number for instant verification.
                </p>
              </div>

              {/* Quick Preset Selector for Fast Evaluation */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quick Demo Operator Profiles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVendorPreset('+91 98290 88801', 'Captain Arvind Negi')}
                    className="p-2 text-left bg-slate-100 dark:bg-slate-800 hover:bg-danger-50 dark:hover:bg-danger-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-danger-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Capt. Arvind Negi</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Air Sports & Paragliding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendorPreset('+91 94141 77702', 'Fateh Singh Bhati')}
                    className="p-2 text-left bg-slate-100 dark:bg-slate-800 hover:bg-warning-50 dark:hover:bg-warning-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-warning-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Fateh Singh Bhati</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Thar Desert Safari</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendorPreset('+91 98370 66603', 'Rakesh Rawat')}
                    className="p-2 text-left bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-sky-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rakesh Rawat</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Ganga Water Rafting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendorPreset('+91 98765 43210', 'Rajesh Kumar')}
                    className="p-2 text-left bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rajesh Kumar</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Waterproofing & Leakage</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-danger-600 to-danger-700 hover:from-danger-700 hover:to-danger-800 shadow-md shadow-danger-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Enter Vendor Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-brand-400" />
              <span>Demo Login:</span>
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600 dark:text-slate-300">
                admin@hipro.in
              </code>
              <span>/</span>
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600 dark:text-slate-300">
                hipro@admin2026
              </code>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-500 pt-4">
        <p>&copy; {new Date().getFullYear()} Hindustan Projects (Hipro). All rights reserved.</p>
      </footer>
    </div>
  );
}
