import React, { useState } from 'react';
import {
  Home, Grid, Calendar, Briefcase, User, MapPin, Bell, ChevronRight,
  ArrowLeft, Star, Clock, ShieldCheck, Users, CheckCircle2,
  Lock, CreditCard, ChevronDown, Check, Building, Wrench, Compass,
  Layers, Hammer, Droplets, HardHat, FileText, Calculator, PhoneCall,
  X, AlertCircle, LogOut, Info, Settings, Bookmark, Search, Maximize2,
  UploadCloud, Sparkles, Plus, Trash2, ArrowRight
} from 'lucide-react';

// The 8 Primary Construction & Maintenance Services
const ALL_SERVICES = [
  {
    id: 's1',
    title: 'Civil Construction',
    subtitle: 'Residential, Commercial, Industrial',
    icon: Building,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    subServices: [
      'Building Construction & Extension',
      'Structural Crack & Beam Patch Work',
      'Plaster Repair & Surface Leveling',
      'Foundation & Column Strengthening'
    ],
    defaultDesc: 'Plaster flaking and hairline settlement crack along the main living room beam.'
  },
  {
    id: 's2',
    title: 'Waterproofing & Maintenance',
    subtitle: 'Roof, Bathroom, Seepage & Cracks',
    icon: Droplets,
    color: '#0284C7',
    bg: '#E0F2FE',
    subServices: [
      'Stop Roof & Terrace Water Leakage',
      'Bathroom & Concealed Pipe Seepage',
      'External Wall Dampness Treatment',
      'Chemical PU Injection & Grouting'
    ],
    defaultDesc: 'Terrace water ponding and ceiling moisture spreading into bedroom wall.'
  },
  {
    id: 's3',
    title: 'Painting & Wall Repair',
    subtitle: 'Putty, POP, Exterior Weathercoat',
    icon: Hammer,
    color: '#7E22CE',
    bg: '#F3E8FF',
    subServices: [
      'Interior Moisture-Resistant Emulsion',
      'Exterior Weathercoat & Anti-Algae',
      'Waterproof Putty & POP Crack Patch',
      'Wall Efflorescence Salt Cleaning'
    ],
    defaultDesc: 'Peeling paint and bubbling damp patches needing scraping and 2 coats weathercoat.'
  },
  {
    id: 's4',
    title: 'Architecture & Planning',
    subtitle: 'Design, 2D/3D Drawings & Sanction',
    icon: Compass,
    color: '#D97706',
    bg: '#FEF3C7',
    subServices: [
      '2D Floor Plans & Elevation',
      '3D Architectural Visualization',
      'Structural Engineering Drawings',
      'Municipal Approval Consultation'
    ],
    defaultDesc: 'Require modern renovation elevation drawing and municipal sanction plan.'
  },
  {
    id: 's5',
    title: 'Survey & Mapping',
    subtitle: 'Site Survey, Land Boundary & GPS',
    icon: Layers,
    color: '#EA580C',
    bg: '#FFEDD5',
    subServices: [
      'Boundary Demarcation & Topo Survey',
      'Digital Total Station Mapping',
      'Drone Aerial Site Scanning',
      'Soil Testing & Bearing Capacity'
    ],
    defaultDesc: 'Boundary survey and level demarcation before foundation work.'
  },
  {
    id: 's6',
    title: 'Interior & Exterior Design',
    subtitle: 'Modern & Functional Spaces',
    icon: Home,
    color: '#0D9488',
    bg: '#CCFBF1',
    subServices: [
      'Modular Kitchen & Wardrobe Design',
      'False Ceiling & Ambient Lighting',
      'Wall Cladding & Designer Louvers',
      'Balcony Landscaping & Decking'
    ],
    defaultDesc: 'Full interior woodwork and modular cabinetry layout makeover.'
  },
  {
    id: 's7',
    title: 'Structural Analysis',
    subtitle: 'Safety & Strength Inspection',
    icon: ShieldCheck,
    color: '#16A34A',
    bg: '#DCFCE7',
    subServices: [
      'Non-Destructive Rebound Hammer Test',
      'Load Bearing Capacity Audit',
      'Earthquake Resistance Verification',
      'Retrofitting & Jacketing Plan'
    ],
    defaultDesc: 'Safety audit of 15-year-old RCC building pillars.'
  },
  {
    id: 's8',
    title: 'Cost Estimation & BOQ',
    subtitle: 'Detailed & Accurate Estimation',
    icon: Calculator,
    color: '#4F46E5',
    bg: '#EEF2FF',
    subServices: [
      'Itemized Bill of Quantities (BOQ)',
      'Material Rate Analysis & Procurement',
      'Milestone Payment Structuring',
      'Contractor Cost Audit'
    ],
    defaultDesc: 'Detailed material and labor estimation for 2nd floor expansion.'
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Multi-Service Selection State
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1', 's2']); // Default 2 services selected for demo
  const [currentSubformIndex, setCurrentSubformIndex] = useState(0); // Which service subform is active (0 to N-1)

  // Per-Service Subform Data (stored as key-value by serviceId)
  const [serviceSubformData, setServiceSubformData] = useState({
    s1: {
      subServices: ['Structural Crack & Beam Patch Work'],
      description: 'Plaster flaking and hairline settlement crack along the main living room beam.',
      photos: ['/images/patch_damage.svg']
    },
    s2: {
      subServices: ['Stop Roof & Terrace Water Leakage'],
      description: 'Terrace water ponding and ceiling moisture spreading into bedroom wall.',
      photos: ['/images/patch_damage.svg']
    }
  });

  // Scheduling State (Date & Desired Time)
  const [selectedDate, setSelectedDate] = useState(16); // Apr 2025
  const [desiredTimeWindow, setDesiredTimeWindow] = useState('morning'); // 'morning' | 'afternoon' | 'evening' | 'flexible'
  const [customDesiredTime, setCustomDesiredTime] = useState('Around 11:30 AM before lunch');

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  // Toggle Service Selection (Checkbox in Services list)
  const toggleServiceSelection = (serviceId) => {
    setSelectedServiceIds(prev => {
      const exists = prev.includes(serviceId);
      let updated;
      if (exists) {
        updated = prev.filter(id => id !== serviceId);
      } else {
        updated = [...prev, serviceId];
      }

      // Initialize subform data if not present
      if (!serviceSubformData[serviceId]) {
        const found = ALL_SERVICES.find(s => s.id === serviceId);
        setServiceSubformData(fData => ({
          ...fData,
          [serviceId]: {
            subServices: [found?.subServices[0] || ''],
            description: found?.defaultDesc || 'Patch repair required.',
            photos: ['/images/patch_damage.svg']
          }
        }));
      }
      return updated;
    });
  };

  // Start filling subforms one by one
  const handleStartSubforms = () => {
    if (selectedServiceIds.length === 0) {
      alert('Please select at least one service!');
      return;
    }
    setCurrentSubformIndex(0);
    setCurrentScreen('service_subform');
  };

  // Proceed from Subform N to N+1 or Date/Time
  const handleNextSubform = () => {
    if (currentSubformIndex < selectedServiceIds.length - 1) {
      setCurrentSubformIndex(currentSubformIndex + 1);
    } else {
      // All services filled! Proceed to Date & Desired Time screen
      setCurrentScreen('schedule_date_time');
    }
  };

  // Go back one subform
  const handlePrevSubform = () => {
    if (currentSubformIndex > 0) {
      setCurrentSubformIndex(currentSubformIndex - 1);
    } else {
      setCurrentScreen('services');
    }
  };

  // Upload image to currently active service subform
  const handleUploadPhotoForCurrentService = (serviceId, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setServiceSubformData(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          photos: [...(prev[serviceId]?.photos || []), url]
        }
      }));
    }
  };

  // Active service in current subform wizard step
  const activeServiceObj = ALL_SERVICES.find(s => s.id === selectedServiceIds[currentSubformIndex]) || ALL_SERVICES[0];
  const activeSubform = serviceSubformData[activeServiceObj.id] || {
    subServices: [activeServiceObj.subServices[0]],
    description: activeServiceObj.defaultDesc,
    photos: ['/images/patch_damage.svg']
  };

  // Sync bottom navigation tabs
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'services') setCurrentScreen('services');
    if (tab === 'bookings') setCurrentScreen('my_bookings');
    if (tab === 'projects') setCurrentScreen('projects');
    if (tab === 'profile') setCurrentScreen('profile');
  };

  const showBottomNav = ['home', 'services', 'my_bookings', 'projects', 'profile'].includes(currentScreen);

  return (
    <div className="simulator-container">
      {/* Top Demo Toolbar to jump to any screen */}
      <div className="top-showcase-bar">
        <div className="showcase-header">
          <div className="brand-label">
            <span className="gold-text">HP</span> HINDUSTAN PROJECTS <span style={{ opacity: 0.6, fontSize: '11px', fontWeight: '400' }}>(Multi-Service Flow)</span>
          </div>
          <button 
            onClick={() => setFullscreenMode(!fullscreenMode)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Maximize2 size={12} /> {fullscreenMode ? 'Bezel' : 'Full'}
          </button>
        </div>

        {/* Screen Selector Pills */}
        <div className="screen-pills-row">
          {[
            { id: 'home', label: '1. Home' },
            { id: 'services', label: '2. Select Services (Multi)' },
            { id: 'service_subform', label: '3. Service Sub-Forms' },
            { id: 'schedule_date_time', label: '4. Date & Desired Time' },
            { id: 'estimation_review', label: '5. Work Estimation' },
            { id: 'payment', label: '6. Payment' },
            { id: 'confirmation', label: '7. Work Started' },
            { id: 'my_bookings', label: '8. Bookings' },
            { id: 'projects', label: '9. Projects' },
            { id: 'profile', label: '10. Profile' }
          ].map((s) => (
            <button
              key={s.id}
              className={`screen-pill-btn ${currentScreen === s.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentScreen(s.id);
                if (['home', 'services', 'my_bookings', 'projects', 'profile'].includes(s.id)) {
                  setActiveTab(s.id === 'my_bookings' ? 'bookings' : s.id);
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Native Mobile Phone Chassis */}
      <div className={`native-phone-wrapper ${fullscreenMode ? 'full-view' : ''}`}>
        
        {/* Status Bar with Dynamic Island */}
        <div className="phone-status-bar">
          <span>9:41</span>
          <div className="dynamic-island" />
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className={`screen-scroll-viewport ${!showBottomNav ? 'no-bottom-nav' : ''}`}>

          {/* ================= 1. HOME SCREEN ================= */}
          {currentScreen === 'home' && (
            <div className="fade-in-slide">
              <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#0B2545" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>Bhilwara, Rajasthan</span>
                  <ChevronDown size={14} color="#64748B" />
                </div>
                <button style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Bell size={16} color="#0B2545" />
                </button>
              </div>

              <div style={{ padding: '14px 18px 8px 18px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                  HINDUSTAN PROJECTS
                </h1>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500', marginTop: '2px' }}>
                  Construction &nbsp;|&nbsp; Architecture &nbsp;|&nbsp; Engineering
                </div>
              </div>

              {/* Hero Banner Card */}
              <div style={{ padding: '0 16px', margin: '8px 0 16px 0' }}>
                <div style={{ position: 'relative', height: '170px', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                  <img 
                    src="/images/hero_villa.jpg" 
                    alt="Luxury Home"
                    onError={(e) => { e.target.src = '/images/construction_site.svg'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.65) 60%, transparent 100%)', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', fontFamily: 'Outfit', lineHeight: '1.3', maxWidth: '200px' }}>
                      Build Better With Expert Services
                    </h2>
                    <button 
                      onClick={() => setCurrentScreen('services')}
                      style={{ marginTop: '12px', background: '#F59E0B', color: '#071930', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Select Multiple Services →
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '0 16px 18px 16px' }}>
                <div onClick={() => setCurrentScreen('services')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <Grid size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#0B2545', textAlign: 'center' }}>Our Services</span>
                </div>

                <div onClick={() => setCurrentScreen('projects')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <Building size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#0B2545', textAlign: 'center' }}>Recent Projects</span>
                </div>

                <div onClick={() => setCurrentScreen('services')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <Calculator size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#0B2545', textAlign: 'center' }}>Multi-Quote</span>
                </div>

                <div onClick={() => setCurrentScreen('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <PhoneCall size={22} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#0B2545', textAlign: 'center' }}>Contact Us</span>
                </div>
              </div>

              {/* Multi-Service Banner */}
              <div style={{ padding: '0 16px 20px 16px' }}>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF' }}>Need Multiple Repairs?</div>
                    <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '2px' }}>Select civil, waterproofing, painting together in 1 visit!</div>
                  </div>
                  <button 
                    onClick={() => setCurrentScreen('services')}
                    style={{ background: '#1D4ED8', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Select →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. SERVICES LIST (WITH MULTI-SELECT CHECKBOXES) ================= */}
          {currentScreen === 'services' && (
            <div className="fade-in-slide" style={{ paddingBottom: '70px' }}>
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Select Services (Multiple)</div>
                <div style={{ width: '24px' }} />
              </div>

              {/* Explanatory Header */}
              <div style={{ padding: '12px 16px 4px 16px' }}>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                  Select all the services you need. For each service selected, a sub-form will open one by one to upload patch photos.
                </p>
              </div>

              {/* Service Cards List with Multi-Select Checkboxes */}
              <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ALL_SERVICES.map((item) => {
                  const isChecked = selectedServiceIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleServiceSelection(item.id)}
                      style={{
                        background: isChecked ? '#FFFBEB' : '#fff',
                        border: `1.5px solid ${isChecked ? '#F59E0B' : '#E2E8F0'}`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Checkbox Icon */}
                      <div className={`multi-select-pill ${isChecked ? 'checked' : ''}`} style={{ background: isChecked ? '#0B2545' : '#fff' }}>
                        {isChecked && <Check size={14} color="#fff" />}
                      </div>

                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={20} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{item.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Multi-Service Bottom Action Bar */}
              {selectedServiceIds.length > 0 && (
                <div className="multi-select-floating-bar">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                      {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'Service' : 'Services'} Selected
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>
                      Configure patch details & photos
                    </div>
                  </div>

                  <button 
                    onClick={handleStartSubforms}
                    style={{ background: '#F59E0B', color: '#071930', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. SUB-FORM FOR EACH SERVICE (OPENED ONE BY ONE!) ================= */}
          {currentScreen === 'service_subform' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={handlePrevSubform}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">
                  Sub-Form {currentSubformIndex + 1} of {selectedServiceIds.length}
                </div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Wizard Progress Bar */}
                <div className="wizard-progress-bar">
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0B2545' }}>
                    SERVICE {currentSubformIndex + 1} OF {selectedServiceIds.length}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedServiceIds.map((_, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: idx === currentSubformIndex ? '20px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: idx <= currentSubformIndex ? '#0B2545' : '#CBD5E1',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Current Service Header Badge */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: activeServiceObj.bg, padding: '12px', borderRadius: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', color: activeServiceObj.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.createElement(activeServiceObj.icon, { size: 22 })}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0B2545' }}>{activeServiceObj.title}</h3>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Configure patch work details for this service</div>
                  </div>
                </div>

                {/* Sub-Service Checkbox Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginBottom: '8px' }}>
                    1. Select Specific Issues for {activeServiceObj.title}:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeServiceObj.subServices.map((sub, sIdx) => {
                      const isSubSelected = activeSubform.subServices?.includes(sub);
                      return (
                        <div
                          key={sIdx}
                          onClick={() => {
                            const updated = isSubSelected 
                              ? activeSubform.subServices.filter(item => item !== sub)
                              : [...(activeSubform.subServices || []), sub];
                            setServiceSubformData(prev => ({
                              ...prev,
                              [activeServiceObj.id]: {
                                ...activeSubform,
                                subServices: updated
                              }
                            }));
                          }}
                          style={{
                            background: isSubSelected ? '#EFF6FF' : '#fff',
                            border: `1.5px solid ${isSubSelected ? '#2563EB' : '#E2E8F0'}`,
                            borderRadius: '10px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#0F172A'
                          }}
                        >
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `1.5px solid ${isSubSelected ? '#2563EB' : '#94A3B8'}`, background: isSubSelected ? '#2563EB' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSubSelected && <Check size={12} color="#fff" />}
                          </div>
                          <span>{sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Patch Work Photo Upload for THIS service */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginBottom: '4px' }}>
                    2. Upload Images of {activeServiceObj.title} Patch Work Area:
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    Photos of damaged surface, cracks, seepage or specific repair spots.
                  </div>

                  <label style={{ display: 'block', border: '2px dashed #93C5FD', background: '#EFF6FF', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => handleUploadPhotoForCurrentService(activeServiceObj.id, e.target.files?.[0])}
                      style={{ display: 'none' }} 
                    />
                    <UploadCloud size={24} color="#1D4ED8" style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>
                      Tap to Take Photo or Upload Image
                    </div>
                  </label>

                  {/* Uploaded Photos Preview for this service */}
                  {activeSubform.photos && activeSubform.photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                      {activeSubform.photos.map((pUrl, pIdx) => (
                        <div key={pIdx} style={{ position: 'relative', height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                          <img src={pUrl} alt="Patch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            onClick={() => {
                              const remaining = activeSubform.photos.filter((_, i) => i !== pIdx);
                              setServiceSubformData(prev => ({
                                ...prev,
                                [activeServiceObj.id]: { ...activeSubform, photos: remaining }
                              }));
                            }}
                            style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description for THIS service */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginBottom: '4px' }}>
                    3. Notes / Measurements for {activeServiceObj.title}:
                  </div>
                  <textarea
                    rows={2}
                    value={activeSubform.description || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setServiceSubformData(prev => ({
                        ...prev,
                        [activeServiceObj.id]: { ...activeSubform, description: val }
                      }));
                    }}
                    placeholder="Describe problem details, dimensions or locations..."
                    style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '8px 10px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                {/* Subform Navigation Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentSubformIndex > 0 && (
                    <button 
                      className="btn-hp-secondary"
                      style={{ flex: 1 }}
                      onClick={handlePrevSubform}
                    >
                      ← Previous
                    </button>
                  )}
                  <button 
                    className="btn-hp-primary"
                    style={{ flex: 2 }}
                    onClick={handleNextSubform}
                  >
                    {currentSubformIndex < selectedServiceIds.length - 1 
                      ? `Next: ${ALL_SERVICES.find(s => s.id === selectedServiceIds[currentSubformIndex + 1])?.title || 'Next Service'} →`
                      : 'Next: Select Date & Desired Time →'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. DATE SELECTION & USER DESIRED TIME SUGGESTION ================= */}
          {currentScreen === 'schedule_date_time' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('service_subform')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Schedule Date & Desired Time</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Selected Services Summary Pill */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>SERVICES CONFIGURED ({selectedServiceIds.length}):</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545', marginTop: '2px' }}>
                    {selectedServiceIds.map(id => ALL_SERVICES.find(s => s.id === id)?.title).join(' • ')}
                  </div>
                </div>

                {/* 1. SELECT DATE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>1. Preferred Date</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>
                    <span>&lt;</span> Apr 2025 <span>&gt;</span>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 8px', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '10px', color: '#94A3B8', fontWeight: '600', marginBottom: '8px' }}>
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>
                    {[13, 14, 15, 16, 17, 18, 19].map(date => (
                      <div 
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          cursor: 'pointer',
                          background: selectedDate === date ? '#0B2545' : 'transparent',
                          color: selectedDate === date ? '#fff' : '#0F172A',
                          fontWeight: selectedDate === date ? '700' : '500'
                        }}
                      >
                        {date}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. USER SUGGESTS DESIRED TIME (User Requirement) */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545', marginBottom: '4px' }}>
                    2. Suggest Your Desired Time:
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    Pick your preferred window or suggest an exact time convenient for you.
                  </div>

                  {/* Window Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {[
                      { id: 'morning', label: '🌅 Morning (9 AM - 12 PM)' },
                      { id: 'afternoon', label: '☀️ Afternoon (1 PM - 4 PM)' },
                      { id: 'evening', label: '🌆 Evening (4 PM - 7 PM)' },
                      { id: 'flexible', label: '⚡ Flexible / Any Time' }
                    ].map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setDesiredTimeWindow(slot.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${desiredTimeWindow === slot.id ? '#0B2545' : '#E2E8F0'}`,
                          background: desiredTimeWindow === slot.id ? '#0B2545' : '#fff',
                          color: desiredTimeWindow === slot.id ? '#fff' : '#0F172A',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Time Suggestion Input */}
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Any specific time preference?
                  </label>
                  <input
                    type="text"
                    value={customDesiredTime}
                    onChange={(e) => setCustomDesiredTime(e.target.value)}
                    placeholder="e.g. Around 11:30 AM before lunch, or after 5 PM"
                    style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px 12px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <button 
                  className="btn-hp-primary"
                  onClick={() => setCurrentScreen('estimation_review')}
                >
                  Send for Multi-Service Estimation (₹0 Upfront)
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. MULTI-SERVICE WORK ESTIMATION REVIEW ================= */}
          {currentScreen === 'estimation_review' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('schedule_date_time')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Work Estimation</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B2545' }}>
                      Combined Estimation #{Math.floor(1000 + Math.random() * 9000)}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Scheduled: <strong>{selectedDate} Apr 2025</strong> ({customDesiredTime})
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#047857', padding: '4px 8px', borderRadius: '6px' }}>
                    MULTI-SERVICE
                  </span>
                </div>

                {/* Grouped Estimation Breakdown per selected service */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {selectedServiceIds.map((sId) => {
                    const sObj = ALL_SERVICES.find(s => s.id === sId);
                    const sfData = serviceSubformData[sId] || {};
                    const isCivil = sId === 's1';
                    const sTotal = isCivil ? 7200 : 5400;

                    return (
                      <div key={sId} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '800', fontSize: '13px', color: '#0B2545' }}>{sObj?.title}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#1D4ED8' }}>₹{sTotal.toLocaleString()}</span>
                        </div>

                        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                          <strong>Sub-services:</strong> {sfData.subServices?.join(', ') || 'Inspection'}
                        </div>

                        <div style={{ fontSize: '11px', color: '#475569', background: '#F8FAFC', padding: '6px 8px', borderRadius: '8px' }}>
                          "{sfData.description || 'Patch work specified.'}"
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Summary */}
                <div style={{ background: '#0B2545', color: '#fff', borderRadius: '16px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Services Configured</span>
                    <span style={{ fontWeight: '700' }}>{selectedServiceIds.length} Services</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL ESTIMATION</div>
                      <div style={{ fontSize: '10px', color: '#F59E0B' }}>Includes all materials, labor & GST</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Outfit', color: '#F59E0B' }}>
                      ₹12,600
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-hp-primary"
                  onClick={() => setCurrentScreen('payment')}
                >
                  Approve Estimation & Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* ================= 6. PAYMENT SCREEN ================= */}
          {currentScreen === 'payment' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('estimation_review')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Payment</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Total Multi-Service Estimation</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit' }}>
                    ₹12,600
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545', marginBottom: '10px' }}>
                  Select Payment Method
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {[
                    { id: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)' },
                    { id: 'card', label: 'Card (Visa, MasterCard, RuPay)' },
                    { id: 'wallet', label: 'Wallet (Paytm, PhonePe)' },
                    { id: 'netbanking', label: 'Net Banking' },
                    { id: 'cod', label: 'Milestone / Post-Service Payment' }
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      style={{
                        background: '#fff',
                        border: `1.5px solid ${selectedPaymentMethod === method.id ? '#1D4ED8' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedPaymentMethod === method.id ? '#1D4ED8' : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selectedPaymentMethod === method.id && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D4ED8' }} />
                          )}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{method.label}</span>
                      </div>
                      <ChevronRight size={14} color="#94A3B8" />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B', marginBottom: '20px' }}>
                  <Lock size={12} color="#10B981" />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <button 
                  className="btn-hp-primary"
                  onClick={() => setCurrentScreen('confirmation')}
                >
                  Pay Now & Start Work
                </button>
              </div>
            </div>
          )}

          {/* ================= 7. CONFIRMATION & WORK STARTED ================= */}
          {currentScreen === 'confirmation' && (
            <div className="fade-in-slide" style={{ padding: '24px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={42} />
              </div>

              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit' }}>
                All Services Scheduled & Work Started!
              </h1>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '20px' }}>
                Appointment locked for <strong>{selectedDate} Apr 2025</strong> ({customDesiredTime}). Technical team dispatched!
              </p>

              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>SCHEDULED DATE & DESIRED TIME</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>{selectedDate} Apr 2025 • {customDesiredTime}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>SERVICES INCLUDED ({selectedServiceIds.length})</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>
                    {selectedServiceIds.map(id => ALL_SERVICES.find(s => s.id === id)?.title).join(', ')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>WARRANTY COVERAGE</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>2 Years Seepage & Crack Shield</div>
                </div>
              </div>

              <button 
                className="btn-hp-primary"
                style={{ marginBottom: '10px' }}
                onClick={() => setCurrentScreen('my_bookings')}
              >
                Track Work Progress
              </button>

              <button 
                className="btn-hp-secondary"
                onClick={() => setCurrentScreen('home')}
              >
                Back to Home
              </button>
            </div>
          )}

          {/* ================= 8. MY BOOKINGS ================= */}
          {currentScreen === 'my_bookings' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">My Bookings</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>
                        Multi-Service Patch Work ({selectedServiceIds.length} Services)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {selectedDate} Apr 2025 • Desired Time: {customDesiredTime}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                      Active
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#334155', background: '#F8FAFC', padding: '8px', borderRadius: '8px', marginBottom: '10px' }}>
                    {selectedServiceIds.map(id => ALL_SERVICES.find(s => s.id === id)?.title).join(' • ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '11px', fontWeight: '600', color: '#0B2545' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => setCurrentScreen('estimation_review')}>View Estimation</span>
                    <span style={{ cursor: 'pointer' }}>Track Team</span>
                    <span style={{ color: '#EF4444', cursor: 'pointer' }}>Support</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. PROJECTS ================= */}
          {currentScreen === 'projects' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Our Projects</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '8px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                    <img 
                      src="/images/hero_villa.jpg" 
                      alt="Modern Villa"
                      onError={(e) => { e.target.src = '/images/construction_site.svg'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                      Residential
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0B2545' }}>Modern Residential Villa</h3>
                    <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Bhilwara • 2024</p>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                    <img 
                      src="/images/warehouse.svg" 
                      alt="Warehouse"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#F0FDF4', color: '#15803D', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                      Industrial
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0B2545' }}>Industrial Warehouse</h3>
                    <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Bhilwara • 2023</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. PROFILE ================= */}
          {currentScreen === 'profile' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Profile</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#0B2545', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800' }}>
                  PK
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0B2545' }}>Piyush Kumar</h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>piyush@gmail.com</div>
                </div>
              </div>

              <div style={{ padding: '12px 16px 24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'My Bookings', icon: Calendar, action: () => setCurrentScreen('my_bookings') },
                  { label: 'My Addresses', icon: MapPin },
                  { label: 'Payment Methods', icon: CreditCard, action: () => setCurrentScreen('payment') },
                  { label: 'Notifications', icon: Bell },
                  { label: 'Help & Support', icon: PhoneCall },
                  { label: 'About Us', icon: Info },
                  { label: 'Log Out', icon: LogOut, color: '#EF4444' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.action}
                    style={{
                      background: '#fff',
                      border: '1px solid #F1F5F9',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={16} color={item.color || '#0B2545'} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: item.color || '#0F172A' }}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 5-Tab Bottom Navigation Bar */}
        {showBottomNav && (
          <div className="phone-bottom-nav">
            <button 
              className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => navigateToTab('home')}
            >
              <Home size={19} className="nav-icon" />
              <span>Home</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => navigateToTab('services')}
            >
              <Grid size={19} className="nav-icon" />
              <span>Services</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => navigateToTab('bookings')}
            >
              <Calendar size={19} className="nav-icon" />
              <span>Bookings</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => navigateToTab('projects')}
            >
              <Briefcase size={19} className="nav-icon" />
              <span>Projects</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => navigateToTab('profile')}
            >
              <User size={19} className="nav-icon" />
              <span>Profile</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
