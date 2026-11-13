import React, { useState, useEffect } from 'react';
import { 
  Server, Link2, Plus, RefreshCw, CheckCircle2, AlertCircle, 
  Trash2, Edit2, Globe, Shield, Activity, ArrowRight, Zap, Database
} from 'lucide-react';

export default function ApiIntegrationsView({ apiBase, token }) {
  const [integrations, setIntegrations] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations' | 'mappings'

  // Modal State
  const [showIntegModal, setShowIntegModal] = useState(false);
  const [integForm, setIntegForm] = useState({
    name: '',
    connectorKey: '',
    baseUrl: '',
    apiKey: '',
    authType: 'NONE',
    description: '',
    isActive: true
  });

  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingForm, setMappingForm] = useState({
    categorySlug: 'freshinbasket',
    integrationId: '',
    moduleType: 'ecommerce',
    resourceKey: 'feed',
    endpointPath: '/api/v1/products',
    httpMethod: 'GET'
  });

  const [testResult, setTestResult] = useState(null);
  const [testingIntegId, setTestingIntegId] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resInteg, resMap] = await Promise.all([
        fetch(`${apiBase}/api/v1/platform/admin/integrations`, { headers: authHeaders }),
        fetch(`${apiBase}/api/v1/platform/admin/mappings`, { headers: authHeaders })
      ]);

      const dataInteg = await resInteg.json();
      const dataMap = await resMap.json();

      if (dataInteg.success) setIntegrations(dataInteg.integrations || []);
      if (dataMap.success) setMappings(dataMap.mappings || []);
    } catch (err) {
      console.error('Failed to load API integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiBase]);

  const handleTestConnection = async (integration) => {
    setTestingIntegId(integration.id);
    setTestResult(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/platform/admin/test-connection`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          baseUrl: integration.baseUrl,
          apiKey: integration.apiKey
        })
      });
      const data = await res.json();
      setTestResult({
        id: integration.id,
        success: data.success,
        message: data.message,
        ms: data.responseTimeMs
      });
    } catch (err) {
      setTestResult({
        id: integration.id,
        success: false,
        message: err.message
      });
    } finally {
      setTestingIntegId(null);
    }
  };

  const handleSaveIntegration = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/v1/platform/admin/integrations`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(integForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowIntegModal(false);
        setIntegForm({
          name: '',
          connectorKey: '',
          baseUrl: '',
          apiKey: '',
          authType: 'NONE',
          description: '',
          isActive: true
        });
        loadData();
      } else {
        alert(data.message || 'Failed to save integration');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveMapping = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/api/v1/platform/admin/mappings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(mappingForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowMappingModal(false);
        loadData();
      } else {
        alert(data.message || 'Failed to save mapping');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteIntegration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this integration and its mappings?')) return;
    try {
      await fetch(`${apiBase}/api/v1/platform/admin/integrations/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Server className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">API Gateway & Category Mappings</h1>
            </div>
            <p className="text-blue-200/80 text-sm max-w-2xl">
              Connect external backend modules (Django, Node.js, Python) to Flutter categories. The mobile app queries the central platform gateway, which dynamically proxies requests to the appropriate service.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold backdrop-blur transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowIntegModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 border-b border-blue-800/60 pb-2">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'integrations'
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Backend Integrations ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'mappings'
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Category API Mappings ({mappings.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Backend Integrations */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integ) => {
            const result = testResult && testResult.id === integ.id ? testResult : null;
            return (
              <div
                key={integ.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{integ.name}</h3>
                        <span className="inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mt-0.5">
                          {integ.connectorKey}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        integ.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {integ.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                    {integ.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-500">
                        <Globe className="w-3.5 h-3.5" /> Base URL:
                      </span>
                      <span className="font-mono text-slate-800 truncate max-w-[220px]" title={integ.baseUrl}>
                        {integ.baseUrl}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-500">
                        <Shield className="w-3.5 h-3.5" /> Auth Type:
                      </span>
                      <span className="font-semibold text-slate-700">{integ.authType}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-500">
                        <Link2 className="w-3.5 h-3.5" /> Mappings:
                      </span>
                      <span className="font-bold text-blue-600">{integ.mappings?.length || 0} resources</span>
                    </div>
                  </div>

                  {result && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        result.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span className="font-medium">{result.message} {result.ms ? `(${result.ms}ms)` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(integ)}
                    disabled={testingIntegId === integ.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Activity className={`w-3.5 h-3.5 ${testingIntegId === integ.id ? 'animate-pulse text-blue-600' : ''}`} />
                    {testingIntegId === integ.id ? 'Testing...' : 'Test Connection'}
                  </button>

                  <button
                    onClick={() => handleDeleteIntegration(integ.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Integration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Category API Mappings */}
      {activeTab === 'mappings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Resource Endpoints per Category</h2>
            <button
              onClick={() => {
                if (integrations.length > 0) {
                  setMappingForm((prev) => ({ ...prev, integrationId: integrations[0].id }));
                }
                setShowMappingModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Mapping
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Module Type</th>
                  <th className="px-4 py-3">Backend Integration</th>
                  <th className="px-4 py-3">Resource Key</th>
                  <th className="px-4 py-3">Endpoint Path</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappings.map((map) => (
                  <tr key={map.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <span className="capitalize">{map.categorySlug.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded border border-indigo-100 text-[10px]">
                        {map.moduleType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold text-slate-900">{map.integration?.name || 'Unknown'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{map.integration?.baseUrl}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-medium rounded text-[10px]">
                        {map.resourceKey}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                      {map.endpointPath}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[11px] text-emerald-600 font-semibold">Active Proxy</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Integration */}
      {showIntegModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Register Backend Module
            </h2>
            <form onSubmit={handleSaveIntegration} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Integration Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FreshInBasket Django API"
                  value={integForm.name}
                  onChange={(e) => setIntegForm({ ...integForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Connector Key (Unique identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. freshinbasket_django"
                  value={integForm.connectorKey}
                  onChange={(e) => setIntegForm({ ...integForm, connectorKey: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://fresh-api.hindustanprojects.in"
                  value={integForm.baseUrl}
                  onChange={(e) => setIntegForm({ ...integForm, baseUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auth Type</label>
                  <select
                    value={integForm.authType}
                    onChange={(e) => setIntegForm({ ...integForm, authType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="NONE">None / Public</option>
                    <option value="BEARER">Bearer Token</option>
                    <option value="API_KEY">API Key</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secret / API Key (Optional)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={integForm.apiKey}
                    onChange={(e) => setIntegForm({ ...integForm, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes on this backend service..."
                  value={integForm.description}
                  onChange={(e) => setIntegForm({ ...integForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntegModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Mapping */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" />
              Configure Category API Mapping
            </h2>
            <form onSubmit={handleSaveMapping} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Slug</label>
                <select
                  value={mappingForm.categorySlug}
                  onChange={(e) => setMappingForm({ ...mappingForm, categorySlug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="hipro">Hipro (Construction & Maintenance)</option>
                  <option value="freshinbasket">FreshInBasket (Fruits & Vegetables)</option>
                  <option value="fashion_basket">Fashion Basket (Apparel & Lifestyle)</option>
                  <option value="adventure">Adventure (Travel & Experiences)</option>
                  <option value="electronics">Electronics (New Category)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Backend Integration</label>
                <select
                  value={mappingForm.integrationId}
                  onChange={(e) => setMappingForm({ ...mappingForm, integrationId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  {integrations.map((integ) => (
                    <option key={integ.id} value={integ.id}>
                      {integ.name} ({integ.connectorKey})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module Type</label>
                  <select
                    value={mappingForm.moduleType}
                    onChange={(e) => setMappingForm({ ...mappingForm, moduleType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="service_booking">Service Booking</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="experience_booking">Experience / Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Key</label>
                  <select
                    value={mappingForm.resourceKey}
                    onChange={(e) => setMappingForm({ ...mappingForm, resourceKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="feed">Feed (Home Products/Services)</option>
                    <option value="products">Products List</option>
                    <option value="cart">Cart & Checkout</option>
                    <option value="bookings">Bookings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endpoint Path on Microservice</label>
                <input
                  type="text"
                  required
                  placeholder="/api/v1/products"
                  value={mappingForm.endpointPath}
                  onChange={(e) => setMappingForm({ ...mappingForm, endpointPath: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMappingModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20"
                >
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

