import React, { useState, useEffect } from 'react';
import {
  Home, Grid, Calendar, Briefcase, User, MapPin, Bell, ChevronRight,
  ArrowLeft, Star, Clock, ShieldCheck, Users, CheckCircle2,
  Lock, CreditCard, ChevronDown, Check, Building, Wrench, Compass,
  Layers, Hammer, Droplets, HardHat, FileText, Calculator, PhoneCall,
  X, AlertCircle, LogOut, Info, Settings, Bookmark, Search, Maximize2,
  UploadCloud, Sparkles, ArrowRight
} from 'lucide-react';
import AdminApp from './admin/AdminApp.jsx';

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
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#client') return 'client';
      if (hash === '#admin' || path.includes('/admin')) return 'admin';
    }
    return 'admin'; // Defaults to Admin Panel as requested
  });

  const [currentScreen, setCurrentScreen] = useState('home');
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Dynamic Categories from Backend API
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

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

  // Fetch Services & SubServices dynamically from Backend API on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/services')
      .then(res => res.json())
      .then(data => {
        const backendServices = data.services || data.data || [];
        if (backendServices.length > 0) {
          const mapped = backendServices.map((bs, index) => {
            const defaultMatch = CATEGORIES.find(c =>
              c.id.toLowerCase().includes(bs.code.toLowerCase()) ||
              bs.code.toLowerCase().includes(c.id.toLowerCase()) ||
              c.title.toLowerCase().includes(bs.name.toLowerCase())
            ) || CATEGORIES[index % CATEGORIES.length];

            return {
              id: bs.code || bs.id,
              title: bs.name,
              shortTitle: bs.name.split(' ')[0] + (bs.name.split(' ')[1] ? ' ' + bs.name.split(' ')[1] : ''),
              subtitle: bs.description || defaultMatch.subtitle,
              icon: defaultMatch.icon,
              color: defaultMatch.color,
              bg: defaultMatch.bg,
              subcategories: (bs.subServices && bs.subServices.length > 0)
                ? bs.subServices.map((sub, i) => ({
                  id: sub.id || `${bs.code}_${i}`,
                  name: sub.titleEn || sub.name,
                  desc: sub.desc || sub.description || '',
                  defaultNotes: `Issue: ${sub.titleEn} (${sub.desc})`,
                  checklist: sub.checklist || []
                }))
                : defaultMatch.subcategories
            };
          });

          setCategoriesList(mapped);
          setActiveCategory(mapped[0]);
          if (mapped[0].subcategories && mapped[0].subcategories.length > 0) {
            setSelectedSubcategories([mapped[0].subcategories[0]]);
          }
        }
      })
      .catch(err => {
        console.log('Backend offline or loading defaults:', err);
      });

    // Auto-fetch existing requests from Neon backend
    loadAdminRequests();
  }, []);

  // Scheduling: Date & Time
  const [selectedDate, setSelectedDate] = useState(16); // Apr 2025
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM - 12:30 PM');
  const [customTimeNote, setCustomTimeNote] = useState('Morning preferred before lunch');

  // Dynamic Live Quotation & Submitted Request State
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [liveQuotation, setLiveQuotation] = useState(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [showAdminDesk, setShowAdminDesk] = useState(false);
  const [allBackendRequests, setAllBackendRequests] = useState([]);

  // Admin Custom Quote Form State
  const [adminQuoteForm, setAdminQuoteForm] = useState({
    requestId: '',
    items: [
      { item: 'Polymer-modified waterproof coating / bonding agent', qty: 2, unit: 'Bucket (20kg)', rate: 1850, amount: 3700 },
      { item: 'Fiberglass mesh reinforcement for corner joints & cracks', qty: 25, unit: 'R.Ft', rate: 35, amount: 875 },
      { item: 'Skilled Mason & Waterproofing Specialist Labor', qty: 2, unit: 'Days', rate: 1200, amount: 2400 }
    ],
    materialCost: 4575,
    laborCost: 2400,
    subtotal: 6975,
    taxGST: 1255,
    grandtotal: 8230,
    estimatedTimeline: '1 - 2 Working Days',
    termsAndConditions: 'Includes 2 Years comprehensive anti-leakage warranty.'
  });

  // Fetch all requests for Admin Desk
  const loadAdminRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/requests');
      const data = await res.json();
      if (data && data.data && data.data.length > 0) {
        setAllBackendRequests(data.data);
        setAdminQuoteForm(prev => {
          const currentExists = data.data.some(r => r.id === prev.requestId);
          return {
            ...prev,
            requestId: currentExists ? prev.requestId : data.data[0].id
          };
        });
      } else {
        setAllBackendRequests([]);
      }
    } catch (err) {
      console.log('Failed to fetch admin requests:', err);
    }
  };

  // Helper to create a quick demo request if none exist
  const handleCreateDemoRequest = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicecode: 'cat_waterproof',
          subServiceCode: 'Stop Roof & Terrace Water Leakage',
          issueDescription: 'Severe water seepage from terrace slab during monsoon rains. Area ~450 sq.ft.',
          propertyType: 'Residential Villa',
          propertySize: '1500 sq.ft',
          location: 'Bhilwara, Rajasthan',
          preferredDate: '16 Apr 2025',
          preferredTime: '10:30 AM - 12:30 PM',
          addressline: 'B-42, Shastri Nagar, Bhilwara'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSubmittedRequest(data.data);
        await loadAdminRequests();
        setAdminQuoteForm(prev => ({ ...prev, requestId: data.data.id }));
      }
    } catch (e) {
      console.log('Demo request error:', e);
    }
  };

  // 1. User Submits Request for Free Inspection (Saved in Neon DB as SUBMITTED / ESTIMATING)
  const handleSendForQuotation = async () => {
    setIsSubmittingRequest(true);
    try {
      const formData = new FormData();
      formData.append('servicecode', activeCategory.id);
      formData.append('subServiceCode', selectedSubcategories.map(s => s.name).join(', '));
      formData.append('issueDescription', Object.values(patchDataBySubId).map(p => p.notes).filter(Boolean).join(' | ') || 'Repair inspection request');
      formData.append('propertyType', 'house');
      formData.append('propertySize', '1200 sq.ft');
      formData.append('location', 'Bhilwara');
      formData.append('preferredDate', `${selectedDate} Apr 2025`);
      formData.append('preferredTime', selectedTimeSlot);
      formData.append('addressline', 'B-42, Shastri Nagar, Bhilwara');

      const res = await fetch('http://localhost:5000/api/v1/requests', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSubmittedRequest(data.data);
        setAdminQuoteForm(prev => ({ ...prev, requestId: data.data.id }));
        loadAdminRequests();
      }
    } catch (error) {
      console.log('Request submission error:', error);
    } finally {
      setIsSubmittingRequest(false);
      setCurrentScreen('request_submitted');
    }
  };

  // 2. Admin Sends Custom Quotation to User (POST /api/v1/quotations)
  const handleAdminSendQuotation = async (e) => {
    e.preventDefault();
    if (!adminQuoteForm.requestId) {
      alert('Please select a request to quote for');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/v1/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: adminQuoteForm.requestId,
          lineItem: adminQuoteForm.items,
          materialCost: adminQuoteForm.materialCost,
          laborCost: adminQuoteForm.laborCost,
          subtotal: adminQuoteForm.subtotal,
          taxGST: adminQuoteForm.taxGST,
          grandtotal: adminQuoteForm.grandtotal,
          estimatedTimeline: adminQuoteForm.estimatedTimeline,
          termsAndConditions: adminQuoteForm.termsAndConditions,
          created_by: 'Hipro Technical Estimator Desk'
        })
      });
      const data = await res.json();

      if (data.success && data.data) {
        setLiveQuotation(data.data);
        setShowAdminDesk(false);
        loadAdminRequests();
        alert('✅ Quotation sent to customer successfully!');
        setCurrentScreen('estimation_review');
      } else {
        alert('Failed: ' + (data.message || 'Error'));
      }
    } catch (err) {
      alert('Error sending quote: ' + err.message);
    }
  };

  // 3. User Approves Quotation in Neon DB
  const handleApproveQuotation = async () => {
    if (liveQuotation?.id) {
      try {
        await fetch(`http://localhost:5000/api/v1/quotations/${liveQuotation.id}/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'ACCEPTED' })
        });
      } catch (err) {
        console.log('Quote approval sync error:', err);
      }
    }
    setCurrentScreen('payment');
  };

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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => {
                loadAdminRequests();
                setShowAdminDesk(true);
              }}
              style={{ background: '#F59E0B', color: '#071930', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}
            >
              <FileText size={12} /> 👨‍💼 Admin / Estimator Desk
            </button>
            <button
              onClick={() => setFullscreenMode(!fullscreenMode)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Maximize2 size={12} /> {fullscreenMode ? 'Bezel' : 'Full'}
            </button>
          </div>
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
                      onClick={() => handleCategoryClick(categoriesList[0])}
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
                  {categoriesList.length} Services
                </span>
              </div>

              {/* 4-Column Category Grid: Icon with text below */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px 8px',
                padding: '0 16px 22px 16px'
              }}>
                {categoriesList.map((cat) => (
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
                  disabled={isSubmittingRequest}
                  onClick={handleSendForQuotation}
                >
                  {isSubmittingRequest ? 'Submitting to Engineering Team...' : 'Send for Inspection & Quotation (₹0 Upfront)'}
                </button>
              </div>
            </div>
          )}

          {/* ================= 4.5. REQUEST SUBMITTED — UNDER REVIEW BY ESTIMATOR ================= */}
          {currentScreen === 'request_submitted' && (
            <div className="fade-in-slide" style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Clock size={36} />
              </div>

              <span style={{ fontSize: '11px', fontWeight: '800', background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                🟡 UNDER ESTIMATOR REVIEW (₹0 UPFRONT)
              </span>

              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0B2545', fontFamily: 'Outfit', marginTop: '12px', marginBottom: '6px' }}>
                Request #{submittedRequest?.requestNumber || 'REQ-2026-0841'} Submitted!
              </h2>

              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto 20px auto' }}>
                Our civil engineering team in Bhilwara is reviewing your uploaded damage photos & patch work notes.
              </p>

              {/* Request Details Card */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Category:</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>{activeCategory.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Sub-Services:</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>{selectedSubcategories.length} Selected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Preferred Slot:</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>{selectedDate} Apr 2025 ({selectedTimeSlot})</span>
                </div>
              </div>

              {/* Simulate Admin Sending Quote Action */}
              <div style={{ background: '#EFF6FF', border: '1.5px dashed #93C5FD', borderRadius: '16px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#1D4ED8', marginBottom: '4px' }}>
                  👨‍💼 Admin / Estimator Simulation:
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px' }}>
                  As Admin, open the Estimator Desk to prepare custom material & labor pricing for this request.
                </div>
                <button
                  onClick={() => {
                    loadAdminRequests();
                    setShowAdminDesk(true);
                  }}
                  style={{ width: '100%', background: '#1D4ED8', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FileText size={14} /> Open Estimator Desk & Send Quote →
                </button>
              </div>

              <button
                className="btn-hp-secondary"
                onClick={() => setCurrentScreen('my_bookings')}
              >
                Track in My Bookings
              </button>
            </div>
          )}

          {/* ================= 5. ESTIMATION / QUOTATION REVIEW (USER APPROVES THEN WE START WORKING) ================= */}
          {currentScreen === 'estimation_review' && (
            <div className="fade-in-slide">
              <div className="subscreen-top-header">
                <button className="back-btn" onClick={() => setCurrentScreen('request_submitted')}>
                  <ArrowLeft size={18} />
                </button>
                <div className="subscreen-title">Work Quotation</div>
                <div style={{ width: '24px' }} />
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B2545' }}>
                      Quotation #{liveQuotation?.quoteNumber || 'EST-2026-8942'}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Scheduled Date: <strong>{selectedDate} Apr 2025</strong> ({selectedTimeSlot})
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#047857', padding: '4px 8px', borderRadius: '6px' }}>
                    {liveQuotation?.status === 'ACCEPTED' ? 'APPROVED' : 'QUOTATION READY'}
                  </span>
                </div>

                {/* Dynamic Itemized Line Items from Neon DB */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {liveQuotation?.lineItem && Array.isArray(liveQuotation.lineItem) && liveQuotation.lineItem.length > 0 ? (
                    liveQuotation.lineItem.map((item, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '800', fontSize: '12px', color: '#0B2545' }}>{item.item}</span>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#1D4ED8' }}>₹{Number(item.amount).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                          Qty: {item.qty} {item.unit} @ ₹{item.rate}/{item.unit}
                        </div>
                      </div>
                    ))
                  ) : (
                    selectedSubcategories.map((sub, idx) => {
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
                    })
                  )}
                </div>

                {/* Total Summary (Calculated from Backend Quotation) */}
                <div style={{ background: '#0B2545', color: '#fff', borderRadius: '16px', padding: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12px', opacity: 0.8 }}>
                    <span>Material Cost</span>
                    <span>₹{Number(liveQuotation?.materialCost || (selectedSubcategories.length * 2400)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12px', opacity: 0.8 }}>
                    <span>Labor & Specialist Wages</span>
                    <span>₹{Number(liveQuotation?.laborCost || (selectedSubcategories.length * 1800)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', opacity: 0.8 }}>
                    <span>GST (18%)</span>
                    <span>₹{Number(liveQuotation?.taxGST || 585).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL PAYABLE</div>
                      <div style={{ fontSize: '10px', color: '#F59E0B' }}>Includes all materials, labor & GST</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Outfit', color: '#F59E0B' }}>
                      ₹{Number(liveQuotation?.grandtotal || liveQuotation?.totalCost || (selectedSubcategories.length * 4200 + 1800)).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action: Approve Quotation then we start working */}
                <button
                  className="btn-hp-primary"
                  onClick={handleApproveQuotation}
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
                    ₹{Number(liveQuotation?.grandtotal || liveQuotation?.totalCost || (selectedSubcategories.length * 4200 + 1800)).toLocaleString()}
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

      {/* ================= 👨‍💼 ADMIN / ESTIMATOR DESK MODAL ================= */}
      {showAdminDesk && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(7, 25, 48, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', background: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '6px' }}>
                  ADMIN PORTAL
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B2545', marginTop: '4px' }}>
                  Technical Estimator Desk
                </h3>
              </div>
              <button
                onClick={() => setShowAdminDesk(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminSendQuotation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Select Customer Request */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>
                    Select Customer Request to Quote:
                  </label>
                  <button
                    type="button"
                    onClick={loadAdminRequests}
                    style={{ fontSize: '10px', color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {allBackendRequests.length === 0 ? (
                  <div style={{ background: '#FFFBEB', border: '1px dashed #F59E0B', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#B45309' }}>
                      No active requests found in database. Submit one from the app or generate a sample request:
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateDemoRequest}
                      style={{ background: '#F59E0B', color: '#071930', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', width: 'fit-content' }}
                    >
                      + Create Sample Customer Request
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={adminQuoteForm.requestId}
                      onChange={(e) => setAdminQuoteForm(prev => ({ ...prev, requestId: e.target.value }))}
                      style={{ width: '100%', borderRadius: '10px', border: '1.5px solid #CBD5E1', padding: '9px 12px', fontSize: '12px', color: '#0F172A', outline: 'none', fontWeight: '600' }}
                    >
                      {allBackendRequests.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.requestNumber} — {r.subServiceCode || r.servicecode} [{r.status}]
                        </option>
                      ))}
                    </select>

                    {/* Selected Request Detail Badge */}
                    {(() => {
                      const sel = allBackendRequests.find(r => r.id === adminQuoteForm.requestId);
                      if (!sel) return null;
                      return (
                        <div style={{ marginTop: '8px', background: '#F1F5F9', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px', borderLeft: '3px solid #1D4ED8' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '700', color: '#0F172A' }}>Service: {sel.subServiceCode || sel.servicecode}</span>
                            <span style={{ fontSize: '10px', background: '#E2E8F0', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>{sel.status}</span>
                          </div>
                          <div><strong>Location & Slot:</strong> {sel.location} • {sel.preferredDate} ({sel.preferredTime})</div>
                          <div><strong>Issue Notes:</strong> {sel.issueDescription}</div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Itemized Materials & Labor Line Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B2545' }}>
                    Itemized Cost Breakdown (Line Items):
                  </label>
                  <button
                    type="button"
                    onClick={() => setAdminQuoteForm(prev => ({
                      ...prev,
                      items: [...prev.items, { item: 'New Material / Labor Scope', qty: 1, unit: 'Unit', rate: 1000, amount: 1000 }]
                    }))}
                    style={{ fontSize: '11px', fontWeight: '700', color: '#1D4ED8', background: '#EFF6FF', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {adminQuoteForm.items.map((item, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => {
                            const newItems = [...adminQuoteForm.items];
                            newItems[idx].item = e.target.value;
                            setAdminQuoteForm(prev => ({ ...prev, items: newItems }));
                          }}
                          placeholder="Item Description"
                          style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = adminQuoteForm.items.filter((_, i) => i !== idx);
                            setAdminQuoteForm(prev => ({ ...prev, items: newItems }));
                          }}
                          style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newItems = [...adminQuoteForm.items];
                            newItems[idx].qty = val;
                            newItems[idx].amount = val * newItems[idx].rate;
                            const sub = newItems.reduce((acc, cur) => acc + cur.amount, 0);
                            const gst = Math.round(sub * 0.18);
                            setAdminQuoteForm(prev => ({ ...prev, items: newItems, subtotal: sub, taxGST: gst, grandtotal: sub + gst }));
                          }}
                          placeholder="Qty"
                          style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 6px', fontSize: '11px' }}
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => {
                            const newItems = [...adminQuoteForm.items];
                            newItems[idx].unit = e.target.value;
                            setAdminQuoteForm(prev => ({ ...prev, items: newItems }));
                          }}
                          placeholder="Unit"
                          style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 6px', fontSize: '11px' }}
                        />
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newItems = [...adminQuoteForm.items];
                            newItems[idx].rate = val;
                            newItems[idx].amount = newItems[idx].qty * val;
                            const sub = newItems.reduce((acc, cur) => acc + cur.amount, 0);
                            const gst = Math.round(sub * 0.18);
                            setAdminQuoteForm(prev => ({ ...prev, items: newItems, subtotal: sub, taxGST: gst, grandtotal: sub + gst }));
                          }}
                          placeholder="Rate"
                          style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 6px', fontSize: '11px' }}
                        />
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ₹{item.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div style={{ background: '#0B2545', color: '#fff', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                  <span>Subtotal Cost:</span>
                  <span>₹{adminQuoteForm.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                  <span>GST (18%):</span>
                  <span>₹{adminQuoteForm.taxGST}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px', fontSize: '14px', fontWeight: '800', color: '#F59E0B' }}>
                  <span>Final Quotation to User:</span>
                  <span>₹{adminQuoteForm.grandtotal}</span>
                </div>
              </div>

              {/* Submit Quote Button */}
              <button
                type="submit"
                className="btn-hp-primary"
                style={{ background: '#10B981', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}
              >
                🚀 Send Quotation to Customer (POST /api/v1/quotations)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
