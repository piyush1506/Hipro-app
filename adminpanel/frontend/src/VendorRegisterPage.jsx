import React, { useState, useEffect } from 'react';
import {
  Briefcase, Building2, Landmark, User, Users,
  Mail, Phone, Lock, Eye, EyeOff, MapPin, Home,
  Search, Info, UserPlus, ChevronDown, Rocket,
  ShieldCheck, Headphones, AlertCircle, CheckCircle2,
  Check, Receipt, Wrench, Zap, Droplets, Hammer,
  Paintbrush, Package, HardHat, Sparkles, Plus, X,
  Compass, Mountain, Tent, Store, Trees
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

const ADVENTURE_ACTIVITIES = [
  { id: 'paragliding', title: 'Paragliding & Aero Sports', desc: 'Tandem flights, powered paragliding, paramotor' },
  { id: 'camping_trekking', title: 'Camping, Trekking & Hiking', desc: 'Hill trekking, tent stays, bonfires, guided trails' },
  { id: 'desert_safari', title: 'Desert Safari & Dune Bashing', desc: '4x4 Thar/Jeep safari, camel rides, sand dunes' },
  { id: 'river_rafting', title: 'River Rafting & Water Sports', desc: 'White water rafting, kayaking, jet ski, boating' },
  { id: 'zipline_climbing', title: 'Zipline, Rope Course & Climbing', desc: 'Aerial zipline, sky bridge, rock climbing, rappelling' },
  { id: 'hot_air_balloon', title: 'Hot Air Ballooning', desc: 'Scenic tethered and free sunrise flights' },
  { id: 'wildlife_safari', title: 'Wildlife & Jungle Safari', desc: 'National park jeep safari, bird watching, nature walks' },
  { id: 'atv_quad', title: 'ATV Quad Biking & Off-Roading', desc: 'All-terrain vehicle circuits, dirt tracks' }
];

export default function VendorRegisterPage({ initialCategory = 'Services', onRegisterSuccess, onSwitchToLogin }) {
  // Top-Level Partner Category / Domain Sector: 'Services' | 'Adventure' | 'Material'
  const [partnerCategory, setPartnerCategory] = useState(() => {
    if (initialCategory === 'Adventure') return 'Adventure';
    if (initialCategory === 'Material') return 'Material';
    return 'Services';
  });

  // Business Ownership Toggle: False = Individual / Freelancer, True = Registered Business
  const [hasBusiness, setHasBusiness] = useState(false);

  // Dynamic Catalog State from Backend PostgreSQL
  const [dbServices, setDbServices] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [materialCatalog, setMaterialCatalog] = useState([]);

  // Common Identity
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Business-specific fields (Conditional on hasBusiness)
  const [businessName, setBusinessName] = useState('');
  const [gstinNumber, setGstinNumber] = useState('');

  // Classification: LABOR, MATERIAL, or BOTH
  const [vendorType, setVendorType] = useState('LABOR'); // 'LABOR' | 'MATERIAL' | 'BOTH'
  
  // Dynamic Service & Sub-service Selection (for Services)
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [customTradeInput, setCustomTradeInput] = useState('');
  const [additionalSkills, setAdditionalSkills] = useState([]);

  // Adventure Activities Selection (for Adventure & Tourism)
  const [selectedAdventures, setSelectedAdventures] = useState([
    'Paragliding & Aero Sports'
  ]);
  const [customAdventureInput, setCustomAdventureInput] = useState('');
  const [additionalAdventures, setAdditionalAdventures] = useState([]);

  // Dynamic Material Selection
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [customMaterialInput, setCustomMaterialInput] = useState('');
  
  const [experience, setExperience] = useState('3-5 Years');

  // Security Credentials
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
  const [resolvedLocation, setResolvedLocation] = useState(null);

  // Interactive states
  const [fetchingPin, setFetchingPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Auto-resolve Indian location in background when 6-digit PIN code is typed
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
  useEffect(() => {
    let isCancelled = false;
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        // Try unified catalog endpoint
        let res = await fetch(`${API_BASE}/api/v1/vendors/catalog`);
        if (!res.ok) {
          // Fallback to standard services endpoint
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
              'Pipes & Plumbing Hardware', 'Electrical Hardware & Wires', 'Paints, Putty & Waterproofing Chemicals',
              'Tiles, Marbles & Sanitaryware', 'Bricks, Stone & AAC Blocks', 'Glass, Aluminum & Hardware'
            ]);
          }

          // Default to first service and its subservices
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

  // When selected service changes, refresh the active subservices
  const handleServiceChange = (serviceId) => {
    setSelectedServiceId(serviceId);
    const matchedService = dbServices.find((s) => s.id === serviceId);
    if (matchedService && matchedService.subServices && matchedService.subServices.length > 0) {
      setSelectedSubServices([matchedService.subServices[0].titleEn || matchedService.subServices[0].name]);
    } else {
      setSelectedSubServices([]);
    }
  };

  // Toggle subservice in list
  const toggleSubService = (subTitle) => {
    setSelectedSubServices((prev) => {
      if (prev.includes(subTitle)) {
        if (prev.length === 1 && additionalSkills.length === 0) return prev; // keep at least 1
        return prev.filter((s) => s !== subTitle);
      } else {
        return [...prev, subTitle];
      }
    });
  };

  // Add custom trade skill
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

  // Toggle material in list
  const toggleMaterial = (mat) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(mat)) {
        return prev.filter((m) => m !== mat);
      } else {
        return [...prev, mat];
      }
    });
  };

  // Add custom material
  const handleAddCustomMaterial = (e) => {
    if (e) e.preventDefault();
    const clean = customMaterialInput.trim();
    if (clean && !materialCatalog.includes(clean)) {
      setMaterialCatalog((prev) => [...prev, clean]);
      setSelectedMaterials((prev) => [...prev, clean]);
      setCustomMaterialInput('');
    }
  };

  // Toggle adventure activity in list
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

  // Add custom adventure activity
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

  // Form submission handler
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    const resolvedName = fullName.trim() || (hasBusiness ? businessName.trim() : '');
    if (!resolvedName) {
      setError(hasBusiness ? 'Please enter contact person or enterprise name.' : 'Please enter your full legal name.');
      return;
    }

    if (hasBusiness && !businessName.trim()) {
      setError('Please enter your registered business or enterprise name.');
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

    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    if (!addressLine1.trim()) {
      setError('Please enter your address in Address Line 1.');
      return;
    }

    const isAdventure = partnerCategory === 'Adventure';
    const isMaterialOnly = partnerCategory === 'Material' || (partnerCategory === 'Services' && vendorType === 'MATERIAL');

    // Material validation if user selected material
    if (isMaterialOnly && selectedMaterials.length === 0) {
      setError('Please select at least one material category you supply.');
      return;
    }

    // Adventure validation
    const allAdventureActivities = [...selectedAdventures, ...additionalAdventures];
    if (isAdventure && allAdventureActivities.length === 0) {
      setError('Please select at least one adventure activity or tourism service you operate.');
      return;
    }

    // Service validation if user selected labor
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
        resolvedSpecialization = selectedMaterials.slice(0, 3).join(', ') || 'Material Trader & Supplier';
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

  // Find currently selected service object
  const currentService = dbServices.find((s) => s.id === selectedServiceId) || dbServices[0];

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 flex flex-col justify-between font-sans antialiased relative overflow-hidden select-none">
      
      {/* Background Soft Ambient Gradients */}
      <div className="absolute -top-32 -right-32 w-[540px] h-[540px] rounded-full bg-[#EBF3FE]/75 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#EEF5FF]/85 blur-3xl pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        
        {/* Left: Brand + Hipro | Partner Onboarding */}
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
              Dynamic Service & Trade Gateway
            </p>
          </div>
        </div>

        {/* Center: Partner Portal Button */}
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
          
          {/* Skyline & Handshake Graphic */}
          <div className="relative w-full h-[180px] flex items-center justify-center mb-4">
            <svg className="absolute top-1 left-4 w-[280px] h-[130px] text-slate-200/90 pointer-events-none" viewBox="0 0 240 120" fill="currentColor">
              <rect x="18" y="45" width="22" height="75" rx="2" opacity="0.45" />
              <rect x="44" y="25" width="26" height="95" rx="2.5" opacity="0.65" />
              <rect x="74" y="38" width="22" height="82" rx="2" opacity="0.55" />
              <rect x="100" y="10" width="32" height="110" rx="3" opacity="0.8" />
              <rect x="136" y="32" width="24" height="88" rx="2" opacity="0.6" />
              <rect x="164" y="20" width="26" height="100" rx="2.5" opacity="0.7" />
              <rect x="194" y="50" width="20" height="70" rx="2" opacity="0.45" />
              <circle cx="57" cy="36" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="57" cy="48" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="116" cy="22" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="116" cy="34" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="116" cy="46" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="177" cy="32" r="1.5" fill="#FFFFFF" opacity="0.85" />
              <circle cx="177" cy="44" r="1.5" fill="#FFFFFF" opacity="0.85" />
            </svg>

            <div className="absolute top-2 left-32 text-[#60A5FA] pointer-events-none drop-shadow-xs">
              <MapPin className="w-5 h-5 fill-[#EBF3FE] text-[#3B82F6]" />
            </div>

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
              Connect to 100+ live civil projects & service requests daily.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="space-y-5 w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Direct Work Dispatch
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  Assigned directly by Civil Engineers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Guaranteed Settlements
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  100% Milestone-based escrow security
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#0B63F6]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-[13.5px] text-[#0F172A] leading-none">
                  Procurement Support
                </h3>
                <p className="text-[12px] text-slate-500 font-normal mt-1">
                  Transparent RFQ quotations
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Registration Form Card */}
        <div className="w-full max-w-[650px]">
          <div className="bg-white rounded-[28px] px-7 sm:px-9 py-8 sm:py-9 shadow-[0_15px_45px_rgba(15,23,42,0.06)] border border-slate-100">
            
            {/* Top Briefcase Icon */}
            <div className="w-13 h-13 rounded-full bg-[#EBF3FE] flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-[#0B63F6]" strokeWidth={2} />
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h2 className="font-heading font-bold text-[22px] sm:text-[23px] text-[#0F172A] tracking-tight">
                Register as a Hipro Partner
              </h2>
              <p className="text-[12.5px] text-slate-500 font-normal mt-0.5">
                Onboard your skilled services or material inventory onto Hipro.
              </p>
            </div>

            {/* Business Ownership Toggle Checkbox */}
            <div 
              onClick={() => setHasBusiness(!hasBusiness)}
              className={`mb-5 p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                hasBusiness 
                  ? 'bg-[#EBF3FE]/70 border-[#0B63F6]/40 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                  hasBusiness 
                    ? 'bg-[#0B63F6] border-[#0B63F6] text-white shadow-xs' 
                    : 'bg-white border-slate-300'
                }`}>
                  {hasBusiness && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A] flex items-center gap-1.5 leading-none">
                    <Building2 className={`w-4 h-4 ${hasBusiness ? 'text-[#0B63F6]' : 'text-slate-400'}`} />
                    <span>I own a business / registered enterprise</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 font-normal mt-1 leading-none">
                    {hasBusiness 
                      ? 'Enterprise Account: Enter Business Name & optional GST' 
                      : 'Individual Account: Only your name, trade skill & address required'}
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
                hasBusiness 
                  ? 'bg-[#0B63F6] text-white' 
                  : 'bg-slate-200/80 text-slate-600'
              }`}>
                {hasBusiness ? 'Business' : 'Individual'}
              </span>
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

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              {/* ======================================================== */}
              {/* SECTION 1: Identity & Name */}
              {/* ======================================================== */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <User className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>{hasBusiness ? 'Contact Person & Enterprise Identity' : 'Personal Details'}</span>
                </div>

                {/* Individual Full Name */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                    {hasBusiness ? 'Authorized Contact Person Name *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <User className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={hasBusiness ? 'e.g. Ramesh Kumar Sharma' : 'e.g. Mukesh Sen (Electrician / Contractor)'}
                      className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* CONDITIONAL: Business Name & GSTIN (Shown ONLY when hasBusiness is true) */}
                {hasBusiness && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                        Business Name / Organization Name *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                        <input
                          type="text"
                          required={hasBusiness}
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Shree Ram Electricals & Hardware"
                          className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                        GST Number (GSTIN) <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <Receipt className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={gstinNumber}
                          onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. 08AAAAA0000A1Z5"
                          className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-mono text-[#1E293B] placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* SECTION 2: Partner Category & Domain Sector */}
              {/* ======================================================== */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                    <Store className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                    <span>Partner Category & Operating Domain *</span>
                  </div>
                  {catalogLoading && (
                    <span className="text-[11px] text-[#0B63F6] font-medium animate-pulse">Loading live catalog...</span>
                  )}
                </div>

                {/* Primary Category Selector Dropdown matching Login Screenshot */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1.5">
                    Primary Domain / Sector *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      {partnerCategory === 'Adventure' ? (
                        <Compass className="w-4 h-4 text-[#0B63F6]" strokeWidth={1.8} />
                      ) : partnerCategory === 'Material' ? (
                        <Package className="w-4 h-4 text-[#0B63F6]" strokeWidth={1.8} />
                      ) : (
                        <Wrench className="w-4 h-4 text-[#0B63F6]" strokeWidth={1.8} />
                      )}
                    </div>
                    <select
                      value={partnerCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPartnerCategory(val);
                        if (val === 'Material') {
                          setVendorType('MATERIAL');
                        } else if (val === 'Adventure') {
                          setVendorType('LABOR');
                        } else if (vendorType === 'MATERIAL') {
                          setVendorType('LABOR');
                        }
                      }}
                      className="w-full h-11 pl-10 pr-9 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-semibold text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="Services">🛠️ Maintenance & Civil Services (Electrician, Plumber, Waterproofing, Civil, ...)</option>
                      <option value="Adventure">🪂 Adventure & Tourism Operator (Bathe, Paragliding, Camping, Trekking, Safari, ...)</option>
                      <option value="Material">📦 Building Material Supplier & Trader (Cement, Steel, Wood, Tiles, Hardware, ...)</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Visual Category Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div
                    onClick={() => {
                      setPartnerCategory('Services');
                      if (vendorType === 'MATERIAL') setVendorType('LABOR');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      partnerCategory === 'Services'
                        ? 'bg-blue-50/70 border-[#0B63F6] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${partnerCategory === 'Services' ? 'bg-[#0B63F6] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[12px] font-bold truncate ${partnerCategory === 'Services' ? 'text-[#0B63F6]' : 'text-slate-800'}`}>
                        Services & Works
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-snug line-clamp-2">
                      Electrician, Plumber, Waterproofing, Civil Works, Painter
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setPartnerCategory('Adventure');
                      setVendorType('LABOR');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      partnerCategory === 'Adventure'
                        ? 'bg-blue-50/70 border-[#0B63F6] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${partnerCategory === 'Adventure' ? 'bg-[#0B63F6] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[12px] font-bold truncate ${partnerCategory === 'Adventure' ? 'text-[#0B63F6]' : 'text-slate-800'}`}>
                        Adventure & Tourism
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-snug line-clamp-2">
                      Paragliding, Trekking, Camping, Desert Safari, Water Sports
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setPartnerCategory('Material');
                      setVendorType('MATERIAL');
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      partnerCategory === 'Material'
                        ? 'bg-blue-50/70 border-[#0B63F6] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${partnerCategory === 'Material' ? 'bg-[#0B63F6] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[12px] font-bold truncate ${partnerCategory === 'Material' ? 'text-[#0B63F6]' : 'text-slate-800'}`}>
                        Material Supplier
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-snug line-clamp-2">
                      Cement, Steel, Wood, Tiles, Hardware, Sanitaryware
                    </p>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 1. ADVENTURE & TOURISM ACTIVITIES (When partnerCategory === 'Adventure') */}
                {/* ======================================================== */}
                {partnerCategory === 'Adventure' && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11.5px] font-semibold text-[#1F2937]">
                        Adventure Activities & Operations * <span className="text-[#0B63F6] font-normal">(Select all that you offer)</span>
                      </label>
                      <span className="text-[10.5px] text-slate-400">
                        {selectedAdventures.length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ADVENTURE_ACTIVITIES.map((act) => {
                        const isSelected = selectedAdventures.includes(act.title);
                        return (
                          <div
                            key={act.id}
                            onClick={() => toggleAdventure(act.title)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-blue-50/80 border-[#0B63F6] shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className={`text-[12px] font-semibold leading-snug ${isSelected ? 'text-[#0B63F6]' : 'text-slate-800'}`}>
                                {act.title}
                              </div>
                              <p className="text-[10.5px] text-slate-400 line-clamp-1">
                                {act.desc}
                              </p>
                            </div>
                            <div className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center mt-0.5 ${
                              isSelected ? 'bg-[#0B63F6] border-[#0B63F6] text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Adventure Activity */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Operate other outdoor adventures, tours or sports?
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customAdventureInput}
                          onChange={(e) => setCustomAdventureInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomAdventure(e); }}
                          placeholder="e.g. Scuba Diving, Bungee Jumping, Paramotor, Kayaking"
                          className="flex-1 h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[12px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomAdventure}
                          className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {additionalAdventures.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {additionalAdventures.map((adv) => (
                            <span
                              key={adv}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 text-[#0B63F6] text-[11.5px] font-medium"
                            >
                              <span>{adv}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomAdventure(adv)}
                                className="hover:text-red-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 2. MAINTENANCE & CIVIL SERVICES (When partnerCategory === 'Services') */}
                {/* ======================================================== */}
                {partnerCategory === 'Services' && (
                  <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                    
                    {/* 3 Type Selector: Labor vs Material vs Both */}
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1.5">
                        What type of services or materials do you provide? *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setVendorType('LABOR')}
                          className={`h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'LABOR'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Labor & Services</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVendorType('MATERIAL')}
                          className={`h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'MATERIAL'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Material Supply</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVendorType('BOTH')}
                          className={`h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            vendorType === 'BOTH'
                              ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Both (Turnkey)</span>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC SERVICE CATEGORY & WORK SECTIONS (When LABOR or BOTH) */}
                    {(vendorType === 'LABOR' || vendorType === 'BOTH') && (
                      <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                        
                        {/* Dynamic Primary Category Dropdown from DB */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11.5px] font-semibold text-[#1F2937]">
                              Service Domain / Work Category * <span className="text-[#0B63F6] font-normal">(Live from Catalog)</span>
                            </label>
                            <span className="text-[10.5px] text-slate-400">
                              {dbServices.length} categories available
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <Landmark className="w-4 h-4" strokeWidth={1.8} />
                            </div>
                            <select
                              value={selectedServiceId}
                              onChange={(e) => handleServiceChange(e.target.value)}
                              className="w-full h-10.5 pl-10 pr-9 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-medium text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300 truncate"
                            >
                              {dbServices.map((srv) => (
                                <option key={srv.id} value={srv.id}>
                                  {srv.name} ({srv.subServices?.length || 0} work sections)
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Sub-services / Work Sections belonging to this Service */}
                        {currentService && currentService.subServices && currentService.subServices.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11.5px] font-semibold text-[#1F2937]">
                                Work Sections in <span className="text-[#0B63F6] font-bold">"{currentService.name}"</span>:
                              </label>
                              <span className="text-[10.5px] text-slate-400">Select what you do</span>
                            </div>

                            {/* Interactive dynamic sub-service cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentService.subServices.map((sub) => {
                                const title = sub.titleEn || sub.name;
                                const isSelected = selectedSubServices.includes(title);
                                return (
                                  <div
                                    key={sub.id}
                                    onClick={() => toggleSubService(title)}
                                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2.5 ${
                                      isSelected
                                        ? 'bg-blue-50/80 border-[#0B63F6] shadow-2xs'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className={`text-[12px] font-semibold leading-snug ${isSelected ? 'text-[#0B63F6]' : 'text-slate-800'}`}>
                                        {title}
                                      </div>
                                      {sub.desc && (
                                        <p className="text-[10.5px] text-slate-400 line-clamp-1">
                                          {sub.desc}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center mt-0.5 ${
                                      isSelected ? 'bg-[#0B63F6] border-[#0B63F6] text-white' : 'border-slate-300'
                                    }`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Additional Custom Trade / Skill Addition */}
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[11px] font-medium text-slate-600">
                            Have other specialized skills or trade tools?
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customTradeInput}
                              onChange={(e) => setCustomTradeInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSkill(e); }}
                              placeholder="e.g. Copper Gas Piping, Core Cutting, Epoxy Grouting"
                              className="flex-1 h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[12px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Skill</span>
                            </button>
                          </div>

                          {/* Display Custom Added Skills */}
                          {additionalSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {additionalSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 text-[#0B63F6] text-[11.5px] font-medium"
                                >
                                  <span>{sk}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSkill(sk)}
                                    className="hover:text-red-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* 3. MATERIAL SUPPLY CATEGORIES (When partnerCategory === 'Material' or vendorType === 'MATERIAL' or 'BOTH') */}
                {/* ======================================================== */}
                {(partnerCategory === 'Material' || (partnerCategory === 'Services' && (vendorType === 'MATERIAL' || vendorType === 'BOTH'))) && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11.5px] font-semibold text-[#1F2937]">
                        Material Categories Supplied <span className="text-slate-400 font-normal">(Click all that you stock)</span>:
                      </label>
                      <span className="text-[10.5px] text-slate-400">{selectedMaterials.length} selected</span>
                    </div>

                    {/* Badges of Material Categories */}
                    <div className="flex flex-wrap gap-2">
                      {materialCatalog.map((cat) => {
                        const isSelected = selectedMaterials.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleMaterial(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0B63F6] text-white border-[#0B63F6] shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Material Option */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customMaterialInput}
                        onChange={(e) => setCustomMaterialInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomMaterial(e); }}
                        placeholder="Add other material or product line..."
                        className="flex-1 h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-[12px] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomMaterial}
                        className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Experience Level */}
                <div className="pt-1">
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                    Industry Experience Level
                  </label>
                  <div className="relative">
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] appearance-none focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="1-3 Years">1 to 3 Years</option>
                      <option value="3-5 Years">3 to 5 Years (Standard)</option>
                      <option value="5-10 Years">5 to 10 Years (Experienced)</option>
                      <option value="10+ Years">10+ Years (Master Contractor)</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* SECTION 3: Contact Details */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                  <Mail className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                  <span>Contact Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
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
                        placeholder="10 digit mobile number"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION 4: Security Information */}
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
              {/* SECTION 5: Address Details (Streamlined: PIN Code & Address Line) */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-[13.5px]">
                    <MapPin className="w-4 h-4 text-[#0B63F6]" strokeWidth={2} />
                    <span>{hasBusiness ? 'Business Address' : 'Address Details'}</span>
                  </div>
                  {fetchingPin && (
                    <span className="text-[11px] text-[#0B63F6] font-medium flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0B63F6] animate-ping"></span>
                      Auto-fetching location...
                    </span>
                  )}
                </div>

                {/* PIN Code Field */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#1F2937] mb-1">
                    PIN Code *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="Enter 6 digit postal PIN code"
                      className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] font-medium text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                    />
                  </div>

                  {/* Auto-resolved location indicator */}
                  {resolvedLocation && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Auto-detected: {resolvedLocation}</span>
                    </div>
                  )}
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
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House / Shop / Building No., Street, Area"
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
                        placeholder="Landmark, Colony, Road"
                        className="w-full h-10.5 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-normal text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-[#0B63F6] focus:ring-1 focus:ring-[#0B63F6] transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Crimson Red Action Button: Register Now → */}
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
                    <span>
                      {partnerCategory === 'Adventure'
                        ? 'Register Adventure Operator Profile Now →'
                        : partnerCategory === 'Material'
                        ? 'Register Material Supplier Profile Now →'
                        : hasBusiness
                        ? 'Register Business Entity Now →'
                        : 'Register Service Profile Now →'}
                    </span>
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
