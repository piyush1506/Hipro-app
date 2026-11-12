import React, { useState } from 'react';
import {
  Briefcase, Building2, Landmark, User, Users,
  Mail, Phone, Lock, Eye, EyeOff, MapPin, Home,
  Search, Info, UserPlus, ChevronDown, Rocket,
  ShieldCheck, Headphones, AlertCircle, CheckCircle2
} from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://app.hindustanprojects.in');

const INDIAN_STATES = [
  'Rajasthan', 'Maharashtra', 'Delhi', 'Gujarat', 'Karnataka',
  'Uttar Pradesh', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Madhya Pradesh',
  'Haryana', 'Punjab', 'Bihar', 'Kerala', 'Andhra Pradesh',
  'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand',
  'Himachal Pradesh', 'Goa', 'Jammu and Kashmir', 'Chandigarh'
];

export default function VendorRegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address fields
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [country] = useState('India');

  // Interactive states
  const [fetchingPin, setFetchingPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Auto-fetch Indian address via postal PIN code
  const handleFetchAddress = async () => {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit Indian PIN code to auto-fetch address.');
      return;
    }

    setFetchingPin(true);
    setError(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const data = await res.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const distName = po.District || '';
        const cityName = (po.Block && po.Block !== 'NA') ? po.Block : (po.District || po.Name || '');
        const stateName = po.State || '';

        setDistrict(distName);
        setCity(cityName);
        setAddressState(stateName);
        if (!selectedState) setSelectedState(stateName);

        setSuccessMsg(`Address verified: ${distName}, ${stateName}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError('PIN code not found in postal registry. Please enter District & City manually.');
      }
    } catch (err) {
      console.warn('PIN fetch network error:', err);
      setError('Could not connect to postal directory. You may fill city and district manually.');
    } finally {
      setFetchingPin(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    if (!businessName.trim()) {
      setError('Please enter your business or organization name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your registered mobile number.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please create a secure password or PIN.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      const category = (businessType.toLowerCase().includes('adventure')) ? 'Adventure' : 'Services';

      const payload = {
        name: businessName.trim(),
        businessName: businessName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        category,
        businessType: businessType || 'Civil & Home Services Contractor',
        state: addressState || selectedState || 'Rajasthan',
        city: city.trim() || district.trim() || 'Bhilwara',
        specialization: businessType || 'General Contracting & Services',
        passcode: password.trim(),
        password: password.trim(),
        pincode: pincode.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim()
      };

      const res = await fetch(`${API_BASE}/api/v1/auth/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('hipro_auth_token', data.token);
        localStorage.setItem('hipro_user_role', 'VENDOR');
        if (data.vendor) {
          localStorage.setItem('hipro_vendor', JSON.stringify(data.vendor));
        }

        setSuccessMsg('Registration successful! Redirecting to partner dashboard...');
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(data);
          } else if (onSwitchToLogin) {
            onSwitchToLogin();
          } else if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }, 600);
      } else {
        setError(data.message || 'Registration failed. Please check the entered details.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server unreachable. Please ensure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 flex flex-col justify-between font-sans antialiased relative overflow-hidden select-none">
      
      {/* Background Ambient Soft Lighting */}
      <div className="absolute -top-32 -right-32 w-[540px] h-[540px] rounded-full bg-[#EBF3FE]/75 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#EEF5FF]/85 blur-3xl pointer-events-none"></div>

      {/* Top Navigation Bar matching reference image */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        
        {/* Left: Brand Icon + Hipro | Partner Onboarding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#0B63F6] flex items-center justify-center font-bold text-white text-[18px] shadow-sm tracking-tight">
            H
          </div>
          <div>
            <div className="flex items-center leading-none">
              <span className="font-heading font-bold text-[19px] text-[#0F172A] tracking-tight">Hipro</span>
              <span className="text-slate-300 font-light text-base mx-2.5">|</span>
              <span className="text-[13.5px] font-semibold text-[#1E293B]">Partner Onboarding</span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-normal mt-0.5 tracking-tight">
              Service & Adventure Operator Gateway
            </p>
          </div>
        </div>

        {/* Center: Partner Portal Pill Button */}
        <button
          type="button"
          onClick={handleGoToLogin}
          className="hidden md:inline-flex items-center px-4 py-1.5 rounded-full bg-[#EBF3FE] hover:bg-blue-100/80 text-[#0B63F6] font-medium text-[12px] border border-blue-100 transition-colors cursor-pointer shadow-2xs"
        >
          Partner Portal
        </button>

        {/* Right: Secure & Trusted */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-[12px] text-slate-700 font-medium">Secure & Trusted</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-4 sm:py-6 flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-14">
        
        {/* Left Side: Illustration + Grow Together + Value Props */}
        <div className="hidden lg:flex flex-col items-start text-left max-w-[340px] pt-4 sticky top-6">
          
          {/* City Skyline & Handshake Graphic */}
          <div className="relative w-full h-[180px] flex items-center justify-center mb-4">
            
            {/* Skyline Buildings Vector */}
            <svg className="absolute top-1 left-4 w-[280px] h-[130px] text-slate-200/90 pointer-events-none" viewBox="0 0 240 120" fill="currentColor">
              <rect x="18" y="45" width="22" height="75" rx="2" opacity="0.45" />
              <rect x="44" y="25" width="26" height="95" rx="2.5" opacity="0.65" />
              <rect x="74" y="38" width="22" height="82" rx="2" opacity="0.55" />
              <rect x="100" y="10" width="32" height="110" rx="3" opacity="0.8" />
              <rect x="136" y="32" width="24" height="88" rx="2" opacity="0.6" />
              <rect x="164" y="20" width="26" height="100" rx="2.5" opacity="0.7" />
              <rect x="194" y="50" width="20" height="70" rx="2" opacity="0.45" />
              {/* Windows */}
              <circle cx="57" cy="36" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="57" cy="48" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="116" cy="22" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="116" cy="34" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="116" cy="46" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="177" cy="32" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="177" cy="44" r="1.5" fill="#FFFFFF" opacity="0.85" />
            </svg>

            {/* Location Pin over Skyline */}
            <div className="absolute top-2 left-32 text-[#60A5FA] pointer-events-none drop-shadow-xs">
              <MapPin className="w-5 h-5 fill-[#EBF3FE] text-[#3B82F6]" />
            </div>

            {/* Handshake Vector Icon */}
            <div className="relative z-10 w-[110px] h-[110px] flex items-center justify-center">
              <svg className="w-[100px] h-[100px] drop-shadow-[0_4px_12px_rgba(37,99,235,0.18)]" viewBox="0 0 100 100" fill="none">
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
                <path d="M48 57 C50 59 53 60 55 58" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M51 53 C53 55 56 56 58 54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M54 49 C56 51 59 52 61 50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-[28px] text-[#0F172A] tracking-tight leading-tight">
              Grow Together<br />with Hipro
            </h1>
            <p className="text-[14px] text-slate-500 font-normal mt-1 leading-snug">
              Partner with us for<br />better business growth.
            </p>
          </div>

          {/* 3 Value Proposition Bullets */}
          <div className="space-y-5 w-full">
            
            {/* Prop 1: Expand Your Business */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Expand Your Business
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  Get more opportunities
                </p>
              </div>
            </div>

            {/* Prop 2: Trusted Platform */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Trusted Platform
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  Safe & Secure
                </p>
              </div>
            </div>

            {/* Prop 3: Professional Support */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Professional Support
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  Dedicated Support
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Registration Form Card */}
        <div className="w-full max-w-[620px]">
          <div className="bg-white rounded-[28px] px-7 sm:px-9 py-8 sm:py-9 shadow-[0_15px_45px_rgba(15,23,42,0.06)] border border-slate-100">
            
            {/* Top Briefcase Icon */}
            <div className="w-13 h-13 rounded-full bg-[#EBF3FE] flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-[#0B63F6]" strokeWidth={2} />
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="font-heading font-bold text-[22px] sm:text-[23px] text-[#0F172A] tracking-tight">
                Register as a Hipro Partner
              </h2>
              <p className="text-[12.5px] text-slate-500 font-normal mt-0.5">
                Fill in the details below to become a registered partner with Hipro.
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* ======================================================== */}
              {/* SECTION 1: Business Information */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-1 border-t border-slate-100 first:border-0 first:pt-0">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <Users className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>Business Information</span>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                    Business Name / Organization Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <User className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* 2-Columns: Business Type & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Business Type *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Landmark className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full h-10.5 pl-10 pr-9 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                      >
                        <option value="">Select Business Type</option>
                        <option value="Adventure & Tourism Operator">Adventure & Tourism Operator</option>
                        <option value="Civil & Home Services Contractor">Civil & Home Services Contractor</option>
                        <option value="Material Supplier & Trader">Material Supplier & Trader</option>
                        <option value="Labor Contractor & Manpower">Labor Contractor & Manpower</option>
                        <option value="Other Commercial Partner">Other Commercial Partner</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          if (!addressState) setAddressState(e.target.value);
                        }}
                        className="w-full h-10.5 pl-10 pr-9 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION 2: Contact Details */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <Mail className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>Contact Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION 3: Security Information */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <Lock className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>Security Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full h-10.5 pl-10 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
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

                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full h-10.5 pl-10 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <Eye className="w-4 h-4" strokeWidth={1.8} /> : <EyeOff className="w-4 h-4" strokeWidth={1.8} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION 4: Address Details */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <MapPin className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>Address Details</span>
                </div>

                {/* PIN Code + Fetch Address Button */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                    PIN Code *
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-1">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Enter 6 digit PIN code"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                    
                    {/* Fetch Address Button */}
                    <button
                      type="button"
                      disabled={fetchingPin}
                      onClick={handleFetchAddress}
                      className="h-10.5 px-4.5 bg-[#0B63F6] hover:bg-[#0954D8] active:bg-[#0848B8] text-white text-[12.5px] font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span>{fetchingPin ? 'Fetching...' : 'Fetch Address'}</span>
                    </button>
                  </div>
                  
                  {/* Explanatory subtext */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-[#2563EB]">
                    <Info className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>Enter PIN code and click 'Fetch Address' to auto-fill your address</span>
                  </div>
                </div>

                {/* Address Line 1 & Line 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Address Line 1 *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Home className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House/Flat No., Building Name, Area"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Home className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Landmark, Street, Area"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 4-Columns: District, City, State, Country */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  
                  {/* District */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      District *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="District"
                        className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      City *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                        className="w-full h-10 pl-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-xl text-[11.5px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        disabled
                        value={country}
                        className="w-full h-10 pl-2.5 pr-7 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11.5px] font-normal text-slate-700 appearance-none cursor-not-allowed"
                      >
                        <option value="India">India</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Auto-fill in one step! Blue Banner */}
                <div className="p-3 bg-[#EBF3FE] border border-blue-100 rounded-xl flex items-center gap-3 mt-2">
                  <div className="w-7 h-7 rounded-full bg-[#0B63F6] flex items-center justify-center shrink-0 text-white font-bold text-xs">
                    i
                  </div>
                  <div>
                    <h4 className="font-semibold text-[12px] text-[#0F172A] leading-none">
                      Auto-fill in one step!
                    </h4>
                    <p className="text-[11px] text-slate-600 font-normal mt-0.5">
                      Enter your PIN code to automatically fetch your address details.
                    </p>
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* Crimson Red Action Button: Register Now → */}
              {/* ======================================================== */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11.5 mt-2 rounded-xl font-semibold text-[14px] text-white bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-red-500/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" strokeWidth={2.2} />
                    <span>Register Now →</span>
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center before:content-[''] before:flex-1 before:border-t before:border-slate-100 after:content-[''] after:flex-1 after:border-t after:border-slate-100">
                <span className="px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Bottom Login Link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="text-[12.5px] text-[#0B63F6] hover:text-[#0954D8] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Already have an account? Login here →</span>
                </button>
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
