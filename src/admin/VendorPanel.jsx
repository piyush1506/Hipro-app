import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ClipboardList, Receipt, Calculator,
  Wrench, Users, Activity, ShieldCheck, Plus, RefreshCw,
  PlusCircle, Search, Menu, X, Camera, Printer, Trash2,
  Check, PhoneCall, Sparkles, Inbox, Clock, FileCheck2,
  CheckCircle2, GitPullRequest, Zap, ArrowRight, ArrowLeft, MapPin,
  Calendar, Home, User, Phone, Info, Send, RotateCcw,
  Server, Database, AlertCircle, Droplets, Image, Layers,
  ExternalLink, Link2, Eye, EyeOff, Upload, Tag, Percent, Ticket,
  MessageCircle, CheckCheck, TrendingUp, HardHat, CheckCircle, ChevronDown,
  Filter, UserCheck, AlertTriangle, ArrowUpRight, Award, Shield, UserPlus, ShoppingCart, Compass,
  Edit, Edit2, Edit3, LogOut, CreditCard, Banknote, Briefcase
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://app.hindustanprojects.in');

export default function VendorPanel({ onSwitchToSuperAdmin, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [vendorQuotes, setVendorQuotes] = useState([]);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotingRequestId, setQuotingRequestId] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteTimeline, setQuoteTimeline] = useState('1-2 Working Days');

  // Multi-vendor / Operator support (Service Providers + Adventure Operators)
  const DEMO_VENDORS = [
    {
      id: 'v_adv_01',
      name: 'Captain Arvind Negi',
      businessName: 'Himalayan Sky Gliders & Air Safari',
      phone: '+91 98290 88801',
      email: 'arvind.gliders@gmail.com',
      city: 'Dehradun',
      category: 'Adventure',
      specialization: 'Paragliding & Microlight Flights',
      experience: '12 Years',
      status: 'active',
      rating: 4.9,
      minCharge: '2500',
    },
    {
      id: 'v_adv_02',
      name: 'Fateh Singh Bhati',
      businessName: 'Thar Royal Desert Safari & Camps',
      phone: '+91 94141 77702',
      email: 'thar.safari@gmail.com',
      city: 'Jaisalmer',
      category: 'Adventure',
      specialization: 'Desert Safari & Dune Bashing',
      experience: '10 Years',
      status: 'active',
      rating: 4.9,
      minCharge: '1800',
    },
    {
      id: 'v_adv_03',
      name: 'Rakesh Rawat',
      businessName: 'Ganga White Water Adventure Club',
      phone: '+91 98370 66603',
      email: 'ganga.rafting@gmail.com',
      city: 'Rishikesh',
      category: 'Adventure',
      specialization: 'River Rafting & Kayaking',
      experience: '14 Years',
      status: 'active',
      rating: 5.0,
      minCharge: '1200',
    },
    {
      id: 'v_1',
      name: 'Rajesh Kumar',
      businessName: 'Rajesh Construction & Repairs',
      phone: '+91 98765 43210',
      email: 'rajesh@example.com',
      city: 'Bhilwara',
      category: 'Services',
      specialization: 'Waterproofing & Leakage',
      experience: '8 Years',
      status: 'active',
      rating: 4.8,
      minCharge: '1000',
    },
  ];

  const [selectedVendorId, setSelectedVendorId] = useState(() => {
    try {
      const saved = localStorage.getItem('hipro_vendor');
      if (saved) {
        const v = JSON.parse(saved);
        const match = DEMO_VENDORS.find(
          item => item.id === v.id ||
                  (v.phone && item.phone && item.phone.replace(/\D/g, '').includes(v.phone.replace(/\D/g, ''))) ||
                  (v.email && item.email && item.email.toLowerCase() === v.email.toLowerCase())
        );
        if (match) return match.id;
      }
    } catch (e) {}
    return 'v_adv_01';
  });

  const vendorProfile = DEMO_VENDORS.find(v => v.id === selectedVendorId) || DEMO_VENDORS[0];
  const isAdventure = (vendorProfile.category || '').toLowerCase().includes('adventure');

  // Fallback demo adventure bookings when backend is offline
  const DEFAULT_ADVENTURE_BOOKINGS = [
    {
      id: 'ent_bk_101',
      bookingCode: 'ENT-SKY-821',
      experienceTitle: 'Tandem Paragliding High Flight',
      category: 'Air Sports',
      city: 'Dehradun',
      vendorId: 'v_adv_01',
      vendorName: 'Captain Arvind Negi',
      vendorBusiness: 'Himalayan Sky Gliders & Air Safari',
      vendorPhone: '+91 98290 88801',
      travelerName: 'Amit Sharma',
      travelerPhone: '+91 94628 77757',
      travelDate: '16 Nov 2026',
      timeSlot: '09:00 AM (Morning Breeze)',
      guests: 2,
      price: 2700,
      totalAmount: 5400,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      reportingPoint: 'Maldevta Adventure Base Camp, Raipur Road, Dehradun',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ent_bk_102',
      bookingCode: 'ENT-SKY-822',
      experienceTitle: 'Motorized Paramotor Sunset Safari',
      category: 'Air Sports',
      city: 'Dehradun',
      vendorId: 'v_adv_01',
      vendorName: 'Captain Arvind Negi',
      vendorBusiness: 'Himalayan Sky Gliders & Air Safari',
      vendorPhone: '+91 98290 88801',
      travelerName: 'Rohit Gupta',
      travelerPhone: '+91 98290 11223',
      travelDate: '17 Nov 2026',
      timeSlot: '04:30 PM (Sunset Flight)',
      guests: 1,
      price: 3200,
      totalAmount: 3200,
      paymentStatus: 'PAID',
      status: 'CHECKED_IN',
      reportingPoint: 'Maldevta Adventure Base Camp, Raipur Road, Dehradun',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ent_bk_103',
      bookingCode: 'ENT-DES-419',
      experienceTitle: 'Sunset Camel Safari & Thar Dunes',
      category: 'Desert Safari',
      city: 'Jaisalmer',
      vendorId: 'v_adv_02',
      vendorName: 'Fateh Singh Bhati',
      vendorBusiness: 'Thar Royal Desert Safari & Camps',
      vendorPhone: '+91 94141 77702',
      travelerName: 'Pooja Rawat',
      travelerPhone: '+91 98290 33344',
      travelDate: '18 Nov 2026',
      timeSlot: '04:30 PM (Evening Combo)',
      guests: 3,
      price: 1600,
      totalAmount: 4800,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      reportingPoint: 'Hipro Desert Camp Milestone, Sam Sand Dunes Road, Jaisalmer',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ent_bk_104',
      bookingCode: 'ENT-RFT-305',
      experienceTitle: 'Marine Drive to Shivpuri River Rafting',
      category: 'Water Sports',
      city: 'Rishikesh',
      vendorId: 'v_adv_03',
      vendorName: 'Rakesh Rawat',
      vendorBusiness: 'Ganga White Water Adventure Club',
      vendorPhone: '+91 98370 66603',
      travelerName: 'Vikrant Mehta',
      travelerPhone: '+91 97110 55443',
      travelDate: '19 Nov 2026',
      timeSlot: '10:00 AM (Rapid Run)',
      guests: 4,
      price: 1200,
      totalAmount: 4800,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      reportingPoint: 'Shivpuri Adventure Beach, Badrinath Highway, Rishikesh',
      createdAt: new Date().toISOString()
    }
  ];

  const [adventureBookings, setAdventureBookings] = useState(() => {
    return DEFAULT_ADVENTURE_BOOKINGS.filter(b => b.vendorId === 'v_adv_01');
  });
  const [adventureSearch, setAdventureSearch] = useState('');
  const [adventureStatusFilter, setAdventureStatusFilter] = useState('ALL');

  const showToastMsg = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchVendorData();
    fetchAdventureBookings();
  }, [selectedVendorId]);

  useEffect(() => {
    if (isAdventure && (activeTab === 'requests' || activeTab === 'quotes' || activeTab === 'assigned')) {
      setActiveTab('adventure');
    } else if (!isAdventure && activeTab === 'adventure') {
      setActiveTab('requests');
    }
  }, [selectedVendorId, isAdventure]);

  const fetchAdventureBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/ent/vendor/bookings?vendorId=${selectedVendorId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
        setAdventureBookings(data.bookings);
        return;
      }
    } catch (e) {
      console.warn('API error, loading default bookings for operator:', e);
    }
    const filtered = DEFAULT_ADVENTURE_BOOKINGS.filter(b => b.vendorId === selectedVendorId || selectedVendorId === 'ALL');
    setAdventureBookings(filtered.length > 0 ? filtered : DEFAULT_ADVENTURE_BOOKINGS);
  };

  const handleUpdateAdventureStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/ent/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Booking marked as ${status}`, 'success');
        fetchAdventureBookings();
      } else {
        showToastMsg(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToastMsg('Error updating booking status', 'error');
    }
  };

  const openWhatsAppTraveler = (booking) => {
    const cleanPhone = (booking.travelerPhone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `👋 *Hello ${booking.travelerName}!* \n\n` +
      `This is *${vendorProfile.name}* from *${vendorProfile.businessName}*.\n` +
      `We have received your confirmed booking for:\n` +
      `🎯 *Activity:* ${booking.experienceTitle}\n` +
      `🎫 *Booking Pass:* ${booking.bookingCode || booking.id}\n` +
      `📅 *Date:* ${booking.travelDate}\n` +
      `⏰ *Scheduled Slot:* ${booking.timeSlot}\n` +
      `👥 *Travelers:* ${booking.guests || 1} Person(s)\n` +
      `📍 *Reporting Base Camp:* ${booking.reportingPoint || 'Base Camp Reception'}\n\n` +
      `Please arrive 15 minutes before your slot with a valid Govt ID. Contact us at ${vendorProfile.phone} if you need directions or assistance. We look forward to hosting your adventure!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const fetchVendorData = async () => {
    try {
      await Promise.all([
        fetchVendorRequests(),
        fetchVendorQuotes(),
        fetchAssignedJobs(),
        fetchAdventureBookings(),
      ]);
    } catch (e) {
      console.error('Failed to fetch vendor data:', e);
    }
  };

  const fetchVendorRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/vendor-requests`);
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setVendorRequests(data.requests);
      } else {
        // Demo data - customer requests shared with vendors
        setVendorRequests([
          {
            id: 'req_101',
            requestNumber: 'HIP-2026-0101',
            customerName: 'Amit Sharma',
            customerPhone: '+91 94628 77757',
            addressline: 'B-42, Shastri Nagar, Bhilwara, Rajasthan',
            location: 'Bhilwara',
            propertyType: 'Residential Villa',
            propertySize: '1500 sq.ft',
            servicecode: 'cat_waterproof',
            subServiceCode: 'Stop Roof & Terrace Water Leakage',
            issueDescription: 'Severe water seepage from terrace slab during monsoon rains. Area ~450 sq.ft. Damp patches visible on ceiling of top floor bedroom.',
            urgency: 'HIGH',
            preferredDate: '16 Nov 2026',
            preferredTime: '10:00 AM - 1:00 PM',
            mediaUrl: [
              'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1600607686527-6fb288596e9e?auto=format&fit=crop&w=600&q=80',
            ],
            status: 'QUOTE_REQUESTED',
            sharedWithVendors: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'req_102',
            requestNumber: 'HIP-2026-0102',
            customerName: 'Priya Verma',
            customerPhone: '+91 94628 77758',
            addressline: 'Plot 12, Civil Lines, Bhilwara, Rajasthan',
            location: 'Bhilwara',
            propertyType: 'Independent House',
            propertySize: '1200 sq.ft',
            servicecode: 'cat_civil',
            subServiceCode: 'Structural Crack & Beam Patch Work',
            issueDescription: 'Hairline settlement cracks along main beam in living room, approx 12x10 ft area. Plaster flaking near window frame.',
            urgency: 'NORMAL',
            preferredDate: '18 Nov 2026',
            preferredTime: '2:00 PM - 5:00 PM',
            mediaUrl: [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            ],
            status: 'QUOTE_REQUESTED',
            sharedWithVendors: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'req_103',
            requestNumber: 'HIP-2026-0103',
            customerName: 'Suresh Mehta',
            customerPhone: '+91 94628 77759',
            addressline: 'Flat 301, Royal Residency, Bhilwara, Rajasthan',
            location: 'Bhilwara',
            propertyType: 'Apartment',
            propertySize: '900 sq.ft',
            servicecode: 'cat_painting',
            subServiceCode: 'Interior Moisture-Resistant Emulsion',
            issueDescription: 'Interior hall repainting required with damp-proof primer. Moisture spots visible on east wall.',
            urgency: 'NORMAL',
            preferredDate: '20 Nov 2026',
            preferredTime: 'Flexible',
            mediaUrl: [],
            status: 'QUOTE_REQUESTED',
            sharedWithVendors: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error('fetchVendorRequests error:', e);
    }
  };

  const fetchVendorQuotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/vendor-quotes`);
      const data = await res.json();
      if (data.success && Array.isArray(data.quotes)) {
        setVendorQuotes(data.quotes);
      } else {
        setVendorQuotes([]);
      }
    } catch (e) {
      console.error('fetchVendorQuotes error:', e);
    }
  };

  const fetchAssignedJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/vendor-assigned-jobs`);
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        setAssignedJobs(data.jobs);
      } else {
        setAssignedJobs([]);
      }
    } catch (e) {
      console.error('fetchAssignedJobs error:', e);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!quotingRequestId) return;
    const price = parseFloat(quotePrice);
    if (isNaN(price) || price <= 0) {
      showToastMsg('Please enter a valid quotation price', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/vendor-quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: quotingRequestId,
          vendorId: vendorProfile.id,
          vendorName: vendorProfile.name,
          quotePrice: price,
          notes: quoteNotes,
          estimatedTimeline: quoteTimeline,
          submittedBy: vendorProfile.businessName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Quotation submitted successfully!', 'success');
        setQuoteModalOpen(false);
        setQuotingRequestId(null);
        setQuotePrice('');
        setQuoteNotes('');
        setQuoteTimeline('1-2 Working Days');
        fetchVendorRequests();
        fetchVendorQuotes();
      } else {
        showToastMsg(data.message || 'Failed to submit quotation', 'error');
      }
    } catch (err) {
      showToastMsg('Network error submitting quotation', 'error');
    }
  };

  const handleOpenQuote = (request) => {
    setQuotingRequestId(request.id);
    setQuotePrice('');
    setQuoteNotes('');
    setQuoteTimeline('1-2 Working Days');
    setQuoteModalOpen(true);
  };

  const handleOpenPhotos = (photos) => {
    setActivePhotoModal({ photos, index: 0, title: 'Customer Damage Photos' });
  };

  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'QUOTE_REQUESTED': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'QUOTED': return 'bg-accent-50 text-accent-700 border-accent-200';
      case 'ASSIGNED': return 'bg-success-50 text-success-700 border-success-200';
      case 'IN_PROGRESS': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans text-[14px] font-[500] antialiased tracking-[-0.01em]">

      {/* SIDEBAR - VENDOR PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xs`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-sm">
              <HardHat className="w-5 h-5 text-accent-100" />
            </div>
            <div>
              <div className="font-heading font-bold text-base tracking-tight text-slate-900 leading-none">VENDOR</div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">Partner Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-50 border border-success-200 text-success-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto text-xs">
          {/* ADVENTURE & SPORTS OPERATOR MENU */}
          {isAdventure ? (
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center justify-between">
                <span>Adventure Operations</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </div>

              <button
                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-rose-600'}`} />
                  <span>Operator Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('adventure'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'adventure'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className={`w-4 h-4 ${activeTab === 'adventure' ? 'text-white' : 'text-rose-600'}`} />
                  <span>Adventure Passes & Leads</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'adventure' ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {adventureBookings.length}
                </span>
              </button>
            </div>
          ) : (
            /* HOME & CIVIL SERVICES CONTRACTOR MENU */
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Service Operations
              </div>

              <button
                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Service Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('requests'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'requests'
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className={`w-4 h-4 ${activeTab === 'requests' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Customer Requests</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'requests' ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {vendorRequests.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('quotes'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'quotes'
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className={`w-4 h-4 ${activeTab === 'quotes' ? 'text-white' : 'text-slate-500'}`} />
                  <span>My Quotations</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'quotes' ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {vendorQuotes.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('assigned'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  activeTab === 'assigned'
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className={`w-4 h-4 ${activeTab === 'assigned' ? 'text-white' : 'text-slate-500'}`} />
                  <span>Assigned Jobs</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'assigned' ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {assignedJobs.length}
                </span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support</div>
            <button
              onClick={() => { setActiveTab('support'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'support'
                  ? (isAdventure ? 'bg-rose-600 text-white font-semibold shadow-xs' : 'bg-brand-600 text-white font-semibold shadow-xs')
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className={`w-4 h-4 ${activeTab === 'support' ? 'text-white' : 'text-slate-500'}`} />
                <span>Chat with Super Admin</span>
              </div>
            </button>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl ${isAdventure ? 'bg-rose-600' : 'bg-accent-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                {vendorProfile.name.charAt(0)}
              </div>
              <span className="w-2 h-2 rounded-full bg-success-500 absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-xs truncate leading-tight">{vendorProfile.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{vendorProfile.businessName}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSwitchToSuperAdmin ? onSwitchToSuperAdmin() : null}
              title="Switch to Super Admin"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out of Vendor Portal"
                className="p-1.5 rounded-lg text-danger-500 hover:text-danger-700 hover:bg-danger-50 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAdventure ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isAdventure ? 'Adventure & Sports Operator' : 'Service Contractor'}
                </span>
                <span className="text-slate-300">/</span>
                <h1 className="font-heading font-bold text-base text-slate-900 capitalize leading-tight">
                  {activeTab === 'dashboard' ? (isAdventure ? 'Operator Dashboard' : 'Service Dashboard') :
                    activeTab === 'requests' ? 'Customer Requests' :
                    activeTab === 'quotes' ? 'My Quotations' :
                    activeTab === 'assigned' ? 'Assigned Jobs' :
                    activeTab === 'adventure' ? 'Adventure Bookings & Passes' : 'Support Desk'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 pl-2 hidden lg:inline">Active Vendor:</span>
              <select
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  const found = DEMO_VENDORS.find(v => v.id === e.target.value);
                  showToastMsg(`Switched to ${found?.name} (${found?.category})`, 'info');
                }}
                className="text-xs font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs"
              >
                <optgroup label="🪂 Adventure & Sports Operators">
                  {DEMO_VENDORS.filter(v => v.category === 'Adventure').map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.businessName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🛠️ Home & Civil Services Providers">
                  {DEMO_VENDORS.filter(v => v.category !== 'Adventure').map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.businessName})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <button
              onClick={() => { fetchVendorData(); fetchAdventureBookings(); }}
              title="Refresh data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-5 max-w-7xl w-full mx-auto">

          {/* ADVENTURE OPERATOR DASHBOARD TAB */}
          {activeTab === 'dashboard' && isAdventure && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-rose-200 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                      <Compass className="w-3.5 h-3.5 text-rose-600" />
                      <span>Authorized Adventure & Sports Operator</span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                      Welcome back, {vendorProfile.name}
                    </h2>
                    <p className="text-slate-600 text-sm font-normal mt-1 max-w-2xl">
                      You are connected as the licensed operator for <span className="font-bold text-slate-900">{vendorProfile.businessName}</span>. Manage traveler passes, monitor guest check-ins, and prepare base camp dispatches.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Category</div>
                      <div className="font-bold text-slate-900">{vendorProfile.specialization}</div>
                    </div>
                    <div className="text-right hidden sm:block bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Camp</div>
                      <div className="font-bold text-slate-900">{vendorProfile.city}</div>
                    </div>
                    <div className="text-right hidden sm:block bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operator Rating</div>
                      <div className="font-bold text-amber-600 flex items-center justify-end gap-1">
                        <span>★</span>
                        <span>{vendorProfile.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adventure KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Assigned Passes</span>
                    <Ticket className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">{adventureBookings.length}</div>
                  <div className="text-[10px] text-rose-600 font-medium mt-1">Total bookings assigned</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Confirmed Arrivals</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                    {adventureBookings.filter(b => (b.status || '').toUpperCase() === 'CONFIRMED').length}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-1">Awaiting base camp arrival</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Travelers</span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                    {adventureBookings.reduce((sum, b) => sum + (Number(b.guests) || 1), 0)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-1">Scheduled guests count</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Booking Revenue</span>
                    <Banknote className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                    ₹{adventureBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium mt-1">Total confirmed pass value</div>
                </div>
              </div>

              {/* Quick Actions & Adventure Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-500" />
                    <span>Operator Quick Actions</span>
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => { setActiveTab('adventure'); }}
                      className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-between transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        <span>View Customer Passes & Leads</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('adventure'); }}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Check-In Arrived Guests</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('support'); }}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span>Chat with Super Admin Desk</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-rose-500" />
                    <span>Operator Profile</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Business / Club</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.businessName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Experience Type</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.specialization}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Base Camp / City</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Emergency Contact</span>
                      <span className="text-xs font-semibold text-slate-800 font-mono">{vendorProfile.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Base Pass Rate</span>
                      <span className="text-xs font-semibold text-slate-800">₹{vendorProfile.minCharge} / person</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>How Adventure Operations Work</span>
                  </h3>
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">1</span>
                      <span><strong className="text-slate-800">Traveler Books Online:</strong> Customer selects your adventure activity, slot time, and completes advance payment.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">2</span>
                      <span><strong className="text-slate-800">Direct Lead Dispatch:</strong> Booking details (guest count, slot time, traveler phone) are dispatched instantly to your console.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">3</span>
                      <span><strong className="text-slate-800">Base Camp Check-in:</strong> Verify traveler booking pass upon arrival and dispatch activity safely.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOME & CIVIL SERVICES CONTRACTOR DASHBOARD TAB */}
          {activeTab === 'dashboard' && !isAdventure && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                      <HardHat className="w-3.5 h-3.5 text-blue-600" />
                      <span>Certified Service Contractor</span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Welcome back, {vendorProfile.name}</h2>
                    <p className="text-slate-500 text-sm font-normal">
                      You are connected as a verified contractor for <span className="font-bold text-slate-800">{vendorProfile.businessName}</span>. View customer repair requests, submit quotations, and get assigned jobs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</div>
                      <div className="font-bold text-slate-900">{vendorProfile.specialization}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</div>
                      <div className="font-bold text-slate-900">{vendorProfile.experience}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</div>
                      <div className="font-bold text-slate-900">{vendorProfile.rating} ★</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Requests Received</span>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">{vendorRequests.length}</div>
                  <div className="text-[10px] text-brand-600 font-medium mt-1">Pending your quotation</div>
                </div>
                <div className="p-4 rounded-xl bg-accent-50 border border-accent-200">
                  <span className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">Quotes Submitted</span>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">{vendorQuotes.length}</div>
                  <div className="text-[10px] text-accent-600 font-medium mt-1">Awaiting customer decision</div>
                </div>
                <div className="p-4 rounded-xl bg-success-50 border border-success-200">
                  <span className="text-[10px] font-bold text-success-600 uppercase tracking-wider">Jobs Assigned</span>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">{assignedJobs.length}</div>
                  <div className="text-[10px] text-success-600 font-medium mt-1">Minimum price winner</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total Quote Value</span>
                  <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                    ₹{vendorQuotes.reduce((s, q) => s + (q.quotePrice || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium mt-1">All submitted quotes</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setActiveTab('requests'); }}
                      className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-between transition-all shadow-xs"
                    >
                      <span>View Customer Requests</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('quotes'); }}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                    >
                      <span>Review My Quotations</span>
                      <FileCheck2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('assigned'); }}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                    >
                      <span>Check Assigned Jobs</span>
                      <Briefcase className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">Vendor Profile</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Business Name</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.businessName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Specialization</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.specialization}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">City</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Contact</span>
                      <span className="text-xs font-semibold text-slate-800">{vendorProfile.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Min Charge</span>
                      <span className="text-xs font-semibold text-slate-800">₹{vendorProfile.minCharge}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">How It Works</h3>
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">1</span>
                      <span>Super Admin shares a customer repair request with damage photos and address.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">2</span>
                      <span>Review the requirement and submit your quotation price.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-[10px] font-bold flex-shrink-0 flex items-center justify-center mt-0.5">3</span>
                      <span>The Super Admin <span className="font-bold text-success-700">manually assigns</span> the job to a vendor.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">Customer Requests Shared with You</h2>
                  <p className="text-[11px] text-slate-400">Review damage requirements and submit your quotation for each request.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {vendorRequests.map(req => {
                  const alreadyQuoted = vendorQuotes.some(q => q.requestId === req.id);
                  const media = Array.isArray(req.mediaUrl) ? req.mediaUrl : (req.mediaUrl ? [req.mediaUrl] : []);
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm sm:text-base text-brand-600 tracking-wide">{req.requestNumber}</span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${req.urgency === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                              {req.urgency || 'NORMAL'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>{req.status}</span>
                          </div>
                          {alreadyQuoted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-100 text-success-700 border border-success-200">
                              Quoted
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">{req.servicecode}</h3>
                          {req.subServiceCode && <p className="text-xs sm:text-sm font-semibold text-brand-600 mt-0.5">{req.subServiceCode}</p>}
                        </div>

                        <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-200 font-normal">
                          <span className="font-bold text-slate-900">Customer Requirement:</span> {req.issueDescription}
                        </div>

                        {media.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-slate-500">Affected Area Photos ({media.length}):</div>
                            <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                              {media.map((imgUrl, i) => (
                                <div key={i} onClick={() => handleOpenPhotos(media)} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer relative group shrink-0 hover:border-brand-500 hover:shadow-md transition-all">
                                  <img src={imgUrl} alt="Damage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80'; }} />
                                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-semibold text-center py-1">Photo #{i + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-xs sm:text-sm text-slate-400 italic">No photos uploaded</div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-3 border-t border-slate-100 text-slate-600">
                          <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-semibold text-slate-800">{req.customerName}</span></div>
                          <div className="flex items-center gap-2 font-mono"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium text-slate-700">{req.customerPhone}</span></div>
                          <div className="flex items-center gap-2"><Home className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium text-slate-700">{req.propertyType}</span></div>
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium text-slate-700">{req.preferredDate}</span></div>
                          <div className="col-span-1 sm:col-span-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /><span className="font-medium text-slate-700 truncate" title={req.addressline}>{req.addressline}</span></div>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                        {!alreadyQuoted ? (
                          <button
                            onClick={() => handleOpenQuote(req)}
                            className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all w-full justify-center"
                          >
                            <Calculator className="w-3.5 h-3.5" /> Submit Quotation
                          </button>
                        ) : (
                          <button
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed w-full justify-center"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" /> Quotation Submitted
                          </button>
                        )}
                        <button
                          onClick={() => openChatForRequest(req)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="Contact Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {vendorRequests.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-4" />
                    <p className="font-semibold text-sm text-slate-600">No customer requests shared yet</p>
                    <p className="text-xs text-slate-400">The Super Admin will share customer repair requests with you here. Once shared, you can view damage photos, requirements, and submit quotations.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUOTATIONS TAB */}
          {activeTab === 'quotes' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">My Submitted Quotations</h2>
                  <p className="text-[11px] text-slate-400">Track quotations you have submitted to customers via Super Admin.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold text-slate-700">Request #</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Customer</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Service</th>
                        <th className="py-3 px-4 font-semibold text-slate-700 text-right">Your Quote (₹)</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Timeline</th>
                        <th className="py-3 px-4 font-semibold text-slate-700 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendorQuotes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400">
                            <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-sm text-slate-600">No quotations submitted yet</p>
                            <p className="text-xs text-slate-400">Go to Customer Requests and submit your first quotation.</p>
                          </td>
                        </tr>
                      ) : (
                        vendorQuotes.map(q => (
                          <tr key={q.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="py-4 px-4 font-mono font-bold text-slate-800">{q.requestNumber || q.requestId}</td>
                            <td className="py-4 px-4 font-medium text-slate-900">{q.customerName || 'Customer'}</td>
                            <td className="py-4 px-4 text-slate-700">{q.serviceName || 'Repair Service'}</td>
                            <td className="py-4 px-4 font-mono text-right">
                              <span className={`font-bold ${q.status === 'ASSIGNED' ? 'text-success-700' : 'text-brand-700'}`}>
                                ₹{(q.quotePrice || 0).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{q.estimatedTimeline || '1-2 Days'}</td>
                            <td className="py-4 px-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold border ${getStatusColor(q.status)}`}>{q.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNED JOBS TAB */}
          {activeTab === 'assigned' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">Assigned Jobs</h2>
                  <p className="text-[11px] text-slate-400">Jobs assigned to you by the Super Admin.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {assignedJobs.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs">
                    <Award className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="font-semibold text-sm text-slate-600">No assigned jobs yet</p>
                    <p className="text-xs text-slate-400">When the Super Admin assigns a job to you, it will appear here.</p>
                  </div>
                ) : (
                  assignedJobs.map(job => (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-success-100 text-success-700 border border-success-200 mb-2 inline-block">Assigned</span>
                          <h3 className="font-heading font-bold text-base text-slate-900">{job.serviceName || 'Repair Job'}</h3>
                          <div className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">Request #{job.requestNumber || job.requestId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xl text-success-700">₹{(job.quotePrice || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-success-600 font-medium">Assigned Price</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-700">{job.customerName || 'Customer'}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-700 truncate">{job.addressline || 'Address to be confirmed'}</span></div>
                        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /><a href={`tel:${job.customerPhone || ''}`} className="text-sm text-slate-700 font-medium">{job.customerPhone || 'N/A'}</a></div>
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-700">{job.preferredDate || 'TBD'}</span></div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <button
                          className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact Customer to Start Work</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">
                    {isAdventure ? 'Adventure Operations Desk' : 'Service Support Desk'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isAdventure
                      ? 'Direct communication channel between Adventure Operator and Super Admin Operations Desk.'
                      : 'Chat with the Super Admin desk for any questions about customer repair requests or quotations.'}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${isAdventure ? 'text-rose-600' : 'text-brand-600'}`} />
                    <span className="font-semibold text-slate-800">
                      {isAdventure ? 'Super Admin Adventure Control Desk' : 'Super Admin Technical Desk'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-success-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span> Online
                  </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
                  {isAdventure ? (
                    <>
                      <div className="flex justify-start">
                        <div className="bg-rose-600 text-white px-4 py-2.5 rounded-2xl rounded-br-none text-sm max-w-[80%] shadow-xs">
                          Hello {vendorProfile.name}! This is the Hipro Adventure Central Desk. Your operator profile for <strong>{vendorProfile.businessName}</strong> is verified and active.
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm max-w-[80%] shadow-xs">
                          Travelers booking your activity slots on the Hipro portal will have their passes dispatched directly to your console. For any weather updates or slot rescheduling, message us directly here.
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-start">
                        <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-br-none text-sm max-w-[80%] shadow-xs">
                          Hello {vendorProfile.name}! I'm the Super Admin Desk. We share verified customer repair requests here for your quotations.
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm max-w-[80%] shadow-xs">
                          We have reviewed your profile for {vendorProfile.businessName}. Submit your best quotations to win customer jobs.
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-3 border-t border-slate-200/50">
                  <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isAdventure ? "Message Adventure Central Desk..." : "Type a message to Super Admin..."}
                      className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button className={`px-4 py-2 rounded-xl ${isAdventure ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'} text-white text-sm font-bold transition-all shadow-xs`}>
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ADVENTURE & SPORTS PASSES TAB */}
          {activeTab === 'adventure' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-danger-50 text-danger-600 border border-danger-200">
                    <Compass className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold text-base text-slate-800">
                      Adventure Passes & Customer Leads
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time traveler bookings for {vendorProfile.businessName}. Dispatch directions and check travelers in upon arrival.
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchAdventureBookings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sync Passes</span>
                </button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Total Passes</span>
                    <Ticket className="w-4 h-4 text-danger-500" />
                  </div>
                  <div className="text-xl font-heading font-bold text-slate-800">
                    {adventureBookings.length}
                  </div>
                  <span className="text-[10px] text-slate-400">Assigned bookings</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Confirmed</span>
                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="text-xl font-heading font-bold text-primary-600">
                    {adventureBookings.filter(b => (b.status || '').toUpperCase() === 'CONFIRMED').length}
                  </div>
                  <span className="text-[10px] text-slate-400">Awaiting arrival</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Checked-In</span>
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xl font-heading font-bold text-emerald-600">
                    {adventureBookings.filter(b => (b.status || '').toUpperCase() === 'CHECKED_IN' || (b.status || '').toUpperCase() === 'COMPLETED').length}
                  </div>
                  <span className="text-[10px] text-slate-400">At base camp / done</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase">Total Guests</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-heading font-bold text-indigo-600">
                    {adventureBookings.reduce((sum, b) => sum + (Number(b.guests) || 1), 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Travelers count</span>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                  {['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setAdventureStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        adventureStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL' ? 'All Leads' : st.replace('_', ' ')}
                      <span className="ml-1.5 text-[10px] opacity-70">
                        ({st === 'ALL' ? adventureBookings.length : adventureBookings.filter(b => (b.status || '').toUpperCase() === st).length})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adventureSearch}
                    onChange={(e) => setAdventureSearch(e.target.value)}
                    placeholder="Search traveler, phone, pass code..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger-500/20 focus:border-danger-500 font-medium"
                  />
                </div>
              </div>

              {/* Bookings List */}
              {(() => {
                const filtered = adventureBookings.filter((b) => {
                  const matchStatus = adventureStatusFilter === 'ALL' || (b.status || '').toUpperCase() === adventureStatusFilter;
                  const q = adventureSearch.toLowerCase();
                  const matchSearch = !adventureSearch ||
                    (b.bookingCode || '').toLowerCase().includes(q) ||
                    (b.travelerName || '').toLowerCase().includes(q) ||
                    (b.travelerPhone || '').includes(q) ||
                    (b.experienceTitle || '').toLowerCase().includes(q);
                  return matchStatus && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                      <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-heading font-semibold text-sm text-slate-700">No adventure passes found</h4>
                      <p className="text-xs text-slate-400 mt-1">Customer adventure bookings assigned to your operator profile will appear here with customer contact, time slot and check-in options.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((b) => (
                      <div
                        key={b.id || b.bookingCode}
                        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <span className="w-12 h-12 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center shrink-0 border border-danger-200 font-bold text-sm">
                            <Compass className="w-6 h-6" />
                          </span>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                {b.bookingCode || b.id}
                              </span>
                              <h3 className="font-heading font-bold text-sm text-slate-900">
                                {b.experienceTitle}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                b.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                                b.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {b.status || 'CONFIRMED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>Customer: <strong className="text-slate-900 font-semibold">{b.travelerName}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>Mobile: <strong className="text-slate-900 font-semibold">{b.travelerPhone}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Date: <strong className="text-slate-900 font-semibold">{b.travelDate}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>Slot: <strong className="text-slate-900 font-semibold">{b.timeSlot}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>Party: <strong className="text-slate-900 font-semibold">{b.guests || 1} Travelers</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span>Amount: <strong className="text-emerald-700 font-bold">₹{b.totalAmount || b.price}</strong> ({b.paymentStatus || 'PAID'})</span>
                              </div>
                            </div>

                            {b.reportingPoint && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-danger-500 shrink-0" />
                                <span>Base Camp: {b.reportingPoint}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct Vendor Actions */}
                        <div className="flex flex-row lg:flex-col items-end gap-2 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Status:</span>
                            <select
                              value={b.status || 'CONFIRMED'}
                              onChange={(e) => handleUpdateAdventureStatus(b.id || b.bookingCode, e.target.value)}
                              className="text-xs px-2.5 py-1 font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-danger-500"
                            >
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="CHECKED_IN">CHECKED_IN</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={`tel:${b.travelerPhone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                              <span>Call</span>
                            </a>
                            <button
                              onClick={() => openWhatsAppTraveler(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Details</span>
                            </button>
                            {b.status !== 'CHECKED_IN' && b.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateAdventureStatus(b.id || b.bookingCode, 'CHECKED_IN')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-all"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Check-In</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* Photo Viewer Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <button
            onClick={() => setActivePhotoModal(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh]">
            <button
              onClick={() => setActivePhotoModal(prev => ({ ...prev, index: (prev.index + activePhotoModal.photos.length - 1) % activePhotoModal.photos.length }))}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-lg hover:bg-white/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActivePhotoModal(prev => ({ ...prev, index: (prev.index + 1) % activePhotoModal.photos.length }))}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-lg hover:bg-white/40 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal.photos[activePhotoModal.index]}
              alt="Damage Photo"
              className="max-w-full max-h-[60vh] rounded-xl object-contain mx-auto border border-white/20"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'; }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
              <div className="text-white text-sm font-medium">
                {activePhotoModal.index + 1} of {activePhotoModal.photos.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Submission Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setQuoteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-200/50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900">Submit Quotation</h3>
              <button onClick={() => setQuoteModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitQuote} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quotation Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">₹</span>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="e.g. 8500"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes / Scope Details</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Describe your approach, materials, warranty..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Timeline</label>
                <select
                  value={quoteTimeline}
                  onChange={(e) => setQuoteTimeline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="1-2 Working Days">1-2 Working Days</option>
                  <option value="3-5 Working Days">3-5 Working Days</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                </select>
              </div>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-slate-800">Customer Address:</span>
                </div>
                <p className="text-xs text-slate-600">
                  {vendorRequests.find(r => r.id === quotingRequestId)?.addressline || 'Address will be shared upon assignment'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow-md transition-all"
                >
                  Submit Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-success-50 text-success-800 border-success-200' :
          toast.type === 'error' ? 'bg-danger-50 text-danger-800 border-danger-200' :
          'bg-brand-50 text-brand-800 border-brand-200'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
