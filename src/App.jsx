import React, { useState } from 'react';
import {
  Home, Grid, Calendar, Briefcase, User, MapPin, Bell, ChevronRight,
  ArrowLeft, Star, Clock, ShieldCheck, Users, CheckCircle2,
  Lock, CreditCard, ChevronDown, Check, Building, Wrench, Compass,
  Layers, Hammer, Droplets, HardHat, FileText, Calculator, PhoneCall,
  X, AlertCircle, LogOut, Info, Settings, Bookmark, Search, Maximize2,
  UploadCloud, Sparkles, ArrowRight
} from 'lucide-react';

// The 8 Primary Construction & Maintenance Categories with Subcategories
const CATEGORIES = [
  {
    id: 'cat_civil',
    title: 'Civil Construction',
    shortTitle: 'Civil Work',
    subtitle: 'Residential, Commercial, Industrial',
    icon: Building,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    subcategories: [
      { id: 'sub_c1', name: 'Structural Crack & Beam Patch Work', desc: 'Filling settlement cracks, beam strengthening', defaultNotes: 'Wall plaster cracked along main beam, approx 12x10 ft area.' },
      { id: 'sub_c2', name: 'Plaster Repair & Surface Leveling', desc: 'Flaking plaster removal, cement re-plastering', defaultNotes: 'Old plaster crumbling near window frame.' },
      { id: 'sub_c3', name: 'Foundation & Column Strengthening', desc: 'Concrete jacketing, rebar rust treatment', defaultNotes: 'Surface rebar visible on pillar base.' },
      { id: 'sub_c4', name: 'Building Extension & Room Addition', desc: 'New brickwork, roof slab, boundary wall', defaultNotes: 'Planning to extend balcony area.' }
    ]
  },
  {
    id: 'cat_waterproof',
    title: 'Waterproofing & Maintenance',
    shortTitle: 'Waterproofing',
    subtitle: 'Roof, Bathroom, Seepage & Cracks',
    icon: Droplets,
    color: '#0284C7',
    bg: '#E0F2FE',
    subcategories: [
      { id: 'sub_w1', name: 'Stop Roof & Terrace Water Leakage', desc: 'Elastomeric chemical coating, ponding test', defaultNotes: 'Water dripping from terrace during rain.' },
      { id: 'sub_w2', name: 'Bathroom & Concealed Pipe Seepage', desc: 'Non-invasive epoxy grouting, drain seal', defaultNotes: 'Damp moisture spreading into adjoining bedroom.' },
      { id: 'sub_w3', name: 'External Wall Dampness Treatment', desc: 'Hydrophobic anti-seepage exterior shield', defaultNotes: 'Efflorescence white powder flaking off wall.' },
      { id: 'sub_w4', name: 'Chemical PU Injection & Grouting', desc: 'High-pressure polyurethane crack injection', defaultNotes: 'Active water seep in basement wall.' }
    ]
  },
  {
    id: 'cat_painting',
    title: 'Painting & Wall Repair',
    shortTitle: 'Painting',
    subtitle: 'Putty, POP, Exterior Weathercoat',
    icon: Hammer,
    color: '#7E22CE',
    bg: '#F3E8FF',
    subcategories: [
      { id: 'sub_p1', name: 'Interior Moisture-Resistant Emulsion', desc: 'Washable luxury emulsion double coat', defaultNotes: 'Interior hall repainting with damp primer.' },
      { id: 'sub_p2', name: 'Exterior Weathercoat & Anti-Algae', desc: 'Rain-proof exterior facade protection', defaultNotes: 'Exterior facade paint peeling off.' },
      { id: 'sub_p3', name: 'Waterproof Putty & POP Crack Patch', desc: 'Acrylic damp-proof putty leveling', defaultNotes: 'POP cornice crack repair.' }
    ]
  },
  {
    id: 'cat_arch',
    title: 'Architecture & Planning',
    shortTitle: 'Architecture',
    subtitle: 'Design, 2D/3D Drawings & Sanction',
    icon: Compass,
    color: '#D97706',
    bg: '#FEF3C7',
    subcategories: [
      { id: 'sub_a1', name: '2D Floor Plans & Elevation', desc: 'Vastu compliant layout & section drawings', defaultNotes: 'Need 2D layout for ground floor renovation.' },
      { id: 'sub_a2', name: '3D Architectural Visualization', desc: 'Photorealistic exterior and interior renders', defaultNotes: 'Modern facade 3D render.' },
      { id: 'sub_a3', name: 'Municipal Approval Consultation', desc: 'Building plan sanction paperwork', defaultNotes: 'Bhilwara municipal clearance drawing.' }
    ]
  },
  {
    id: 'cat_survey',
    title: 'Survey & Mapping',
    shortTitle: 'Survey & GPS',
    subtitle: 'Site Survey, Land Boundary & GPS',
    icon: Layers,
    color: '#EA580C',
    bg: '#FFEDD5',
    subcategories: [
      { id: 'sub_s1', name: 'Boundary Demarcation & Topo Survey', desc: 'Land area measurement and boundary stone marking', defaultNotes: 'Demarcate plot boundary stones.' },
      { id: 'sub_s2', name: 'Digital Total Station Mapping', desc: 'Sub-centimeter precision coordinates', defaultNotes: 'Contour and level survey for construction.' }
    ]
  },
  {
    id: 'cat_interior',
    title: 'Interior & Exterior Design',
    shortTitle: 'Interiors',
    subtitle: 'Modern & Functional Spaces',
    icon: Home,
    color: '#0D9488',
    bg: '#CCFBF1',
    subcategories: [
      { id: 'sub_i1', name: 'Modular Kitchen & Wardrobe Design', desc: 'Custom plywood cabinets, soft-close fittings', defaultNotes: 'L-shape modular kitchen remodel.' },
      { id: 'sub_i2', name: 'False Ceiling & Ambient Lighting', desc: 'Gypsum designer ceiling with cove lights', defaultNotes: 'Living room gypsum false ceiling.' }
    ]
  },
  {
    id: 'cat_structural',
    title: 'Structural Analysis',
    shortTitle: 'Structure Audit',
    subtitle: 'Safety & Strength Inspection',
    icon: ShieldCheck,
    color: '#16A34A',
    bg: '#DCFCE7',
    subcategories: [
      { id: 'sub_st1', name: 'Load Bearing Capacity Audit', desc: 'Structural stability report for extra floors', defaultNotes: 'Audit foundation before adding 1st floor.' },
      { id: 'sub_st2', name: 'Non-Destructive Rebound Hammer Test', desc: 'Concrete compressive strength measurement', defaultNotes: 'Test pillar strength after 10 years.' }
    ]
  },
  {
    id: 'cat_estimation',
    title: 'Cost Estimation & BOQ',
    shortTitle: 'Cost BOQ',
    subtitle: 'Detailed & Accurate Estimation',
    icon: Calculator,
    color: '#4F46E5',
    bg: '#EEF2FF',
    subcategories: [
      { id: 'sub_boq1', name: 'Itemized Bill of Quantities (BOQ)', desc: 'Cement, steel, sand & labor breakdown', defaultNotes: 'Full material requirement estimate.' },
      { id: 'sub_boq2', name: 'Contractor Cost Audit', desc: 'Verification of contractor bills and measurements', defaultNotes: 'Cross check contractor bill.' }
    ]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Active Category clicked from Home page
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  // Selected subcategories (array of subcategory objects)
  const [selectedSubcategories, setSelectedSubcategories] = useState([
    CATEGORIES[0].subcategories[0],
    CATEGORIES[0].subcategories[1]
  ]);

  // Current Subform Index (which sub-service is being configured right now: 0 to N-1)
  const [currentSubformIdx, setCurrentSubformIdx] = useState(0);

  // Patch work details and photos for each subcategory (keyed by subcategory id)
  const [patchDataBySubId, setPatchDataBySubId] = useState({
    sub_c1: {
      notes: 'Plaster flaking and hairline settlement crack along the main living room beam.',
      photos: ['/images/patch_damage.svg']
    },
    sub_c2: {
      notes: 'Cracks widening near window frame, approx 6x4 ft area.',
      photos: ['/images/patch_damage.svg']
    }
  });

  // Scheduling: Date & Time
  const [selectedDate, setSelectedDate] = useState(16); // Apr 2025
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM - 12:30 PM');
  const [customTimeNote, setCustomTimeNote] = useState('Morning preferred before lunch');

  // Payment
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  // When user clicks a Category on Home Page -> Open Subcategory page
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Pre-select first subcategory as default
    setSelectedSubcategories([category.subcategories[0]]);
    // Ensure default patch data exists
    setPatchDataBySubId(prev => ({
      ...prev,
      [category.subcategories[0].id]: {
        notes: category.subcategories[0].defaultNotes,
        photos: ['/images/patch_damage.svg']
      }
    }));
    setCurrentScreen('subcategory_selection');
  };

  // Toggle subcategory checkbox
  const toggleSubcategoryCheck = (sub) => {
    setSelectedSubcategories(prev => {
      const exists = prev.some(item => item.id === sub.id);
      let updated;
      if (exists) {
        if (prev.length === 1) return prev; // keep at least 1
        updated = prev.filter(item => item.id !== sub.id);
      } else {
        updated = [...prev, sub];
      }

      // Initialize patch data if not present
      if (!patchDataBySubId[sub.id]) {
        setPatchDataBySubId(p => ({
          ...p,
          [sub.id]: {
            notes: sub.defaultNotes,
            photos: ['/images/patch_damage.svg']
          }
        }));
      }
      return updated;
    });
  };

  // Start filling subforms one by one
  const handleStartSubforms = () => {
    if (selectedSubcategories.length === 0) {
      alert('Please select at least one sub-service!');
      return;
    }
    setCurrentSubformIdx(0);
    setCurrentScreen('subservice_patch_form');
  };

  // Move to next sub-service or to Date & Time screen
  const handleNextSubservice = () => {
    if (currentSubformIdx < selectedSubcategories.length - 1) {
      setCurrentSubformIdx(currentSubformIdx + 1);
    } else {
      // All subservices configured! Proceed to Date & Time
      setCurrentScreen('schedule_date_time');
    }
  };

  // Go back one sub-service
  const handlePrevSubservice = () => {
    if (currentSubformIdx > 0) {
      setCurrentSubformIdx(currentSubformIdx - 1);
    } else {
      setCurrentScreen('subcategory_selection');
    }
  };

  // Active subcategory in wizard
  const currentSubObj = selectedSubcategories[currentSubformIdx] || selectedSubcategories[0];
  const currentPatchData = patchDataBySubId[currentSubObj?.id] || {
    notes: currentSubObj?.defaultNotes || 'Patch repair required.',
    photos: ['/images/patch_damage.svg']
  };

  // Handle local image file upload for current subservice
  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file && currentSubObj) {
      const url = URL.createObjectURL(file);
      setPatchDataBySubId(prev => ({
        ...prev,
        [currentSubObj.id]: {
          ...prev[currentSubObj.id],
          photos: [...(prev[currentSubObj.id]?.photos || []), url]
        }
      }));
    }
  };

  // Sync bottom navigation tabs
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'services') setCurrentScreen('home');
    if (tab === 'bookings') setCurrentScreen('my_bookings');
    if (tab === 'projects') setCurrentScreen('projects');
    if (tab === 'profile') setCurrentScreen('profile');
  };

  const showBottomNav = ['home', 'my_bookings', 'projects', 'profile'].includes(currentScreen);

  return (
    <div className="simulator-container">
      {/* Top Demo Toolbar to jump to any screen */}
      <div className="top-showcase-bar">
        <div className="showcase-header">
          <div className="brand-label">
            <span className="gold-text">HP</span> HINDUSTAN PROJECTS <span style={{ opacity: 0.6, fontSize: '11px', fontWeight: '400' }}>(Dynamic Estimation Flow)</span>
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
            { id: 'home', label: '1. Home (Categories)' },
            { id: 'subcategory_selection', label: '2. Subcategories' },
            { id: 'subservice_patch_form', label: '3. Patch Details & Photos' },
            { id: 'schedule_date_time', label: '4. Date & Time' },
            { id: 'estimation_review', label: '5. Work Quotation' },
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
                if (['home', 'my_bookings', 'projects', 'profile'].includes(s.id)) {
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

          {/* ================= 1. HOME SCREEN: SHOWS CATEGORIES ================= */}
          {currentScreen === 'home' && (
            <div className="fade-in-slide">
              {/* Location Bar */}
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

              {/* Brand Header */}
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
                <div style={{ position: 'relative', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                  <img 
                    src="/images/hero_villa.jpg" 
                    alt="Luxury Home"
                    onError={(e) => { e.target.src = '/images/construction_site.svg'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.65) 60%, transparent 100%)', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'Outfit', lineHeight: '1.3', maxWidth: '190px' }}>
                      Build Better With Expert Services
                    </h2>
                    <button 
                      onClick={() => handleCategoryClick(CATEGORIES[0])}
                      style={{ marginTop: '10px', background: '#F59E0B', color: '#071930', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Book an Appointment →
                    </button>
                  </div>
                </div>
              </div>

              {/* CATEGORIES SECTION (ICON ON TOP, TEXT BELOW INSTEAD OF FULL) */}
              <div style={{ padding: '0 16px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit' }}>
                  Categories
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                  {CATEGORIES.length} Services
                </span>
              </div>

              {/* 4-Column Category Grid: Icon with text below */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px 8px',
                padding: '0 16px 22px 16px'
              }}>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '7px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'transform 0.15s ease'
                    }}>
                      <cat.icon size={26} strokeWidth={2.2} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#0B2545',
                      lineHeight: '1.25',
                      textAlign: 'center',
                      maxWidth: '75px'
                    }}>
                      {cat.shortTitle || cat.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Featured Project Showcase Card */}
              <div style={{ padding: '0 16px 20px 16px' }}>
                <div 
                  onClick={() => setCurrentScreen('projects')}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>Explore Recent Projects</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Verified civil & architectural work</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. SUBCATEGORY PAGE (USER SELECTS CHECKBOXES & CLICKS NEXT) ================= */}
          {currentScreen === 'subcategory_selection' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('home')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">{activeCategory.title}</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Category Header */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: activeCategory.bg, padding: '14px', borderRadius: '16px', marginBottom: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fff', color: activeCategory.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <activeCategory.icon size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0B2545' }}>{activeCategory.title}</h2>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{activeCategory.subtitle}</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545', marginBottom: '6px' }}>
                  Select Sub-Services (Checkboxes):
                </div>
                <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '14px' }}>
                  Check all the services you need. For each checked service, a sub-form will open next to upload patch photos.
                </p>

                {/* Subcategory Checkbox List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {activeCategory.subcategories.map((sub) => {
                    const isChecked = selectedSubcategories.some(item => item.id === sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubcategoryCheck(sub)}
                        style={{
                          background: isChecked ? '#EFF6FF' : '#fff',
                          border: `1.5px solid ${isChecked ? '#1D4ED8' : '#E2E8F0'}`,
                          borderRadius: '14px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Interactive Checkbox */}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '5px',
                          border: `2px solid ${isChecked ? '#1D4ED8' : '#CBD5E1'}`,
                          background: isChecked ? '#1D4ED8' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isChecked && <Check size={14} color="#fff" />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{sub.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{sub.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* NEXT BUTTON */}
                <button 
                  className="btn-hp-primary"
                  onClick={handleStartSubforms}
                  disabled={selectedSubcategories.length === 0}
                  style={{ opacity: selectedSubcategories.length === 0 ? 0.6 : 1 }}
                >
                  Next ({selectedSubcategories.length} {selectedSubcategories.length === 1 ? 'Service' : 'Services'} Selected) →
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. SUB-FORM FOR EACH SUB-SERVICE INDIVIDUALLY (PATCH WORK & IMAGES) ================= */}
          {currentScreen === 'subservice_patch_form' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={handlePrevSubservice}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">
                  Sub-Service {currentSubformIdx + 1} of {selectedSubcategories.length}
                </div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Wizard Progress Indicator */}
                <div className="wizard-progress-bar">
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0B2545' }}>
                    SERVICE {currentSubformIdx + 1} OF {selectedSubcategories.length}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedSubcategories.map((_, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          width: idx === currentSubformIdx ? '20px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: idx <= currentSubformIdx ? '#0B2545' : '#CBD5E1',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Sub-Service Title Badge */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '14px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {activeCategory.title}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0B2545', marginTop: '2px' }}>
                    {currentSubObj.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    {currentSubObj.desc}
                  </div>
                </div>

                {/* 1. UPLOAD IMAGES FOR THIS SUB-SERVICE */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginBottom: '4px' }}>
                    1. Upload Images of Patch Work Area:
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    Upload clear photos of this specific damaged spot or crack.
                  </div>

                  {/* Photo Upload Zone */}
                  <label style={{ display: 'block', border: '2px dashed #93C5FD', background: '#EFF6FF', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadPhoto}
                      style={{ display: 'none' }} 
                    />
                    <UploadCloud size={24} color="#1D4ED8" style={{ margin: '0 auto 4px auto' }} />
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1D4ED8' }}>
                      Tap to Take Photo or Upload Image
                    </div>
                  </label>

                  {/* Uploaded Photos Preview for this specific subservice */}
                  {currentPatchData.photos && currentPatchData.photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                      {currentPatchData.photos.map((pUrl, pIdx) => (
                        <div key={pIdx} style={{ position: 'relative', height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                          <img src={pUrl} alt="Patch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            onClick={() => {
                              const remaining = currentPatchData.photos.filter((_, i) => i !== pIdx);
                              setPatchDataBySubId(prev => ({
                                ...prev,
                                [currentSubObj.id]: { ...currentPatchData, photos: remaining }
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

                {/* 2. ENTER DETAILS OF THIS SUB-SERVICE */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginBottom: '4px' }}>
                    2. Patch Work Detail / Measurements:
                  </div>
                  <textarea
                    rows={3}
                    value={currentPatchData.notes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPatchDataBySubId(prev => ({
                        ...prev,
                        [currentSubObj.id]: { ...currentPatchData, notes: val }
                      }));
                    }}
                    placeholder="Enter details like dimensions (e.g. 10x12 ft), depth of crack, wall location..."
                    style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                {/* Navigation Buttons: Previous / Next */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentSubformIdx > 0 && (
                    <button 
                      className="btn-hp-secondary"
                      style={{ flex: 1 }}
                      onClick={handlePrevSubservice}
                    >
                      ← Previous
                    </button>
                  )}
                  <button 
                    className="btn-hp-primary"
                    style={{ flex: 2 }}
                    onClick={handleNextSubservice}
                  >
                    {currentSubformIdx < selectedSubcategories.length - 1 
                      ? `Next: ${selectedSubcategories[currentSubformIdx + 1]?.name} →`
                      : 'Next: Select Date & Time →'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. DATE & TIME SELECTION SCREEN ================= */}
          {currentScreen === 'schedule_date_time' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('subservice_patch_form')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Select Date & Time</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                {/* Summary of configured sub-services */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>
                    CONFIGURED SUB-SERVICES ({selectedSubcategories.length}):
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545', marginTop: '2px' }}>
                    {selectedSubcategories.map(s => s.name).join(' • ')}
                  </div>
                </div>

                {/* 1. SELECT DATE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>1. Select Date</span>
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

                {/* 2. SELECT TIME */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545', marginBottom: '6px' }}>
                    2. Select Time Window:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {[
                      '09:00 AM - 11:00 AM',
                      '11:30 AM - 01:30 PM',
                      '02:30 PM - 04:30 PM',
                      '05:00 PM - 07:00 PM'
                    ].map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${selectedTimeSlot === slot ? '#0B2545' : '#E2E8F0'}`,
                          background: selectedTimeSlot === slot ? '#0B2545' : '#fff',
                          color: selectedTimeSlot === slot ? '#fff' : '#0F172A',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Custom time note (optional):
                  </label>
                  <input
                    type="text"
                    value={customTimeNote}
                    onChange={(e) => setCustomTimeNote(e.target.value)}
                    placeholder="e.g. Please call before arriving"
                    style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px 12px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <button 
                  className="btn-hp-primary"
                  onClick={() => setCurrentScreen('estimation_review')}
                >
                  Send for Quotation & Estimation (₹0 Upfront)
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. ESTIMATION / QUOTATION REVIEW (USER APPROVES THEN WE START WORKING) ================= */}
          {currentScreen === 'estimation_review' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('schedule_date_time')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Work Quotation</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B2545' }}>
                      Quotation #EST-2025-8942
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Scheduled Date: <strong>{selectedDate} Apr 2025</strong> ({selectedTimeSlot})
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#047857', padding: '4px 8px', borderRadius: '6px' }}>
                    QUOTATION READY
                  </span>
                </div>

                {/* Sub-services breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {selectedSubcategories.map((sub, idx) => {
                    const cost = 4200 + idx * 1800;
                    const patch = patchDataBySubId[sub.id] || {};
                    return (
                      <div key={sub.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '800', fontSize: '12px', color: '#0B2545' }}>{sub.name}</span>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#1D4ED8' }}>₹{cost.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                          "{patch.notes || 'Patch repair specified.'}"
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Summary */}
                <div style={{ background: '#0B2545', color: '#fff', borderRadius: '16px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Services Included</span>
                    <span style={{ fontWeight: '700' }}>{selectedSubcategories.length} Sub-Services</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL QUOTATION</div>
                      <div style={{ fontSize: '10px', color: '#F59E0B' }}>Includes all materials, labor & GST</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Outfit', color: '#F59E0B' }}>
                      ₹{(selectedSubcategories.length * 4200 + 1800).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action: Approve Quotation then we start working */}
                <button 
                  className="btn-hp-primary"
                  onClick={() => setCurrentScreen('payment')}
                >
                  Approve Quotation & Proceed to Payment
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
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Approved Quotation Amount</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit' }}>
                    ₹{(selectedSubcategories.length * 4200 + 1800).toLocaleString()}
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
                Quotation Approved & Work Started!
              </h1>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '20px' }}>
                Scheduled for <strong>{selectedDate} Apr 2025</strong> ({selectedTimeSlot}). Our team has started working!
              </p>

              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>SCHEDULED DATE & TIME</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>{selectedDate} Apr 2025 • {selectedTimeSlot}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>SERVICES APPROVED ({selectedSubcategories.length})</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B2545' }}>
                    {selectedSubcategories.map(s => s.name).join(', ')}
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
                        {activeCategory.title} ({selectedSubcategories.length} Sub-Services)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {selectedDate} Apr 2025 • {selectedTimeSlot}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                      Work Active
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#334155', background: '#F8FAFC', padding: '8px', borderRadius: '8px', marginBottom: '10px' }}>
                    {selectedSubcategories.map(s => s.name).join(' • ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '11px', fontWeight: '600', color: '#0B2545' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => setCurrentScreen('estimation_review')}>View Quotation</span>
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
