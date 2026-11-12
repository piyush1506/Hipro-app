import React, { useState, useEffect } from 'react';
import {
  Briefcase, Building2, Landmark, User,
  Mail, Phone, Lock, Eye, EyeOff, MapPin, Home,
  Search, Info, UserPlus, ChevronDown, Rocket,
  ShieldCheck, Headphones, AlertCircle, CheckCircle2,
  Check, Receipt, Wrench, Package, Sparkles, Plus, X,
  Compass, CheckSquare, Square
} from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://app.hindustanprojects.in');

const ADVENTURE_ACTIVITIES = [
  { id: 'paragliding', title: 'Paragliding & Aero Sports' },
  { id: 'camping_trekking', title: 'Camping & Trekking' },
  { id: 'desert_safari', title: 'Desert Safari & Dune Bashing' },
  { id: 'river_rafting', title: 'River Rafting & Water Sports' },
  { id: 'zipline_climbing', title: 'Zipline & Rock Climbing' },
  { id: 'hot_air_balloon', title: 'Hot Air Ballooning' },
  { id: 'wildlife_safari', title: 'Wildlife & Jungle Safari' },
  { id: 'atv_quad', title: 'ATV Quad Biking' }
];

export default function VendorRegisterPage({ initialCategory = 'Services', onRegisterSuccess, onSwitchToLogin }) {
  // ─── Step 1: Root Partner Category (Services OR Adventure) ───
  const [partnerCategory, setPartnerCategory] = useState(() => {
    if (initialCategory === 'Adventure') return 'Adventure';
    return 'Services';
  });

  // ─── Step 2: Under Services -> Type (Labor, Material, or Both) ───
  const [vendorType, setVendorType] = useState('LABOR');

  // Dynamic Catalog from Backend
  const [dbServices, setDbServices] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [materialCatalog, setMaterialCatalog] = useState([]);

  // Selected Service & Sub-services
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [customTradeInput, setCustomTradeInput] = useState('');
  const [additionalSkills, setAdditionalSkills] = useState([]);

  // Material Selection
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [customMaterialInput, setCustomMaterialInput] = useState('');

  // Adventure Activities
  const [selectedAdventures, setSelectedAdventures] = useState(['Paragliding & Aero Sports']);
  const [customAdventureInput, setCustomAdventureInput] = useState('');
  const [additionalAdventures, setAdditionalAdventures] = useState([]);

  const [experience, setExperience] = useState('3-5 Years');

  // ─── Step 3: Identity & Business Details ───
  const [hasBusiness, setHasBusiness] = useState(false);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstinNumber, setGstinNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // ─── Step 4: Address Details (PIN Auto-Fetch) ───
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [fetchingPin, setFetchingPin] = useState(false);

  // ─── Step 5: Security Credentials (LAST STEP) ───
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ═══════════════════════════════════════════════
  // PIN Code Auto-Resolver
  // ═══════════════════════════════════════════════
  const resolvePincode = async (code) => {
    const cleanPin = code.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) return;
    setFetchingPin(true);
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
        setResolvedLocation(`${distName || cityName}, ${stateName}`);
        setError(null);
      } else {
        setResolvedLocation(null);
      }
    } catch (err) {
      console.warn('PIN fetch error:', err);
    } finally {
      setFetchingPin(false);
    }
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      resolvePincode(val);
    } else {
      setResolvedLocation(null);
    }
  };

  // ═══════════════════════════════════════════════
  // Dynamic Catalog Fetch
  // ═══════════════════════════════════════════════
  useEffect(() => {
    let isCancelled = false;
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        let res = await fetch(`${API_BASE}/api/v1/vendors/catalog`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/v1/services`);
        }
        const data = await res.json();
        if (data.success && !isCancelled) {
          const servicesList = data.services || [];
          setDbServices(servicesList);
          if (data.materialCategories) {
            setMaterialCatalog(data.materialCategories);
          } else {
            setMaterialCatalog([
              'Cement & Aggregate', 'TMT Steel & Iron Rods', 'Plywood, Timber & Laminates',
              'Pipes & Plumbing Hardware', 'Electrical Hardware & Wires', 'Paints, Putty & Chemicals',
              'Tiles & Sanitaryware', 'Bricks & AAC Blocks', 'Glass & Aluminum'
            ]);
          }
          if (servicesList.length > 0) {
            const first = servicesList[0];
            setSelectedServiceId(first.id);
            if (first.subServices && first.subServices.length > 0) {
              setSelectedSubServices([first.subServices[0].titleEn || first.subServices[0].name]);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic catalog:', err);
      } finally {
        if (!isCancelled) setCatalogLoading(false);
      }
    };
    fetchCatalog();
    return () => { isCancelled = true; };
  }, []);

  const currentService = dbServices.find((s) => s.id === selectedServiceId) || dbServices[0];

  const handleServiceChange = (serviceId) => {
    setSelectedServiceId(serviceId);
    const matchedService = dbServices.find((s) => s.id === serviceId);
    if (matchedService && matchedService.subServices && matchedService.subServices.length > 0) {
      setSelectedSubServices([matchedService.subServices[0].titleEn || matchedService.subServices[0].name]);
    } else {
      setSelectedSubServices([]);
    }
  };

  const toggleSubService = (subTitle) => {
    setSelectedSubServices((prev) => {
      if (prev.includes(subTitle)) {
        if (prev.length === 1 && additionalSkills.length === 0) return prev;
        return prev.filter((s) => s !== subTitle);
      } else {
        return [...prev, subTitle];
      }
    });
  };

  const handleSelectAllSubServices = () => {
    if (!currentService || !currentService.subServices) return;
    const allTitles = currentService.subServices.map((s) => s.titleEn || s.name);
    if (selectedSubServices.length === allTitles.length) {
      setSelectedSubServices(allTitles.length > 0 ? [allTitles[0]] : []);
    } else {
      setSelectedSubServices(allTitles);
    }
  };

  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    const clean = customTradeInput.trim();
    if (clean && !additionalSkills.includes(clean)) {
      setAdditionalSkills((prev) => [...prev, clean]);
      setCustomTradeInput('');
    }
  };

  const handleRemoveCustomSkill = (skill) => {
    setAdditionalSkills((prev) => prev.filter((s) => s !== skill));
  };

  const toggleMaterial = (mat) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(mat)) return prev.filter((m) => m !== mat);
      return [...prev, mat];
    });
  };

  const handleAddCustomMaterial = (e) => {
    if (e) e.preventDefault();
    const clean = customMaterialInput.trim();
    if (clean && !materialCatalog.includes(clean)) {
      setMaterialCatalog((prev) => [...prev, clean]);
      setSelectedMaterials((prev) => [...prev, clean]);
      setCustomMaterialInput('');
    }
  };

  const toggleAdventure = (title) => {
    setSelectedAdventures((prev) => {
      if (prev.includes(title)) {
        if (prev.length === 1 && additionalAdventures.length === 0) return prev;
        return prev.filter((t) => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  const handleAddCustomAdventure = (e) => {
    if (e) e.preventDefault();
    const clean = customAdventureInput.trim();
    if (clean && !selectedAdventures.includes(clean) && !additionalAdventures.includes(clean)) {
      setAdditionalAdventures((prev) => [...prev, clean]);
      setSelectedAdventures((prev) => [...prev, clean]);
      setCustomAdventureInput('');
    }
  };

  const handleRemoveCustomAdventure = (title) => {
    setAdditionalAdventures((prev) => prev.filter((t) => t !== title));
    setSelectedAdventures((prev) => prev.filter((t) => t !== title));
  };

  // ═══════════════════════════════════════════════
  // Form Submission
  // ═══════════════════════════════════════════════
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const resolvedName = fullName.trim() || (hasBusiness ? businessName.trim() : '');
    if (!resolvedName) {
      setError(hasBusiness ? 'Please enter contact person or enterprise name.' : 'Please enter your full legal name.');
      return;
    }
    if (hasBusiness && !businessName.trim()) {
      setError('Please enter your registered business name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      return;
    }
    if (!addressLine1.trim()) {
      setError('Please enter your address in Address Line 1.');
      return;
    }
    if (!password.trim()) {
      setError('Please create a secure password.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const isAdventure = partnerCategory === 'Adventure';
    const isMaterialOnly = partnerCategory === 'Services' && vendorType === 'MATERIAL';

    if (isMaterialOnly && selectedMaterials.length === 0) {
      setError('Please select at least one material category you supply.');
      return;
    }

    const allAdventureActivities = [...selectedAdventures, ...additionalAdventures];
    if (isAdventure && allAdventureActivities.length === 0) {
      setError('Please select at least one adventure activity.');
      return;
    }

    const allLaborTrades = [...selectedSubServices, ...additionalSkills];
    if (!isAdventure && !isMaterialOnly && (vendorType === 'LABOR' || vendorType === 'BOTH') && allLaborTrades.length === 0) {
      setError('Please select at least one service trade or work section.');
      return;
    }

    setLoading(true);

    try {
      let resolvedCategory = isAdventure ? 'Adventure' : 'Services';
      let resolvedServiceName = 'Civil & Home Services';
      let resolvedSpecialization = '';

      if (isAdventure) {
        resolvedServiceName = 'Adventure & Tourism';
        resolvedSpecialization = allAdventureActivities.slice(0, 3).join(', ') || 'Adventure Operator';
      } else if (isMaterialOnly) {
        resolvedServiceName = 'Building Material Supply';
        resolvedSpecialization = selectedMaterials.slice(0, 3).join(', ') || 'Material Trader';
      } else {
        const activeServiceObj = dbServices.find((s) => s.id === selectedServiceId);
        resolvedServiceName = activeServiceObj?.name || 'General Construction Services';
        resolvedSpecialization = (vendorType === 'BOTH')
          ? `${resolvedServiceName} & Material Supply`
          : (allLaborTrades.slice(0, 3).join(', ') || resolvedServiceName);
      }

      const payload = {
        name: resolvedName,
        businessName: hasBusiness ? businessName.trim() : resolvedName,
        phone: cleanPhone,
        email: email.trim() || undefined,
        category: resolvedCategory,
        vendorType: isAdventure ? 'LABOR' : (isMaterialOnly ? 'MATERIAL' : vendorType),
        serviceId: isAdventure ? undefined : (selectedServiceId || undefined),
        serviceName: resolvedServiceName,
        laborCategories: isAdventure ? allAdventureActivities : ((vendorType === 'LABOR' || vendorType === 'BOTH') ? allLaborTrades : []),
        materialCategories: isMaterialOnly || vendorType === 'BOTH' ? selectedMaterials : [],
        specialization: resolvedSpecialization,
        experience,
        gstinNumber: hasBusiness && gstinNumber.trim() ? gstinNumber.trim().toUpperCase() : undefined,
        state: addressState || 'Rajasthan',
        city: city.trim() || district.trim() || 'Bhilwara',
        passcode: password.trim(),
        password: password.trim(),
        pincode: pincode.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        hasBusiness
      };

      const res = await fetch(`${API_BASE}/api/v1/auth/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('hipro_auth_token', data.token);
        if (data.vendor) {
          localStorage.setItem('hipro_vendor', JSON.stringify(data.vendor));
        }
        setSuccessMsg('Registration successful! Opening partner dashboard...');
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess('VENDOR', data);
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
      setError('Server unreachable. Please verify backend is running on port 5000.');
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

      {/* Ambient background blur */}
      <div className="absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full bg-[#EBF3FE]/70 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#EEF5FF]/80 blur-3xl pointer-events-none"></div>

      {/* ═══════════════ Top Navigation Bar ═══════════════ */}
      <header className="relative z-10 w-full px-5 sm:px-10 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B63F6] flex items-center justify-center font-bold text-white text-[16px] shadow-sm tracking-tight">
            H
          </div>
          <div>
            <div className="flex items-center leading-none">
              <span className="font-heading font-bold text-[17px] text-[#0F172A] tracking-tight">Hipro</span>
              <span className="text-slate-300 font-light text-sm mx-2">|</span>
              <span className="text-[12.5px] font-semibold text-[#1E293B]">Partner Onboarding</span>
            </div>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5 tracking-tight">
              Service & Adventure Operator Gateway
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoToLogin}
          className="hidden md:inline-flex items-center px-3.5 py-1 rounded-full bg-[#EBF3FE] hover:bg-blue-100/80 text-[#0B63F6] font-medium text-[11.5px] border border-blue-100 transition-colors cursor-pointer"
        >
          Partner Portal
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <svg className="w-3.5 h-3.5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-slate-700">Secure & Trusted</span>
        </div>
      </header>

      {/* ═══════════════ Main Content ═══════════════ */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2 sm:py-4 flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10">

        {/* ─── Left Column: Illustration & Value Pillars ─── */}
        <div className="hidden lg:flex flex-col items-start text-left max-w-[280px] pt-2 sticky top-4">
          <div className="relative w-full h-[140px] flex items-center justify-center mb-3">
            <svg className="absolute top-1 left-2 w-[240px] h-[100px] text-slate-200/90 pointer-events-none" viewBox="0 0 240 120" fill="currentColor">
              <rect x="18" y="45" width="22" height="75" rx="2" opacity="0.45" />
              <rect x="44" y="25" width="26" height="95" rx="2.5" opacity="0.65" />
              <rect x="74" y="38" width="22" height="82" rx="2" opacity="0.55" />
              <rect x="100" y="10" width="32" height="110" rx="3" opacity="0.8" />
              <rect x="136" y="32" width="24" height="88" rx="2" opacity="0.6" />
              <rect x="164" y="20" width="26" height="100" rx="2.5" opacity="0.7" />
            </svg>
            <div className="relative z-10 w-[90px] h-[90px] flex items-center justify-center">
              <svg className="w-[85px] h-[85px] drop-shadow-[0_4px_10px_rgba(37,99,235,0.18)]" viewBox="0 0 100 100" fill="none">
                <path d="M8 50 L26 34 L36 45 L18 61 Z" fill="#2563EB" />
                <path d="M24 32 L29 28 L39 39 L34 43 Z" fill="#93C5FD" />
                <path d="M92 50 L74 34 L64 45 L82 61 Z" fill="#3B82F6" />
                <path d="M76 32 L71 28 L61 39 L66 43 Z" fill="#93C5FD" />
                <path d="M30 42 C32 40 37 40 40 43 L54 53 C57 55 57 59 54 62 C51 65 47 65 44 62 L30 51 C28 49 28 45 30 42 Z" fill="#1D4ED8" />
                <path d="M70 42 C68 40 63 40 60 43 L46 53 C43 55 43 59 46 62 C49 65 53 65 56 62 L70 51 C72 49 72 45 70 42 Z" fill="#60A5FA" />
              </svg>
            </div>
          </div>

          <div className="mb-5">
            <h1 className="font-heading font-bold text-[23px] text-[#0F172A] tracking-tight leading-tight">
              Grow Together<br />with Hipro
            </h1>
            <p className="text-[12.5px] text-slate-500 font-normal mt-1 leading-snug">
              Partner with us for better business growth.
            </p>
          </div>

          <div className="space-y-3.5 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Rocket className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[12.5px] text-[#0F172A] leading-none">
                  Expand Your Business
                </h3>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Get more live project leads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[12.5px] text-[#0F172A] leading-none">
                  Trusted Platform
                </h3>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Safe & guaranteed payouts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[12.5px] text-[#0F172A] leading-none">
                  Dedicated Support
                </h3>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Assistance on every stage
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Compact Form Card ─── */}
        <div className="w-full max-w-[530px]">
          <div className="bg-white rounded-2xl px-5 sm:px-7 py-5 sm:py-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] border border-slate-100">

            {/* Header info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-[19px] sm:text-[20px] text-[#0F172A] tracking-tight leading-tight">
                  Register as a Hipro Partner
                </h2>
                <p className="text-[11.5px] text-slate-500 font-normal mt-0.5">
                  Fill in details below to register your skilled services with Hipro.
                </p>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11.5px] flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11.5px] flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 1: CATEGORY SELECTION (Services vs Adventure)     */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#1F2937]">
                    Partner Category / Domain *
                  </label>
                  <span className="text-[10px] text-slate-400">Step 1 of 5</span>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    {partnerCategory === 'Adventure' ? (
                      <Compass className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={1.8} />
                    ) : (
                      <Wrench className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={1.8} />
                    )}
                  </div>
                  <select
                    value={partnerCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPartnerCategory(val);
                      if (val === 'Adventure') {
                        setVendorType('LABOR');
                      }
                    }}
                    className="w-full h-9 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-semibold text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300"
                  >
                    <option value="Services">Maintenance & Services (Electrician, Plumber, Waterproofing, Civil & Materials)</option>
                    <option value="Adventure">Adventure & Tourism (Paragliding, Trekking, Camping, Desert Safari & Sports)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 2: WORK / SERVICE SPECIFICATIONS                  */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold text-[12.5px]">
                    <Wrench className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={2} />
                    <span>
                      {partnerCategory === 'Services' ? 'Service Type & Work Selection' : 'Adventure Operations'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Step 2 of 5</span>
                </div>

                {/* ──── IF SERVICES: Type Selector (Labor vs Material vs Both) ──── */}
                {partnerCategory === 'Services' && (
                  <div className="space-y-2.5">
                    <div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setVendorType('LABOR')}
                          className={`h-8 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'LABOR'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Labour / Work</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVendorType('MATERIAL')}
                          className={`h-8 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'MATERIAL'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          <span>Material Supply</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVendorType('BOTH')}
                          className={`h-8 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'BOTH'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Building2 className="w-3 h-3" />
                          <span>Both (Turnkey)</span>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC SERVICE DROPDOWN & SUB-SERVICES */}
                    {(vendorType === 'LABOR' || vendorType === 'BOTH') && (
                      <div className="space-y-2.5 pt-0.5 animate-in fade-in duration-200">
                        {/* Service Category Dropdown */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-[#1F2937]">
                              Service Category *
                            </label>
                            {catalogLoading ? (
                              <span className="text-[10px] text-[#0B63F6] font-medium animate-pulse">Loading catalog...</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">{dbServices.length} categories</span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <Landmark className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </div>
                            <select
                              value={selectedServiceId}
                              onChange={(e) => handleServiceChange(e.target.value)}
                              className="w-full h-8.5 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-medium text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                            >
                              {dbServices.map((srv) => (
                                <option key={srv.id} value={srv.id}>
                                  {srv.name} ({srv.subServices?.length || 0} work sections)
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        {/* Streamlined Sub-Services Grid (Compact & Sleek) */}
                        {currentService && currentService.subServices && currentService.subServices.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-semibold text-[#1F2937]">
                                Sub-Services in <span className="text-[#0B63F6] font-bold">"{currentService.name}"</span>:
                              </label>
                              <button
                                type="button"
                                onClick={handleSelectAllSubServices}
                                className="text-[10.5px] text-[#0B63F6] hover:text-[#0954D8] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {selectedSubServices.length === currentService.subServices.length ? (
                                  <>
                                    <Square className="w-3 h-3" />
                                    <span>Reset</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare className="w-3 h-3" />
                                    <span>Select All ({currentService.subServices.length})</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Compact Grid */}
                            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                              {currentService.subServices.map((sub) => {
                                const title = sub.titleEn || sub.name;
                                const isSelected = selectedSubServices.includes(title);
                                return (
                                  <div
                                    key={sub.id}
                                    onClick={() => toggleSubService(title)}
                                    title={sub.desc || title}
                                    className={`px-2 py-1.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-1.5 ${
                                      isSelected
                                        ? 'bg-blue-50/90 border-[#0B63F6] text-[#0B63F6] shadow-2xs font-semibold'
                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <span className="text-[11px] leading-tight truncate flex-1">
                                      {title}
                                    </span>
                                    <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${
                                      isSelected ? 'bg-[#0B63F6] border-[#0B63F6] text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* "Other" Custom Trade Input */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={customTradeInput}
                              onChange={(e) => setCustomTradeInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSkill(e); }}
                              placeholder="Other specialized skill (e.g. Core Cutting, Epoxy Grouting)"
                              className="flex-1 h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[11.5px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                          {additionalSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {additionalSkills.map((sk) => (
                                <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100/80 text-[#0B63F6] text-[10.5px] font-medium">
                                  <span>{sk}</span>
                                  <button type="button" onClick={() => handleRemoveCustomSkill(sk)} className="hover:text-red-600 cursor-pointer">
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MATERIAL SUPPLY CATEGORIES */}
                    {(vendorType === 'MATERIAL' || vendorType === 'BOTH') && (
                      <div className="space-y-1.5 pt-0.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-[#1F2937]">
                            Material Categories:
                          </label>
                          <span className="text-[10px] text-slate-400">{selectedMaterials.length} selected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                          {materialCatalog.map((cat) => {
                            const isSelected = selectedMaterials.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => toggleMaterial(cat)}
                                className={`px-2 py-1 rounded-lg text-[10.5px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-[#0B63F6] text-white border-[#0B63F6]'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span>{cat}</span>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <input
                            type="text"
                            value={customMaterialInput}
                            onChange={(e) => setCustomMaterialInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomMaterial(e); }}
                            placeholder="Add other material..."
                            className="flex-1 h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[11.5px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomMaterial}
                            className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ──── IF ADVENTURE: Compact Grid ──── */}
                {partnerCategory === 'Adventure' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-[#1F2937]">
                        Adventure Activities *
                      </label>
                      <span className="text-[10px] text-slate-400">{selectedAdventures.length} selected</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                      {ADVENTURE_ACTIVITIES.map((act) => {
                        const isSelected = selectedAdventures.includes(act.title);
                        return (
                          <div
                            key={act.id}
                            onClick={() => toggleAdventure(act.title)}
                            className={`px-2 py-1.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-blue-50/90 border-[#0B63F6] text-[#0B63F6] font-semibold'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="text-[11px] truncate flex-1">{act.title}</span>
                            <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${
                              isSelected ? 'bg-[#0B63F6] border-[#0B63F6] text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <input
                        type="text"
                        value={customAdventureInput}
                        onChange={(e) => setCustomAdventureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomAdventure(e); }}
                        placeholder="Other adventure (e.g. Scuba, Bungee)"
                        className="flex-1 h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[11.5px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAdventure}
                        className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Experience Level */}
                <div>
                  <div className="relative">
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[11.5px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="1-3 Years">Experience: 1 to 3 Years</option>
                      <option value="3-5 Years">Experience: 3 to 5 Years (Standard)</option>
                      <option value="5-10 Years">Experience: 5 to 10 Years (Experienced)</option>
                      <option value="10+ Years">Experience: 10+ Years (Master Contractor)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 3: PERSONAL / BUSINESS DETAILS                    */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold text-[12.5px]">
                    <User className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={2} />
                    <span>Identity & Business Info</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Step 3 of 5</span>
                </div>

                {/* "I own a business" Toggle Checkbox */}
                <div
                  onClick={() => setHasBusiness(!hasBusiness)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                    hasBusiness
                      ? 'bg-[#EBF3FE]/70 border-[#0B63F6]/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      hasBusiness
                        ? 'bg-[#0B63F6] border-[#0B63F6] text-white shadow-xs'
                        : 'bg-white border-slate-300'
                    }`}>
                      {hasBusiness && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0F172A] flex items-center gap-1 leading-none">
                        <Building2 className={`w-3.5 h-3.5 ${hasBusiness ? 'text-[#0B63F6]' : 'text-slate-400'}`} />
                        <span>I own a business / registered enterprise</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    hasBusiness ? 'bg-[#0B63F6] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {hasBusiness ? 'Business' : 'Individual'}
                  </span>
                </div>

                {/* Full Legal Name */}
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <User className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={hasBusiness ? 'Authorized Contact Person Name *' : 'Full Legal Name *'}
                      className="w-full h-8.5 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Conditional: Business Name & GSTIN */}
                {hasBusiness && (
                  <div className="space-y-2 pt-0.5 animate-in fade-in duration-200">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Building2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        required={hasBusiness}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business / Enterprise Name *"
                        className="w-full h-8.5 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Receipt className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstinNumber}
                        onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                        placeholder="GST Number / GSTIN (Optional)"
                        className="w-full h-8.5 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-mono text-[#1E293B] placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300 uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* Email & Mobile Number Side by Side */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (Optional)"
                      className="w-full h-8.5 pl-9 pr-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Number *"
                      className="w-full h-8.5 pl-9 pr-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 4: ADDRESS DETAILS (PIN Auto-Fetch)                */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold text-[12.5px]">
                    <MapPin className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={2} />
                    <span>Address Details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {fetchingPin && (
                      <span className="text-[10px] text-[#0B63F6] font-medium animate-pulse">
                        Auto-fetching...
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Step 4 of 5</span>
                  </div>
                </div>

                {/* PIN Code Field */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="Enter 6 digit PIN code *"
                        className="w-full h-8.5 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-medium text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (pincode.length === 6) resolvePincode(pincode); }}
                      disabled={pincode.length !== 6 || fetchingPin}
                      className="h-8.5 px-3 bg-[#0B63F6] hover:bg-[#0954D8] text-white text-[11px] font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      <Search className="w-3 h-3" />
                      <span>Fetch</span>
                    </button>
                  </div>

                  {resolvedLocation && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg animate-in fade-in">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Auto-detected: <strong>{resolvedLocation}</strong></span>
                    </div>
                  )}
                </div>

                {/* Address Lines */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Address Line 1 *"
                      className="w-full h-8.5 pl-9 pr-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[11.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Address Line 2 (Optional)"
                      className="w-full h-8.5 pl-9 pr-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[11.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════ */}
              {/* STEP 5: SECURITY INFORMATION (Password - Final Step)    */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold text-[12.5px]">
                    <Lock className="w-3.5 h-3.5 text-[#0B63F6]" strokeWidth={2} />
                    <span>Security Credentials</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Step 5 of 5</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password *"
                      className="w-full h-8.5 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-3.5 h-3.5" strokeWidth={1.8} /> : <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} />}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password *"
                      className="w-full h-8.5 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <Eye className="w-3.5 h-3.5" strokeWidth={1.8} /> : <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ═══════════════ Register Button ═══════════════ */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 rounded-xl font-semibold text-[13px] text-white bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-red-500/20"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" strokeWidth={2.2} />
                    <span>Register Now →</span>
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative my-2 flex items-center justify-center before:content-[''] before:flex-1 before:border-t before:border-slate-100 after:content-[''] after:flex-1 after:border-t after:border-slate-100">
                <span className="px-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Bottom Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="text-[12px] text-[#0B63F6] hover:text-[#0954D8] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <User className="w-3 h-3" strokeWidth={2} />
                  <span>Already have an account? Login here →</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-2.5 text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 text-slate-600">
          <svg className="w-3 h-3 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>TLS 1.3 / Secure Connection</span>
        </div>
        <span className="text-slate-300 font-light">|</span>
        <span className="text-slate-500">Hipro Partner Portal</span>
      </footer>

    </div>
  );
}
