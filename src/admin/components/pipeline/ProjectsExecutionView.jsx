import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  User,
  HardHat,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Building,
  Check
} from 'lucide-react';

const PROJECT_STAGES = [
  'PLANNING',
  'MATERIAL_PROCUREMENT',
  'LABOR_MOBILIZATION',
  'IN_PROGRESS',
  'INSPECTION',
  'COMPLETED'
];

export default function ProjectsExecutionView({
  currentUserRole = 'CIVIL_ENGINEER'
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error('Fetch projects error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    setUpdatingId(projectId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (e) {
      console.error('Update project status error:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary-600" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
              Active Construction & Services Projects
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervised by Civil Engineers with tracked material delivery and labor execution stages.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading active projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-sm text-slate-700">No active projects yet</h4>
          <p className="text-xs text-slate-400 mt-1">
            Projects are initialized once all material and labor vendor quotations are awarded.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(proj => {
            const currentStageIdx = PROJECT_STAGES.indexOf(proj.status);

            return (
              <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200">
                        {proj.projectNumber}
                      </span>
                      <h3 className="font-heading font-bold text-base text-slate-900">
                        {proj.lead?.serviceName || 'Construction Project'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Customer: <strong>{proj.lead?.customerName}</strong> ({proj.lead?.customerPhone}) • {proj.lead?.location}, {proj.lead?.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Project Budget</span>
                    <span className="font-mono font-extrabold text-lg text-emerald-600">
                      ₹{(proj.totalBudget || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Stages Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>Stage: {proj.status.replace('_', ' ')}</span>
                    <span>Civil Engineer: {proj.manager?.name || 'Unassigned'}</span>
                  </div>

                  <div className="grid grid-cols-6 gap-1 bg-slate-100 p-1 rounded-xl">
                    {PROJECT_STAGES.map((st, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div
                          key={st}
                          className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-bold truncate transition-all ${
                            isCurrent
                              ? 'bg-primary-600 text-white shadow-xs'
                              : isPast
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Started: {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'Pending'}
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-500">Update Stage:</label>
                    <select
                      value={proj.status}
                      disabled={updatingId === proj.id}
                      onChange={(e) => handleUpdateStatus(proj.id, e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white focus:outline-none"
                    >
                      {PROJECT_STAGES.map(st => (
                        <option key={st} value={st}>{st.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
