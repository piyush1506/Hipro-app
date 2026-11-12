import React, { useState } from 'react';
import {
  Briefcase, Lock, Phone, ArrowRight,
  Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2,
  Building2, ChevronDown, UserPlus
} from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://app.hindustanprojects.in');

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  // Vendor category selection
  const [vendorCategory, setVendorCategory] = useState('Adventure');

  // Form states
  const [vendorContact, setVendorContact] = useState('');
  const [vendorPasscode, setVendorPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLoginComplete = (role, data) => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect && redirect.startsWith('/')) {
          window.history.replaceState(null, '', redirect);
        }
      } catch (e) {
        // ignore url parsing errors
      }
    }
    if (onLoginSuccess) onLoginSuccess(role, data);
  };

  const handleVendorLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!vendorContact.trim()) {
      setError('Please enter your registered mobile number or email.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: vendorContact.trim(),
          email: vendorContact.trim(),
          passcode: vendorPasscode.trim(),
          category: vendorCategory
        }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('hipro_auth_token', data.token);
        localStorage.setItem('hipro_user_role', 'VENDOR');
        localStorage.setItem('hipro_vendor', JSON.stringify(data.vendor));
        setSuccessMsg(`Welcome, ${data.vendor?.businessName || data.vendor?.name}! Initializing console...`);
        setTimeout(() => {
          handleLoginComplete('VENDOR', data);
        }, 500);
      } else {
        setError(data.message || 'Access Denied: Unregistered contact or invalid credentials.');
      }
    } catch (err) {
      console.error('Vendor login error:', err);
      setError('Connection failed: Unable to reach authentication server. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic console button label
  const getButtonLabel = () => {
    switch (vendorCategory) {
      case 'Adventure':
        return 'Access Adventure Console →';
      case 'Services':
        return 'Access Contractor Console →';
      case 'Material':
        return 'Access Supplier Console →';
      case 'Labor':
        return 'Access Labor Console →';
      default:
        return 'Access Partner Console →';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased relative overflow-hidden selection:bg-blue-600/10">
      
      {/* Background Soft Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/25">
            H
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">Hipro</span>
            <span className="text-slate-300 font-light text-lg">|</span>
            <span className="text-sm font-semibold text-slate-500">Partner Access</span>
          </div>
        </div>

        {/* Right: Security Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure & Trusted</span>
        </div>
      </header>

      {/* Main Hero & Auth Split Layout */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Graphic & Brand Statement */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center text-center space-y-6 px-4">
          
          {/* Partnership Vector Graphic with City Silhouette */}
          <div className="relative w-72 h-64 flex items-center justify-center">
            {/* City Silhouette Background (Soft SVG) */}
            <svg className="absolute inset-0 w-full h-full text-blue-100/70" viewBox="0 0 300 240" fill="currentColor">
              <rect x="25" y="100" width="28" height="110" rx="2" opacity="0.4" />
              <rect x="58" y="70" width="34" height="140" rx="3" opacity="0.6" />
              <rect x="96" y="90" width="30" height="120" rx="2" opacity="0.5" />
              <rect x="130" y="45" width="40" height="165" rx="3" opacity="0.7" />
              <rect x="174" y="80" width="32" height="130" rx="2" opacity="0.5" />
              <rect x="210" y="60" width="36" height="150" rx="3" opacity="0.6" />
              <rect x="250" y="110" width="26" height="100" rx="2" opacity="0.4" />
            </svg>

            {/* Ambient Flow Curve */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-sky-400/5 to-transparent rounded-full blur-2xl"></div>

            {/* Handshake Badge / Icon (Large & Styled to match image) */}
            <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.4-2.4a1 1 0 0 0-1.4 0l-1.4 1.4" />
                <path d="m18 10 1.7-1.7a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-3.4 3.4" />
                <path d="m7 7-4.3 4.3a1 1 0 0 0 0 1.4l2.4 2.4a1 1 0 0 0 1.4 0l1.4-1.4" />
                <path d="M14.5 13.5 13 12" />
                <path d="M12.5 15.5 11 14" />
                <path d="M10.5 17.5 9 16" />
                <path d="M7.7 13.3 6.3 11.9a1 1 0 0 1 0-1.4L10 6.8a1 1 0 0 1 1.4 0L14 9.4" />
              </svg>
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Stronger Together
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Partner with Hipro for better business growth.
            </p>
          </div>
        </div>

        {/* Right Column: Clean White Authentication Card */}
        <div className="lg:col-span-7 max-w-md w-full mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-100 relative">
            
            {/* Top Center Icon (Blue Briefcase inside light blue circle) */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-2xs">
              <Briefcase className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Card Titles */}
            <div className="text-center mb-6">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                Vendor & Operator Login
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                Sign in to manage your bookings, quotes and customer requests.
              </p>
            </div>

            {/* Error or Success Feedback */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleVendorLogin} className="space-y-4 text-left">
              
              {/* Field 1: Partner Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Partner Category *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={vendorCategory}
                    onChange={(e) => {
                      setVendorCategory(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-slate-300"
                  >
                    <option value="Adventure">Adventure & Tourism Operator (Bathe, Paragliding, ...</option>
                    <option value="Services">Civil & Home Services Contractor (Civil, Waterproof, ...</option>
                    <option value="Material">Material Supplier & Trader (Cement, Steel, Wood, ...</option>
                    <option value="Labor">Labor Contractor & Manpower (Masons, Helpers, ...</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 2: Registered Mobile Number or Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Registered Mobile Number or Email *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    placeholder="Enter mobile number or email"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Field 3: Security PIN / Passcode */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Security PIN / Passcode
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={vendorPasscode}
                    onChange={(e) => setVendorPasscode(e.target.value)}
                    placeholder="Enter 4–6 digits"
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{getButtonLabel()}</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-3">OR</span>
                </div>
              </div>

              {/* Registration Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToRegister) {
                      onSwitchToRegister();
                    } else if (typeof window !== 'undefined') {
                      window.location.hash = '#register';
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>New operator or contractor? Register here →</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>TLS 1.3 / Secure Connection</span>
        </div>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="font-medium text-slate-500">Hipro Partner Portal</span>
      </footer>
    </div>
  );
}
