import React, { useState, useEffect } from 'react';
import {
  Package,
  Users,
  Send,
  CheckCircle,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Filter,
  Search,
  Check,
  X,
  FileText,
  Star,
  RefreshCw,
  Award,
  ChevronRight,
  TrendingDown,
  Building2
} from 'lucide-react';

export default function ProcurementRFQView({
  selectedLead,
  currentUserRole = 'PURCHASE_PERSON',
  onBack,
  onVendorsAssigned
}) {
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'labors'
  const [requirementsData, setRequirementsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // RFQ modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [matchingVendors, setMatchingVendors] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [sendingRFQ, setSendingRFQ] = useState(false);
  const [rfqSuccessMsg, setRfqSuccessMsg] = useState('');

  // Compare modal state
  const [comparingReq, setComparingReq] = useState(null);
  const [rfqQuotes, setRfqQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    if (selectedLead?.id) {
      fetchRequirements();
    }
  }, [selectedLead]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/requirements/lead/${selectedLead.id}`);
      const data = await res.json();
      if (data.success) {
        setRequirementsData(data.analysis);
      }
    } catch (err) {
      console.error('Fetch requirements error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRFQModal = async (reqItem, type) => {
    setSelectedReq({ ...reqItem, type });
    setSelectedVendorIds([]);
    setRfqSuccessMsg('');

    try {
      // Fetch vendors filtered by type and category
      const categoryParam = type === 'MATERIAL'
        ? `vendorType=MATERIAL&materialCategory=${encodeURIComponent(reqItem.materialCategory)}`
        : `vendorType=LABOR&laborCategory=${encodeURIComponent(reqItem.laborType || reqItem.laborCategory)}`;

      const res = await fetch(`/api/v1/vendors?${categoryParam}&status=active`);
      const data = await res.json();
      if (data.success) {
        // If no vendors matched specific category, fetch all vendors of that type
        if (data.vendors.length === 0) {
          const fallbackRes = await fetch(`/api/v1/vendors?vendorType=${type}&status=active`);
          const fallbackData = await fallbackRes.json();
          setMatchingVendors(fallbackData.vendors || []);
        } else {
          setMatchingVendors(data.vendors || []);
        }
      }
    } catch (e) {
      console.error('Fetch matching vendors error:', e);
    }
  };

  const handleSendRFQ = async () => {
    if (!selectedReq || selectedVendorIds.length === 0) return;
    setSendingRFQ(true);
    try {
      const res = await fetch('/api/v1/rfq/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedReq.type,
          requirementId: selectedReq.id,
          vendorIds: selectedVendorIds
        })
      });
      const data = await res.json();
      if (data.success) {
        setRfqSuccessMsg(`RFQ dispatched to ${selectedVendorIds.length} vendor(s)!`);
        setTimeout(() => {
          setSelectedReq(null);
          fetchRequirements();
        }, 1200);
      } else {
        alert(data.message || 'Failed to send RFQ');
      }
    } catch (e) {
      console.error('Send RFQ error:', e);
    } finally {
      setSendingRFQ(false);
    }
  };

  const handleOpenCompareModal = async (reqItem, type) => {
    setComparingReq({ ...reqItem, type });
    setLoadingQuotes(true);
    try {
      const res = await fetch(`/api/v1/rfq/compare/${reqItem.id}?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setRfqQuotes(data.rfqs || []);
      }
    } catch (e) {
      console.error('Fetch comparison error:', e);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleAssignWinner = async (rfqId) => {
    if (!confirm('Confirm assignment of this vendor quotation? This will lock in the budget and notify the vendor.')) return;
    setAssigningId(rfqId);
    try {
      const res = await fetch(`/api/v1/rfq/${rfqId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setComparingReq(null);
        fetchRequirements();
        if (onVendorsAssigned) onVendorsAssigned();
      } else {
        alert(data.message || 'Assignment failed');
      }
    } catch (e) {
      console.error('Assign error:', e);
    } finally {
      setAssigningId(null);
    }
  };

  const toggleVendorSelection = (id) => {
    if (selectedVendorIds.includes(id)) {
      setSelectedVendorIds(selectedVendorIds.filter(vId => vId !== id));
    } else {
      setSelectedVendorIds([...selectedVendorIds, id]);
    }
  };

  const materials = requirementsData?.materialRequirements || [];
  const labors = requirementsData?.laborRequirements || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
              Procurement & Vendor Quotation Desk
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Role: {currentUserRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Match material & labor requirements with categorized vendors, dispatch RFQs, and select best quality & budget quotes.
          </p>
        </div>

        {selectedLead && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-mono font-bold text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                {selectedLead.leadNumber}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold">{selectedLead.customerName} • {selectedLead.city}</p>
            </div>
            {onBack && (
              <button onClick={onBack} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                Back
              </button>
            )}
          </div>
        )}
      </div>

      {/* Material / Labor Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Material Procurement ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('labors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'labors'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Labor Contracts ({labors.length})</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading requirements scope...</p>
        </div>
      ) : activeTab === 'materials' ? (
        /* Materials Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Material Item & Category</th>
                <th className="py-3 px-4">Specification</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Est. Rate</th>
                <th className="py-3 px-4">Procurement Status</th>
                <th className="py-3 px-4">Assigned Vendor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No material requirements generated yet for this project.
                  </td>
                </tr>
              ) : (
                materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.materialName}</div>
                      <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-100">
                        {m.materialCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.specification || 'Standard Grade'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{m.quantity} {m.unit}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">₹{m.estimatedRate || '–'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.status === 'VENDOR_ASSIGNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        m.status === 'QUOTATIONS_RECEIVED' ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                        m.status === 'RFQ_SENT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {m.assignedVendor ? (
                        <div>
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{m.assignedVendor.businessName || m.assignedVendor.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">₹{m.assignedPrice?.toLocaleString('en-IN')}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {m.status === 'VENDOR_ASSIGNED' ? (
                        <span className="text-xs font-bold text-emerald-600">Locked</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRFQModal(m, 'MATERIAL')}
                            className="py-1 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send RFQ</span>
                          </button>

                          {m.status === 'QUOTATIONS_RECEIVED' || (m.rfqs && m.rfqs.length > 0) ? (
                            <button
                              onClick={() => handleOpenCompareModal(m, 'MATERIAL')}
                              className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                            >
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>Compare ({m.rfqs?.length || 0})</span>
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Labors Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Labor Trade</th>
                <th className="py-3 px-3">Skill Level</th>
                <th className="py-3 px-3">Workers</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Vendor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No labor requirements generated for this project.
                  </td>
                </tr>
              ) : (
                labors.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{l.laborType}</td>
                    <td className="py-3 px-3 text-slate-600">{l.skillLevel}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{l.numberOfWorkers} workers</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{l.durationDays} days</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'VENDOR_ASSIGNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        l.status === 'QUOTATIONS_RECEIVED' ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                        l.status === 'RFQ_SENT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {l.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {l.assignedVendor ? (
                        <div>
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{l.assignedVendor.businessName || l.assignedVendor.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">₹{l.assignedPrice?.toLocaleString('en-IN')}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === 'VENDOR_ASSIGNED' ? (
                        <span className="text-xs font-bold text-emerald-600">Locked</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRFQModal(l, 'LABOR')}
                            className="py-1 px-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send RFQ</span>
                          </button>

                          {l.status === 'QUOTATIONS_RECEIVED' || (l.rfqs && l.rfqs.length > 0) ? (
                            <button
                              onClick={() => handleOpenCompareModal(l, 'LABOR')}
                              className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1"
                            >
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>Compare ({l.rfqs?.length || 0})</span>
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Send RFQ to matching vendors */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Send RFQ for {selectedReq.materialName || selectedReq.laborType}
                </h3>
                <p className="text-xs text-slate-500">
                  Select {selectedReq.type === 'MATERIAL' ? 'Material Suppliers' : 'Labor Contractors'} to receive this quotation request.
                </p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rfqSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
                {rfqSuccessMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Matching Active Vendors ({matchingVendors.length} found)
              </label>

              <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2">
                {matchingVendors.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No active {selectedReq.type} vendors found matching this category. Please add or verify vendors in the Vendor Network tab.
                  </p>
                ) : (
                  matchingVendors.map(v => {
                    const isSelected = selectedVendorIds.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        onClick={() => toggleVendorSelection(v.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500 text-primary-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{v.businessName || v.name}</span>
                            <span className="text-[10px] font-bold text-yellow-500 flex items-center">
                              ★ {v.rating || 5.0}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {v.city} • Exp: {v.experience || '3+ Yrs'} • Type: {v.vendorType}
                          </p>
                        </div>

                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingRFQ || selectedVendorIds.length === 0}
                onClick={handleSendRFQ}
                className="flex-1 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {sendingRFQ ? 'Sending...' : `Send RFQ to (${selectedVendorIds.length}) Vendors`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Compare Quotations Side-by-Side & Assign Winner */}
      {comparingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Vendor Quotation Matrix: {comparingReq.materialName || comparingReq.laborType}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Compare vendor price quotes, delivery timelines, and quality specifications to award the contract.
                </p>
              </div>
              <button onClick={() => setComparingReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingQuotes ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading quotations...</p>
              </div>
            ) : rfqQuotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No vendor quotations received yet. RFQs are still pending vendor response.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rfqQuotes.map((q, idx) => {
                  const isAccepted = q.status === 'ACCEPTED';
                  const isQuoted = q.status === 'QUOTED';

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isAccepted
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : idx === 0
                          ? 'bg-white border-amber-300 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {q.vendor?.businessName || q.vendor?.name}
                          </span>
                          <span className="text-yellow-500 font-bold flex items-center text-xs">
                            ★ {q.vendor?.rating || 5.0}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              Lowest Price
                            </span>
                          )}
                        </div>

                        <div className="text-slate-600 text-[11px] space-x-3">
                          <span>Timeline: <strong>{q.quotedTimeline || 'Immediate'}</strong></span>
                          <span>•</span>
                          <span>Quality: <strong>{q.qualityDetails || 'Standard Grade Verified'}</strong></span>
                        </div>

                        {q.quotedNotes && (
                          <p className="text-[11px] text-slate-500 italic">"{q.quotedNotes}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-base text-slate-900">
                            {q.quotedPrice ? `₹${q.quotedPrice.toLocaleString('en-IN')}` : 'Pending Quote'}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Quoted Amount</span>
                        </div>

                        {isAccepted ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5" /> Awarded
                          </span>
                        ) : isQuoted ? (
                          <button
                            onClick={() => handleAssignWinner(q.id)}
                            disabled={assigningId === q.id}
                            className="py-1.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
                          >
                            {assigningId === q.id ? 'Assigning...' : 'Assign Vendor'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Awaiting Response</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
