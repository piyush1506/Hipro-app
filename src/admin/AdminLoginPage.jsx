import React, { useState } from 'react';
import {
  Briefcase, Lock, Mail, ArrowRight, Eye, EyeOff,
  ShieldCheck, AlertCircle, CheckCircle2, ChevronDown, Store, UserPlus
} from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://app.hindustanprojects.in');

export default function AdminLoginPage({ onLoginSuccess }) {
  const [operatorCategory, setOperatorCategory] = useState('Staff');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleAdminSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const email = adminEmail.trim();
    const password = adminPassword.trim();

    if (!email) {
      setError('Please provide your registered operator email or phone.');
      return;
    }
    if (!password) {
      setError('Please enter your security passcode or password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with unified staff role endpoint
      let res = await fetch(`${API_BASE}/api/v1/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // 2. Fallback to legacy admin if staff login 404s
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/api/v1/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      }

      // 3. Fallback to vendor login if this is a partner credential
      if (res.status === 401 || res.status === 403) {
        const vRes = await fetch(`${API_BASE}/api/v1/auth/vendor/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: email, email, passcode: password, category: operatorCategory }),
        });
        const vData = await vRes.json();
        if (vData.success && vData.token) {
          localStorage.setItem('hipro_auth_token', vData.token);
          localStorage.setItem('hipro_user_role', 'VENDOR');
          localStorage.setItem('hipro_vendor', JSON.stringify(vData.vendor));
          setSuccessMsg(`Welcome, ${vData.vendor?.businessName || vData.vendor?.name}! Opening console...`);
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess('VENDOR', vData);
            else window.location.href = '/';
          }, 450);
          return;
        }
      }

      const data = await res.json();

      if (data.success && data.token) {
        const userRole = (data.staff?.role || data.user?.role || 'ADMIN').toUpperCase();
        const userRoleDisplay = data.staff?.roleDisplayName || data.staff?.role || userRole;
        const permissions = data.staff?.permissions || (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? ['*'] : []);

        localStorage.setItem('hipro_auth_token', data.token);
        localStorage.setItem('hipro_user_role', userRole);
        localStorage.setItem('hipro_user_role_display', userRoleDisplay);
        localStorage.setItem('hipro_user', JSON.stringify(data.staff || data.user));
        localStorage.setItem('hipro_permissions', JSON.stringify(permissions));

        setSuccessMsg(`Access verified for ${data.staff?.name || 'Administrator'} (${userRoleDisplay}). Opening console...`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(userRole, data);
          } else if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 450);
      } else {
        setError(data.message || 'Access Denied: Invalid credentials or role permissions.');
      }
    } catch (err) {
      console.error('Admin login network error:', err);
      setError('Authentication server unreachable. Please verify backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    switch (operatorCategory) {
      case 'Staff':
        return 'Access Operations Console →';
      case 'Adventure':
        return 'Access Adventure Console →';
      case 'Services':
        return 'Access Contractor Console →';
      case 'Material':
        return 'Access Supplier Console →';
      default:
        return 'Access Operations Console →';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 flex flex-col justify-between font-sans antialiased relative overflow-hidden select-none">
      
      {/* Background Soft Ambient Light-Blue Glows */}
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#EBF3FE]/80 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#EEF5FF]/90 blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-8 sm:px-14 py-6 flex items-center justify-between">
        {/* Left Brand: Blue H icon + Hipro | Partner Access */}
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-[#0B63F6] flex items-center justify-center font-bold text-white text-[17px] shadow-sm tracking-tight">
            H
          </div>
          <div className="flex items-center">
            <span className="font-heading font-bold text-[20px] text-[#0F172A] tracking-tight">Hipro</span>
            <span className="text-slate-300 font-light text-base mx-3">|</span>
            <span className="text-[14px] font-normal text-slate-500">Partner Access</span>
          </div>
        </div>

        {/* Right: Secure & Trusted with green shield */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-[12.5px] text-slate-700 font-medium">Secure & Trusted</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-4 sm:py-6 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
        
        {/* Left Side: Handshake Graphic + Stronger Together */}
        <div className="hidden lg:flex flex-col items-start text-left max-w-[360px] pl-4">
          
          {/* Handshake & City Skyline Illustration */}
          <div className="relative w-[340px] h-[220px] flex items-center justify-center mb-6">
            
            {/* City Skyline Outline Background */}
            <svg className="absolute top-2 left-6 w-[280px] h-[150px] text-slate-200/90 pointer-events-none" viewBox="0 0 240 130" fill="currentColor">
              <rect x="18" y="55" width="22" height="75" rx="2" opacity="0.45" />
              <rect x="44" y="30" width="28" height="100" rx="2.5" opacity="0.65" />
              <rect x="76" y="45" width="24" height="85" rx="2" opacity="0.55" />
              <rect x="105" y="12" width="34" height="118" rx="3" opacity="0.8" />
              <rect x="144" y="38" width="26" height="92" rx="2" opacity="0.6" />
              <rect x="174" y="24" width="28" height="106" rx="2.5" opacity="0.7" />
              <rect x="206" y="58" width="22" height="72" rx="2" opacity="0.45" />
              <circle cx="58" cy="42" r="1.6" fill="#FFFFFF" opacity="0.85" />
              <circle cx="58" cy="54" r="1.6" fill="#FFFFFF" opacity="0.85" />
              <circle cx="122" cy="24" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="122" cy="36" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="122" cy="48" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="188" cy="38" r="1.6" fill="#FFFFFF" opacity="0.85" />
              <circle cx="188" cy="50" r="1.6" fill="#FFFFFF" opacity="0.85" />
            </svg>

            {/* Swooshing Light Blue Wave */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 220" fill="none">
              <path
                d="M10 125 C 70 80, 160 170, 320 95"
                stroke="#E2EEFE"
                strokeWidth="32"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            {/* Clean Flat Vector Handshake */}
            <div className="relative z-10 w-[140px] h-[140px] flex items-center justify-center">
              <svg className="w-[130px] h-[130px] drop-shadow-[0_4px_12px_rgba(37,99,235,0.18)]" viewBox="0 0 100 100" fill="none">
                <path d="M8 50 L26 34 L36 45 L18 61 Z" fill="#2563EB" />
                <path d="M24 32 L29 28 L39 39 L34 43 Z" fill="#93C5FD" />
                <path d="M92 50 L74 34 L64 45 L82 61 Z" fill="#3B82F6" />
                <path d="M76 32 L71 28 L61 39 L66 43 Z" fill="#93C5FD" />
                <path
                  d="M30 42 C32 40 37 40 40 43 L54 53 C57 55 57 59 54 62 C51 65 47 65 44 62 L30 51 C28 49 28 45 30 42 Z"
                  fill="#1D4ED8"
                />
                <path
                  d="M70 42 C68 40 63 40 60 43 L46 53 C43 55 43 59 46 62 C49 65 53 65 56 62 L70 51 C72 49 72 45 70 42 Z"
                  fill="#60A5FA"
                />
                <path d="M38 39 C41 36 46 38 47 42 L44 47 L37 42 Z" fill="#2563EB" />
                <path d="M62 39 C59 36 54 38 53 42 L56 47 L63 42 Z" fill="#93C5FD" />
                <path d="M48 57 C50 59 53 60 55 58" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M51 53 C53 55 56 56 58 54" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M54 49 C56 51 59 52 61 50" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Stronger Together Text - Left Aligned */}
          <div className="space-y-1.5 pl-2">
            <h2 className="font-heading font-bold text-[24px] text-[#0F172A] tracking-tight">
              Stronger Together
            </h2>
            <p className="text-[14px] text-slate-500 font-normal leading-relaxed">
              Partner with Hipro for<br />better business growth.
            </p>
          </div>
        </div>

        {/* Right Side: The White Login Card */}
        <div className="w-full max-w-[430px]">
          <div className="bg-white rounded-[28px] px-8 sm:px-9 py-9 shadow-[0_12px_45px_rgba(15,23,42,0.05)] border border-slate-100">
            
            {/* Top Icon: Blue Briefcase in Light Blue Circle */}
            <div className="w-14 h-14 rounded-full bg-[#EBF3FE] flex items-center justify-center mx-auto mb-4.5">
              <Briefcase className="w-6 h-6 text-[#0B63F6]" strokeWidth={2} />
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h1 className="font-heading font-bold text-[23px] text-[#0F172A] tracking-tight">
                Vendor & Operator Login
              </h1>
              <p className="text-[12.5px] text-slate-500 font-normal mt-1 leading-normal">
                Sign in to manage your bookings, quotes and customer requests.
              </p>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              
              {/* Field 1: Partner Category * */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1F2937] mb-1.5">
                  Partner Category *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" strokeWidth={1.8} />
                  </div>

                  <select
                    value={operatorCategory}
                    onChange={(e) => {
                      setOperatorCategory(e.target.value);
                      setError(null);
                    }}
                    className="w-full h-11 pl-10 pr-9 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                  >
                    <option value="Adventure">Adventure & Tourism Operator (Bathe, Paragliding, ...</option>
                    <option value="Staff">Operations & Staff Role (Telecaller, Civil Engineer, Purchase, ...</option>
                    <option value="Services">Civil & Home Services Contractor (Civil, Waterproof, ...</option>
                    <option value="Material">Material Supplier & Trader (Cement, Steel, Wood, ...</option>
                    <option value="Labor">Labor Contractor & Manpower (Masons, Helpers, ...</option>
                  </select>

                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 2: Registered Mobile Number or Email * */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1F2937] mb-1.5">
                  Registered Mobile Number or Email *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter mobile number or email"
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Field 3: Security PIN / Passcode */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1F2937] mb-1.5">
                  Security PIN / Passcode
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter 4–6 digits"
                    className="w-full h-11 pl-10 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-4 h-4" strokeWidth={1.8} /> : <EyeOff className="w-4 h-4" strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-11 rounded-xl font-medium text-[13.5px] text-white bg-[#0B63F6] hover:bg-[#0954D8] active:bg-[#0747B8] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{getButtonLabel()}</span>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center before:content-[''] before:flex-1 before:border-t before:border-slate-100 after:content-[''] after:flex-1 after:border-t after:border-slate-100">
                <span className="px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Register Link */}
              <div className="text-center pt-0.5">
                <a
                  href="/#register"
                  className="text-[12.5px] text-[#0B63F6] hover:text-[#0954D8] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>New operator or contractor? Register here →</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-[12px] text-slate-500 flex items-center justify-center gap-2.5">
        <div className="flex items-center gap-1.5 font-normal text-slate-600">
          <svg className="w-3.5 h-3.5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>TLS 1.3 / Secure Connection</span>
        </div>
        <span className="text-slate-300 font-light">|</span>
        <span className="font-normal text-slate-500">Hipro Partner Portal</span>
      </footer>
    </div>
  );
}
