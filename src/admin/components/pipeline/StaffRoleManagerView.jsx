import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Key,
  Users,
  ShieldAlert,
  Save,
  RefreshCw,
  Search
} from 'lucide-react';

const ALL_PERMISSION_MODULES = [
  {
    module: 'Leads Pipeline',
    permissions: [
      { key: 'leads.view', label: 'View Leads Pipeline' },
      { key: 'leads.verify', label: 'Verify & Qualify Leads (Telecaller)' },
      { key: 'leads.contact', label: 'Contact Customer' },
      { key: 'leads.assign', label: 'Assign Civil Engineer' },
      { key: 'leads.reject', label: 'Reject Leads' },
      { key: 'leads.delete', label: 'Delete Leads' }
    ]
  },
  {
    module: 'Site Inspection & Requirements',
    permissions: [
      { key: 'requirements.view', label: 'View Requirements' },
      { key: 'requirements.create', label: 'Create Requirement Analysis (Civil Eng.)' },
      { key: 'requirements.edit', label: 'Edit Requirements Scope' },
      { key: 'requirements.approve', label: 'Approve Requirements' }
    ]
  },
  {
    module: 'Material Procurement & RFQ',
    permissions: [
      { key: 'procurement.view', label: 'View Procurement Dashboard' },
      { key: 'procurement.send_rfq', label: 'Send RFQs to Material Suppliers' },
      { key: 'procurement.compare', label: 'Compare Quotations Side-by-Side' },
      { key: 'procurement.assign', label: 'Award Contract & Assign Supplier' }
    ]
  },
  {
    module: 'Labor & Contracting',
    permissions: [
      { key: 'labor.view', label: 'View Labor Requirements' },
      { key: 'labor.send_rfq', label: 'Send RFQs to Labor Vendors' },
      { key: 'labor.compare', label: 'Compare Labor Quotations' },
      { key: 'labor.assign', label: 'Assign Labor Contractors' }
    ]
  },
  {
    module: 'Vendor Network',
    permissions: [
      { key: 'vendors.view', label: 'View Vendors Directory' },
      { key: 'vendors.create', label: 'Add / Empanel New Vendors' },
      { key: 'vendors.edit', label: 'Edit Vendor Profiles' },
      { key: 'vendors.verify_kyc', label: 'Verify / Revoke KYC Documents' },
      { key: 'vendors.delete', label: 'Delete Vendors' }
    ]
  },
  {
    module: 'Projects Execution',
    permissions: [
      { key: 'projects.view', label: 'View Active Projects' },
      { key: 'projects.manage', label: 'Manage & Update Project Status' },
      { key: 'projects.close', label: 'Close & Complete Projects' }
    ]
  },
  {
    module: 'Quotations & Billing',
    permissions: [
      { key: 'quotations.view', label: 'View Customer Quotations' },
      { key: 'quotations.create', label: 'Generate Official BOQ Quotations' },
      { key: 'quotations.approve', label: 'Approve Quotations' }
    ]
  },
  {
    module: 'System Administration',
    permissions: [
      { key: 'rbac.manage', label: 'Manage Staff Members & Roles' },
      { key: 'services.edit', label: 'Manage Services Catalog' },
      { key: 'reports.view', label: 'View Reports & Analytics' }
    ]
  }
];

export default function StaffRoleManagerView() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'roles'
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: ''
  });

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    displayName: '',
    description: '',
    permissions: []
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/v1/staff'),
        fetch('/api/v1/roles')
      ]);
      const staffData = await staffRes.json();
      const rolesData = await rolesRes.json();

      if (staffData.success) setStaffList(staffData.staff || []);
      if (rolesData.success) {
        setRoles(rolesData.roles || []);
        if (rolesData.roles.length > 0 && !staffForm.roleId) {
          setStaffForm(f => ({ ...f, roleId: rolesData.roles[0].id }));
        }
      }
    } catch (e) {
      console.error('Fetch staff/roles error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingStaff ? `/api/v1/staff/${editingStaff.id}` : '/api/v1/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowStaffModal(false);
        setEditingStaff(null);
        fetchData();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (e) {
      console.error('Save staff error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingRole ? `/api/v1/roles/${editingRole.id}` : '/api/v1/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowRoleModal(false);
        setEditingRole(null);
        fetchData();
      } else {
        alert(data.message || 'Role operation failed');
      }
    } catch (e) {
      console.error('Save role error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (key) => {
    const current = roleForm.permissions || [];
    if (current.includes(key)) {
      setRoleForm({ ...roleForm, permissions: current.filter(k => k !== key) });
    } else {
      setRoleForm({ ...roleForm, permissions: [...current, key] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
              Access-Based Control & Staff Management (RBAC)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure granular permissions for Telecallers, Civil Engineers, Purchase Persons, and custom roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'staff' ? (
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  roleId: roles[0]?.id || ''
                });
                setShowStaffModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleForm({
                  displayName: '',
                  description: '',
                  permissions: []
                });
                setShowRoleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Permissions ({roles.length})</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading access control configuration...</p>
        </div>
      ) : activeTab === 'staff' ? (
        /* Staff Directory Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{s.name}</div>
                    <div className="text-[11px] font-normal text-slate-500">{s.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold border bg-primary-50 text-primary-700 border-primary-200">
                      {s.role?.displayName || s.role?.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.phone || '–'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {s.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingStaff(s);
                        setStaffForm({
                          name: s.name,
                          email: s.email,
                          phone: s.phone || '',
                          password: '',
                          roleId: s.role?.id || ''
                        });
                        setShowStaffModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Roles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-slate-900">{r.displayName}</h3>
                    {r.isSystem && (
                      <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                        System Role
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description || 'Predefined system role'}</p>
                </div>

                <button
                  onClick={() => {
                    setEditingRole(r);
                    setRoleForm({
                      displayName: r.displayName,
                      description: r.description || '',
                      permissions: Array.isArray(r.permissions) ? r.permissions : []
                    });
                    setShowRoleModal(true);
                  }}
                  className="py-1 px-2.5 rounded-lg text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200"
                >
                  Configure Permissions
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{r.staffCount || 0} active staff members</span>
                <span className="font-semibold text-slate-700">
                  {r.permissions?.includes('*') ? 'All Permissions (*)' : `${r.permissions?.length || 0} Permissions`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              {editingStaff ? 'Edit Staff Account' : 'Add New Staff Member'}
            </h3>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Riya Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingStaff}
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="e.g. telecaller@hipro.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="e.g. +91 98290 88801"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingStaff ? 'Password (leave blank to keep unchanged)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Role *</label>
                <select
                  value={staffForm.roleId}
                  onChange={(e) => setStaffForm({ ...staffForm, roleId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.displayName} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Configuration Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Configure Permissions: {editingRole ? editingRole.displayName : 'New Role'}
              </h3>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Display Name *</label>
                  <input
                    type="text"
                    required
                    value={roleForm.displayName}
                    onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                    placeholder="e.g. Telecaller Team Lead"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="e.g. Supervise calls and verify customer site requests"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-2">
                  Module Access & Granular Permissions
                </label>

                <div className="space-y-4 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {ALL_PERMISSION_MODULES.map(group => (
                    <div key={group.module} className="space-y-2">
                      <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                        {group.module}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.permissions.map(perm => {
                          const isChecked = roleForm.permissions?.includes('*') || roleForm.permissions?.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                                isChecked
                                  ? 'bg-primary-50 border-primary-300 text-primary-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="rounded text-primary-600 focus:ring-0"
                              />
                              <span className="text-[11px]">{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2 shrink-0 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Role Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
