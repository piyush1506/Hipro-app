import React, { useState, useEffect } from 'react';
import {
  Phone,
  CheckCircle,
  UserCheck,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Eye,
  FileText,
  User,
  ShieldCheck,
  HardHat,
  ArrowRight
} from 'lucide-react';

const STATUS_CONFIG = {
  NEW: { label: 'New Lead', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONTACTED: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'Verified & Qualified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SITE_VISIT_SCHEDULED: { label: 'Site Visit Scheduled', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  SITE_VISITED: { label: 'Site Visited', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  REQUIREMENTS_CREATED: { label: 'Requirements Created', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  PROCUREMENT_IN_PROGRESS: { label: 'Procurement Active', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  QUOTATIONS_RECEIVED: { label: 'Quotes Received', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  VENDORS_ASSIGNED: { label: 'Vendors Assigned', color: 'bg-green-50 text-green-700 border-green-200' },
  PROJECT_STARTED: { label: 'Project Started', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  IN_PROGRESS: { label: 'Work In Progress', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  REJECTED: { label: 'Rejected', color: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export default function LeadsPipelineView({
  currentUserRole = 'SUPER_ADMIN',
  userPermissions = [],
  onOpenRequirementBuilder,
  onOpenProcurement
}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [countsByStatus, setCountsByStatus] = useState({});
  const [engineers, setEngineers] = useState([]);

  // Modals state
  const [selectedLead, setSelectedLead] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyPreferredDate, setVerifyPreferredDate] = useState('');
  const [verifyPreferredTime, setVerifyPreferredTime] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEngineerId, setAssignEngineerId] = useState('');
  const [assignScheduledDate, setAssignScheduledDate] = useState('');
  const [assignScheduledTime, setAssignScheduledTime] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Customer not interested');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    city: 'Bhilwara',
    serviceName: 'Civil Construction',
    issueDescription: '',
    preferredDate: '',
    source: 'MANUAL'
  });

  const [submitting, setSubmitting] = useState(false);

  const isTelecaller = currentUserRole === 'TELECALLER';
  const isCivilEngineer = currentUserRole === 'CIVIL_ENGINEER';
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN' || userPermissions.includes('*');

  // Can actions
  const canVerify = isSuperAdmin || isTelecaller || userPermissions.includes('leads.verify');
  const canAssign = isSuperAdmin || isTelecaller || userPermissions.includes('leads.assign');
  const canCreateReq = isSuperAdmin || isCivilEngineer || userPermissions.includes('requirements.create');

  useEffect(() => {
    fetchLeads();
    fetchEngineers();
  }, [statusFilter, sourceFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/leads?`;
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (sourceFilter !== 'ALL') url += `source=${sourceFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setCountsByStatus(data.countsByStatus || {});
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await fetch('/api/v1/staff');
      const data = await res.json();
      if (data.success && data.staff) {
        // Filter staff with CIVIL_ENGINEER or SUPER_ADMIN
        const engs = data.staff.filter(
          s => s.role?.name === 'CIVIL_ENGINEER' || s.role?.name === 'SUPER_ADMIN'
        );
        setEngineers(engs);
        if (engs.length > 0) setAssignEngineerId(engs[0].id);
      }
    } catch (e) {
      console.error('Fetch engineers error:', e);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/leads/${selectedLead.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telecallerNotes: verifyNotes,
          preferredDate: verifyPreferredDate,
          preferredTime: verifyPreferredTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowVerifyModal(false);
        fetchLeads();
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead || !assignEngineerId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/leads/${selectedLead.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineerId: assignEngineerId,
          scheduledDate: assignScheduledDate,
          scheduledTime: assignScheduledTime,
          notes: assignNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAssignModal(false);
        fetchLeads();
      } else {
        alert(data.message || 'Assignment failed');
      }
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/leads/${selectedLead.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        fetchLeads();
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateForm({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          city: 'Bhilwara',
          serviceName: 'Civil Construction',
          issueDescription: '',
          preferredDate: '',
          source: 'MANUAL'
        });
        fetchLeads();
      } else {
        alert(data.message || 'Creation failed');
      }
    } catch (err) {
      console.error('Create lead error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.leadNumber || '').toLowerCase().includes(q) ||
      (l.customerName || '').toLowerCase().includes(q) ||
      (l.customerPhone || '').includes(q) ||
      (l.serviceName || '').toLowerCase().includes(q) ||
      (l.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Pipeline KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
              Customer Leads & Project Pipeline
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
              Role: {currentUserRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming customer requirements from Cart, Online Payments, Inspection requests, and Telecaller qualification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          {(isSuperAdmin || isTelecaller) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { key: 'ALL', label: 'All Leads', count: leads.length },
          { key: 'NEW', label: '1. New Leads', count: countsByStatus['NEW'] || 0 },
          { key: 'CONTACTED', label: '2. Contacted', count: countsByStatus['CONTACTED'] || 0 },
          { key: 'VERIFIED', label: '3. Qualified for Visit', count: countsByStatus['VERIFIED'] || 0 },
          { key: 'SITE_VISIT_SCHEDULED', label: '4. Visit Scheduled', count: countsByStatus['SITE_VISIT_SCHEDULED'] || 0 },
          { key: 'REQUIREMENTS_CREATED', label: '5. Requirements Ready', count: countsByStatus['REQUIREMENTS_CREATED'] || 0 },
          { key: 'PROCUREMENT_IN_PROGRESS', label: '6. In Procurement', count: countsByStatus['PROCUREMENT_IN_PROGRESS'] || 0 },
          { key: 'VENDORS_ASSIGNED', label: '7. Vendors Assigned', count: countsByStatus['VENDORS_ASSIGNED'] || 0 },
          { key: 'PROJECT_STARTED', label: '8. Projects Active', count: countsByStatus['PROJECT_STARTED'] || 0 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Source Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead number, customer, phone, service..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold text-slate-400">Source:</span>
          {['ALL', 'INSPECTION', 'PAYMENT', 'CART', 'MANUAL'].map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                sourceFilter === s
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Cards Grid */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Loading customer leads pipeline...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No leads found in this stage</h4>
          <p className="text-xs text-slate-400 mt-1">Try switching status filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredLeads.map(lead => {
            const statusConfig = STATUS_CONFIG[lead.status] || { label: lead.status, color: 'bg-slate-100 text-slate-600 border-slate-200' };

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Lead Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-primary-700 tracking-tight">
                          {lead.leadNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {lead.source}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-slate-900 mt-1">
                        {lead.serviceName}
                      </h3>
                      {lead.subServiceName && (
                        <p className="text-xs font-semibold text-primary-600">{lead.subServiceName}</p>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border shrink-0 ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Customer Information Block */}
                  <div className="p-3 bg-slate-50/90 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100 font-medium">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.customerName}</span>
                      </div>
                      <a
                        href={`tel:${lead.customerPhone}`}
                        className="inline-flex items-center gap-1 text-primary-600 font-bold hover:underline"
                        title="Click to Call"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.customerPhone}</span>
                      </a>
                    </div>

                    {lead.location && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.location}, {lead.city}</span>
                      </div>
                    )}

                    {lead.preferredDate && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Preferred: {lead.preferredDate} {lead.preferredTime || ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Issue Description */}
                  {lead.issueDescription && (
                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      <span className="font-bold text-slate-700">Requirement: </span>
                      {lead.issueDescription}
                    </div>
                  )}

                  {/* Media Thumbnails */}
                  {Array.isArray(lead.mediaUrl) && lead.mediaUrl.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {lead.mediaUrl.slice(0, 4).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Evidence"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80'; }}
                        />
                      ))}
                      {lead.mediaUrl.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
                          +{lead.mediaUrl.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Qualification Badges */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
                    {lead.verifiedBy ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified by {lead.verifiedBy.name}</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Pending Verification
                      </span>
                    )}

                    {lead.assignedTo ? (
                      <span className="flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        <HardHat className="w-3 h-3 text-purple-600" />
                        <span>Eng. {lead.assignedTo.name}</span>
                      </span>
                    ) : (
                      lead.status === 'VERIFIED' && (
                        <span className="text-slate-400">Needs Engineer</span>
                      )
                    )}
                  </div>
                </div>

                {/* Pipeline Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Step 1: Telecaller Verify */}
                  {lead.status === 'NEW' || lead.status === 'CONTACTED' ? (
                    <div className="flex items-center gap-1.5 w-full">
                      {canVerify && (
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setVerifyNotes(lead.telecallerNotes || '');
                            setVerifyPreferredDate(lead.preferredDate || '');
                            setVerifyPreferredTime(lead.preferredTime || '');
                            setShowVerifyModal(true);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verify & Qualify</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowRejectModal(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all"
                        title="Reject Lead"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : lead.status === 'VERIFIED' ? (
                    /* Step 2: Assign Civil Engineer */
                    <div className="w-full">
                      {canAssign && (
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setAssignScheduledDate(lead.preferredDate || '');
                            setAssignScheduledTime(lead.preferredTime || '');
                            setShowAssignModal(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <HardHat className="w-3.5 h-3.5" />
                          <span>Assign Civil Engineer</span>
                        </button>
                      )}
                    </div>
                  ) : lead.status === 'SITE_VISIT_SCHEDULED' ? (
                    /* Step 3: Civil Engineer Site Visit → Requirement Analysis */
                    <div className="w-full">
                      {canCreateReq ? (
                        <button
                          onClick={() => {
                            if (onOpenRequirementBuilder) {
                              onOpenRequirementBuilder(lead);
                            }
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Create Requirement Analysis</span>
                        </button>
                      ) : (
                        <span className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Site visit pending by {lead.assignedTo?.name || 'Engineer'}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Step 4+: Procurement / Quotation Review */
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold text-slate-600">
                        {lead.requirementAnalysis ? (
                          <span>
                            {lead.requirementAnalysis._count?.materialRequirements || 0} Materials • {lead.requirementAnalysis._count?.laborRequirements || 0} Labor
                          </span>
                        ) : 'Requirements logged'}
                      </span>

                      <button
                        onClick={() => {
                          if (onOpenProcurement) onOpenProcurement(lead);
                        }}
                        className="py-1.5 px-3 rounded-lg text-primary-600 hover:bg-primary-50 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span>Open Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verify Lead Modal */}
      {showVerifyModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Verify & Qualify Lead
                </h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-800">{selectedLead.customerName}</span> ({selectedLead.customerPhone})
                <p className="text-slate-500">{selectedLead.serviceName} • {selectedLead.city}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telecaller Qualification Notes *</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Spoke to customer, confirmed site address, customer requested visit on Saturday morning..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirmed Date</label>
                  <input
                    type="date"
                    value={verifyPreferredDate}
                    onChange={(e) => setVerifyPreferredDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                  <input
                    type="text"
                    value={verifyPreferredTime}
                    onChange={(e) => setVerifyPreferredTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 12:00 PM"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Verifying...' : 'Confirm Qualification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Civil Engineer Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-purple-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Assign Civil Engineer for Site Visit
                </h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Civil Engineer *</label>
                <select
                  value={assignEngineerId}
                  onChange={(e) => setAssignEngineerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  required
                >
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.phone || eng.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={assignScheduledDate}
                    onChange={(e) => setAssignScheduledDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Window</label>
                  <input
                    type="text"
                    value={assignScheduledTime}
                    onChange={(e) => setAssignScheduledTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions for Engineer</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Inspect RCC slab cracks and estimate shuttering & cement requirements..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Assigning...' : 'Dispatch Engineer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Lead Modal */}
      {showRejectModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-heading font-bold text-base text-red-600">
              Reject Lead {selectedLead.leadNumber}
            </h3>

            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Customer not interested">Customer not interested</option>
                  <option value="Invalid or unreachable phone number">Invalid or unreachable phone number</option>
                  <option value="Out of service area">Out of service area</option>
                  <option value="Duplicate lead">Duplicate lead</option>
                  <option value="Customer budget mismatch">Customer budget mismatch</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Create New Customer Lead
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service</label>
                  <input
                    type="text"
                    value={createForm.serviceName}
                    onChange={(e) => setCreateForm({ ...createForm, serviceName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Address</label>
                <input
                  type="text"
                  value={createForm.customerAddress}
                  onChange={(e) => setCreateForm({ ...createForm, customerAddress: e.target.value })}
                  placeholder="e.g. 42 Shanti Nagar, Near Court Road"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Description</label>
                <textarea
                  rows={2}
                  value={createForm.issueDescription}
                  onChange={(e) => setCreateForm({ ...createForm, issueDescription: e.target.value })}
                  placeholder="e.g. Slab casting 1500 sq ft, requires shuttering and labor"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
