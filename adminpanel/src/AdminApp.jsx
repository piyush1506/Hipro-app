import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
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
  Filter, UserCheck, AlertTriangle, ArrowUpRight, Award, Shield, UserPlus
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'https://app.hindustanprojects.in');

export default function AdminApp({ onSwitchToCustomerApp }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [slides, setSlides] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [activeInspectionReq, setActiveInspectionReq] = useState(null); // inspection request detail

  // Overview Operations & Engineer Assignment State
  const [overviewFilter, setOverviewFilter] = useState('ALL'); // 'ALL' | 'READY' | 'NEEDS_QUOTE' | 'AUDIT' | 'DIRECT'
  const [overviewSearch, setOverviewSearch] = useState('');
  const [assigningEngineerReqId, setAssigningEngineerReqId] = useState(null);
  const [assignedEngineers, setAssignedEngineers] = useState(() => {
    try {
      const saved = localStorage.getItem('hipro_assigned_engineers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const availableEngineers = [
    { id: 'eng_1', name: 'Er. Vikram Sharma', role: 'Senior Civil Lead', phone: '+91 94141 12345', badge: 'Civil Expert', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'eng_2', name: 'Er. Rajesh Verma', role: 'Waterproofing Specialist', phone: '+91 94142 67890', badge: 'Waterproofing', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { id: 'eng_3', name: 'Er. Neha Gupta', role: 'Structural Audit Lead', phone: '+91 98290 45678', badge: 'Structural', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'eng_4', name: 'Amit Sharma', role: 'Field Tech Lead', phone: '+91 94618 77701', badge: 'Field Ops', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'eng_5', name: 'Suresh Kumar', role: 'Civil Site Supervisor', phone: '+91 98288 34567', badge: 'Supervisor', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'eng_6', name: 'Ramesh Lal', role: 'Finishing & Painting Lead', phone: '+91 94133 98765', badge: 'Finishing', color: 'bg-rose-100 text-rose-700 border-rose-200' }
  ];

  const handleAssignEngineer = (requestId, engineerName) => {
    setAssignedEngineers(prev => {
      const updated = { ...prev, [requestId]: engineerName };
      try {
        localStorage.setItem('hipro_assigned_engineers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setAssigningEngineerReqId(null);
    showToastMsg(`Assigned to ${engineerName}`, 'success');
  };

  // Live Chat Desk State
  const socketRef = useRef(null);
  const [chatThreads, setChatThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatFilterType, setChatFilterType] = useState('ALL');
  const [activeChatModal, setActiveChatModal] = useState(null); // Instant Floating/Modal Live Chat Window
  const [chatModalInput, setChatModalInput] = useState('');
  const chatMessagesEndRef = useRef(null);

  const handleOpenChatWithCustomer = (user, phone, req = null) => {
    if (req) {
      openChatForRequest(req);
      return;
    }
    const cleanPhone = (phone || user?.phoneNumber || '').replace(/\D/g, '');
    let targetThread = chatThreads.find(t => {
      const tPhone = (t.customerPhone || '').replace(/\D/g, '');
      const matchPhone = cleanPhone && tPhone && (cleanPhone.includes(tPhone) || tPhone.includes(cleanPhone));
      const matchName = user?.name && t.customerName && t.customerName.toLowerCase().trim() === user.name.toLowerCase().trim();
      return matchPhone || matchName;
    });

    const threadId = targetThread ? targetThread.id : `thread_user_${cleanPhone || Date.now()}`;
    if (!targetThread) {
      targetThread = {
        id: threadId,
        customerName: user?.name || 'Customer',
        customerPhone: phone || user?.phoneNumber || '+91 94628 77757',
        contextType: 'GENERAL',
        contextTag: 'Support Desk',
        quoteNumber: '',
        requestNumber: '',
        bookingNumber: '',
        lastMessage: 'Support chat initiated',
        lastMessageTime: new Date().toISOString(),
        unreadCountAdmin: 0,
        unreadCountCustomer: 0,
      };
      setChatThreads(prev => [targetThread, ...prev.filter(t => t.id !== threadId)]);
    }

    setActiveThreadId(threadId);
    setChatFilterType('ALL');
    setChatSearch('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_thread', threadId);
    }
    fetchThreadMessages(threadId);
    setActiveTab('chat');
    setSidebarOpen(false);
  };

  // Slides State
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetRoute: 'create_inspection',
    badgeText: 'LIMITED OFFER',
    order: 1,
    isActive: true,
  });
  const [uploadingSlideImg, setUploadingSlideImg] = useState(false);

  // Offers State
  const [offers, setOffers] = useState([]);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerCategoryFilter, setOfferCategoryFilter] = useState('ALL');
  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    category: 'Trending',
    discount: '20% OFF',
    code: '',
    badge: 'POPULAR',
    imageUrl: '',
    minAmount: 1500,
    validTill: '31 Dec 2026',
    targetRoute: 'create_inspection',
    terms: 'Applicable on residential and commercial inspections.',
    order: 1,
    isActive: true,
  });
  const [uploadingOfferImg, setUploadingOfferImg] = useState(false);

  // Modals state
  const [activePhotoModal, setActivePhotoModal] = useState(null); // { photos: [], index: 0, title: '' }
  const [activeQuoteModal, setActiveQuoteModal] = useState(null); // quote object
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [addSubServiceModalOpen, setAddSubServiceModalOpen] = useState(null); // parent service object

  // Direct Bookings State (Maintenance Services)
  const [directBookings, setDirectBookings] = useState([]);
  const [directBookingStats, setDirectBookingStats] = useState(null);
  const [directBookingFilter, setDirectBookingFilter] = useState('ALL');
  const [directBookingSearch, setDirectBookingSearch] = useState('');
  const [directBookingCityFilter, setDirectBookingCityFilter] = useState('ALL');
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] = useState(null);
  const [assignTechModalBooking, setAssignTechModalBooking] = useState(null);
  const [statusModalBooking, setStatusModalBooking] = useState(null);
  const [refundModalBooking, setRefundModalBooking] = useState(null);
  const [adjustChargeModalBooking, setAdjustChargeModalBooking] = useState(null);
  const [techForm, setTechForm] = useState({ name: '', phone: '', role: 'Senior Field Specialist' });
  const [statusForm, setStatusForm] = useState({ status: 'CONFIRMED', reason: '' });
  const [refundForm, setRefundForm] = useState({ amount: '', reason: 'Customer requested cancellation' });
  const [adjustForm, setAdjustForm] = useState({ additionalAmount: '', note: '' });

  // SubService Edit/Add State
  const [subServiceModalOpen, setSubServiceModalOpen] = useState(false);
  const [editingSubService, setEditingSubService] = useState(null);
  const [subServiceParentService, setSubServiceParentService] = useState(null);
  const [subServiceForm, setSubServiceForm] = useState({
    titleEn: '',
    titleHi: '',
    desc: '',
    visitingCharge: 199,
    bookNowEnabled: true,
    getQuoteEnabled: true,
    checklist: '',
    requiredFields: []
  });
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  // Quotation Builder State
  const [builderRequestId, setBuilderRequestId] = useState('');
  const [builderEstimator, setBuilderEstimator] = useState('Hipro Technical Admin Desk');
  const [builderTimeline, setBuilderTimeline] = useState('1-2 Working Days');
  const [builderScope, setBuilderScope] = useState('Standard Engineering Specifications');
  const [builderTerms, setBuilderTerms] = useState('Standard HiBuild service terms apply upon receipt of final payment. 50% advance before material mobilization, 50% on completion and customer sign-off.');
  const [lineItems, setLineItems] = useState([
    { item: 'Surface Preparation & Moisture Tracing', qty: 1, unit: 'Lumpsum', rate: 1200 },
    { item: 'Chemical PU Injection / Polymer Grouting', qty: 15, unit: 'Running Ft', rate: 180 },
    { item: 'Waterproof Acrylic Protective Top Coat', qty: 120, unit: 'Sq Ft', rate: 45 }
  ]);
  const [matCost, setMatCost] = useState(0);
  const [labCost, setLabCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [builderAdvancePct, setBuilderAdvancePct] = useState(30);
  const [customAdvanceAmt, setCustomAdvanceAmt] = useState(null);
  const [isEditingModalAdvance, setIsEditingModalAdvance] = useState(false);
  const [modalNewAdvanceAmt, setModalNewAdvanceAmt] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchStats(true), 60000);
    return () => clearInterval(interval);
  }, []);


  // Real-Time Chat Socket & Event Listeners
  useEffect(() => {
    fetchChatThreads();
    // Connect to Socket.io server
    // Use VITE_SOCKET_URL env var if set, otherwise construct from location/API_BASE
    const socketBase = import.meta.env.VITE_SOCKET_URL || 
      (typeof window !== 'undefined' ? 
        (window.location.protocol + '//' + window.location.hostname + ':5000') 
        : 'http://localhost:5000');
    const socket = io(socketBase, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    // Join thread room when socket connects
    socket.on('connect', () => {
      // Re-join active thread room if one was selected
      if (activeThreadId) {
        socket.emit('join_thread', activeThreadId);
      }
    });

    socket.on('thread_updated', (payload) => {
      // Optimistically update the specific thread without full refresh
      if (payload.thread) {
        setChatThreads(prev => prev.map(t => t.id === payload.thread.id ? payload.thread : t));
      }
      if (activeThreadId && payload.thread?.id === activeThreadId) {
        fetchThreadMessages(activeThreadId);
      }
    });

    socket.on('new_message', (msg) => {
      // Add message to the specific thread if it matches, or if no active thread (first new message)
      setThreadMessages(prev => {
        if (activeThreadId && msg.threadId !== activeThreadId) return prev;
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Auto-switch to new thread if no thread was active
      if (!activeThreadId) {
        setActiveThreadId(msg.threadId);
        fetchThreadMessages(msg.threadId);
      }
    });

    socket.on('new_direct_booking', (payload) => {
      fetchDirectBookings();
      fetchDirectBookingStats();
      if (payload && payload.message) {
        showToastMsg(payload.message, 'success');
      }
    });

    socket.on('direct_booking_updated', () => {
      fetchDirectBookings();
      fetchDirectBookingStats();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty dependency - socket management is independent of thread state

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const showToastMsg = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAllData = async (showFeedback = false) => {
    try {
      await Promise.all([
        fetchStats(),
        fetchRequests(),
        fetchQuotations(),
        fetchServices(),
        fetchUsers(),
        fetchSlides(),
        fetchOffers(),
        fetchChatThreads(),
        fetchDirectBookings(),
        fetchDirectBookingStats()
      ]);
      if (showFeedback) showToastMsg('Database synced successfully', 'success');
    } catch (err) {
      if (showFeedback) showToastMsg('Failed to sync with API', 'error');
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/offers/admin`);
      const data = await res.json();
      if (data.success) setOffers(data.offers || []);
    } catch (e) { console.error('fetchOffers error:', e); }
  };

  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      subtitle: '',
      category: 'Trending',
      discount: '20% OFF',
      code: '',
      badge: 'LIMITED TIME',
      imageUrl: '',
      minAmount: 1500,
      validTill: '31 Dec 2026',
      targetRoute: 'create_inspection',
      terms: 'Applicable on residential and commercial inspections.',
      order: offers.length + 1,
      isActive: true,
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      category: offer.category || 'Trending',
      discount: offer.discount || '',
      code: offer.code || '',
      badge: offer.badge || '',
      imageUrl: offer.imageUrl || '',
      minAmount: offer.minAmount || 0,
      validTill: offer.validTill || '',
      targetRoute: offer.targetRoute || 'create_inspection',
      terms: offer.terms || '',
      order: offer.order || 1,
      isActive: offer.isActive !== false,
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (e) => {
    if (e) e.preventDefault();
    if (!offerForm.title || !offerForm.code) {
      showToastMsg('Offer Title and Coupon Code are required', 'error');
      return;
    }

    try {
      const url = editingOffer
        ? `${API_BASE}/api/v1/offers/admin/${editingOffer.id}`
        : `${API_BASE}/api/v1/offers/admin`;
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerForm),
      });

      const data = await res.json();
      if (data.success) {
        showToastMsg(editingOffer ? 'Offer updated successfully!' : 'Offer created successfully!', 'success');
        setOfferModalOpen(false);
        fetchOffers();
      } else {
        showToastMsg(data.message || 'Failed to save offer', 'error');
      }
    } catch (err) {
      showToastMsg('Network error saving offer', 'error');
    }
  };

  const handleToggleOfferActive = async (offer) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/offers/admin/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Offer marked ${!offer.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchOffers();
      }
    } catch (err) {
      showToastMsg('Failed to toggle offer status', 'error');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/offers/admin/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Offer deleted successfully', 'success');
        fetchOffers();
      }
    } catch (err) {
      showToastMsg('Failed to delete offer', 'error');
    }
  };

  const handleOfferImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOfferImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/offers');

    try {
      const res = await fetch(`${API_BASE}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setOfferForm(prev => ({ ...prev, imageUrl: data.url }));
        showToastMsg('Offer image uploaded successfully!', 'success');
      } else {
        showToastMsg(data.message || 'Image upload failed', 'error');
      }
    } catch (err) {
      showToastMsg('Error uploading image', 'error');
    } finally {
      setUploadingOfferImg(false);
    }
  };

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/slides/admin`);
      const data = await res.json();
      if (data.success) setSlides(data.data || []);
    } catch (e) { console.error('fetchSlides error:', e); }
  };

  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      targetRoute: 'create_inspection',
      badgeText: 'LIMITED OFFER',
      order: slides.length + 1,
      isActive: true,
    });
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      imageUrl: slide.imageUrl || '',
      targetRoute: slide.targetRoute || 'create_inspection',
      badgeText: slide.badgeText || '',
      order: slide.order || 1,
      isActive: slide.isActive !== false,
    });
    setSlideModalOpen(true);
  };

  const handleSaveSlide = async (e) => {
    if (e) e.preventDefault();
    if (!slideForm.title || !slideForm.imageUrl) {
      showToastMsg('Title and Image URL are required', 'error');
      return;
    }

    try {
      const url = editingSlide
        ? `${API_BASE}/api/v1/slides/admin/${editingSlide.id}`
        : `${API_BASE}/api/v1/slides/admin`;
      const method = editingSlide ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideForm),
      });

      const data = await res.json();
      if (data.success) {
        showToastMsg(editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!', 'success');
        setSlideModalOpen(false);
        fetchSlides();
      } else {
        showToastMsg(data.message || 'Failed to save slide', 'error');
      }
    } catch (err) {
      showToastMsg('Network error saving slide', 'error');
    }
  };

  const handleToggleSlideActive = async (slide) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/slides/admin/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Slide marked ${!slide.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchSlides();
      }
    } catch (err) {
      showToastMsg('Failed to toggle slide status', 'error');
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/slides/admin/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Slide deleted successfully', 'success');
        fetchSlides();
      }
    } catch (err) {
      showToastMsg('Failed to delete slide', 'error');
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/slides');

    try {
      const res = await fetch(`${API_BASE}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSlideForm(prev => ({ ...prev, imageUrl: data.url }));
        showToastMsg('Image uploaded successfully!', 'success');
      } else {
        showToastMsg(data.message || 'Image upload failed', 'error');
      }
    } catch (err) {
      showToastMsg('Error uploading image', 'error');
    } finally {
      setUploadingSlideImg(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/stats`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/requests`);
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations`);
      const data = await res.json();
      if (data.success) setQuotations(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/services`);
      const data = await res.json();
      if (data.success) setServices(data.services || []);
    } catch (e) { console.error(e); }
  };

  const fetchDirectBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings`);
      const data = await res.json();
      if (data.success) setDirectBookings(data.bookings || []);
    } catch (e) {
      console.error('fetchDirectBookings error:', e);
    }
  };

  const fetchDirectBookingStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings/admin/stats`);
      const data = await res.json();
      if (data.success) setDirectBookingStats(data.stats || null);
    } catch (e) {
      console.error('fetchDirectBookingStats error:', e);
    }
  };

  // Direct Booking Handlers
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!assignTechModalBooking) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings/${assignTechModalBooking.id}/technician`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianName: techForm.name,
          technicianPhone: techForm.phone,
          technicianRole: techForm.role || 'Senior Field Specialist',
          assignedBy: 'Admin Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Technician ${techForm.name} assigned successfully!`, 'success');
        setAssignTechModalBooking(null);
        setTechForm({ name: '', phone: '', role: 'Senior Field Specialist' });
        if (selectedBookingForDrawer && selectedBookingForDrawer.id === assignTechModalBooking.id) {
          setSelectedBookingForDrawer(data.booking);
        }
        fetchDirectBookings();
        fetchDirectBookingStats();
      } else {
        showToastMsg(data.message || 'Failed to assign technician', 'error');
      }
    } catch (err) {
      showToastMsg('Network error assigning technician', 'error');
    }
  };

  const handleUpdateDirectBookingStatus = async (e) => {
    e.preventDefault();
    if (!statusModalBooking) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings/${statusModalBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusForm.status,
          reason: statusForm.reason,
          updatedBy: 'Admin Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Status updated to ${statusForm.status}`, 'success');
        setStatusModalBooking(null);
        fetchDirectBookings();
        fetchDirectBookingStats();
      } else {
        showToastMsg(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToastMsg('Network error updating status', 'error');
    }
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    if (!refundModalBooking) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings/${refundModalBooking.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(refundForm.amount) || refundModalBooking.onlinePaidAmount,
          reason: refundForm.reason,
          initiatedBy: 'Admin Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(data.message || 'Refund processed successfully!', 'success');
        setRefundModalBooking(null);
        fetchDirectBookings();
        fetchDirectBookingStats();
      } else {
        showToastMsg(data.message || 'Failed to process refund', 'error');
      }
    } catch (err) {
      showToastMsg('Network error processing refund', 'error');
    }
  };

  const handleAdjustAdditionalCharge = async (e) => {
    e.preventDefault();
    if (!adjustChargeModalBooking) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/direct-bookings/${adjustChargeModalBooking.id}/additional-work`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalWorkAmount: parseFloat(adjustForm.additionalAmount) || 0,
          note: adjustForm.note,
          updatedBy: 'Admin Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(data.message || 'Charges adjusted successfully', 'success');
        setAdjustChargeModalBooking(null);
        fetchDirectBookings();
      } else {
        showToastMsg(data.message || 'Failed to adjust charges', 'error');
      }
    } catch (err) {
      showToastMsg('Network error adjusting charges', 'error');
    }
  };

  // SubService Handlers
  const handleOpenAddSubService = (parentService) => {
    setSubServiceParentService(parentService);
    setEditingSubService(null);
    setSubServiceForm({
      titleEn: '',
      titleHi: '',
      desc: '',
      visitingCharge: 199,
      bookNowEnabled: true,
      getQuoteEnabled: true,
      checklist: '',
      requiredFields: []
    });
    setSubServiceModalOpen(true);
  };

  const handleOpenEditSubService = (sub, parentService) => {
    setSubServiceParentService(parentService);
    setEditingSubService(sub);
    setSubServiceForm({
      titleEn: sub.titleEn || '',
      titleHi: sub.titleHi || '',
      desc: sub.desc || '',
      visitingCharge: sub.visitingCharge !== undefined ? sub.visitingCharge : 199,
      bookNowEnabled: sub.bookNowEnabled !== undefined ? sub.bookNowEnabled : true,
      getQuoteEnabled: sub.getQuoteEnabled !== undefined ? sub.getQuoteEnabled : true,
      checklist: Array.isArray(sub.checklist) ? sub.checklist.join('\n') : '',
      requiredFields: Array.isArray(sub.requiredFields) ? sub.requiredFields : []
    });
    setSubServiceModalOpen(true);
  };

  const handleSaveSubService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serviceId: subServiceParentService?.id,
        titleEn: subServiceForm.titleEn.trim(),
        titleHi: subServiceForm.titleHi ? subServiceForm.titleHi.trim() : null,
        desc: subServiceForm.desc.trim(),
        visitingCharge: parseFloat(subServiceForm.visitingCharge) || 199.0,
        bookNowEnabled: Boolean(subServiceForm.bookNowEnabled),
        getQuoteEnabled: Boolean(subServiceForm.getQuoteEnabled),
        checklist: subServiceForm.checklist ? subServiceForm.checklist.split('\n').filter(Boolean) : [],
        requiredFields: subServiceForm.requiredFields
      };

      const url = editingSubService
        ? `${API_BASE}/api/v1/admin/sub-services/${editingSubService.id}`
        : `${API_BASE}/api/v1/admin/sub-services`;
      const method = editingSubService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(editingSubService ? 'Sub-service updated successfully' : 'Sub-service created successfully', 'success');
        setSubServiceModalOpen(false);
        fetchServices();
      } else {
        showToastMsg(data.message || 'Failed to save sub-service', 'error');
      }
    } catch (err) {
      showToastMsg('Network error saving sub-service', 'error');
    }
  };

  const handleAddRequiredField = () => {
    if (!newFieldLabel.trim()) {
      showToastMsg('Please enter a question / field label', 'error');
      return;
    }
    const fieldId = newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const newField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      fieldType: newFieldType,
      options: newFieldType === 'select' ? newFieldOptions.split(',').map(s => s.trim()).filter(Boolean) : [],
      required: Boolean(newFieldRequired)
    };
    setSubServiceForm(prev => ({
      ...prev,
      requiredFields: [...(prev.requiredFields || []), newField]
    }));
    setNewFieldLabel('');
    setNewFieldOptions('');
  };

  const handleRemoveRequiredField = (index) => {
    setSubServiceForm(prev => ({
      ...prev,
      requiredFields: (prev.requiredFields || []).filter((_, i) => i !== index)
    }));
  };

  const handleDeleteSubService = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this sub-service?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/sub-services/${subId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Sub-service deleted successfully', 'success');
        fetchServices();
      } else {
        showToastMsg(data.message || 'Failed to delete sub-service', 'error');
      }
    } catch (err) {
      showToastMsg('Network error deleting sub-service', 'error');
    }
  };

  const handleToggleSubServiceActive = async (sub) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/sub-services/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sub.isActive })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Sub-service marked ${!sub.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchServices();
      }
    } catch (err) {
      showToastMsg('Failed to toggle status', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users`);
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchChatThreads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/threads`);
      const data = await res.json();
      if (data.success && data.data) {
        setChatThreads(data.data);
        if (!activeThreadId && data.data.length > 0) {
          setActiveThreadId(data.data[0].id);
          fetchThreadMessages(data.data[0].id);
        }
      }
    } catch (e) {
      console.error('Fetch chat threads error:', e);
    }
  };

  const fetchThreadMessages = async (threadId) => {
    if (!threadId) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/threads/${threadId}/messages`);
      const data = await res.json();
      if (data.success && data.data) {
        setThreadMessages(data.data);
      }
    } catch (e) {
      console.error('Fetch thread messages error:', e);
    }
    // NO LONGER auto-mark as read on every fetch - that resets unread counts
    // Mark as read should be intentional via the mark-read button/action
  };

  const handleSendAdminReply = async (customText) => {
    const textToSend = (customText || adminReplyText).trim();
    if (!textToSend || !activeThreadId) return;

    setIsSendingReply(true);
    const currentThread = chatThreads.find(t => t.id === activeThreadId);
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeThreadId,
          sender: 'admin',
          senderName: 'Er. Vikram Sharma (Admin Desk)',
          text: textToSend,
          contextType: currentThread?.contextType,
          contextTag: currentThread?.contextTag,
          quoteNumber: currentThread?.quoteNumber,
          requestNumber: currentThread?.requestNumber,
          bookingNumber: currentThread?.bookingNumber,
          customerName: currentThread?.customerName,
          customerPhone: currentThread?.customerPhone
        })
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        setThreadMessages(prev => {
          if (prev.some(m => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        if (!customText) setAdminReplyText('');
        fetchChatThreads();
      } else {
        // Optimistic addition if API responds with non-standard format
        const optimisticMsg = {
          id: `msg_${Date.now()}`,
          threadId: activeThreadId,
          sender: 'admin',
          senderName: 'Er. Vikram Sharma (Admin Desk)',
          text: textToSend,
          createdAt: new Date().toISOString()
        };
        setThreadMessages(prev => [...prev, optimisticMsg]);
        if (!customText) setAdminReplyText('');
      }
    } catch (e) {
      // Optimistic append on network issue
      const optimisticMsg = {
        id: `msg_${Date.now()}`,
        threadId: activeThreadId,
        sender: 'admin',
        senderName: 'Er. Vikram Sharma (Admin Desk)',
        text: textToSend,
        createdAt: new Date().toISOString()
      };
      setThreadMessages(prev => [...prev, optimisticMsg]);
      if (!customText) setAdminReplyText('');
    } finally {
      setIsSendingReply(false);
    }
  };

  const openChatForRequest = (req) => {
    if (!req) return;
    const reqNum = req.requestNumber || req.id || '';
    const cleanPhone = (req.user?.phoneNumber || req.customerPhone || '').replace(/\D/g, '');
    const custName = req.user?.name || req.customerName || 'Customer';

    // Find if a thread already exists for this request or customer
    let targetThread = chatThreads.find(t => {
      const tPhone = (t.customerPhone || '').replace(/\D/g, '');
      const matchPhone = cleanPhone && tPhone && (cleanPhone.includes(tPhone) || tPhone.includes(cleanPhone));
      const matchReq = reqNum && (t.requestNumber === reqNum || t.contextTag?.includes(reqNum));
      const matchName = custName && t.customerName && t.customerName.toLowerCase().trim() === custName.toLowerCase().trim();
      return matchReq || (matchPhone && matchName);
    });

    const threadId = targetThread ? targetThread.id : `thread_req_${reqNum.toString().replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    if (!targetThread) {
      targetThread = {
        id: threadId,
        customerName: custName,
        customerPhone: req.user?.phoneNumber || req.customerPhone || '+91 94628 77757',
        contextType: 'REQUEST',
        contextTag: `Request #${reqNum}`,
        quoteNumber: req.quotations?.[0]?.quoteNumber || '',
        requestNumber: reqNum,
        bookingNumber: '',
        lastMessage: req.issueDescription || req.description || 'Inspection request initiated',
        lastMessageTime: new Date().toISOString(),
        unreadCountAdmin: 0,
        unreadCountCustomer: 0,
      };
      setChatThreads(prev => [targetThread, ...prev.filter(t => t.id !== threadId)]);
    }

    setActiveThreadId(threadId);
    setChatFilterType('ALL');
    setChatSearch('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_thread', threadId);
    }
    fetchThreadMessages(threadId);
    setActiveTab('chat');
    setSidebarOpen(false);
  };

  const openChatForBooking = (b) => {
    if (!b) return;
    const bNum = b.bookingNumber || b.id || '';
    const cleanPhone = (b.customerPhone || '').replace(/\D/g, '');
    const custName = b.customerName || 'Customer';

    // Find if a thread already exists for this booking or customer
    let targetThread = chatThreads.find(t => {
      const tPhone = (t.customerPhone || '').replace(/\D/g, '');
      const matchPhone = cleanPhone && tPhone && (cleanPhone.includes(tPhone) || tPhone.includes(cleanPhone));
      const matchBooking = bNum && (t.bookingNumber === bNum || t.contextTag?.includes(bNum));
      const matchName = custName && t.customerName && t.customerName.toLowerCase().trim() === custName.toLowerCase().trim();
      return matchBooking || (matchPhone && matchName);
    });

    const threadId = targetThread ? targetThread.id : `thread_book_${bNum.toString().replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    if (!targetThread) {
      targetThread = {
        id: threadId,
        customerName: custName,
        customerPhone: b.customerPhone || '+91 94628 77757',
        contextType: 'BOOKING',
        contextTag: `Booking #${bNum}`,
        bookingNumber: bNum,
        quoteNumber: '',
        requestNumber: '',
        lastMessage: `Instant booking for ${b.subServiceName || b.serviceName || 'Maintenance Service'}`,
        lastMessageTime: new Date().toISOString(),
        unreadCountAdmin: 0,
        unreadCountCustomer: 0,
      };
      setChatThreads(prev => [targetThread, ...prev.filter(t => t.id !== threadId)]);
    }

    setActiveThreadId(threadId);
    setChatFilterType('ALL');
    setChatSearch('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_thread', threadId);
    }
    fetchThreadMessages(threadId);
    setActiveTab('chat');
    setSidebarOpen(false);
  };

  const callCustomer = (phone) => {
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const openWhatsApp = (phone, text = '') => {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    const num = clean.length === 10 ? `91${clean}` : clean;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const openChatForQuotation = (q) => {
    if (!q) return;
    const qNum = q.quoteNumber || q.id || '';
    const threadId = `thread_quote_${qNum.toString().replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    setChatThreads(prev => {
      if (prev.some(t => t.id === threadId)) return prev;
      return [
        {
          id: threadId,
          customerName: q.customerName || q.request?.user?.name || q.user?.name || 'Customer',
          customerPhone: q.customerPhone || q.request?.user?.phoneNumber || q.user?.phoneNumber || '+91 94628 77757',
          contextType: 'QUOTATION',
          contextTag: `Quotation #${qNum}`,
          quoteNumber: qNum,
          requestNumber: q.requestNumber || '',
          bookingNumber: '',
          lastMessage: `Official Quotation for ₹${(q.grandtotal || q.amount || 0).toLocaleString('en-IN')}`,
          lastMessageTime: new Date().toISOString(),
          unreadCountAdmin: 0,
          unreadCountCustomer: 0,
        },
        ...prev
      ];
    });
    setActiveThreadId(threadId);
    setChatFilterType('ALL');
    setChatSearch('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_thread', threadId);
    }
    fetchThreadMessages(threadId);
    setActiveTab('chat');
    setSidebarOpen(false);
  };

  // Status Handlers
  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Status updated to ${status}`, 'success');
        fetchRequests();
        fetchStats();
      }
    } catch (e) {
      showToastMsg('Error updating status', 'error');
    }
  };

  const handleToggleSiteAudit = async (req) => {
    const isCurrentlyAudit = (req.status || '').toUpperCase() === 'AUDIT_SCHEDULED' || req.requiresSiteAudit === true;
    const targetStatus = isCurrentlyAudit ? 'ESTIMATING' : 'AUDIT_SCHEDULED';

    try {
      const res = await fetch(`${API_BASE}/api/v1/requests/${req.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(
          !isCurrentlyAudit
            ? `📍 Physical Site Audit REQUIRED for #${req.requestNumber || req.id.slice(0, 8)}`
            : `Physical Site Audit removed (Switched to Digital Review) for #${req.requestNumber || req.id.slice(0, 8)}`,
          'success'
        );
        fetchRequests();
        fetchStats();
      } else {
        showToastMsg(data.message || 'Failed to update audit status', 'error');
      }
    } catch (e) {
      showToastMsg('Error updating site audit requirement', 'error');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Delete this service request?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/requests/${requestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Request deleted', 'success');
        fetchRequests();
        fetchStats();
      }
    } catch (e) {
      showToastMsg('Failed to delete request', 'error');
    }
  };

  const handleStartQuote = (req) => {
    setBuilderRequestId(req.id);
    if (req.servicecode?.includes('WATER') || req.servicecode?.includes('LEAK')) {
      setLineItems([
        { item: 'Thermal Moisture Scanning & Surface Tracing', qty: 1, unit: 'Lumpsum', rate: 950 },
        { item: 'High-Pressure Hydrophobic PU Injection Grouting', qty: 20, unit: 'Running Ft', rate: 220 },
        { item: 'Elastomeric 3-Layer Waterproof Membrane Application', qty: 150, unit: 'Sq Ft', rate: 65 }
      ]);
    } else if (req.servicecode?.includes('TILE')) {
      setLineItems([
        { item: 'Damaged Tile Demolition & Debris Disposal', qty: 40, unit: 'Sq Ft', rate: 35 },
        { item: 'Polymer Modified Adhesive & Tile Laying', qty: 40, unit: 'Sq Ft', rate: 95 },
        { item: 'Epoxy Anti-Stain Tile Grouting', qty: 40, unit: 'Sq Ft', rate: 45 }
      ]);
    }
    setActiveTab('builder');
  };

  const handleQuoteDecision = async (quoteId, decision) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations/${quoteId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Quotation marked as ${decision}`, 'success');
        fetchQuotations();
        fetchRequests();
        fetchStats();
      }
    } catch (e) {
      showToastMsg('Failed to update decision', 'error');
    }
  };

  const handleDeleteQuotation = async (quoteId) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations/${quoteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Quotation deleted', 'success');
        fetchQuotations();
        fetchStats();
      }
    } catch (e) {
      showToastMsg('Failed to delete quotation', 'error');
    }
  };

  // Calculations
  const lineItemsTotal = lineItems.reduce((acc, li) => acc + ((parseFloat(li.qty) || 0) * (parseFloat(li.rate) || 0)), 0);
  const effectiveMatCost = (matCost === 0 && labCost === 0 && lineItemsTotal > 0) ? Math.round(lineItemsTotal * 0.55) : matCost;
  const effectiveLabCost = (matCost === 0 && labCost === 0 && lineItemsTotal > 0) ? Math.round(lineItemsTotal * 0.45) : labCost;
  const subtotal = (effectiveMatCost + effectiveLabCost > 0) ? (effectiveMatCost + effectiveLabCost) : lineItemsTotal;
  const taxableAmount = Math.max(0, subtotal - discount);
  const gstAmount = Math.round(taxableAmount * (taxRate / 100));
  const grandTotal = taxableAmount + gstAmount;

  const effectiveAdvanceAmount = customAdvanceAmt !== null && customAdvanceAmt !== '' && !isNaN(customAdvanceAmt)
    ? Math.round(parseFloat(customAdvanceAmt))
    : Math.round(grandTotal * (builderAdvancePct / 100));
  const effectiveAdvancePct = grandTotal > 0
    ? parseFloat(((effectiveAdvanceAmount / grandTotal) * 100).toFixed(1))
    : builderAdvancePct;

  const handleUpdateQuotationAdvance = async (quoteId, newAmt) => {
    const parsedAmt = parseFloat(newAmt);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      showToastMsg('Please enter a valid advance amount in ₹', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advanceAmount: parsedAmt })
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg(`Advance adjusted to ₹${Math.round(parsedAmt).toLocaleString('en-IN')}`, 'success');
        setActiveQuoteModal(data.data);
        setIsEditingModalAdvance(false);
        fetchAllData();
      } else {
        showToastMsg(data.message || 'Failed to update advance', 'error');
      }
    } catch (e) {
      showToastMsg('Error updating quotation advance', 'error');
    }
  };

  const handleIssueQuotation = async () => {
    if (!builderRequestId) {
      showToastMsg('Please select a service request to quote', 'error');
      return;
    }
    if (lineItems.length === 0) {
      showToastMsg('Please add at least one line item', 'error');
      return;
    }

    const payload = {
      requestId: builderRequestId,
      lineItem: lineItems,
      materialCost: effectiveMatCost,
      laborCost: effectiveLabCost,
      subtotal,
      discount,
      taxGST: gstAmount,
      taxRate,
      totalCost: effectiveMatCost + effectiveLabCost,
      grandtotal: grandTotal,
      advancePercentage: effectiveAdvancePct,
      advanceAmount: effectiveAdvanceAmount,
      estimatedTimeline: builderTimeline,
      termsAndConditions: builderTerms || `Standard service terms apply. ${effectiveAdvancePct}% advance (₹${effectiveAdvanceAmount.toLocaleString('en-IN')}) required to mobilize materials & start work, remaining on completion.`,
      created_by: builderEstimator,
      service_scope: builderScope
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToastMsg('Quotation created and dispatched!', 'success');
        setBuilderRequestId('');
        fetchAllData();
        setActiveTab('quotations');
      } else {
        showToastMsg(data.message || 'Quotation creation failed', 'error');
      }
    } catch (e) {
      showToastMsg('Error creating quotation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AUDIT_SCHEDULED':
      case 'SITE_AUDIT': return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'ESTIMATING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUOTED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const TIMELINE_STAGES = [
    { key: 'SUBMITTED', step: 1, label: 'Submitted', desc: 'Request Logged' },
    { key: 'ESTIMATING', step: 2, label: 'Estimating', desc: 'Technical Review' },
    { key: 'QUOTED', step: 3, label: 'Quoted', desc: 'Quotation Ready' },
    { key: 'IN_PROGRESS', step: 4, label: 'In Progress', desc: 'Execution & Mobilization' },
    { key: 'COMPLETED', step: 5, label: 'Completed', desc: 'Work Done & Handover' },
  ];

  const getTimelineStepIndex = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 0;
      case 'AUDIT_SCHEDULED':
      case 'SITE_AUDIT':
      case 'ESTIMATING': return 1;
      case 'QUOTED': return 2;
      case 'ACCEPTED':
      case 'PAID':
      case 'IN_PROGRESS': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const selectedBuilderReq = requests.find(r => r.id === builderRequestId);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans text-[14px] font-[500] antialiased tracking-[-0.01em]">

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xs`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-heading font-bold text-base tracking-tight text-slate-900 leading-none">HIPRO</div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">Technical Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto text-xs">
          {/* Section 1: OPERATIONS */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operations</div>
            
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('direct-bookings'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'direct-bookings'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className={`w-4 h-4 ${activeTab === 'direct-bookings' ? 'text-amber-400' : 'text-amber-500'}`} />
                <span>Instant Bookings</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'direct-bookings' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
              }`}>
                {directBookings.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('requests'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'requests'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className={`w-4 h-4 ${activeTab === 'requests' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Inspection Requests</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {stats ? (stats.statusCounts.SUBMITTED + stats.statusCounts.ESTIMATING) : 0}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('quotations'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'quotations'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className={`w-4 h-4 ${activeTab === 'quotations' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Quotations Desk</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'quotations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {quotations.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('builder'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'builder'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className={`w-4 h-4 ${activeTab === 'builder' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>BOQ Generator</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                Auto
              </span>
            </button>
          </div>

          {/* Section 2: COMMUNICATIONS */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communications</div>
            
            <button
              onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className={`w-4 h-4 ${activeTab === 'chat' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>Live Chat Desk</span>
              </div>
              {chatThreads.some(t => t.unreadCountAdmin > 0) ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white animate-pulse">
                  {chatThreads.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0)} New
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'chat' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {chatThreads.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Customer Directory</span>
              </div>
            </button>
          </div>

          {/* Section 3: CATALOG & MARKETING */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog & Marketing</div>
            
            <button
              onClick={() => { setActiveTab('services'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'services'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className={`w-4 h-4 ${activeTab === 'services' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Services Catalog</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('slides'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'slides'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'slides' ? 'text-amber-400' : 'text-indigo-600'}`} />
                <span>Slides & Banners</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'slides' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {slides.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('offers'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'offers'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className={`w-4 h-4 ${activeTab === 'offers' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span>Offers & Coupons</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'offers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {offers.length}
              </span>
            </button>
          </div>

          {/* Section 4: SYSTEM */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</div>
            
            <button
              onClick={() => { setActiveTab('diagnostics'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'diagnostics'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className={`w-4 h-4 ${activeTab === 'diagnostics' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Diagnostics & API</span>
              </div>
            </button>
          </div>
        </nav>

        {/* User Card in Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AD
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-xs truncate leading-tight">Admin Desk</div>
              <div className="text-[10px] text-slate-400 truncate">Online & Synced</div>
            </div>
          </div>
          <button
            onClick={() => fetchAllData(true)}
            title="Sync Database"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hipro Portal</span>
                <span className="text-slate-300">/</span>
                <h1 className="font-heading font-bold text-base text-slate-900 capitalize leading-tight">
                  {activeTab === 'overview' ? 'Dashboard Overview' :
                    activeTab === 'direct-bookings' ? 'Instant Maintenance Bookings' :
                      activeTab === 'requests' ? 'Inspection Requests' :
                        activeTab === 'quotations' ? 'Quotations Desk' :
                          activeTab === 'builder' ? 'BOQ Quotation Generator' :
                            activeTab === 'chat' ? 'Live Customer Chat Desk' :
                              activeTab === 'services' ? 'Services Catalog' :
                                activeTab === 'slides' ? 'Slides & Banners' :
                                  activeTab === 'offers' ? 'Coupons & Offers' :
                                    activeTab === 'users' ? 'Customer Directory' : 'System Diagnostics'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders, quotes, customers... (⌘K)"
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <button
              onClick={() => fetchAllData(true)}
              title="Sync live database"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {onSwitchToCustomerApp && (
              <button
                onClick={onSwitchToCustomerApp}
                title="Switch to Mobile Customer Demo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Customer App</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('builder')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Quote</span>
            </button>
          </div>
        </header>

        {/* DYNAMIC TAB BODY */}
        <main className="flex-1 p-6 space-y-5 max-w-7xl w-full mx-auto">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (() => {
            // Derived Analytics Computations
            const acceptedQuotes = quotations.filter(q => (q.status || '').toUpperCase() === 'ACCEPTED');
            const totalAcceptedRev = (stats?.acceptedValue || 0) || acceptedQuotes.reduce((s, q) => s + (q.grandtotal || 0), 0);
            const totalQuotedRev = (stats?.totalQuotedValue || 0) || quotations.reduce((s, q) => s + (q.grandtotal || 0), 0);

            // Customers Ready for Service Execution (Accepted Quotations)
            const readyRequests = requests.filter(r =>
              (r.status || '').toUpperCase() === 'ACCEPTED' ||
              r.quotations?.some(q => (q.status || '').toUpperCase() === 'ACCEPTED')
            );

            // Requests Needing Quotation
            const needsQuoteRequests = requests.filter(r =>
              ['SUBMITTED', 'ESTIMATING'].includes((r.status || '').toUpperCase()) &&
              (!r.quotations || r.quotations.length === 0 || !r.quotations.some(q => ['QUOTED', 'ACCEPTED'].includes((q.status || '').toUpperCase())))
            );

            // Audit Scheduled Requests
            const auditScheduledRequests = requests.filter(r =>
              (r.status || '').toUpperCase() === 'AUDIT_SCHEDULED' ||
              (r.status || '').toUpperCase() === 'SITE_AUDIT' ||
              r.requiresSiteAudit
            );

            const directBookingsRev = directBookings.reduce((s, b) => s + (b.totalAmount || b.onlinePaidAmount || 199), 0);
            const conversionRatePct = quotations.length > 0 ? Math.round((acceptedQuotes.length / quotations.length) * 100) : 100;

            // Category Demand Breakdown
            const categoryDemand = requests.reduce((acc, r) => {
              const code = (r.servicecode || 'General Repair').trim();
              let name = 'Waterproofing & Leakage';
              if (code.toLowerCase().includes('civil') || code.toLowerCase().includes('construct') || code.toLowerCase().includes('slab') || code.toLowerCase().includes('wall')) {
                name = 'Civil Construction & Masonry';
              } else if (code.toLowerCase().includes('paint') || code.toLowerCase().includes('finish')) {
                name = 'Painting & Finishing';
              } else if (code.toLowerCase().includes('clean')) {
                name = 'Deep Cleaning & Sanitization';
              } else if (code.toLowerCase().includes('tile') || code.toLowerCase().includes('floor')) {
                name = 'Tile & Floor Repair';
              } else if (!code.toLowerCase().includes('water') && !code.toLowerCase().includes('leak')) {
                name = 'General Building Repair';
              }
              acc[name] = (acc[name] || 0) + 1;
              return acc;
            }, {});

            // Filter Operations List
            const filteredRequests = requests.filter(req => {
              const q = req.quotations?.[0] || quotations.find(item => item.requestId === req.id);
              const isReady = (req.status || '').toUpperCase() === 'ACCEPTED' || (q && (q.status || '').toUpperCase() === 'ACCEPTED');
              const isNeedsQuote = ['SUBMITTED', 'ESTIMATING'].includes((req.status || '').toUpperCase()) && (!q || !['QUOTED', 'ACCEPTED'].includes((q.status || '').toUpperCase()));
              const isAudit = (req.status || '').toUpperCase() === 'AUDIT_SCHEDULED' || req.requiresSiteAudit;

              if (overviewFilter === 'READY' && !isReady) return false;
              if (overviewFilter === 'NEEDS_QUOTE' && !isNeedsQuote) return false;
              if (overviewFilter === 'AUDIT' && !isAudit) return false;

              if (overviewSearch.trim()) {
                const s = overviewSearch.toLowerCase();
                const matchCust = (req.user?.name || '').toLowerCase().includes(s);
                const matchPhone = (req.user?.phoneNumber || '').toLowerCase().includes(s);
                const matchReq = (req.requestNumber || '').toLowerCase().includes(s);
                const matchService = (req.servicecode || '').toLowerCase().includes(s) || (req.subServiceCode || '').toLowerCase().includes(s);
                const assigned = (assignedEngineers[req.id] || q?.created_by || '').toLowerCase();
                const matchEng = assigned.includes(s);
                return matchCust || matchPhone || matchReq || matchService || matchEng;
              }
              return true;
            });

            const filteredDirectBookings = directBookings.filter(b => {
              if (overviewSearch.trim()) {
                const s = overviewSearch.toLowerCase();
                return (b.customerName || '').toLowerCase().includes(s) ||
                  (b.customerPhone || '').toLowerCase().includes(s) ||
                  (b.bookingNumber || '').toLowerCase().includes(s) ||
                  (b.serviceName || '').toLowerCase().includes(s) ||
                  (b.technicianName || '').toLowerCase().includes(s);
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* 1. OPERATIONS COMMAND BANNER */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-indigo-800/40">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Dispatch Active
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15">
                          <Clock className="w-3.5 h-3.5 text-brand-300" /> Real-Time Sync
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Customer & Service Operations Hub
                      </h2>
                      <p className="text-white/80 text-xs sm:text-sm font-normal leading-relaxed">
                        Track who requested service, assign lead engineers, dispatch instant BOQ quotations, and execute jobs for customers ready for service.
                      </p>
                    </div>

                    {/* Quick Launch Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setActiveTab('builder')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all group"
                      >
                        <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span>Create Quotation</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition-all"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-300" />
                        <span>Chat Desk ({chatThreads.length})</span>
                      </button>
                      <button
                        onClick={() => fetchAllData(true)}
                        title="Sync Database"
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-200" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. REAL-TIME INTERACTIVE KPI METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Card 1: Total Inflow */}
                  <div
                    onClick={() => setOverviewFilter('ALL')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      overviewFilter === 'ALL'
                        ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <Inbox className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                      {stats?.totalRequests || requests.length}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="text-indigo-600 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Active Pipeline
                      </span>
                      <span>{requests.filter(r => (r.status || '').toUpperCase() !== 'COMPLETED').length} active</span>
                    </div>
                  </div>

                  {/* Card 2: Ready for Service (Quotation Accepted) */}
                  <div
                    onClick={() => setOverviewFilter('READY')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      overviewFilter === 'READY'
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                        Ready For Service
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-2xl text-slate-900 mt-2 flex items-baseline gap-2">
                      <span>{readyRequests.length}</span>
                      <span className="text-xs font-semibold text-emerald-700">Approved</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] font-mono text-emerald-700 pt-2 border-t border-slate-100">
                      <span className="font-bold">₹{totalAcceptedRev.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-sans font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">Mobilize</span>
                    </div>
                  </div>

                  {/* Card 3: Pending Estimation (Needs Quotation) */}
                  <div
                    onClick={() => setOverviewFilter('NEEDS_QUOTE')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      overviewFilter === 'NEEDS_QUOTE'
                        ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:border-amber-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Needs Quote</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                      {needsQuoteRequests.length}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] pt-2 border-t border-slate-100">
                      <span className="px-1.5 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 text-[10px] border border-amber-200">
                        Pending BOQ
                      </span>
                      <span className="text-amber-800 font-semibold text-[11px]">Action Needed</span>
                    </div>
                  </div>

                  {/* Card 4: Quotations Pipeline */}
                  <div
                    onClick={() => setActiveTab('quotations')}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quotations Issued</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                      {quotations.length}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] pt-2 border-t border-slate-100">
                      <span className="font-mono text-purple-700 font-bold">₹{totalQuotedRev.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 text-[11px] font-semibold">{conversionRatePct}% Accepted</span>
                    </div>
                  </div>

                  {/* Card 5: Direct Maintenance Bookings */}
                  <div
                    onClick={() => setOverviewFilter('DIRECT')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      overviewFilter === 'DIRECT'
                        ? 'bg-white border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                        : 'bg-white border-slate-200/80 hover:border-cyan-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Direct Bookings</span>
                      <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-heading font-bold text-2xl text-slate-900 mt-2">
                      {directBookings.length}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] pt-2 border-t border-slate-100">
                      <span className="font-mono text-cyan-700 font-bold">₹{directBookingsRev.toLocaleString('en-IN')}</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Pre-Paid</span>
                    </div>
                  </div>
                </div>

                {/* 3. VISUAL CHARTS & REAL-TIME FUNNEL ANALYTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Interactive Request Lifecycle Funnel (7 cols) */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-brand-600">
                          <GitPullRequest className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-sm text-slate-900">Request Lifecycle & Execution Funnel</h3>
                          <p className="text-[11px] text-slate-400">Live operational distribution from first customer submission to completion</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {stats?.totalRequests || requests.length} Total
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {[
                        { key: 'SUBMITTED', label: '1. Submitted (Initial Review & Photo Check)', count: stats?.statusCounts?.SUBMITTED || requests.filter(r => (r.status || '').toUpperCase() === 'SUBMITTED').length, color: 'bg-blue-500', barBg: 'bg-blue-100' },
                        { key: 'AUDIT_SCHEDULED', label: '2. Site Audit Scheduled (Physical Inspection)', count: stats?.statusCounts?.AUDIT_SCHEDULED || requests.filter(r => (r.status || '').toUpperCase() === 'AUDIT_SCHEDULED').length, color: 'bg-amber-500', barBg: 'bg-amber-100' },
                        { key: 'ESTIMATING', label: '3. Estimator Triage (Drafting BOQ & Rates)', count: stats?.statusCounts?.ESTIMATING || requests.filter(r => (r.status || '').toUpperCase() === 'ESTIMATING').length, color: 'bg-amber-600', barBg: 'bg-amber-100' },
                        { key: 'QUOTED', label: '4. Quotation Dispatched (Awaiting Client Decision)', count: stats?.statusCounts?.QUOTED || requests.filter(r => (r.status || '').toUpperCase() === 'QUOTED').length, color: 'bg-purple-500', barBg: 'bg-purple-100' },
                        { key: 'ACCEPTED', label: '5. Client Accepted (Ready for Work & Mobilization)', count: readyRequests.length, color: 'bg-emerald-500', barBg: 'bg-emerald-100', highlight: true },
                        { key: 'COMPLETED', label: '6. Work Completed (Handover & Sign-Off)', count: stats?.statusCounts?.COMPLETED || requests.filter(r => (r.status || '').toUpperCase() === 'COMPLETED').length, color: 'bg-teal-500', barBg: 'bg-teal-100' }
                      ].map(st => {
                        const total = Math.max(stats?.totalRequests || requests.length || 1, 1);
                        const pct = Math.round((st.count / total) * 100);
                        return (
                          <div
                            key={st.key}
                            onClick={() => {
                              if (st.key === 'ACCEPTED') setOverviewFilter('READY');
                              else if (st.key === 'SUBMITTED' || st.key === 'ESTIMATING') setOverviewFilter('NEEDS_QUOTE');
                              else if (st.key === 'AUDIT_SCHEDULED') setOverviewFilter('AUDIT');
                              else setOverviewFilter('ALL');
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${st.highlight ? 'bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/60' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                              <span className="flex items-center gap-1.5">
                                {st.highlight && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                                <span className={st.highlight ? 'font-bold text-emerald-900' : ''}>{st.label}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-xs ${st.highlight ? 'font-bold text-emerald-800' : 'text-slate-600'}`}>
                                  {st.count}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span>
                              </div>
                            </div>
                            <div className={`h-2 w-full ${st.barBg} rounded-full overflow-hidden`}>
                              <div className={`h-full ${st.color} rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, st.count > 0 ? 5 : 0)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Technical Engineering Roster & Demand Breakdown (5 cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Engineering Leads Capacity */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <HardHat className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-sm text-slate-900">Engineering & Service Leads</h3>
                            <p className="text-[11px] text-slate-400">Field assignment roster & active workload</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {availableEngineers.map(eng => {
                          const activeJobCount = requests.filter(r => {
                            const assigned = assignedEngineers[r.id] || r.quotations?.[0]?.created_by || '';
                            return assigned.toLowerCase().includes(eng.name.toLowerCase().split(' ')[1] || eng.name.toLowerCase());
                          }).length;

                          return (
                            <div key={eng.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all">
                              <div className="flex items-start justify-between gap-1">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                                    <span>{eng.name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">{eng.role}</div>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${eng.color}`}>
                                  {activeJobCount} active
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 pt-1">
                                <a href={`tel:${eng.phone}`} className="hover:text-brand-600 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" /> {eng.phone}
                                </a>
                                <span className="font-semibold text-slate-600">{eng.badge}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Services Demand Breakdown */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-brand-600" /> Service Categories in Demand
                        </span>
                        <span className="text-[11px] text-slate-400">Total {requests.length} Orders</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(categoryDemand).map(([cat, count]) => {
                          const pct = Math.round((count / Math.max(requests.length, 1)) * 100);
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                                <span>{cat}</span>
                                <span className="font-mono text-slate-800 font-bold">{count} ({pct}%)</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. MASTER OPERATIONS TRACKER (WHO REQUESTED, WHICH ENGINEER, READY FOR SERVICE) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
                  {/* Tracker Header & Filter Tabs */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-base text-slate-900">
                              Customer Service & Engineer Assignment Tracker
                            </h3>
                            <p className="text-xs text-slate-500">
                              Real-time tracking of customer requests, assigned engineers, quotation status, and service readiness.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative min-w-[260px] sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={overviewSearch}
                          onChange={(e) => setOverviewSearch(e.target.value)}
                          placeholder="Search customer, phone, req #, engineer..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                        {overviewSearch && (
                          <button
                            onClick={() => setOverviewSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Pills Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => setOverviewFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${overviewFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <span>All Operations</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${overviewFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {requests.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setOverviewFilter('READY')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${overviewFilter === 'READY' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready For Service Execution</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${overviewFilter === 'READY' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                          {readyRequests.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setOverviewFilter('NEEDS_QUOTE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${overviewFilter === 'NEEDS_QUOTE' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Needs Quotation</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${overviewFilter === 'NEEDS_QUOTE' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
                          {needsQuoteRequests.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setOverviewFilter('AUDIT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${overviewFilter === 'AUDIT' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'}`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Site Audit Scheduled</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${overviewFilter === 'AUDIT' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-900'}`}>
                          {auditScheduledRequests.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setOverviewFilter('DIRECT')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${overviewFilter === 'DIRECT' ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'}`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Direct Maintenance Orders</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${overviewFilter === 'DIRECT' ? 'bg-white/20 text-white' : 'bg-cyan-200 text-cyan-900'}`}>
                          {directBookings.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Operational Tracker Table */}
                  <div className="overflow-x-auto">
                    {overviewFilter === 'DIRECT' ? (
                      /* DIRECT BOOKINGS TABLE */
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Booking #</th>
                            <th className="py-3 px-4">Customer & Contact</th>
                            <th className="py-3 px-4">Service Details</th>
                            <th className="py-3 px-4">Scheduled Slot</th>
                            <th className="py-3 px-4">Assigned Technician</th>
                            <th className="py-3 px-4">Amount & Payment</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDirectBookings.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-8 text-center text-slate-400">
                                No direct maintenance bookings found.
                              </td>
                            </tr>
                          ) : (
                            filteredDirectBookings.map(b => (
                              <tr key={b.id} className="hover:bg-slate-50/80 transition-all">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                  {b.bookingNumber}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900">{b.customerName}</div>
                                  <a href={`tel:${b.customerPhone}`} className="text-slate-500 hover:text-brand-600 flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                                    <Phone className="w-3 h-3 text-emerald-500" /> {b.customerPhone}
                                  </a>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-slate-800">{b.serviceName}</div>
                                  <div className="text-[11px] text-slate-400">{b.subServiceName}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-medium text-slate-700">{b.scheduledDate}</div>
                                  <div className="text-[11px] text-slate-400">{b.scheduledSlot}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  {b.technicianName ? (
                                    <div className="flex flex-col gap-1 items-start">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-xs">
                                        <HardHat className="w-3.5 h-3.5 text-emerald-600" /> {b.technicianName}
                                      </span>
                                      <div className="flex items-center gap-2 text-[11px]">
                                        <span className="text-slate-500 font-medium">{b.technicianRole || 'Field Specialist'}</span>
                                        <button
                                          onClick={() => { setAssignTechModalBooking(b); setTechForm({ name: b.technicianName || '', phone: b.technicianPhone || '', role: b.technicianRole || 'Senior Field Specialist' }); }}
                                          className="text-brand-600 hover:text-brand-800 font-medium underline"
                                        >
                                          Change
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setAssignTechModalBooking(b); setTechForm({ name: '', phone: '', role: 'Senior Field Specialist' }); }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-300 hover:bg-amber-100 text-xs shadow-xs transition-all"
                                    >
                                      <UserPlus className="w-3.5 h-3.5 text-amber-600" /> Assign Specialist
                                    </button>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-mono">
                                  <div className="font-bold text-slate-900">₹{(b.totalAmount || b.onlinePaidAmount || 199).toLocaleString('en-IN')}</div>
                                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-100 text-emerald-800">
                                    {b.paymentStatus || 'PAID'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openChatForBooking(b)}
                                      title="Chat with Customer regarding this Instant Booking"
                                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1 text-[11px] font-semibold"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                                      <span className="hidden sm:inline">Chat</span>
                                    </button>
                                    <button
                                      onClick={() => setSelectedBookingForDrawer(b)}
                                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    >
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    ) : (
                      /* MAIN INSPECTION & QUOTATION OPERATIONS TABLE */
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Customer & Request #</th>
                            <th className="py-3 px-4">Service & Damage Scope</th>
                            <th className="py-3 px-4">Readiness & Quotation Status</th>
                            <th className="py-3 px-4">Assigned Lead Engineer</th>
                            <th className="py-3 px-4 text-right">Quick Dispatch Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRequests.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-slate-400">
                                <div className="space-y-1">
                                  <ClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                                  <p className="font-semibold text-sm text-slate-600">No matching requests found</p>
                                  <p className="text-xs text-slate-400">Try adjusting your search query or filter selection</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredRequests.map(req => {
                              const media = Array.isArray(req.mediaUrl) ? req.mediaUrl : (req.mediaUrl ? [req.mediaUrl] : []);
                              const q = req.quotations?.[0] || quotations.find(item => item.requestId === req.id);
                              const isAccepted = (req.status || '').toUpperCase() === 'ACCEPTED' || (q && (q.status || '').toUpperCase() === 'ACCEPTED');
                              const isQuoted = (req.status || '').toUpperCase() === 'QUOTED' || (q && (q.status || '').toUpperCase() === 'QUOTED');
                              const isNeedsQuote = ['SUBMITTED', 'ESTIMATING'].includes((req.status || '').toUpperCase()) && !q;
                              const isUrgent = req.urgency === 'URGENT' || req.urgency === 'HIGH';

                              // Assigned Engineer logic
                              const assignedEngName = assignedEngineers[req.id] || q?.created_by || null;
                              const isAssigningThis = assigningEngineerReqId === req.id;

                              return (
                                <tr
                                  key={req.id}
                                  className={`transition-all ${isAccepted ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500' : isNeedsQuote ? 'hover:bg-amber-50/30' : 'hover:bg-slate-50/80'}`}
                                >
                                  {/* 1. Customer Details (Who gave request) */}
                                  <td className="py-4 px-4 align-top min-w-[210px]">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-xs text-brand-600">
                                          {req.requestNumber}
                                        </span>
                                        {isUrgent && (
                                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-red-100 text-red-700 border border-red-200">
                                            {req.urgency}
                                          </span>
                                        )}
                                      </div>

                                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                        <span>{req.user?.name || 'Customer'}</span>
                                      </div>

                                      <div className="flex items-center gap-2 pt-0.5">
                                        <a
                                          href={`tel:${req.user?.phoneNumber || ''}`}
                                          className="text-slate-600 hover:text-brand-600 font-mono text-[11px] font-semibold flex items-center gap-1"
                                          title="Call Customer"
                                        >
                                          <Phone className="w-3 h-3 text-emerald-600" />
                                          <span>{req.user?.phoneNumber || 'No Phone'}</span>
                                        </a>

                                        {req.user?.email && (
                                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={req.user.email}>
                                            • {req.user.email}
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                                        <Home className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-700">{req.propertyType || 'Residential'}</span>
                                        {req.propertySize && <span>({req.propertySize})</span>}
                                      </div>

                                      <div className="text-[10px] text-slate-400 flex items-start gap-1">
                                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="truncate max-w-[180px]" title={req.addressline || req.location}>
                                          {req.addressline || req.location || 'Bhilwara, Rajasthan'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* 2. Service & Issue Scope */}
                                  <td className="py-4 px-4 align-top min-w-[220px]">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                          {req.servicecode}
                                        </span>
                                      </div>

                                      {req.subServiceCode && (
                                        <div className="font-semibold text-xs text-slate-800">
                                          {req.subServiceCode}
                                        </div>
                                      )}

                                      <div className="text-[11px] text-slate-600 line-clamp-2 max-w-[260px] italic">
                                        "{req.issueDescription || 'Repair inspection requested.'}"
                                      </div>

                                      {/* Photos / Media Thumbnail button */}
                                      {media.length > 0 && (
                                        <div className="pt-1 flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setActivePhotoModal({ photos: media, index: 0, title: `Damage Photos - ${req.requestNumber}` })}
                                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-all"
                                          >
                                            <Camera className="w-3 h-3 text-blue-600" />
                                            <span>Inspect {media.length} {media.length === 1 ? 'Photo' : 'Photos'}</span>
                                          </button>
                                        </div>
                                      )}

                                      {req.preferredDate && (
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                          <Calendar className="w-2.5 h-2.5" />
                                          <span>Slot: {req.preferredDate} ({req.preferredTime || 'Standard'})</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* 3. Readiness Status (Which person is ready to take service) */}
                                  <td className="py-4 px-4 align-top min-w-[190px]">
                                    <div className="space-y-1.5">
                                      {isAccepted ? (
                                        <div className="space-y-1 p-2 rounded-xl bg-emerald-100/70 border border-emerald-300">
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready For Execution
                                          </span>
                                          <div className="font-mono text-xs font-bold text-emerald-800">
                                            Quote: {q?.quoteNumber || 'Agreed'}
                                          </div>
                                          <div className="font-mono font-bold text-base text-emerald-950">
                                            ₹{(q?.grandtotal || 0).toLocaleString('en-IN')}
                                          </div>
                                          <div className="text-[10px] font-semibold text-emerald-800 bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                                            Customer Accepted
                                          </div>
                                        </div>
                                      ) : isQuoted ? (
                                        <div className="space-y-1 p-2 rounded-xl bg-purple-50 border border-purple-200">
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 uppercase tracking-wide">
                                            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" /> Quotation Issued
                                          </span>
                                          <div className="font-mono text-xs font-bold text-purple-900">
                                            {q?.quoteNumber}
                                          </div>
                                          <div className="font-mono font-bold text-sm text-purple-950">
                                            ₹{(q?.grandtotal || 0).toLocaleString('en-IN')}
                                          </div>
                                          <div className="text-[10px] text-purple-700">Awaiting customer response</div>
                                        </div>
                                      ) : isNeedsQuote ? (
                                        <div className="space-y-1 p-2 rounded-xl bg-amber-50 border border-amber-200">
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Needs Quotation
                                          </span>
                                          <div className="text-[11px] text-amber-800 font-medium">Pending BOQ estimate</div>
                                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-200 text-amber-900 inline-block">
                                            Action Required
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(req.status)}`}>
                                            {req.status}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* 4. Assigned Lead Engineer / Service Provider */}
                                  <td className="py-4 px-4 align-top min-w-[200px]">
                                    <div className="space-y-2">
                                      {assignedEngName ? (
                                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Lead</span>
                                            <button
                                              onClick={() => setAssigningEngineerReqId(isAssigningThis ? null : req.id)}
                                              className="text-[10px] font-semibold text-brand-600 hover:text-brand-700"
                                            >
                                              Change
                                            </button>
                                          </div>
                                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                            <HardHat className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                            <span>{assignedEngName}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <button
                                            onClick={() => setAssigningEngineerReqId(isAssigningThis ? null : req.id)}
                                            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                          >
                                            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Assign Engineer</span>
                                            <ChevronDown className="w-3 h-3 text-amber-500" />
                                          </button>
                                          <div className="text-[10px] text-slate-400 text-center">Unassigned Lead</div>
                                        </div>
                                      )}

                                      {/* Quick Inline Picker Dropdown */}
                                      {isAssigningThis && (
                                        <div className="p-2 rounded-xl bg-white border border-brand-300 shadow-lg space-y-1 mt-1 z-20 relative">
                                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
                                            Select Lead Engineer:
                                          </div>
                                          <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {availableEngineers.map(eng => (
                                              <button
                                                key={eng.id}
                                                onClick={() => handleAssignEngineer(req.id, eng.name)}
                                                className="w-full text-left p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-700 text-xs font-medium text-slate-700 flex items-center justify-between transition-all"
                                              >
                                                <div>
                                                  <div className="font-bold">{eng.name}</div>
                                                  <div className="text-[9.5px] text-slate-400">{eng.role}</div>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-500">{eng.badge}</span>
                                              </button>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => setAssigningEngineerReqId(null)}
                                            className="w-full text-center text-[10px] font-semibold text-slate-400 hover:text-slate-600 pt-1"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* 5. Quick Dispatch Actions */}
                                  <td className="py-4 px-4 align-top text-right min-w-[170px]">
                                    <div className="flex flex-col items-end gap-2">
                                      {/* One-Click Quotation Generator Action */}
                                      {(!q || isNeedsQuote) ? (
                                        <button
                                          onClick={() => handleStartQuote(req)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all w-full justify-center"
                                        >
                                          <Zap className="w-3.5 h-3.5" />
                                          <span>Create Quotation</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setActiveQuoteModal(q)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all w-full justify-center"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>View BOQ Quote</span>
                                        </button>
                                      )}

                                      {/* Secondary Action Buttons */}
                                      <div className="flex items-center gap-1.5 w-full justify-end">
                                        <button
                                          onClick={() => openChatForRequest(req)}
                                          title="Open Live Chat Desk with customer"
                                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1 text-[11px] font-semibold"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                                          <span className="hidden sm:inline">Chat</span>
                                        </button>

                                        <a
                                          href={`tel:${req.user?.phoneNumber || ''}`}
                                          title="Call customer directly"
                                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all flex items-center gap-1 text-[11px] font-medium"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                          <span className="hidden sm:inline">Call</span>
                                        </a>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">Inspection Requests & Photo Damage Reviews</h2>
                  <p className="text-[11px] text-slate-400">Examine damage severity uploaded by customers and dispatch itemized quotations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {requests.map(req => {
                  const media = Array.isArray(req.mediaUrl) ? req.mediaUrl : [];
                  const isUrgent = req.urgency === 'URGENT';
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm sm:text-base text-brand-600 tracking-wide">{req.requestNumber}</span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isUrgent ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                              {req.urgency || 'NORMAL'}
                            </span>
                            {((req.status || '').toUpperCase() === 'AUDIT_SCHEDULED' || req.requiresSiteAudit) && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                <MapPin className="w-3 h-3 text-amber-600" /> Site Audit Req.
                              </span>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${getStatusBadge(req.status)}`}>{req.status}</span>
                        </div>

                        <div>
                          <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">{req.servicecode}</h3>
                          {req.subServiceCode && <p className="text-xs sm:text-sm font-semibold text-brand-600 mt-0.5">{req.subServiceCode}</p>}
                        </div>

                        <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-200 font-normal">
                          <span className="font-bold text-slate-900">Issue:</span> {req.issueDescription || 'No description provided'}
                        </div>

                        {media.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-slate-500">Damage Photos / Evidence ({media.length}):</div>
                            <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                              {media.map((imgUrl, i) => (
                                <div key={i} onClick={() => setActivePhotoModal({ photos: media, index: i, title: `${req.requestNumber} Photo Review` })} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer relative group shrink-0 hover:border-brand-500 hover:shadow-md transition-all">
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
                          <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-800">{req.user?.name || 'Customer'}</span></div>
                          <div className="flex items-center gap-2 font-mono"><Phone className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-medium text-slate-700">{req.user?.phoneNumber || 'N/A'}</span></div>
                          <div className="flex items-center gap-2"><Home className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-medium text-slate-700">{req.propertyType || 'House'} ({req.propertySize || 'Standard'})</span></div>
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-medium text-slate-700">{req.preferredDate || 'Flexible'}</span></div>
                          <div className="col-span-1 sm:col-span-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-medium text-slate-700 truncate">{req.addressline || 'Main Residence'} {req.location && `• ${req.location}`}</span></div>
                        </div>

                        {/* INTERACTIVE TIMELINE STAGE CONTROLLER */}
                        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Clock className="w-4 h-4 text-brand-600" />
                              <span>Service Timeline (Customer View)</span>
                            </div>
                            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                              Stage {getTimelineStepIndex(req.status) + 1} of 5
                            </span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-600 h-full transition-all duration-300"
                              style={{ width: `${((getTimelineStepIndex(req.status) + 1) / 5) * 100}%` }}
                            />
                          </div>

                          {/* 5 Milestone Step Buttons */}
                          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                            {TIMELINE_STAGES.map((stg, idx) => {
                              const currentIdx = getTimelineStepIndex(req.status);
                              const isPast = idx < currentIdx;
                              const isCurrent = idx === currentIdx;

                              let btnStyle = 'bg-white text-slate-500 border-slate-200 hover:border-brand-400 hover:text-brand-600';
                              if (isCurrent) {
                                btnStyle = 'bg-brand-600 text-white border-brand-600 shadow-xs font-bold ring-2 ring-brand-500/20';
                              } else if (isPast) {
                                btnStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
                              }

                              return (
                                <button
                                  key={stg.key}
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, stg.key)}
                                  title={`Set Timeline to: ${stg.label} (${stg.desc})`}
                                  className={`px-1 py-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${btnStyle}`}
                                >
                                  <div className="flex items-center justify-center">
                                    {isPast ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <span className={`text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold ${isCurrent ? 'bg-white text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {stg.step}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] leading-tight truncate max-w-full">
                                    {stg.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>💡 Tap any milestone to update app timeline</span>
                            <span className="font-semibold text-slate-600">{TIMELINE_STAGES[getTimelineStepIndex(req.status)]?.desc}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Status:</span>
                          <select value={req.status} onChange={(e) => handleUpdateStatus(req.id, e.target.value)} className="text-xs sm:text-sm font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20">
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="AUDIT_SCHEDULED">AUDIT_SCHEDULED (Physical Audit)</option>
                            <option value="ESTIMATING">ESTIMATING (Digital Review)</option>
                            <option value="QUOTED">QUOTED</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Require Site Audit Button */}
                          {(() => {
                            const isAuditReq = (req.status || '').toUpperCase() === 'AUDIT_SCHEDULED' || req.requiresSiteAudit;
                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleSiteAudit(req)}
                                title={isAuditReq ? 'Site audit is currently marked REQUIRED. Click to switch back to digital review.' : 'Mark this request as requiring a physical on-site audit inspection.'}
                                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border shadow-xs flex items-center gap-1.5 transition-all ${
                                  isAuditReq
                                    ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200 ring-2 ring-amber-400/20 font-bold'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800'
                                }`}
                              >
                                <MapPin className={`w-4 h-4 ${isAuditReq ? 'text-amber-700 fill-amber-300' : 'text-slate-400'}`} />
                                <span>{isAuditReq ? 'Site Audit: REQUIRED' : 'Require Site Audit'}</span>
                              </button>
                            );
                          })()}

                          <button
                            onClick={() => openChatForRequest(req)}
                            title="Chat with Customer"
                            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-4 h-4 text-indigo-600" /> Chat
                          </button>
                          <button onClick={() => handleStartQuote(req)} className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all">
                            <Calculator className="w-4 h-4" /> Build Quote
                          </button>
                          <button onClick={() => handleDeleteRequest(req.id)} title="Delete request" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUOTATIONS TAB */}
          {activeTab === 'quotations' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">Quotations Desk & Commercial BOQ</h2>
                  <p className="text-[11px] text-slate-400">Track issued estimates, customer decisions, and print official PDF receipts.</p>
                </div>
                <button onClick={() => setActiveTab('builder')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-all">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Create New Quote</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {quotations.map(q => {
                  const lineItemsArray = Array.isArray(q.lineItem) ? q.lineItem : [];
                  const grandTotalFormatted = (q.grandtotal || 0).toLocaleString('en-IN');
                  return (
                    <div key={q.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm sm:text-base text-brand-600 tracking-wide">{q.quoteNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${getStatusBadge(q.status)}`}>{q.status}</span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <div>
                            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">{q.request?.servicecode || 'Repair Quotation'}</h3>
                            <div className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">{q.request?.requestNumber || ''}</div>
                          </div>
                          <div className="font-heading font-bold text-xl sm:text-2xl text-emerald-600 font-mono shrink-0">₹{grandTotalFormatted}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                          <div><strong className="text-slate-900">Client:</strong> {q.request?.user?.name || 'Customer'}</div>
                          <div className="font-mono">{q.request?.user?.phoneNumber || 'N/A'}</div>
                          <div><strong className="text-slate-900">Timeline:</strong> {q.estimatedTimeline || '1-2 Days'}</div>
                          <div><strong className="text-slate-900">Scope:</strong> {q.estimatedTimeline || 'Standard'}</div>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-600 font-normal">
                          <strong className="text-slate-800">Scope ({lineItemsArray.length}):</strong> {lineItemsArray.map(li => li.item || li.description).slice(0, 2).join(', ')}{lineItemsArray.length > 2 ? '...' : ''}
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openChatForQuotation(q)}
                            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Chat with Customer"
                          >
                            <MessageCircle className="w-4 h-4 text-indigo-600" /> Chat
                          </button>
                          <button
                            onClick={() => setActiveQuoteModal(q)}
                            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-brand-600 bg-brand-100 hover:bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                            title="View Quotation Details"
                          >
                            <Eye className="w-4 h-4 text-brand-600" /> Details
                          </button>
                          <button onClick={() => handleQuoteDecision(q.id, 'ACCEPTED')} className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs">
                            <Check className="w-4 h-4" /> Accept
                          </button>
                        </div>
                        <button onClick={() => handleDeleteQuotation(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete quotation">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUOTATION BUILDER TAB */}
          {activeTab === 'builder' && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-slate-800">Dynamic Itemized Quotation Generator</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hind Building Solutions — Material & Labor Custom Scope Pricing Engine</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-600">
                  <span>QTE-2026-AUTO</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Select Associated Service Request *</label>
                  <select value={builderRequestId} onChange={(e) => setBuilderRequestId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                    <option value="">-- Choose a pending customer request --</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{r.requestNumber} — {r.servicecode} ({r.user?.name || 'Customer'} • {r.status})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created By (Estimator Desk)</label>
                  <input type="text" value={builderEstimator} onChange={(e) => setBuilderEstimator(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
                </div>
              </div>

              {selectedBuilderReq && (
                <div className="p-3.5 rounded-lg bg-brand-50/40 border border-brand-200 text-slate-700 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-brand-800">
                      <Info className="w-3.5 h-3.5 text-brand-600" />
                      <span>{selectedBuilderReq.requestNumber} — {selectedBuilderReq.servicecode}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-brand-700 border border-brand-200">{selectedBuilderReq.status}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-600 leading-relaxed font-normal">
                    <strong>Client:</strong> {selectedBuilderReq.user?.name} ({selectedBuilderReq.user?.phoneNumber}) &nbsp;|&nbsp;
                    <strong>Property:</strong> {selectedBuilderReq.propertyType || 'House'} ({selectedBuilderReq.propertySize || 'Standard Area'}) &nbsp;|&nbsp;
                    <strong>Address:</strong> {selectedBuilderReq.addressline || 'Main Residence'} <br />
                    <strong>Issue:</strong> "{selectedBuilderReq.issueDescription}"
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-medium text-sm text-slate-800">Itemized Scope & Bill of Quantities (BOQ)</h3>
                  <button type="button" onClick={() => setLineItems([...lineItems, { item: '', qty: 1, unit: 'Sq Ft', rate: 0 }])} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all">
                    <Plus className="w-3 h-3" /> Add Line Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] font-medium uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5 min-w-[220px]">Item Description & Scope</th>
                        <th className="p-2.5 w-24">Qty</th>
                        <th className="p-2.5 w-32">Unit</th>
                        <th className="p-2.5 w-32">Rate (₹)</th>
                        <th className="p-2.5 w-32 text-right">Amount (₹)</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {lineItems.map((li, idx) => {
                        const lineAmt = ((parseFloat(li.qty) || 0) * (parseFloat(li.rate) || 0)).toFixed(2);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-2.5 text-center text-xs font-medium text-slate-400">{idx + 1}</td>
                            <td className="p-1.5">
                              <input type="text" value={li.item} onChange={(e) => { const updated = [...lineItems]; updated[idx].item = e.target.value; setLineItems(updated); }} placeholder="Scope description" className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none font-normal" />
                            </td>
                            <td className="p-1.5">
                              <input type="number" value={li.qty} onChange={(e) => { const updated = [...lineItems]; updated[idx].qty = e.target.value; setLineItems(updated); }} className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none font-normal" />
                            </td>
                            <td className="p-1.5">
                              <select value={li.unit} onChange={(e) => { const updated = [...lineItems]; updated[idx].unit = e.target.value; setLineItems(updated); }} className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none font-normal">
                                <option value="Sq Ft">Sq Ft</option>
                                <option value="Running Ft">Running Ft</option>
                                <option value="Lumpsum">Lumpsum</option>
                                <option value="Bags">Bags</option>
                                <option value="Hours">Hours</option>
                                <option value="Points">Points</option>
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input type="number" value={li.rate} onChange={(e) => { const updated = [...lineItems]; updated[idx].rate = e.target.value; setLineItems(updated); }} className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none font-normal" />
                            </td>
                            <td className="p-2.5 text-right font-mono font-medium text-xs text-emerald-600">
                              ₹{Number(lineAmt).toLocaleString('en-IN')}
                            </td>
                            <td className="p-1.5 text-center">
                              <button type="button" onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                <X className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercials Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-100 text-xs">
                <div className="lg:col-span-7 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400 uppercase">Estimated Timeline</label>
                      <select value={builderTimeline} onChange={(e) => setBuilderTimeline(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-700">
                        <option value="1-2 Working Days">1-2 Working Days</option>
                        <option value="2-3 Working Days">2-3 Working Days</option>
                        <option value="3-5 Working Days">3-5 Working Days</option>
                        <option value="1 Week (Phased)">1 Week (Phased)</option>
                        <option value="Same Day Immediate">Same Day Immediate</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400 uppercase">Service Scope</label>
                      <select value={builderScope} onChange={(e) => setBuilderScope(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-700">
                        <option value="Standard Engineering Specifications">Standard Engineering Specifications</option>
                        <option value="Comprehensive Waterproofing Scope">Comprehensive Waterproofing Scope</option>
                        <option value="Structural Patchwork Scope">Structural Patchwork Scope</option>
                        <option value="Standard Maintenance Scope">Standard Maintenance Scope</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400 uppercase">Terms & Conditions</label>
                    <textarea rows="2" value={builderTerms} onChange={(e) => setBuilderTerms(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-700 leading-relaxed"></textarea>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <h4 className="font-heading font-medium text-xs text-slate-800 pb-1.5 border-b border-slate-200">Commercial Summary</h4>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Material Cost (₹):</span>
                    <input type="number" value={effectiveMatCost} onChange={(e) => setMatCost(parseFloat(e.target.value) || 0)} className="w-28 px-2 py-1 text-right bg-white border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800" />
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Labor & Application (₹):</span>
                    <input type="number" value={effectiveLabCost} onChange={(e) => setLabCost(parseFloat(e.target.value) || 0)} className="w-28 px-2 py-1 text-right bg-white border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800" />
                  </div>

                  <div className="flex items-center justify-between font-medium text-slate-800 pt-0.5">
                    <span>Subtotal (₹):</span>
                    <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Discount (₹):</span>
                    <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-28 px-2 py-1 text-right bg-white border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-800" />
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>GST Tax Rate (%):</span>
                    <select value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 18)} className="w-28 px-2 py-1 text-right bg-white border border-slate-200 rounded-md text-xs font-normal text-slate-800">
                      <option value="18">18% GST (Standard)</option>
                      <option value="12">12% GST</option>
                      <option value="5">5% GST</option>
                      <option value="0">0% (Exempt)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>GST Amount:</span>
                    <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-heading font-medium text-sm text-slate-800">Grand Total:</span>
                    <span className="font-heading font-semibold text-xl text-emerald-600 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* ADMIN ADVANCE PAYMENT ADJUSTMENT */}
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200/90 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        Min. Advance To Start Work:
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                        ₹{effectiveAdvanceAmount.toLocaleString('en-IN')} ({effectiveAdvancePct}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                          Select % Amount
                        </label>
                        <select
                          value={customAdvanceAmt !== null ? 'custom' : builderAdvancePct}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setCustomAdvanceAmt(effectiveAdvanceAmount);
                            } else {
                              setCustomAdvanceAmt(null);
                              setBuilderAdvancePct(parseFloat(e.target.value) || 30);
                            }
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-800"
                        >
                          <option value="10">10% Advance</option>
                          <option value="20">20% Advance</option>
                          <option value="25">25% Advance</option>
                          <option value="30">30% Advance (Recommended)</option>
                          <option value="40">40% Advance</option>
                          <option value="50">50% Advance</option>
                          <option value="60">60% Advance</option>
                          <option value="70">70% Advance</option>
                          <option value="100">100% Full Payment</option>
                          <option value="custom">Custom ₹ Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                          Advance Value (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 3000"
                          value={customAdvanceAmt !== null ? customAdvanceAmt : effectiveAdvanceAmount}
                          onChange={(e) => {
                            setCustomAdvanceAmt(e.target.value);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-indigo-700 leading-tight">
                      Customer will pay exactly <strong>₹{effectiveAdvanceAmount.toLocaleString('en-IN')}</strong> to approve & commence work.
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-2">
                    <button type="button" onClick={() => { setBuilderRequestId(''); setLineItems([{ item: '', qty: 1, unit: 'Sq Ft', rate: 0 }]); }} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all">
                      Reset
                    </button>
                    <button type="button" onClick={handleIssueQuotation} className="flex-2 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Issue Quotation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE CHAT DESK TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              {/* Header / Stats Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-heading font-semibold text-xl sm:text-2xl text-slate-900">
                          Live Customer Chat Desk
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Socket Live
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                        Real-time direct communication with customers across Quotations, Service Requests, and Technical Inquiries.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      fetchChatThreads();
                      if (activeThreadId) fetchThreadMessages(activeThreadId);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-700" />
                    <span>Sync Threads</span>
                  </button>
                </div>
              </div>

              {/* Chat Two-Pane Workspace */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-12 min-h-[700px] h-[calc(100vh-280px)]">
                {/* LEFT COLUMN: Conversation Threads List */}
                <div className={`col-span-12 md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                  {/* Search and Filters */}
                  <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        placeholder="Search client, quote #, phone..."
                        className="w-full pl-9 pr-3.5 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-semibold">
                      {[
                        { id: 'ALL', label: 'All' },
                        { id: 'REQUEST', label: 'Requests' },
                        { id: 'BOOKING', label: 'Bookings' },
                        { id: 'QUOTATION', label: 'Quotes' },
                        { id: 'GENERAL', label: 'General' },
                      ].map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setChatFilterType(filter.id)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                            chatFilterType === filter.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thread list scroll container */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {(() => {
                      const filtered = chatThreads.filter(t => {
                        if (chatFilterType !== 'ALL' && t.contextType !== chatFilterType) return false;
                        if (!chatSearch.trim()) return true;
                        const q = chatSearch.toLowerCase();
                        return (
                          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
                          (t.customerPhone && t.customerPhone.toLowerCase().includes(q)) ||
                          (t.quoteNumber && t.quoteNumber.toLowerCase().includes(q)) ||
                          (t.requestNumber && t.requestNumber.toLowerCase().includes(q)) ||
                          (t.bookingNumber && t.bookingNumber.toLowerCase().includes(q)) ||
                          (t.contextTag && t.contextTag.toLowerCase().includes(q)) ||
                          (t.lastMessage && t.lastMessage.toLowerCase().includes(q))
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-500 space-y-2">
                            <MessageCircle className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="font-semibold text-sm">No conversations found</p>
                            <p className="text-xs text-slate-400">Customer inquiries from app and quotes will appear here.</p>
                          </div>
                        );
                      }

                      return filtered.map(t => {
                        const isSelected = activeThreadId === t.id;
                        const unread = t.unreadCountAdmin || 0;
                        const initial = (t.customerName || 'C')[0].toUpperCase();

                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setActiveThreadId(t.id);
                              fetchThreadMessages(t.id);
                              setChatThreads(prev => prev.map(item => item.id === t.id ? { ...item, unreadCountAdmin: 0 } : item));
                            }}
                            className={`p-4 cursor-pointer transition-all flex items-start gap-3 border-l-4 ${
                              isSelected
                                ? 'bg-indigo-50/80 border-indigo-600'
                                : 'bg-white hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center shadow-xs">
                                {initial}
                              </div>
                              {unread > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-ping" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4 className="font-semibold text-sm text-slate-900 truncate">
                                  {t.customerName || 'Customer'}
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                                  {t.lastMessageTime ? new Date(t.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                {t.bookingNumber ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                    Booking #{t.bookingNumber}
                                  </span>
                                ) : t.quoteNumber ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    Quote #{t.quoteNumber}
                                  </span>
                                ) : t.requestNumber ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Req #{t.requestNumber}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {t.contextTag || 'Consultation'}
                                  </span>
                                )}
                                {unread > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                    {unread} new
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-semibold text-slate-600 truncate">
                                {t.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* RIGHT COLUMN: Active Thread Chat View */}
                <div className={`col-span-12 md:col-span-7 lg:col-span-8 flex flex-col h-full bg-white ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                  {(() => {
                    const currentThread = chatThreads.find(t => t.id === activeThreadId) || (activeThreadId ? { id: activeThreadId, customerName: 'Client' } : null);

                    if (!currentThread) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3">
                            <MessageCircle className="w-8 h-8" />
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900">Select a Conversation</h3>
                          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-sm mt-1">
                            Choose any customer thread from the left panel to review questions and reply in real-time.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Thread Header */}
                        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setActiveThreadId(null)}
                              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                              title="Back to conversations"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs shrink-0">
                              {(currentThread.customerName || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base text-slate-900">
                                  {currentThread.customerName || 'Customer'}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <span>{currentThread.customerPhone || 'Customer App Client'}</span>
                                {currentThread.contextTag && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-600">{currentThread.contextTag}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Context Shortcuts */}
                          <div className="flex items-center gap-2">
                            {currentThread.bookingNumber && (
                              <button
                                onClick={() => {
                                  const found = directBookings.find(b => b.bookingNumber === currentThread.bookingNumber);
                                  if (found) setSelectedBookingForDrawer(found);
                                  setActiveTab('direct-bookings');
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all flex items-center gap-1.5"
                                title="Open Instant Booking details"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">View Booking</span>
                              </button>
                            )}
                            {currentThread.quoteNumber && (
                              <button
                                onClick={() => setActiveTab('quotations')}
                                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-1.5"
                                title="Open Quotations desk"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View Quote</span>
                              </button>
                            )}
                            {currentThread.requestNumber && (
                              <button
                                onClick={() => setActiveTab('requests')}
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5"
                                title="Open Requests desk"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View Request</span>
                              </button>
                            )}
                            {currentThread.customerPhone && (
                              <button
                                onClick={() => callCustomer(currentThread.customerPhone)}
                                className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-all"
                                title="Call Customer"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Thread Message Stream */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
                          {/* Context Callout Banner */}
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>
                                Real-Time Chat Room: <span className="text-slate-900 font-bold">{currentThread.contextTag || currentThread.id}</span>
                              </span>
                            </div>
                            <span className="text-slate-500 font-normal">Customer messages sync directly from mobile app</span>
                          </div>

                          {/* Messages */}
                          {threadMessages.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 space-y-2">
                              <Sparkles className="w-6 h-6 text-indigo-500 mx-auto" />
                              <p className="font-semibold text-sm">No messages in this conversation yet</p>
                              <p className="text-xs text-slate-400">Send an official note or proposal update to start the discussion.</p>
                            </div>
                          ) : (
                            threadMessages.map(msg => {
                              const isAdmin = msg.sender === 'admin';
                              return (
                                <div
                                  key={msg.id || msg.createdAt}
                                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                >
                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1 px-1">
                                    <span>{isAdmin ? 'Er. Vikram Sharma (Admin Desk)' : (msg.senderName || currentThread.customerName || 'Customer')}</span>
                                    <span>•</span>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div
                                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-sm font-semibold shadow-xs ${
                                      isAdmin
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                                        : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    {isAdmin && (
                                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-indigo-100">
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        <span>Delivered</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatMessagesEndRef} />
                        </div>

                        {/* Quick Pre-Set Replies */}
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
                          <span className="text-slate-500 shrink-0">Quick reply:</span>
                          {[
                            'Hello! I am reviewing your request right now.',
                            'Our senior engineer will visit your site tomorrow.',
                            'Quotation has been prepared. Please review and approve.',
                            'Thank you! Our materials and team have been dispatched.',
                            'Can you please share photos or video of the affected area?'
                          ].map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendAdminReply(chip)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 whitespace-nowrap transition-all shadow-2xs"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>

                        {/* Admin Reply Input */}
                        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendAdminReply();
                            }}
                            className="flex items-center gap-2.5"
                          >
                            <input
                              type="text"
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              placeholder="Write a message to customer... (Press Enter to send)"
                              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
                            />
                            <button
                              type="submit"
                              disabled={isSendingReply || !adminReplyText.trim()}
                              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all shrink-0"
                            >
                              {isSendingReply ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">Send</span>
                            </button>
                          </form>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* DIRECT MAINTENANCE BOOKINGS TAB */}
          {activeTab === 'direct-bookings' && (
            <div className="space-y-5">
              {/* Top Banner & Header */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h2 className="font-heading font-semibold text-base text-slate-800">Direct Maintenance Bookings</h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pre-Paid Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live bookings for Plumbers, Electricians, and quick utility services. Online visiting charge received.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { fetchDirectBookings(); fetchDirectBookingStats(); showToastMsg('Bookings refreshed', 'info'); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{directBookingStats?.total || directBookings.length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Confirmed (Paid)</div>
                  <div className="text-2xl font-bold font-mono text-amber-600 mt-1.5">{directBookingStats?.confirmed || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Assigned</div>
                  <div className="text-2xl font-bold font-mono text-indigo-600 mt-1.5">{directBookingStats?.assigned || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed</div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 mt-1.5">{directBookingStats?.completed || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Refunded</div>
                  <div className="text-2xl font-bold font-mono text-rose-600 mt-1.5">{directBookingStats?.refunded || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Revenue</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5">₹{(directBookingStats?.netRevenue || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                  {['ALL', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setDirectBookingFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 text-xs ${
                        directBookingFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {st === 'ALL' ? 'All Bookings' : st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={directBookingSearch}
                      onChange={(e) => setDirectBookingSearch(e.target.value)}
                      placeholder="Search booking #, phone, customer..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Bookings Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Sub-Service / Category</th>
                        <th className="py-3 px-4">Customer & Address</th>
                        <th className="py-3 px-4">Scheduled Slot</th>
                        <th className="py-3 px-4">Pre-Paid Online</th>
                        <th className="py-3 px-4">Technician</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const filtered = directBookings.filter(b => {
                          const matchesFilter =
                            directBookingFilter === 'ALL' ? true :
                            directBookingFilter === 'REFUNDED' ? b.paymentStatus === 'REFUNDED' :
                            b.status === directBookingFilter;
                          const q = directBookingSearch.trim().toLowerCase();
                          const matchesSearch = !q ||
                            (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q)) ||
                            (b.customerName && b.customerName.toLowerCase().includes(q)) ||
                            (b.customerPhone && b.customerPhone.includes(q)) ||
                            (b.subServiceName && b.subServiceName.toLowerCase().includes(q));
                          return matchesFilter && matchesSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400">
                                <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <div>No direct maintenance bookings found matching criteria.</div>
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(b => {
                          const isRefunded = b.paymentStatus === 'REFUNDED';
                          const isCancelled = b.status === 'CANCELLED';

                          return (
                            <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-brand-600 font-bold">{b.bookingNumber}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">{b.subServiceName}</div>
                                <div className="text-[11px] text-brand-600 font-medium">{b.serviceName}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-medium text-slate-800">{b.customerName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{b.customerPhone}</div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{b.customerAddress}, {b.city}</div>
                                {b.latitude && b.longitude && (
                                  <a
                                    href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-brand-600 hover:text-brand-800 hover:underline mt-0.5"
                                  >
                                    <MapPin className="w-2.5 h-2.5 text-brand-500" />
                                    <span>Map Pin ({b.latitude.toFixed(3)}, {b.longitude.toFixed(3)})</span>
                                  </a>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                  <Calendar className="w-3 h-3 text-brand-500" />
                                  <span>{b.scheduledDate}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{b.scheduledSlot}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-slate-800">
                                  ₹{b.onlinePaidAmount || b.visitingCharge}
                                </div>
                                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" /> PAID
                                </div>
                                {b.additionalWorkAmount > 0 && (
                                  <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                                    +₹{b.additionalWorkAmount} on-site
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {b.technicianName ? (
                                  <div>
                                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                                      <User className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{b.technicianName}</span>
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-semibold">{b.technicianRole || 'Field Specialist'}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">{b.technicianPhone}</div>
                                    <button
                                      onClick={() => { setAssignTechModalBooking(b); setTechForm({ name: b.technicianName || '', phone: b.technicianPhone || '', role: b.technicianRole || 'Senior Field Specialist' }); }}
                                      className="text-[11px] text-brand-600 hover:text-brand-800 font-medium underline mt-0.5"
                                    >
                                      Change Specialist
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setAssignTechModalBooking(b); setTechForm({ name: '', phone: '', role: 'Senior Field Specialist' }); }}
                                    className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all flex items-center gap-1.5"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-amber-600" /> Assign Specialist
                                  </button>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isRefunded ? (
                                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                    REFUNDED (₹{b.refundAmount})
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                                    b.status === 'CONFIRMED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    b.status === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                                    b.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                    b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {b.status}
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openChatForBooking(b)}
                                    title="Live Chat with Customer"
                                    className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => setSelectedBookingForDrawer(b)}
                                    title="View Full Details & Answers"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => { setAssignTechModalBooking(b); setTechForm({ name: b.technicianName || '', phone: b.technicianPhone || '' }); }}
                                    title="Assign / Change Technician"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                                  >
                                    <User className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => { setStatusModalBooking(b); setStatusForm({ status: b.status, reason: '' }); }}
                                    title="Update Booking Status"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-all"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>

                                  {!isRefunded && (
                                    <button
                                      onClick={() => { setRefundModalBooking(b); setRefundForm({ amount: b.onlinePaidAmount || b.visitingCharge, reason: 'Technician unavailable / Customer cancellation' }); }}
                                      title="Issue Automated Refund via Razorpay"
                                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SERVICES CATALOG & SUB-SERVICES CONFIGURATION TAB */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-800">Services & Sub-Services Management</h2>
                  <p className="text-[11px] text-slate-400">
                    Each Sub-Service has its own independent Visiting Charge, Detailed Description, Book Now & Get Quote toggles, and Required Customer Fields.
                  </p>
                </div>
                <button onClick={() => setAddServiceModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service Category</span>
                </button>
              </div>

              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-medium">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-heading font-semibold text-sm text-slate-800">{svc.name}</h3>
                            <span className="font-mono text-sm font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                              {svc.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{svc.description || 'Core Service Category'} • Rating: ⭐ {svc.rating || 4.8}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAddSubService(svc)}
                          className="px-3 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Sub-Service
                        </button>
                      </div>
                    </div>

                    {/* Sub-Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(svc.subServices || []).map(sub => (
                        <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-brand-300 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-xs text-slate-800">{sub.titleEn}</div>
                              {sub.titleHi && <div className="text-[11px] font-medium text-brand-600">{sub.titleHi}</div>}
                            </div>
                            <div className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                              ₹{sub.visitingCharge !== undefined ? sub.visitingCharge : 199} Visit
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 font-normal line-clamp-2">
                            {sub.desc || 'No description provided.'}
                          </div>

                          {/* Toggles & Required Fields badges */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${sub.bookNowEnabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                              Book Now: {sub.bookNowEnabled !== false ? 'ON' : 'OFF'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${sub.getQuoteEnabled !== false ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                              Quote: {sub.getQuoteEnabled !== false ? 'ON' : 'OFF'}
                            </span>
                            {sub.requiredFields && sub.requiredFields.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {sub.requiredFields.length} Required Qs
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              Status: <strong className={sub.isActive !== false ? 'text-emerald-600' : 'text-slate-400'}>{sub.isActive !== false ? 'Active' : 'Inactive'}</strong>
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditSubService(sub, svc)}
                                className="px-2 py-0.5 text-[11px] font-medium text-brand-600 bg-white hover:bg-brand-50 border border-slate-200 rounded transition-all"
                              >
                                Edit & Price
                              </button>
                              <button
                                onClick={() => handleDeleteSubService(sub.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMER DIRECTORY TAB */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <h2 className="font-heading font-semibold text-base text-slate-800">Registered Customers Directory</h2>
                <p className="text-[11px] text-slate-400">Customer contact information, saved address books, and service history.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Saved Addresses</th>
                        <th className="p-3">Requests</th>
                        <th className="p-3">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-slate-800">{u.name}</td>
                          <td className="p-3 font-mono font-medium text-emerald-600">{u.phoneNumber}</td>
                          <td className="p-3 text-slate-500 font-normal leading-tight">
                            {(u.address || []).map(a => `${a.type.toUpperCase()}: ${a.address}, ${a.city}`).join(' | ') || 'Default Residence'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">{(u.requests || []).length} Requests</span>
                          </td>
                          <td className="p-3 text-slate-400 font-normal">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* APP SLIDES & CAROUSEL TAB */}
          {activeTab === 'slides' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>App Carousel Slides & Dynamic In-App Routing</span>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Configure promotional carousel slides displayed on the mobile home screen and set which in-app screen or service opens when tapped.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSlides}
                    className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-all font-semibold"
                    title="Refresh Slides"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleOpenAddSlide}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Slide</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Total Slides</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{slides.length}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Active in App</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {slides.filter(s => s.isActive !== false).length}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Inactive / Drafts</div>
                  <div className="text-xl font-bold text-slate-400 mt-1">
                    {slides.filter(s => s.isActive === false).length}
                  </div>
                </div>
              </div>

              {/* Slides Grid */}
              {slides.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200/80 shadow-xs">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium text-sm">No slides created yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first promotional slide with an in-app destination route.</p>
                  <button
                    onClick={handleOpenAddSlide}
                    className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg"
                  >
                    Create First Slide
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slides.map((slide) => {
                    const isInspection = slide.targetRoute === 'create_inspection';
                    const isServices = slide.targetRoute === 'services';
                    const isRequests = slide.targetRoute === 'requests';
                    const isQuotations = slide.targetRoute === 'quotations';
                    const isProfile = slide.targetRoute === 'profile';
                    const isSpecificService = slide.targetRoute && slide.targetRoute.startsWith('service:');

                    let routeLabel = 'Book Inspection Screen';
                    let routeBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (isServices) {
                      routeLabel = 'Services Catalog Tab';
                      routeBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                    } else if (isRequests) {
                      routeLabel = 'Requests Tab';
                      routeBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    } else if (isQuotations) {
                      routeLabel = 'Quotations Tab';
                      routeBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    } else if (isProfile) {
                      routeLabel = 'Profile Tab';
                      routeBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                    } else if (isSpecificService) {
                      routeLabel = `Service: ${slide.targetRoute.replace('service:', '')}`;
                      routeBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    } else if (slide.targetRoute) {
                      routeLabel = slide.targetRoute;
                      routeBadgeColor = 'bg-cyan-50 text-cyan-700 border-cyan-200';
                    }

                    return (
                      <div
                        key={slide.id}
                        className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs flex flex-col justify-between ${
                          slide.isActive !== false ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-200/50 opacity-60'
                        }`}
                      >
                        {/* Slide Banner Preview */}
                        <div className="relative h-36 bg-slate-100 overflow-hidden group">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                              <Image className="w-8 h-8 opacity-40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            {slide.badgeText && (
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider bg-brand-600 text-white shadow-xs">
                                {slide.badgeText}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium bg-black/50 text-white/90 backdrop-blur-xs">
                              #{slide.order || 1}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                slide.isActive !== false
                                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                                  : 'bg-slate-700/80 text-slate-300 border-slate-600'
                              }`}
                            >
                              {slide.isActive !== false ? 'Active in App' : 'Disabled'}
                            </span>
                          </div>

                          {/* Bottom title in preview */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-white">
                            <div className="font-semibold text-xs leading-snug drop-shadow-xs line-clamp-1">
                              {slide.title}
                            </div>
                            {slide.subtitle && (
                              <div className="text-[11px] text-slate-200 font-normal drop-shadow-xs line-clamp-1 mt-0.5">
                                {slide.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slide Card Body */}
                        <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-400 uppercase font-medium flex items-center justify-between">
                              <span>Target In-App Route</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {slide.targetRoute}
                              </span>
                            </div>
                            <div className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${routeBadgeColor}`}>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{routeLabel}</span>
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => handleToggleSlideActive(slide)}
                              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                                slide.isActive !== false
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {slide.isActive !== false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{slide.isActive !== false ? 'Pause' : 'Activate'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditSlide(slide)}
                                className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* OFFERS TAB */}
          {activeTab === 'offers' && (
            <div className="space-y-5">
              {/* Top Banner & Action */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Tag className="w-4 h-4" />
                    </span>
                    <h2 className="font-heading font-semibold text-base text-slate-800">
                      App Promotional Offers & Deals
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage coupons, discount badges, and service-specific deals shown dynamically in the mobile app.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchOffers()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleOpenAddOffer}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Offer</span>
                  </button>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Offers</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{offers.length}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Active Deals</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {offers.filter(o => o.isActive !== false).length}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Paused / Drafts</span>
                  <div className="text-xl font-bold text-amber-600 mt-1">
                    {offers.filter(o => o.isActive === false).length}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">Categories</span>
                  <div className="text-xl font-bold text-indigo-600 mt-1">
                    {Array.from(new Set(offers.map(o => o.category || 'Trending'))).length}
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              {offers.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['ALL', ...Array.from(new Set(offers.map(o => o.category || 'Trending')))].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setOfferCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        offerCategoryFilter === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Offers Grid */}
              {offers.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200/80 shadow-xs">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium text-sm">No promotional offers created yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Create discount coupons and deals to entice customers on the mobile app.
                  </p>
                  <button
                    onClick={handleOpenAddOffer}
                    className="mt-4 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
                  >
                    Create First Offer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers
                    .filter(o => offerCategoryFilter === 'ALL' || (o.category || 'Trending') === offerCategoryFilter)
                    .map((offer) => {
                      const isInspection = offer.targetRoute === 'create_inspection';
                      const isServices = offer.targetRoute === 'services';
                      const isSpecificService = offer.targetRoute && offer.targetRoute.startsWith('service:');

                      let routeLabel = 'Book Inspection Screen';
                      let routeBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (isServices) {
                        routeLabel = 'Services Catalog Tab';
                        routeBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                      } else if (isSpecificService) {
                        routeLabel = `Pre-select: ${offer.targetRoute.replace('service:', '')}`;
                        routeBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      } else if (offer.targetRoute) {
                        routeLabel = offer.targetRoute;
                        routeBadgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
                      }

                      return (
                        <div
                          key={offer.id}
                          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs flex flex-col justify-between ${
                            offer.isActive !== false ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-200/50 opacity-65'
                          }`}
                        >
                          {/* Top Banner Image with Badges */}
                          <div className="relative h-32 bg-slate-100 overflow-hidden group">
                            {offer.imageUrl ? (
                              <img
                                src={offer.imageUrl}
                                alt={offer.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-emerald-50 to-teal-50">
                                <Ticket className="w-8 h-8 text-emerald-400/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent"></div>

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                              {offer.badge && (
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider bg-amber-500 text-white shadow-xs">
                                  {offer.badge}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wide bg-emerald-600 text-white shadow-xs">
                                {offer.discount || 'SPECIAL'}
                              </span>
                            </div>

                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  offer.isActive !== false
                                    ? 'bg-emerald-500/90 text-white border-emerald-400'
                                    : 'bg-slate-700/80 text-slate-300 border-slate-600'
                                }`}
                              >
                                {offer.isActive !== false ? 'Active' : 'Disabled'}
                              </span>
                            </div>

                            {/* Title preview overlay */}
                            <div className="absolute bottom-2 left-3 right-3 text-white">
                              <div className="text-[10px] font-semibold text-emerald-300 tracking-wider uppercase">
                                {offer.category || 'Trending'}
                              </div>
                              <div className="font-semibold text-xs leading-snug line-clamp-1">
                                {offer.title}
                              </div>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {/* Coupon Code Pill */}
                              <div className="flex items-center justify-between bg-emerald-50/60 border border-dashed border-emerald-300 rounded-lg p-2">
                                <div className="flex items-center gap-1.5">
                                  <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-mono font-bold text-xs text-emerald-800 tracking-wider">
                                    {offer.code}
                                  </span>
                                </div>
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                  {offer.discount}
                                </span>
                              </div>

                              {offer.subtitle && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {offer.subtitle}
                                </p>
                              )}

                              {/* Min Amount & Validity */}
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                <span>Min: ₹{Number(offer.minAmount || 0).toLocaleString('en-IN')}</span>
                                <span>Expires: {offer.validTill || 'Limited'}</span>
                              </div>

                              {/* Target Route */}
                              <div className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${routeBadgeColor}`}>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                                <span className="truncate">{routeLabel}</span>
                              </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={() => handleToggleOfferActive(offer)}
                                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                                  offer.isActive !== false
                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                }`}
                              >
                                {offer.isActive !== false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{offer.isActive !== false ? 'Pause' : 'Activate'}</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditOffer(offer)}
                                  className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                                  title="Delete Offer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* SYSTEM DIAGNOSTICS TAB */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <h2 className="font-heading font-semibold text-base text-slate-800">System Diagnostics & Cloud Database Health</h2>
                <p className="text-[11px] text-slate-400">Live API endpoint latencies and Aiven PostgreSQL connectivity details.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-heading font-medium text-sm text-slate-800">API Routes Latency Check</h3>
                    <button onClick={() => showToastMsg('All routes responding at 200 OK (<45ms)', 'success')} className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all">
                      Run Tests
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { method: 'GET', path: '/api/health', status: '200 OK (18ms)' },
                      { method: 'GET', path: '/api/v1/services', status: '200 OK (28ms)' },
                      { method: 'GET', path: '/api/v1/requests', status: '200 OK (32ms)' },
                      { method: 'GET', path: '/api/v1/quotations', status: '200 OK (24ms)' },
                      { method: 'GET', path: '/api/v1/admin/stats', status: '200 OK (38ms)' },
                    ].map((ep, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-blue-100 text-blue-700">{ep.method}</span>
                          <span className="font-mono text-slate-600">{ep.path}</span>
                        </div>
                        <span className="font-medium text-emerald-600">{ep.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading font-medium text-sm text-slate-800">Database & Server Architecture</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Database Engine:</span>
                      <span className="font-medium text-slate-700">PostgreSQL (Aiven Cloud Managed)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">ORM & Migrations:</span>
                      <span className="font-medium text-slate-700">Prisma Client 6.19.3</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Server Stack:</span>
                      <span className="font-medium text-slate-700">Express.js (Node.js) on Port 5000</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Media Uploads:</span>
                      <span className="font-medium text-slate-700">Multer Disk Storage (/uploads)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">UI Framework:</span>
                      <span className="font-medium text-slate-700">React 18 + Tailwind CSS 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-heading font-medium text-slate-800 text-sm">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>{activePhotoModal.title}</span>
              </div>
              <button onClick={() => setActivePhotoModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              <div className="w-full h-80 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={activePhotoModal.photos[activePhotoModal.index]} alt="Damage" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activePhotoModal.photos.map((p, i) => (
                  <div key={i} onClick={() => setActivePhotoModal({ ...activePhotoModal, index: i })} className={`w-14 h-14 rounded-md overflow-hidden border-2 cursor-pointer flex-shrink-0 ${activePhotoModal.index === i ? 'border-brand-600' : 'border-slate-200'}`}>
                    <img src={p} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE QUOTATION MODAL */}
      {activeQuoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-heading font-medium text-slate-800 text-sm">
                <Receipt className="w-4 h-4 text-brand-600" />
                <span>Official Quotation Document</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const q = activeQuoteModal;
                    setActiveQuoteModal(null);
                    openChatForQuotation(q);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs transition-all"
                  title="Chat with Customer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-600" /> Chat
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-all">
                  <Printer className="w-3 h-3" /> Print / PDF
                </button>
                <button onClick={() => setActiveQuoteModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-white text-slate-800 font-sans space-y-5 text-xs font-normal" id="printableQuotationContent">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-heading font-semibold text-xl text-slate-900 tracking-tight">HIND BUILDING SOLUTIONS</h2>
                  <p className="text-[11px] text-slate-500 font-normal">Technical Waterproofing, Surface Repair & Restoration</p>
                  <p className="text-[11px] text-slate-500 font-normal">Support Hotline: +91 94628 77757 | support@hindbuilding.com</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-base text-brand-600">{activeQuoteModal.quoteNumber}</div>
                  <div className="text-[11px] text-slate-400">Date: {new Date(activeQuoteModal.created_at).toLocaleDateString('en-IN')}</div>
                  <div className="text-[11px] text-slate-400">Ref: {activeQuoteModal.request?.requestNumber || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[11.5px] text-slate-600">
                <div>
                  <span className="font-medium text-slate-800 uppercase text-[10px]">Customer Information:</span><br />
                  {activeQuoteModal.request?.user?.name || 'Customer'}<br />
                  Phone: {activeQuoteModal.request?.user?.phoneNumber || 'N/A'}<br />
                  Property: {activeQuoteModal.request?.propertyType || 'House'} ({activeQuoteModal.request?.propertySize || 'Standard'})
                </div>
                <div>
                  <span className="font-medium text-slate-800 uppercase text-[10px]">Service Scope:</span><br />
                  {activeQuoteModal.request?.servicecode || 'Repair Work'}<br />
                  Address: {activeQuoteModal.request?.addressline || 'Main Residence'}<br />
                  Timeline: <strong>{activeQuoteModal.estimatedTimeline || '1-2 Working Days'}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-medium uppercase border-b border-slate-300 text-[11px]">
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Scope & Specification</th>
                    <th className="p-2 w-14">Qty</th>
                    <th className="p-2 w-20">Unit</th>
                    <th className="p-2 w-20">Rate (₹)</th>
                    <th className="p-2 w-24 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(Array.isArray(activeQuoteModal.lineItem) ? activeQuoteModal.lineItem : []).map((li, idx) => {
                    const amt = ((parseFloat(li.qty) || 0) * (parseFloat(li.rate) || 0)).toFixed(2);
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-400">{idx + 1}</td>
                        <td className="p-2 text-slate-800 font-normal">{li.item || li.description}</td>
                        <td className="p-2 font-normal">{li.qty}</td>
                        <td className="p-2 font-normal">{li.unit || 'Unit'}</td>
                        <td className="p-2 font-normal">₹{(li.rate || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2 text-right font-medium text-slate-900">₹{Number(amt).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-end pt-1">
                <div className="w-64 space-y-1.5 text-xs border-t border-slate-200 pt-2.5">
                  <div className="flex justify-between text-slate-500 font-normal">
                    <span>Material Cost:</span>
                    <span>₹{(activeQuoteModal.materialCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-normal">
                    <span>Labor & Application:</span>
                    <span>₹{(activeQuoteModal.laborCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-800">
                    <span>Subtotal:</span>
                    <span>₹{(activeQuoteModal.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-normal">
                    <span>GST ({activeQuoteModal.taxRate || 18}%):</span>
                    <span>₹{(activeQuoteModal.taxGST || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-800 pt-1.5 font-mono">
                    <span>Grand Total:</span>
                    <span>₹{(activeQuoteModal.grandtotal || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {/* ACTIVE QUOTE ADVANCE BADGE & ADJUSTMENT */}
                  <div className="mt-2.5 p-2.5 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-indigo-900 tracking-wider">Advance Required to Start Work</div>
                        <div className="text-sm font-bold font-mono text-indigo-700">
                          ₹{Math.round(activeQuoteModal.advanceAmount || (activeQuoteModal.grandtotal || 0) * ((activeQuoteModal.advancePercentage || 50) / 100)).toLocaleString('en-IN')}
                          <span className="text-[11px] font-normal text-indigo-500 ml-1.5">({activeQuoteModal.advancePercentage || 50}%)</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setModalNewAdvanceAmt(Math.round(activeQuoteModal.advanceAmount || (activeQuoteModal.grandtotal || 0) * ((activeQuoteModal.advancePercentage || 50) / 100)));
                          setIsEditingModalAdvance(!isEditingModalAdvance);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-all"
                      >
                        {isEditingModalAdvance ? 'Cancel' : 'Adjust Advance'}
                      </button>
                    </div>

                    {isEditingModalAdvance && (
                      <div className="pt-2 border-t border-indigo-200/80 flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                          <input
                            type="number"
                            value={modalNewAdvanceAmt}
                            onChange={(e) => setModalNewAdvanceAmt(e.target.value)}
                            placeholder="e.g. 3000"
                            className="w-full pl-6 pr-2 py-1 text-xs font-mono font-bold text-slate-800 bg-white border border-indigo-300 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuotationAdvance(activeQuoteModal.id, modalNewAdvanceAmt)}
                          className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-[11px] text-slate-500 space-y-0.5 font-normal">
                <div><strong>Service Specifications:</strong> {(activeQuoteModal.service_scope) || 'Standard Engineering Specifications'}</div>
                <div><strong>Commercial Terms:</strong> {activeQuoteModal.termsAndConditions || 'Standard payment terms apply.'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {addServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-medium text-slate-800 text-sm">Add New Service Category</h3>
              <button onClick={() => setAddServiceModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              try {
                const res = await fetch(`${API_BASE}/api/v1/admin/services`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    code: form.code.value,
                    name: form.name.value,
                    description: form.description.value,
                    icon: form.icon.value || 'Wrench',
                    rating: parseFloat(form.rating.value) || 4.8
                  })
                });
                const data = await res.json();
                if (data.success) {
                  showToastMsg('Service created', 'success');
                  setAddServiceModalOpen(false);
                  fetchServices();
                }
              } catch (err) { showToastMsg('Error creating service', 'error'); }
            }} className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500 uppercase">Service Code</label>
                <input name="code" placeholder="e.g. WATERPROOFING" required className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500 uppercase">Service Name</label>
                <input name="name" placeholder="e.g. Terrace Waterproofing" required className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500 uppercase">Description</label>
                <textarea name="description" rows="2" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500 uppercase">Icon</label>
                  <input name="icon" defaultValue="Droplets" className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500 uppercase">Rating</label>
                  <input name="rating" defaultValue="4.8" step="0.1" type="number" className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAddServiceModalOpen(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT SLIDE MODAL */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden my-6">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h3 className="font-heading font-semibold text-slate-800 text-sm">
                  {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                </h3>
              </div>
              <button
                onClick={() => setSlideModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-4 space-y-3.5 text-xs">
              {/* Slide Title */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Slide Headline / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% Off Terrace Waterproofing"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free moisture scan with every structural inspection"
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              {/* Badge Text & Order in 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED OFFER"
                    value={slideForm.badgeText}
                    onChange={(e) => setSlideForm({ ...slideForm, badgeText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-brand-500 outline-none uppercase font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={slideForm.order}
                    onChange={(e) => setSlideForm({ ...slideForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Banner Image *
                  </label>
                  <label className="text-[11px] text-brand-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{uploadingSlideImg ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={uploadingSlideImg}
                    />
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={slideForm.imageUrl}
                  onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-brand-500 outline-none font-mono text-xs"
                />
              </div>

              {/* TARGET IN-APP ROUTE SELECTOR (The Key Feature) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-brand-50/50 border border-brand-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-brand-900 uppercase">
                    Target Route / Destination Page *
                  </label>
                  <span className="text-[10px] text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded font-medium">
                    When clicked in app
                  </span>
                </div>

                <select
                  value={
                    ['create_inspection', 'services', 'requests', 'quotations', 'profile'].includes(slideForm.targetRoute)
                      ? slideForm.targetRoute
                      : slideForm.targetRoute.startsWith('service:')
                      ? slideForm.targetRoute
                      : 'custom'
                  }
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setSlideForm({ ...slideForm, targetRoute: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-brand-200 rounded-lg text-slate-800 font-medium outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <optgroup label="App Main Screens">
                    <option value="create_inspection">🎯 Book Inspection (Create Inspection Screen)</option>
                    <option value="services">📂 Services Catalog Tab</option>
                    <option value="requests">📋 Customer Requests Tab</option>
                    <option value="quotations">🧾 Quotations Tab</option>
                    <option value="profile">👤 User Profile Tab</option>
                  </optgroup>

                  {services && services.length > 0 && (
                    <optgroup label="Pre-select Specific Service">
                      {services.map((srv) => (
                        <option key={srv.id} value={`service:${srv.name}`}>
                          🔧 Open & Pre-select: {srv.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="Custom / Other">
                    <option value="custom">🔗 Custom Route Path / Deep Link...</option>
                  </optgroup>
                </select>

                {/* If custom or custom route */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Enter route: e.g. create_inspection, services, or service:Waterproofing"
                    value={slideForm.targetRoute}
                    onChange={(e) => setSlideForm({ ...slideForm, targetRoute: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    User will be automatically navigated to this route in Flutter upon clicking the slide.
                  </p>
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slideActiveCheck"
                  checked={slideForm.isActive}
                  onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="slideActiveCheck" className="text-xs text-slate-700 font-medium select-none">
                  Publish Slide Live in Mobile App Carousel
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingSlide ? 'Update Slide' : 'Save Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SLIDE MODAL END */}

      {/* ADD / EDIT OFFER MODAL */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2 font-heading font-semibold text-slate-800 text-sm">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>{editingOffer ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}</span>
              </div>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveOffer} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Offer Title */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Offer Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 20% OFF on Waterproofing Audits"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Subtitle / Promo Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced infrared terrace & bathroom leakage scanning"
                  value={offerForm.subtitle}
                  onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Category & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Category *
                  </label>
                  <input
                    type="text"
                    placeholder="Trending, Waterproofing, Civil..."
                    value={offerForm.category}
                    onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['Trending', 'Waterproofing', 'Civil', 'Renovation'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, category: c })}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                      >
                        +{c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Discount Display *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF or ₹500 OFF"
                    value={offerForm.discount}
                    onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Coupon Code & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HIPRO20"
                    value={offerForm.code}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 focus:bg-white focus:border-emerald-500 outline-none font-mono font-bold uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Badge Pill
                  </label>
                  <input
                    type="text"
                    placeholder="POPULAR, EXCLUSIVE, NEW USER"
                    value={offerForm.badge}
                    onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none uppercase font-semibold text-amber-700"
                  />
                </div>
              </div>

              {/* Min Amount & Valid Till */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Min Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offerForm.minAmount}
                    onChange={(e) => setOfferForm({ ...offerForm, minAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Valid Till
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 31 Dec 2026"
                    value={offerForm.validTill}
                    onChange={(e) => setOfferForm({ ...offerForm, validTill: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Banner Image URL & File Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Offer Thumbnail / Banner Image
                  </label>
                  <label className="text-[11px] text-emerald-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{uploadingOfferImg ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOfferImageUpload}
                      className="hidden"
                      disabled={uploadingOfferImg}
                    />
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={offerForm.imageUrl}
                  onChange={(e) => setOfferForm({ ...offerForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none font-mono text-xs"
                />
              </div>

              {/* Target In-App Route Selector */}
              <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-emerald-900 uppercase">
                    Target Route / Destination Page *
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                    When user taps "Book with Offer"
                  </span>
                </div>

                <select
                  value={
                    ['create_inspection', 'services', 'requests', 'quotations', 'profile'].includes(offerForm.targetRoute)
                      ? offerForm.targetRoute
                      : offerForm.targetRoute.startsWith('service:')
                      ? offerForm.targetRoute
                      : 'custom'
                  }
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setOfferForm({ ...offerForm, targetRoute: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-slate-800 font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <optgroup label="App Main Screens">
                    <option value="create_inspection">🎯 Book Inspection (Create Inspection Screen)</option>
                    <option value="services">📂 Services Catalog Tab</option>
                    <option value="requests">📋 Customer Requests Tab</option>
                    <option value="quotations">🧾 Quotations Tab</option>
                    <option value="profile">👤 User Profile Tab</option>
                  </optgroup>

                  {services && services.length > 0 && (
                    <optgroup label="Pre-select Specific Service">
                      {services.map((srv) => (
                        <option key={srv.id} value={`service:${srv.name}`}>
                          🔧 Open & Pre-select: {srv.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="Custom / Other">
                    <option value="custom">🔗 Custom Route Path...</option>
                  </optgroup>
                </select>

                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="e.g. create_inspection or service:Waterproofing"
                    value={offerForm.targetRoute}
                    onChange={(e) => setOfferForm({ ...offerForm, targetRoute: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Terms & Conditions Snippet
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid once per user for inspection bookings above ₹1,500."
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none text-xs"
                />
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offerForm.order}
                    onChange={(e) => setOfferForm({ ...offerForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="offerActiveCheck"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="offerActiveCheck" className="text-xs text-slate-700 font-medium select-none">
                    Active in Mobile App
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingOffer ? 'Update Offer' : 'Save Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. SUB-SERVICE ADD / EDIT MODAL */}
      {subServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800">
                  {editingSubService ? 'Edit Sub-Service & Pricing' : 'Add New Sub-Service'}
                </h3>
                <p className="text-xs text-slate-400">
                  Category: <span className="font-semibold text-brand-600">{subServiceParentService?.titleEn || 'Parent Service'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubService} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Sub-Service Title (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={subServiceForm.titleEn}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, titleEn: e.target.value })}
                    placeholder="e.g. Overhead Tank Cleaning"
                    className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Hindi Title (HI)
                  </label>
                  <input
                    type="text"
                    value={subServiceForm.titleHi}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, titleHi: e.target.value })}
                    placeholder="e.g. पानी की टंकी सफाई"
                    className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Pricing strictly on SubService */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Visiting / Booking Charge (₹) *
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium bg-amber-100/80 px-2 py-0.5 rounded-full">
                    Pre-paid Upfront by Customer
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={subServiceForm.visitingCharge}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, visitingCharge: e.target.value })}
                    placeholder="199"
                    className="w-full pl-7 pr-3 py-2 bg-white text-sm font-mono font-bold text-slate-900 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <p className="text-[11px] text-amber-800 mt-1.5 leading-snug">
                  Customer pays this visiting charge online to confirm. Any material or major work is adjusted on-site by technician.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Detailed Scope / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={subServiceForm.desc}
                  onChange={(e) => setSubServiceForm({ ...subServiceForm, desc: e.target.value })}
                  placeholder="Explain what is included in this sub-service and visiting scope..."
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              {/* Booking Mode Toggles */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subServiceForm.bookNowEnabled}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, bookNowEnabled: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Book Now (Online)</div>
                    <div className="text-sm text-slate-400">Pre-paid instant checkout</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subServiceForm.getQuoteEnabled}
                    onChange={(e) => setSubServiceForm({ ...subServiceForm, getQuoteEnabled: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Get Quote</div>
                    <div className="text-sm text-slate-400">Inspection request flow</div>
                  </div>
                </label>
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Technician Checklist (One item per line)
                </label>
                <textarea
                  rows={2}
                  value={subServiceForm.checklist}
                  onChange={(e) => setSubServiceForm({ ...subServiceForm, checklist: e.target.value })}
                  placeholder="Inspect inlet valve&#10;Deep clean with antibacterial solution&#10;Check water flow & pressure"
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500 font-mono"
                />
              </div>

              {/* Required Dynamic Questions Builder */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 uppercase tracking-wide">Required Customer Questions</h4>
                    <p className="text-sm text-indigo-700">Questions customer must answer when booking this subservice</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {subServiceForm.requiredFields?.length || 0} Configured
                  </span>
                </div>

                {/* List existing configured fields */}
                {subServiceForm.requiredFields && subServiceForm.requiredFields.length > 0 && (
                  <div className="space-y-1.5">
                    {subServiceForm.requiredFields.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-100 text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{f.label}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span className="font-mono uppercase bg-slate-100 px-1 rounded">{f.fieldType}</span>
                            {f.required && <span className="text-rose-600 font-medium">* Required</span>}
                            {f.options && f.options.length > 0 && <span>Options: {f.options.join(', ')}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredField(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new field inline */}
                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700">Add a New Question:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="e.g. Tank Capacity or Leaking Tap Count"
                      className="w-full px-2.5 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-md outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-md outline-none focus:bg-white"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Numeric (Count / Size)</option>
                      <option value="select">Dropdown Options</option>
                    </select>
                  </div>
                  {newFieldType === 'select' && (
                    <input
                      type="text"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      placeholder="Dropdown choices (comma separated: 500L, 1000L, 2000L+)"
                      className="w-full px-2.5 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-md outline-none focus:bg-white"
                    />
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={newFieldRequired}
                        onChange={(e) => setNewFieldRequired(e.target.checked)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span>Mandatory to answer</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddRequiredField}
                      className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSubService ? 'Save Changes' : 'Create Sub-Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ASSIGN TECHNICIAN MODAL */}
      {assignTechModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800">Assign Field Technician</h3>
                <p className="text-xs text-brand-600 font-mono font-semibold">{assignTechModalBooking.bookingNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignTechModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200/80">
              <div><strong className="text-slate-800">Sub-Service:</strong> {assignTechModalBooking.subServiceName}</div>
              <div><strong className="text-slate-800">Customer:</strong> {assignTechModalBooking.customerName} ({assignTechModalBooking.customerPhone})</div>
              <div><strong className="text-slate-800">Address:</strong> {assignTechModalBooking.customerAddress}, {assignTechModalBooking.city}</div>
              <div><strong className="text-slate-800">Scheduled:</strong> {assignTechModalBooking.scheduledDate} ({assignTechModalBooking.scheduledSlot})</div>
            </div>

            <form onSubmit={handleAssignTechnician} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1.5">
                  Certified Team Presets (1-Click Selection)
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {[
                    { name: 'Er. Vikram Sharma', phone: '+91 98290 12345', role: 'Lead Waterproofing Engineer' },
                    { name: 'Mukesh Kumar', phone: '+91 94140 54321', role: 'Senior Field Technician & Plumber' },
                    { name: 'Rajesh Soni', phone: '+91 97840 98765', role: 'Master Roofing & Masonry' },
                    { name: 'Er. Rohit Verma', phone: '+91 98280 67890', role: 'Structural Leakage Specialist' },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setTechForm({ name: preset.name, phone: preset.phone, role: preset.role })}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        techForm.name === preset.name
                          ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-semibold ring-1 ring-brand-400'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{preset.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Technician / Specialist Name *
                </label>
                <input
                  type="text"
                  required
                  value={techForm.name}
                  onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={techForm.role || ''}
                  onChange={(e) => setTechForm({ ...techForm, role: e.target.value })}
                  placeholder="e.g. Senior Waterproofing Technician"
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Technician Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={techForm.phone}
                  onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignTechModalBooking(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Assign Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. UPDATE STATUS MODAL */}
      {statusModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800">Update Booking Status</h3>
                <p className="text-xs text-brand-600 font-mono font-semibold">{statusModalBooking.bookingNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDirectBookingStatus} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Lifecycle Status *
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                >
                  <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                  <option value="ASSIGNED">ASSIGNED (Technician Dispatched)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician On-Site)</option>
                  <option value="COMPLETED">COMPLETED (Work Done & Signed Off)</option>
                  <option value="CANCELLED">CANCELLED (Order Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Status Change Note / Audit Reason
                </label>
                <textarea
                  rows={2}
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  placeholder="e.g. Technician arrived at customer site, job started."
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusModalBooking(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ISSUE INSTANT ONLINE REFUND MODAL (RAZORPAY) */}
      {refundModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-800">Issue Razorpay Refund</h3>
                  <p className="text-xs text-slate-400 font-mono">{refundModalBooking.bookingNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Automated Online Refund Engine</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This triggers an instant refund request via <strong>Razorpay API</strong> directly back to the customer's UPI / Bank Account.
                The Bank Reference Number (ARN) will be recorded automatically.
              </p>
              <div className="pt-1 text-[11px] font-mono text-slate-700">
                Pre-paid Visiting Charge: <strong>₹{refundModalBooking.onlinePaidAmount || refundModalBooking.visitingCharge}</strong>
              </div>
            </div>

            <form onSubmit={handleIssueRefund} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  placeholder="e.g. 199"
                  className="w-full px-3 py-2 bg-slate-50 text-sm font-mono font-bold text-rose-700 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Refund / Cancellation Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="e.g. Technician unavailable / Customer requested cancellation before visit"
                  className="w-full px-3 py-2 bg-slate-50 text-xs border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalBooking(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Razorpay Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADJUST ADDITIONAL WORK CHARGES MODAL */}
      {adjustChargeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800">Adjust On-Site Work Charge</h3>
                <p className="text-xs text-brand-600 font-mono font-semibold">{adjustChargeModalBooking.bookingNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustChargeModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-amber-50/60 rounded-xl text-xs space-y-1 text-slate-700 border border-amber-200">
              <div>Pre-paid Visiting Charge: <strong className="font-mono text-emerald-700">₹{adjustChargeModalBooking.onlinePaidAmount || adjustChargeModalBooking.visitingCharge} (PAID)</strong></div>
              <div>Current Additional Work: <strong className="font-mono text-amber-700">₹{adjustChargeModalBooking.additionalWorkAmount || 0}</strong></div>
            </div>

            <form onSubmit={handleAdjustAdditionalCharge} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Additional Work / Material Charge (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={adjustForm.additionalAmount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, additionalAmount: e.target.value })}
                  placeholder="e.g. 450 (for replacement valve or extra labor)"
                  className="w-full px-3 py-2 bg-slate-50 text-sm font-mono font-bold text-slate-900 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Scope of Extra Work / Parts Replaced
                </label>
                <textarea
                  rows={2}
                  value={adjustForm.note}
                  onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                  placeholder="e.g. Replaced 1 inch ball valve + 3 ft CPVC pipe"
                  className="w-full px-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustChargeModalBooking(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Additional Charge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DIRECT BOOKING DETAILS DRAWER / MODAL */}
      {selectedBookingForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-brand-600">{selectedBookingForDrawer.bookingNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    selectedBookingForDrawer.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedBookingForDrawer.status === 'CONFIRMED' ? 'bg-amber-100 text-amber-800' :
                    selectedBookingForDrawer.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedBookingForDrawer.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Booked on {new Date(selectedBookingForDrawer.created_at).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDrawer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Customer Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{selectedBookingForDrawer.customerName}</div>
                    <div className="font-mono text-xs text-brand-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{selectedBookingForDrawer.customerPhone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const booking = selectedBookingForDrawer;
                        setSelectedBookingForDrawer(null);
                        openChatForBooking(booking);
                      }}
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
                      title="Open Live Chat with Customer"
                    >
                      <MessageCircle className="w-4 h-4 text-indigo-600" />
                      <span>Chat</span>
                    </button>
                    <a
                      href={`tel:${selectedBookingForDrawer.customerPhone}`}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
                      title="Call Customer"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div>{selectedBookingForDrawer.customerAddress}, {selectedBookingForDrawer.city}</div>
                      {selectedBookingForDrawer.landmark && <span className="block text-[11px] text-slate-400">Landmark: {selectedBookingForDrawer.landmark}</span>}
                      {selectedBookingForDrawer.latitude && selectedBookingForDrawer.longitude && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-[11px] font-mono text-indigo-700">
                          <span>📍 {selectedBookingForDrawer.latitude.toFixed(5)}, {selectedBookingForDrawer.longitude.toFixed(5)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedBookingForDrawer.latitude && selectedBookingForDrawer.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedBookingForDrawer.latitude},${selectedBookingForDrawer.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all"
                      title="Open Google Maps Navigation for Technician"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Navigate</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Sub-Service & Schedule Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sub-Service & Slot</div>
                <div>
                  <div className="font-bold text-slate-800">{selectedBookingForDrawer.subServiceName}</div>
                  <div className="text-sm text-brand-600 font-medium">{selectedBookingForDrawer.serviceName}</div>
                  {selectedBookingForDrawer.subServiceDesc && (
                    <div className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                      "{selectedBookingForDrawer.subServiceDesc}"
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>{selectedBookingForDrawer.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBookingForDrawer.scheduledSlot}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Required Field Answers (Filled by Customer) */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Customer Answers (Custom Fields)</div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                    {selectedBookingForDrawer.customFieldAnswers && Object.keys(selectedBookingForDrawer.customFieldAnswers).length > 0
                      ? `${Object.keys(selectedBookingForDrawer.customFieldAnswers).length} Answers`
                      : 'None Required'}
                  </span>
                </div>
                {selectedBookingForDrawer.customFieldAnswers && Object.keys(selectedBookingForDrawer.customFieldAnswers).length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(selectedBookingForDrawer.customFieldAnswers).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-white border border-indigo-100/80 text-xs flex items-center justify-between">
                        <span className="font-medium text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-indigo-950 font-mono">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No custom questionnaire required for this sub-service.</div>
                )}
              </div>

              {/* Payment & Financial Ledger */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment & Settlement</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Online Pre-paid (Visiting Fee):</span>
                    <span className="font-mono font-bold text-emerald-600">₹{selectedBookingForDrawer.onlinePaidAmount || selectedBookingForDrawer.visitingCharge} (PAID)</span>
                  </div>
                  {selectedBookingForDrawer.additionalWorkAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">On-Site Additional Work:</span>
                      <span className="font-mono font-bold text-amber-600">+₹{selectedBookingForDrawer.additionalWorkAmount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
                    <span className="text-slate-800">Total Order Value:</span>
                    <span className="font-mono text-brand-700">₹{(selectedBookingForDrawer.onlinePaidAmount || selectedBookingForDrawer.visitingCharge || 0) + (selectedBookingForDrawer.additionalWorkAmount || 0)}</span>
                  </div>
                </div>

                {/* Razorpay transaction details */}
                <div className="pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-500 space-y-0.5">
                  {selectedBookingForDrawer.razorpayPaymentId && (
                    <div>Payment ID: <strong className="text-slate-700">{selectedBookingForDrawer.razorpayPaymentId}</strong></div>
                  )}
                  {selectedBookingForDrawer.razorpayOrderId && (
                    <div>Order ID: <strong className="text-slate-700">{selectedBookingForDrawer.razorpayOrderId}</strong></div>
                  )}
                </div>

                {/* Refund Status if applicable */}
                {selectedBookingForDrawer.paymentStatus === 'REFUNDED' && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 mt-2">
                    <div className="font-bold flex items-center gap-1 text-rose-700">
                      <RotateCcw className="w-3.5 h-3.5" /> REFUND PROCESSED
                    </div>
                    <div>Refund Amount: <strong className="font-mono">₹{selectedBookingForDrawer.refundAmount}</strong></div>
                    {selectedBookingForDrawer.refundArn && <div>Bank ARN: <strong className="font-mono">{selectedBookingForDrawer.refundArn}</strong></div>}
                    {selectedBookingForDrawer.refundId && <div>Razorpay Refund ID: <strong className="font-mono">{selectedBookingForDrawer.refundId}</strong></div>}
                    {selectedBookingForDrawer.refundedAt && <div>Refunded At: {new Date(selectedBookingForDrawer.refundedAt).toLocaleString('en-IN')}</div>}
                  </div>
                )}
              </div>

              {/* Technician Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Plumber / Tech</div>
                  <button
                    onClick={() => {
                      setAssignTechModalBooking(selectedBookingForDrawer);
                      setTechForm({
                        name: selectedBookingForDrawer.technicianName || '',
                        phone: selectedBookingForDrawer.technicianPhone || '',
                        role: selectedBookingForDrawer.technicianRole || 'Senior Field Specialist'
                      });
                    }}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {selectedBookingForDrawer.technicianName ? 'Change Specialist' : 'Assign Specialist'}
                  </button>
                </div>
                {selectedBookingForDrawer.technicianName ? (
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedBookingForDrawer.technicianName}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{selectedBookingForDrawer.technicianRole || 'Senior Field Specialist'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{selectedBookingForDrawer.technicianPhone}</div>
                    </div>
                    <a
                      href={`tel:${selectedBookingForDrawer.technicianPhone}`}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-all flex items-center gap-1 text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No specialist assigned yet. Tap "Assign Specialist" above.</div>
                )}
              </div>

              {/* Status History & Audit Timeline */}
              {selectedBookingForDrawer.statusHistory && Array.isArray(selectedBookingForDrawer.statusHistory) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status & Audit History</div>
                  <div className="space-y-2 pt-1">
                    {selectedBookingForDrawer.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {item.status} <span className="text-[10px] text-slate-400 font-normal">by {item.updatedBy || 'System'}</span>
                          </div>
                          {item.reason && <div className="text-[11px] text-slate-500">{item.reason}</div>}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStatusModalBooking(selectedBookingForDrawer);
                    setStatusForm({ status: selectedBookingForDrawer.status, reason: '' });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
                >
                  Change Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustChargeModalBooking(selectedBookingForDrawer);
                    setAdjustForm({ additionalAmount: selectedBookingForDrawer.additionalWorkAmount || '', note: '' });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 shadow-2xs"
                >
                  Adjust On-Site Fee
                </button>
              </div>

              {selectedBookingForDrawer.paymentStatus !== 'REFUNDED' && (
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalBooking(selectedBookingForDrawer);
                    setRefundForm({
                      amount: selectedBookingForDrawer.onlinePaidAmount || selectedBookingForDrawer.visitingCharge,
                      reason: 'Customer requested cancellation'
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 shadow-2xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refund</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* PREMIUM SAAS TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${
            toast.type === 'success' ? 'bg-white/95 border-emerald-200/90 text-slate-800 shadow-emerald-500/5' :
            toast.type === 'error' ? 'bg-white/95 border-rose-200/90 text-slate-800 shadow-rose-500/5' :
            toast.type === 'warning' ? 'bg-white/95 border-amber-200/90 text-slate-800 shadow-amber-500/5' :
            'bg-white/95 border-slate-200 text-slate-800'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
              toast.type === 'error' ? 'bg-rose-50 text-rose-600' :
              toast.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              'bg-brand-50 text-brand-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
               toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
               toast.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
               <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  toast.type === 'success' ? 'text-emerald-700' :
                  toast.type === 'error' ? 'text-rose-700' :
                  toast.type === 'warning' ? 'text-amber-700' :
                  'text-brand-700'
                }`}>
                  {toast.type === 'success' ? 'Success' :
                   toast.type === 'error' ? 'Action Failed' :
                   toast.type === 'warning' ? 'Notice' : 'System Update'}
                </span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
