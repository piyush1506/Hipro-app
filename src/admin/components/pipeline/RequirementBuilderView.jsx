import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Send,
  HardHat,
  Package,
  Users,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';

const MATERIAL_CATEGORIES = [
  'Carpentry Products & Wood',
  'Iron & Steel (TMT)',
  'Cement & Concrete',
  'Tiles & Flooring',
  'Plumbing & Pipes',
  'Electrical & Wiring',
  'Paint & Putty',
  'Hardware & Fasteners',
  'Glass & Aluminum',
  'Waterproofing Chemicals',
  'Sand & Aggregates',
  'General Materials'
];

const LABOR_TYPES = [
  'Mason (Mistri)',
  'Helper / Beldar',
  'Carpenter (Badhai)',
  'Electrician',
  'Plumber',
  'Painter',
  'Tiler / Marble Layer',
  'Welder / Fabricator',
  'Waterproofing Specialist',
  'Shuttering Carpenter',
  'Commercial Labor'
];

const UNIT_OPTIONS = [
  'Sq Ft',
  'Running Ft',
  'Bags',
  'Kg / Ton',
  'Pieces',
  'Lumpsum',
  'Truck / Dumper',
  'Hours',
  'Points'
];

export default function RequirementBuilderView({
  selectedLead,
  onBack,
  onRequirementCreated
}) {
  const [siteNotes, setSiteNotes] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('2-3 Weeks');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);

  // Materials rows
  const [materials, setMaterials] = useState([
    {
      materialName: '',
      materialCategory: 'Cement & Concrete',
      specification: '',
      quantity: 50,
      unit: 'Bags',
      estimatedRate: 380,
      notes: ''
    }
  ]);

  // Labor rows
  const [labors, setLabors] = useState([
    {
      laborType: 'Mason (Mistri)',
      laborCategory: 'Civil',
      numberOfWorkers: 2,
      durationDays: 7,
      skillLevel: 'Skilled',
      estimatedRate: 900,
      description: ''
    },
    {
      laborType: 'Helper / Beldar',
      laborCategory: 'Civil',
      numberOfWorkers: 3,
      durationDays: 7,
      skillLevel: 'Unskilled',
      estimatedRate: 500,
      description: ''
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto calculate total budget
  const materialTotal = materials.reduce((sum, m) => sum + ((parseFloat(m.quantity) || 0) * (parseFloat(m.estimatedRate) || 0)), 0);
  const laborTotal = labors.reduce((sum, l) => sum + ((parseInt(l.numberOfWorkers, 10) || 0) * (parseInt(l.durationDays, 10) || 1) * (parseFloat(l.estimatedRate) || 0)), 0);
  const grandTotal = materialTotal + laborTotal;

  // Add material row
  const addMaterialRow = () => {
    setMaterials([
      ...materials,
      {
        materialName: '',
        materialCategory: 'General Materials',
        specification: '',
        quantity: 1,
        unit: 'Pieces',
        estimatedRate: 0,
        notes: ''
      }
    ]);
  };

  const removeMaterialRow = (idx) => {
    setMaterials(materials.filter((_, i) => i !== idx));
  };

  const updateMaterialRow = (idx, field, value) => {
    const updated = [...materials];
    updated[idx][field] = value;
    setMaterials(updated);
  };

  // Add labor row
  const addLaborRow = () => {
    setLabors([
      ...labors,
      {
        laborType: 'Mason (Mistri)',
        laborCategory: 'Civil',
        numberOfWorkers: 1,
        durationDays: 1,
        skillLevel: 'Skilled',
        estimatedRate: 800,
        description: ''
      }
    ]);
  };

  const removeLaborRow = (idx) => {
    setLabors(labors.filter((_, i) => i !== idx));
  };

  const updateLaborRow = (idx, field, value) => {
    const updated = [...labors];
    updated[idx][field] = value;
    setLabors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) {
      setErrorMsg('Please select a lead first');
      return;
    }

    if (materials.length === 0 && labors.length === 0) {
      setErrorMsg('Please add at least one material or labor requirement');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          siteNotes,
          inspectionDate,
          estimatedBudget: grandTotal,
          estimatedDuration,
          materials: materials.filter(m => m.materialName && m.materialName.trim()),
          labors: labors.filter(l => l.laborType)
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Requirement analysis successfully created and routed to Purchase Person!');
        setTimeout(() => {
          if (onRequirementCreated) onRequirementCreated(data.analysis);
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Failed to submit requirements');
      }
    } catch (err) {
      console.error('Submit requirement error:', err);
      setErrorMsg('Network error while saving requirement analysis');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-primary-600" />
              <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                Civil Engineer Requirement Analysis & Scope Split
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Split site inspection into Material Procurement (routed to Purchase Person) and Labor Contractors.
            </p>
          </div>
        </div>

        {selectedLead && (
          <div className="text-right">
            <span className="font-mono font-bold text-sm text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
              {selectedLead.leadNumber}
            </span>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {selectedLead.customerName} • {selectedLead.city}
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Inspection Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-xs">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Site Visit Findings & Overall Estimates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Project Timeline</label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 10 Working Days, 3 Weeks"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Budget (₹)</label>
              <div className="p-2 bg-slate-100 rounded-xl font-mono font-bold text-sm text-slate-800">
                ₹{grandTotal.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Civil Engineer Site Notes & Scope Summary</label>
            <textarea
              rows={3}
              value={siteNotes}
              onChange={(e) => setSiteNotes(e.target.value)}
              placeholder="e.g. Inspection of 2nd floor roof slab. Shuttering needed with 18mm ply, 12mm TMT reinforcement, M-25 grade concrete mix..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Section 1: Material Requirements (Routes to Purchase Person) */}
        <div className="bg-white p-5 rounded-2xl border border-cyan-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                <Package className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  1. Material Requirements & Specifications
                </h3>
                <p className="text-[11px] text-slate-500">
                  Forwarded to Purchase Person to match with material suppliers and request quotations.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addMaterialRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Material Name *</th>
                  <th className="py-2.5 px-3">Product Category</th>
                  <th className="py-2.5 px-3">Specification</th>
                  <th className="py-2.5 px-2 w-20">Qty</th>
                  <th className="py-2.5 px-2 w-28">Unit</th>
                  <th className="py-2.5 px-2 w-24">Est. Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m, idx) => {
                  const lineTotal = (parseFloat(m.quantity) || 0) * (parseFloat(m.estimatedRate) || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={m.materialName}
                          onChange={(e) => updateMaterialRow(idx, 'materialName', e.target.value)}
                          placeholder="e.g. TMT Steel Bar 12mm"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={m.materialCategory}
                          onChange={(e) => updateMaterialRow(idx, 'materialCategory', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          {MATERIAL_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={m.specification}
                          onChange={(e) => updateMaterialRow(idx, 'specification', e.target.value)}
                          placeholder="e.g. Fe-550D Grade ISI"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={m.quantity}
                          onChange={(e) => updateMaterialRow(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={m.unit}
                          onChange={(e) => updateMaterialRow(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          {UNIT_OPTIONS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={m.estimatedRate}
                          onChange={(e) => updateMaterialRow(idx, 'estimatedRate', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeMaterialRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end font-bold text-xs text-slate-700">
            <span>Material Subtotal: <span className="font-mono text-cyan-700">₹{materialTotal.toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {/* Section 2: Labor Requirements (Routes to Labor Contractors) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  2. Labor & Skilled Trade Requirements
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dispatched to labor vendors (Masons, Helpers, Carpenters, Electricians, Plumbers).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addLaborRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Labor Trade</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Labor Trade *</th>
                  <th className="py-2.5 px-3">Skill Level</th>
                  <th className="py-2.5 px-2 w-24 text-center">Workers</th>
                  <th className="py-2.5 px-2 w-24 text-center">Days</th>
                  <th className="py-2.5 px-2 w-28">Rate / Day (₹)</th>
                  <th className="py-2.5 px-3 text-right">Estimated Cost (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labors.map((l, idx) => {
                  const lineTotal = (parseInt(l.numberOfWorkers, 10) || 0) * (parseInt(l.durationDays, 10) || 1) * (parseFloat(l.estimatedRate) || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <select
                          value={l.laborType}
                          onChange={(e) => updateLaborRow(idx, 'laborType', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {LABOR_TYPES.map(trade => (
                            <option key={trade} value={trade}>{trade}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={l.skillLevel}
                          onChange={(e) => updateLaborRow(idx, 'skillLevel', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Skilled">Skilled</option>
                          <option value="Semi-Skilled">Semi-Skilled</option>
                          <option value="Unskilled">Unskilled</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={l.numberOfWorkers}
                          onChange={(e) => updateLaborRow(idx, 'numberOfWorkers', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={l.durationDays}
                          onChange={(e) => updateLaborRow(idx, 'durationDays', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={l.estimatedRate}
                          onChange={(e) => updateLaborRow(idx, 'estimatedRate', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLaborRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end font-bold text-xs text-slate-700">
            <span>Labor Subtotal: <span className="font-mono text-amber-800">₹{laborTotal.toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {/* Grand Total & Submit Actions */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Project Estimated Budget
            </span>
            <div className="font-heading font-extrabold text-2xl text-emerald-400 mt-0.5">
              ₹{grandTotal.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              {materials.length} material lines + {labors.length} labor trades
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="py-2.5 px-4 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                Back
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit & Route to Purchase Person'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
