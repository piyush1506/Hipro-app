/**
 * HIPRO OPERATIONS & QUOTATION ADMIN DESK
 * Tailwind CSS + White Theme Engine (Refined Slim Typography)
 */

const API_BASE = window.location.origin;

// Application State
const state = {
  activeTab: 'overview',
  stats: null,
  requests: [],
  quotations: [],
  services: [],
  users: [],
  selectedRequestForQuote: null,
  lineItems: [
    { item: 'Surface Preparation & Moisture Tracing', qty: 1, unit: 'Lumpsum', rate: 1200 },
    { item: 'Chemical PU Injection / Polymer Grouting', qty: 15, unit: 'Running Ft', rate: 180 },
    { item: 'Waterproof Acrylic Protective Top Coat', qty: 120, unit: 'Sq Ft', rate: 45 }
  ],
  activeInspectionPhotos: [],
  activePhotoIndex: 0
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initNavigation();
  initSearch();
  initBuilder();
  initModals();
  initDiagnostics();
  initSettings();

  // Initial Data Fetch
  fetchAllData();

  // Auto Refresh every 60s
  setInterval(() => {
    fetchStats(true);
  }, 60000);
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   NAVIGATION & TABS
   ========================================================================== */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('currentPageTitle');
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('sidebar');

  function switchTab(tabId) {
    state.activeTab = tabId;

    navItems.forEach(item => {
      const isTarget = item.dataset.tab === tabId;
      if (isTarget) {
        item.className = 'nav-item group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-brand-50 text-brand-600 shadow-xs transition-all';
        const icon = item.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-brand-600';
      } else {
        item.className = 'nav-item group flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-all';
        const icon = item.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-slate-400 group-hover:text-brand-600';
      }
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    const titles = {
      overview: 'Dashboard Overview',
      requests: 'Service Requests & Photo Inspections',
      quotations: 'Quotations Desk',
      builder: 'Dynamic Quotation Builder',
      services: 'Services Catalog',
      users: 'Customer Directory',
      diagnostics: 'API Diagnostics & System Health',
      settings: 'System & ENV Credentials'
    };

    if (pageTitle) pageTitle.textContent = titles[tabId] || 'Dashboard';
    if (sidebar) sidebar.classList.add('-translate-x-full');

    if (tabId === 'builder') populateBuilderRequestOptions();
    if (tabId === 'diagnostics') runDiagnostics();
    if (tabId === 'settings') loadEnvSettings();

    initIcons();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      window.location.hash = tab;
      switchTab(tab);
    });
  });

  // Hash Navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchTab(hash);
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) switchTab(initialHash);

  // Mobile sidebar toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Header and Action Buttons
  document.getElementById('topCreateQuoteBtn')?.addEventListener('click', () => switchTab('builder'));
  document.getElementById('goToBuilderBtn')?.addEventListener('click', () => switchTab('builder'));
  document.getElementById('qaBuildQuote')?.addEventListener('click', () => switchTab('builder'));
  document.getElementById('qaReviewQueue')?.addEventListener('click', () => switchTab('requests'));
  document.getElementById('qaAddService')?.addEventListener('click', () => {
    switchTab('services');
    openModal('addServiceModalBackdrop');
  });
  document.getElementById('qaTestHealth')?.addEventListener('click', () => switchTab('diagnostics'));
  document.getElementById('viewAllRequestsBtn')?.addEventListener('click', () => switchTab('requests'));
  document.getElementById('viewAllQuotesBtn')?.addEventListener('click', () => switchTab('quotations'));
  document.getElementById('refreshDataBtn')?.addEventListener('click', () => fetchAllData(true));
}

/* ==========================================================================
   DATA SYNC
   ========================================================================== */
async function fetchAllData(showToastMsg = false) {
  try {
    await Promise.all([
      fetchStats(),
      fetchRequests(),
      fetchQuotations(),
      fetchServices(),
      fetchUsers()
    ]);
    if (showToastMsg) showToast('Database synced successfully', 'success');
  } catch (error) {
    console.error('Sync error:', error);
    if (showToastMsg) showToast('Failed to sync with API', 'error');
  }
}

async function fetchStats(silent = false) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/stats`);
    const data = await res.json();
    if (data.success) {
      state.stats = data.data;
      renderStats();
    }
  } catch (error) {
    console.error('Stats error:', error);
  }
}

async function fetchRequests() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/requests`);
    const data = await res.json();
    if (data.success) {
      state.requests = data.data || [];
      renderRequests();
      renderOverviewRecentRequests();
      populateBuilderRequestOptions();
    }
  } catch (error) {
    console.error('Requests error:', error);
  }
}

async function fetchQuotations() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/quotations`);
    const data = await res.json();
    if (data.success) {
      state.quotations = data.data || [];
      renderQuotations();
      renderOverviewRecentQuotes();
    }
  } catch (error) {
    console.error('Quotations error:', error);
  }
}

async function fetchServices() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/services`);
    const data = await res.json();
    if (data.success) {
      state.services = data.services || [];
      renderServices();
    }
  } catch (error) {
    console.error('Services error:', error);
  }
}

async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/users`);
    const data = await res.json();
    if (data.success) {
      state.users = data.data || [];
      renderUsers();
    }
  } catch (error) {
    console.error('Users error:', error);
  }
}

/* ==========================================================================
   RENDERERS: STATS & OVERVIEW
   ========================================================================== */
function renderStats() {
  if (!state.stats) return;
  const s = state.stats;

  const kpiTotalRequests = document.getElementById('kpiTotalRequests');
  const kpiPendingEstimations = document.getElementById('kpiPendingEstimations');
  const kpiTotalQuotes = document.getElementById('kpiTotalQuotes');
  const kpiTotalQuotedValue = document.getElementById('kpiTotalQuotedValue');
  const kpiAcceptedQuotes = document.getElementById('kpiAcceptedQuotes');
  const kpiAcceptedValue = document.getElementById('kpiAcceptedValue');
  const pendingRequestsBadge = document.getElementById('pendingRequestsBadge');
  const totalQuotesBadge = document.getElementById('totalQuotesBadge');

  if (kpiTotalRequests) kpiTotalRequests.textContent = s.totalRequests;
  if (kpiPendingEstimations) kpiPendingEstimations.textContent = s.statusCounts.SUBMITTED + s.statusCounts.ESTIMATING;
  if (kpiTotalQuotes) kpiTotalQuotes.textContent = s.totalQuotes;
  if (kpiTotalQuotedValue) kpiTotalQuotedValue.textContent = `₹${(s.totalQuotedValue || 0).toLocaleString('en-IN')} Quoted`;
  if (kpiAcceptedQuotes) kpiAcceptedQuotes.textContent = s.acceptedQuotesCount;
  if (kpiAcceptedValue) kpiAcceptedValue.textContent = `₹${(s.acceptedValue || 0).toLocaleString('en-IN')} Revenue`;

  if (pendingRequestsBadge) pendingRequestsBadge.textContent = s.statusCounts.SUBMITTED + s.statusCounts.ESTIMATING;
  if (totalQuotesBadge) totalQuotesBadge.textContent = s.totalQuotes;

  // Pipeline Progress Bars
  const pipelineContainer = document.getElementById('pipelineProgressContainer');
  if (pipelineContainer) {
    const total = Math.max(s.totalRequests, 1);
    const statuses = [
      { key: 'SUBMITTED', label: '1. Submitted (Under Review)', count: s.statusCounts.SUBMITTED, color: 'bg-blue-500' },
      { key: 'ESTIMATING', label: '2. Estimator Triage', count: s.statusCounts.ESTIMATING, color: 'bg-amber-500' },
      { key: 'QUOTED', label: '3. Quotation Dispatched', count: s.statusCounts.QUOTED, color: 'bg-purple-500' },
      { key: 'ACCEPTED', label: '4. Client Accepted', count: s.statusCounts.ACCEPTED, color: 'bg-emerald-500' },
      { key: 'COMPLETED', label: '5. Work Completed', count: s.statusCounts.COMPLETED, color: 'bg-teal-500' }
    ];

    pipelineContainer.innerHTML = statuses.map(st => {
      const pct = Math.round((st.count / total) * 100);
      return `
        <div class="space-y-1">
          <div class="flex justify-between text-xs font-normal text-slate-500">
            <span>${st.label}</span>
            <span class="font-mono text-slate-700">${st.count} (${pct}%)</span>
          </div>
          <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full ${st.color} rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderOverviewRecentRequests() {
  const container = document.getElementById('overviewRecentRequestsList');
  if (!container) return;

  if (state.requests.length === 0) {
    container.innerHTML = `<div class="text-center py-5 text-slate-400 text-xs">No customer requests submitted yet</div>`;
    return;
  }

  const recent = state.requests.slice(0, 4);
  container.innerHTML = recent.map(req => {
    const user = req.user ? req.user.name : 'Customer';
    const statusBadge = getStatusBadgeClass(req.status);
    const formattedDate = new Date(req.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-all">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-white border border-slate-200 text-brand-600 flex items-center justify-center text-xs">
            <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <div class="font-medium text-xs text-slate-800">${req.requestNumber} — ${req.servicecode}</div>
            <div class="text-[10.5px] text-slate-400">${user} • ${req.propertyType || 'House'} • ${formattedDate}</div>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${statusBadge}">${req.status}</span>
      </div>
    `;
  }).join('');
  initIcons();
}

function renderOverviewRecentQuotes() {
  const container = document.getElementById('overviewRecentQuotesList');
  if (!container) return;

  if (state.quotations.length === 0) {
    container.innerHTML = `<div class="text-center py-5 text-slate-400 text-xs">No quotations generated yet</div>`;
    return;
  }

  const recent = state.quotations.slice(0, 4);
  container.innerHTML = recent.map(q => {
    const amount = (q.grandtotal || 0).toLocaleString('en-IN');
    const statusBadge = getStatusBadgeClass(q.status);
    const formattedDate = new Date(q.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-all">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-white border border-slate-200 text-emerald-600 flex items-center justify-center text-xs">
            <i data-lucide="receipt" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <div class="font-medium text-xs text-slate-800">${q.quoteNumber} — ₹${amount}</div>
            <div class="text-[10.5px] text-slate-400">${q.estimatedTimeline || '1-2 Days'} • ${formattedDate}</div>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${statusBadge}">${q.status}</span>
      </div>
    `;
  }).join('');
  initIcons();
}

/* ==========================================================================
   RENDERERS: SERVICE REQUESTS
   ========================================================================== */
function renderRequests() {
  const container = document.getElementById('requestsContainer');
  if (!container) return;

  const statusFilter = document.getElementById('requestStatusFilter')?.value || 'ALL';
  const propertyFilter = document.getElementById('requestPropertyFilter')?.value || 'ALL';
  const query = document.getElementById('globalSearchInput')?.value.toLowerCase() || '';

  let filtered = state.requests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (propertyFilter !== 'ALL' && (req.propertyType || '').toLowerCase() !== propertyFilter.toLowerCase()) return false;
    if (query) {
      const match = (req.requestNumber || '').toLowerCase().includes(query) ||
                    (req.servicecode || '').toLowerCase().includes(query) ||
                    (req.issueDescription || '').toLowerCase().includes(query) ||
                    (req.user?.name || '').toLowerCase().includes(query) ||
                    (req.user?.phoneNumber || '').includes(query);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full bg-white p-10 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">No inspection requests match your filters.</div>`;
    return;
  }

  container.innerHTML = filtered.map(req => {
    const statusBadge = getStatusBadgeClass(req.status);
    const isUrgent = req.urgency === 'URGENT';
    const media = Array.isArray(req.mediaUrl) ? req.mediaUrl : [];
    const user = req.user || { name: 'Customer', phoneNumber: '9461877701' };

    const thumbnailsHtml = media.map((imgUrl, idx) => `
      <div class="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative group flex-shrink-0 hover:border-brand-500 transition-all" onclick="openPhotoModal('${req.id}', ${idx})">
        <img src="${imgUrl}" alt="Damage ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80'">
        <span class="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[8.5px] font-normal text-center py-0.5">#${idx + 1}</span>
      </div>
    `).join('');

    const quotesHtml = (req.quotations && req.quotations.length > 0) ? `
      <div class="col-span-2 p-2 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-between text-xs text-purple-900">
        <span class="font-medium flex items-center gap-1"><i data-lucide="file-check" class="w-3.5 h-3.5 text-purple-600"></i> ${req.quotations[0].quoteNumber}</span>
        <span class="font-mono font-medium text-purple-700">₹${(req.quotations[0].grandtotal || 0).toLocaleString('en-IN')}</span>
      </div>
    ` : '';

    return `
      <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
        
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-medium text-xs text-brand-600">${req.requestNumber}</span>
              <span class="px-1.5 py-0.5 rounded text-[9.5px] font-medium uppercase ${isUrgent ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">${req.urgency || 'NORMAL'}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${statusBadge}">${req.status}</span>
          </div>

          <div>
            <h3 class="font-heading font-medium text-sm text-slate-800">${req.servicecode}</h3>
            ${req.subServiceCode ? `<p class="text-[11px] font-medium text-brand-600">${req.subServiceCode}</p>` : ''}
          </div>

          <div class="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-100 font-light">
            <span class="font-medium text-slate-800">Issue:</span> ${escapeHtml(req.issueDescription || 'No description')}
          </div>

          ${media.length > 0 ? `
            <div class="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              ${thumbnailsHtml}
            </div>
          ` : `<div class="text-[10.5px] text-slate-400 italic">No photos uploaded</div>`}

          <div class="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-100 text-slate-500">
            <div class="flex items-center gap-1"><i data-lucide="user" class="w-3 h-3 text-slate-400"></i> <span class="font-medium text-slate-700">${escapeHtml(user.name)}</span></div>
            <div class="flex items-center gap-1 font-mono"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${user.phoneNumber}</div>
            <div class="flex items-center gap-1"><i data-lucide="home" class="w-3 h-3 text-slate-400"></i> ${req.propertyType || 'House'} (${req.propertySize || 'Standard'})</div>
            <div class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i> ${req.preferredDate || 'Flexible'}</div>
            <div class="col-span-2 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> <span class="truncate">${escapeHtml(req.addressline || 'Main Residence')} ${req.location ? `• ${escapeHtml(req.location)}` : ''}</span></div>
            ${quotesHtml}
          </div>
        </div>

        <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <select onchange="updateRequestStatus('${req.id}', this.value)" class="text-[11px] font-medium px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-600 focus:outline-none">
            <option value="SUBMITTED" ${req.status === 'SUBMITTED' ? 'selected' : ''}>SUBMITTED</option>
            <option value="ESTIMATING" ${req.status === 'ESTIMATING' ? 'selected' : ''}>ESTIMATING</option>
            <option value="QUOTED" ${req.status === 'QUOTED' ? 'selected' : ''}>QUOTED</option>
            <option value="ACCEPTED" ${req.status === 'ACCEPTED' ? 'selected' : ''}>ACCEPTED</option>
            <option value="IN_PROGRESS" ${req.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
            <option value="COMPLETED" ${req.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
            <option value="REJECTED" ${req.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
          </select>

          <div class="flex items-center gap-1">
            <button onclick="startQuotationForRequest('${req.id}')" class="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center gap-1 transition-all">
              <i data-lucide="calculator" class="w-3 h-3"></i> Build Quote
            </button>
            <button onclick="deleteRequest('${req.id}')" title="Delete request" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  initIcons();
}

async function updateRequestStatus(requestId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchRequests();
      fetchStats();
    } else {
      showToast(data.message || 'Status update failed', 'error');
    }
  } catch (error) {
    showToast('Network error', 'error');
  }
}

async function deleteRequest(requestId) {
  if (!confirm('Are you sure you want to delete this service request?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/requests/${requestId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Request deleted', 'success');
      fetchRequests();
      fetchStats();
    }
  } catch (error) {
    showToast('Failed to delete request', 'error');
  }
}

/* ==========================================================================
   RENDERERS: QUOTATIONS DESK
   ========================================================================== */
function renderQuotations() {
  const container = document.getElementById('quotationsContainer');
  if (!container) return;

  if (state.quotations.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-10 text-center rounded-xl border border-slate-200 text-slate-400 text-xs space-y-2.5">
        <p>No quotations issued yet.</p>
        <button onclick="document.querySelector('[data-tab=builder]').click()" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg">
          <i data-lucide="plus" class="w-3 h-3"></i> Create First Quotation
        </button>
      </div>
    `;
    initIcons();
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${state.quotations.map(q => {
        const statusBadge = getStatusBadgeClass(q.status);
        const lineItems = Array.isArray(q.lineItem) ? q.lineItem : [];
        const grandTotal = (q.grandtotal || 0).toLocaleString('en-IN');
        const req = q.request || {};
        const customer = req.user || { name: 'Customer', phoneNumber: '9461877701' };

        return `
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
            
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-mono font-medium text-xs text-brand-600">${q.quoteNumber}</span>
                <span class="px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${statusBadge}">${q.status}</span>
              </div>

              <div class="flex items-baseline justify-between">
                <div>
                  <h3 class="font-heading font-medium text-sm text-slate-800">${req.servicecode || 'Repair Quotation'}</h3>
                  <div class="text-[11px] text-slate-400 font-mono">${req.requestNumber || ''}</div>
                </div>
                <div class="font-heading font-semibold text-lg text-emerald-600 font-mono">₹${grandTotal}</div>
              </div>

              <div class="grid grid-cols-2 gap-1.5 text-[11px] p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                <div><strong>Client:</strong> ${escapeHtml(customer.name)}</div>
                <div class="font-mono">${customer.phoneNumber}</div>
                <div><strong>Timeline:</strong> ${q.estimatedTimeline || '1-2 Days'}</div>
                <div><strong>Warranty:</strong> ${q.warranty_coverage ? q.warranty_coverage.slice(0, 18) + '...' : '1 Year'}</div>
              </div>

              <div class="text-[10.5px] text-slate-400 font-light">
                <strong>Scope (${lineItems.length}):</strong> ${lineItems.map(li => li.item || li.description).slice(0, 2).join(', ')}${lineItems.length > 2 ? '...' : ''}
              </div>
            </div>

            <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
              <div class="flex items-center gap-1.5">
                <button onclick="openQuotationPreviewModal('${q.id}')" class="px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md flex items-center gap-1 transition-all">
                  <i data-lucide="printer" class="w-3 h-3"></i> View & Print
                </button>
                <button onclick="triggerCustomerDecision('${q.id}', 'ACCEPTED')" class="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center gap-1 transition-all">
                  <i data-lucide="check" class="w-3 h-3"></i> Accept
                </button>
              </div>
              <button onclick="deleteQuotation('${q.id}')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>

          </div>
        `;
      }).join('')}
    </div>
  `;
  initIcons();
}

async function triggerCustomerDecision(quoteId, decision) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/quotations/${quoteId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Quotation marked as ${decision}`, 'success');
      fetchQuotations();
      fetchRequests();
      fetchStats();
    } else {
      showToast(data.message || 'Failed to update decision', 'error');
    }
  } catch (error) {
    showToast('Failed to update quotation decision', 'error');
  }
}

async function deleteQuotation(quoteId) {
  if (!confirm('Are you sure you want to delete this quotation?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/quotations/${quoteId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Quotation deleted', 'success');
      fetchQuotations();
      fetchStats();
    }
  } catch (error) {
    showToast('Failed to delete quotation', 'error');
  }
}

/* ==========================================================================
   DYNAMIC QUOTATION BUILDER
   ========================================================================== */
function initBuilder() {
  const reqSelect = document.getElementById('builderRequestId');
  const addLineItemBtn = document.getElementById('addLineItemBtn');
  const resetBtn = document.getElementById('resetBuilderFormBtn');
  const submitBtn = document.getElementById('submitQuotationBtn');

  ['calcMaterialCost', 'calcLaborCost', 'calcDiscount', 'calcTaxRate'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calculateCommercials);
  });

  reqSelect?.addEventListener('change', () => {
    const reqId = reqSelect.value;
    const req = state.requests.find(r => r.id === reqId);
    renderBuilderRequestCallout(req);
  });

  addLineItemBtn?.addEventListener('click', () => {
    state.lineItems.push({ item: '', qty: 1, unit: 'Sq Ft', rate: 0 });
    renderLineItemsTable();
  });

  resetBtn?.addEventListener('click', resetBuilderForm);
  submitBtn?.addEventListener('click', submitQuotationForm);

  renderLineItemsTable();
  calculateCommercials();
}

function populateBuilderRequestOptions() {
  const reqSelect = document.getElementById('builderRequestId');
  if (!reqSelect) return;

  const currentVal = reqSelect.value;
  reqSelect.innerHTML = `<option value="">-- Choose a pending customer request --</option>` +
    state.requests.map(req => {
      const user = req.user ? req.user.name : 'Customer';
      return `<option value="${req.id}">${req.requestNumber} — ${req.servicecode} (${user} • ${req.status})</option>`;
    }).join('');

  if (currentVal) reqSelect.value = currentVal;
}

function startQuotationForRequest(requestId) {
  const req = state.requests.find(r => r.id === requestId);
  if (!req) return;

  document.querySelector('[data-tab=builder]')?.click();
  const reqSelect = document.getElementById('builderRequestId');
  if (reqSelect) {
    reqSelect.value = requestId;
    renderBuilderRequestCallout(req);
  }

  // Pre-fill smart line items based on service type
  if (req.servicecode?.includes('WATER') || req.servicecode?.includes('LEAK')) {
    state.lineItems = [
      { item: 'Thermal Moisture Scanning & Surface Tracing', qty: 1, unit: 'Lumpsum', rate: 950 },
      { item: 'High-Pressure Hydrophobic PU Injection Grouting', qty: 20, unit: 'Running Ft', rate: 220 },
      { item: 'Elastomeric 3-Layer Waterproof Membrane Application', qty: 150, unit: 'Sq Ft', rate: 65 }
    ];
  } else if (req.servicecode?.includes('TILE')) {
    state.lineItems = [
      { item: 'Damaged Tile Demolition & Debris Disposal', qty: 40, unit: 'Sq Ft', rate: 35 },
      { item: 'Polymer Modified Adhesive & Tile Laying', qty: 40, unit: 'Sq Ft', rate: 95 },
      { item: 'Epoxy Anti-Stain Tile Grouting', qty: 40, unit: 'Sq Ft', rate: 45 }
    ];
  }

  renderLineItemsTable();
  calculateCommercials();
}

function renderBuilderRequestCallout(req) {
  const callout = document.getElementById('builderRequestPreview');
  const reqNum = document.getElementById('calloutReqNumber');
  const reqStatus = document.getElementById('calloutReqStatus');
  const reqDetails = document.getElementById('calloutReqDetails');

  if (!req || !callout) {
    if (callout) callout.classList.add('hidden');
    return;
  }

  callout.classList.remove('hidden');
  reqNum.textContent = `${req.requestNumber} — ${req.servicecode}`;
  reqStatus.textContent = req.status;

  const user = req.user || { name: 'Customer', phoneNumber: '9461877701' };
  reqDetails.innerHTML = `
    <strong>Client:</strong> ${escapeHtml(user.name)} (${user.phoneNumber}) &nbsp;|&nbsp; 
    <strong>Property:</strong> ${req.propertyType || 'House'} (${req.propertySize || 'Standard Area'}) &nbsp;|&nbsp; 
    <strong>Address:</strong> ${escapeHtml(req.addressline || 'Main Residence')} <br/>
    <strong>Issue Details:</strong> "${escapeHtml(req.issueDescription || 'No description provided')}"
  `;
}

function renderLineItemsTable() {
  const tbody = document.getElementById('lineItemsBody');
  if (!tbody) return;

  tbody.innerHTML = state.lineItems.map((li, idx) => {
    const amount = (parseFloat(li.qty || 0) * parseFloat(li.rate || 0)).toFixed(2);
    return `
      <tr class="hover:bg-slate-50/50 transition-colors" data-index="${idx}">
        <td class="p-2.5 text-center text-xs font-medium text-slate-400">${idx + 1}</td>
        <td class="p-1.5">
          <input type="text" value="${escapeHtml(li.item)}" placeholder="Scope description" oninput="updateLineItem(${idx}, 'item', this.value)" class="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 font-normal">
        </td>
        <td class="p-1.5">
          <input type="number" value="${li.qty}" min="0" step="any" oninput="updateLineItem(${idx}, 'qty', this.value)" class="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 font-normal">
        </td>
        <td class="p-1.5">
          <select onchange="updateLineItem(${idx}, 'unit', this.value)" class="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none font-normal">
            <option value="Sq Ft" ${li.unit === 'Sq Ft' ? 'selected' : ''}>Sq Ft</option>
            <option value="Running Ft" ${li.unit === 'Running Ft' ? 'selected' : ''}>Running Ft</option>
            <option value="Lumpsum" ${li.unit === 'Lumpsum' ? 'selected' : ''}>Lumpsum</option>
            <option value="Bags" ${li.unit === 'Bags' ? 'selected' : ''}>Bags</option>
            <option value="Hours" ${li.unit === 'Hours' ? 'selected' : ''}>Hours</option>
            <option value="Points" ${li.unit === 'Points' ? 'selected' : ''}>Points</option>
          </select>
        </td>
        <td class="p-1.5">
          <input type="number" value="${li.rate}" min="0" step="any" oninput="updateLineItem(${idx}, 'rate', this.value)" class="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 font-normal">
        </td>
        <td class="p-2.5 text-right font-mono font-medium text-xs text-emerald-600 line-amount-cell">
          ₹${Number(amount).toLocaleString('en-IN')}
        </td>
        <td class="p-1.5 text-center">
          <button type="button" onclick="removeLineItem(${idx})" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  initIcons();
  calculateCommercials();
}

function updateLineItem(idx, key, val) {
  if (state.lineItems[idx]) {
    state.lineItems[idx][key] = (key === 'qty' || key === 'rate') ? parseFloat(val || 0) : val;
    calculateCommercials();
    const row = document.querySelector(`tr[data-index="${idx}"]`);
    if (row) {
      const amtCell = row.querySelector('.line-amount-cell');
      const amount = (parseFloat(state.lineItems[idx].qty || 0) * parseFloat(state.lineItems[idx].rate || 0)).toFixed(2);
      if (amtCell) amtCell.textContent = `₹${Number(amount).toLocaleString('en-IN')}`;
    }
  }
}

function removeLineItem(idx) {
  state.lineItems.splice(idx, 1);
  renderLineItemsTable();
}

function calculateCommercials() {
  let lineItemsTotal = 0;
  state.lineItems.forEach(li => {
    lineItemsTotal += (parseFloat(li.qty || 0) * parseFloat(li.rate || 0));
  });

  const matCostInput = document.getElementById('calcMaterialCost');
  const labCostInput = document.getElementById('calcLaborCost');

  let materialCost = parseFloat(matCostInput?.value || 0);
  let laborCost = parseFloat(labCostInput?.value || 0);

  if (materialCost === 0 && laborCost === 0 && lineItemsTotal > 0) {
    materialCost = Math.round(lineItemsTotal * 0.55);
    laborCost = Math.round(lineItemsTotal * 0.45);
    if (matCostInput) matCostInput.value = materialCost;
    if (labCostInput) labCostInput.value = laborCost;
  }

  const subtotal = (materialCost + laborCost > 0) ? (materialCost + laborCost) : lineItemsTotal;
  const discount = parseFloat(document.getElementById('calcDiscount')?.value || 0);
  const taxRate = parseFloat(document.getElementById('calcTaxRate')?.value || 18);

  const taxableAmount = Math.max(0, subtotal - discount);
  const gstAmount = Math.round(taxableAmount * (taxRate / 100));
  const grandTotal = taxableAmount + gstAmount;

  document.getElementById('calcSubtotalText').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('calcGstAmountText').textContent = `₹${gstAmount.toLocaleString('en-IN')}`;
  document.getElementById('calcGrandTotalText').textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  return { materialCost, laborCost, subtotal, discount, taxRate, gstAmount, grandTotal };
}

function resetBuilderForm() {
  document.getElementById('builderRequestId').value = '';
  document.getElementById('builderRequestPreview')?.classList.add('hidden');
  document.getElementById('calcMaterialCost').value = 0;
  document.getElementById('calcLaborCost').value = 0;
  document.getElementById('calcDiscount').value = 0;
  state.lineItems = [
    { item: 'Inspection & Site Mobilization', qty: 1, unit: 'Lumpsum', rate: 1000 },
    { item: 'Chemical Waterproof Repair Application', qty: 100, unit: 'Sq Ft', rate: 60 }
  ];
  renderLineItemsTable();
}

async function submitQuotationForm() {
  const requestId = document.getElementById('builderRequestId')?.value;
  if (!requestId) {
    showToast('Please select a service request to quote', 'error');
    return;
  }

  if (state.lineItems.length === 0) {
    showToast('Please add at least one line item', 'error');
    return;
  }

  const comm = calculateCommercials();
  const estimatedTimeline = document.getElementById('builderTimeline')?.value || '1-2 Working Days';
  const warranty_coverage = document.getElementById('builderWarranty')?.value || '1 Year Anti-Leakage';
  const termsAndConditions = document.getElementById('builderTerms')?.value || 'Standard warranty terms apply';
  const created_by = document.getElementById('builderEstimatorName')?.value || 'Hipro Technical Admin Desk';

  const payload = {
    requestId,
    lineItem: state.lineItems,
    materialCost: comm.materialCost,
    laborCost: comm.laborCost,
    subtotal: comm.subtotal,
    discount: comm.discount,
    taxGST: comm.gstAmount,
    taxRate: comm.taxRate,
    totalCost: comm.materialCost + comm.laborCost,
    grandtotal: comm.grandTotal,
    estimatedTimeline,
    termsAndConditions,
    created_by,
    warranty_coverage
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Quotation created & dispatched!', 'success');
      resetBuilderForm();
      await fetchAllData();
      document.querySelector('[data-tab=quotations]')?.click();
    } else {
      showToast(data.message || 'Quotation creation failed', 'error');
    }
  } catch (error) {
    showToast('Failed to connect to backend', 'error');
  }
}

/* ==========================================================================
   RENDERERS: SERVICES CATALOG
   ========================================================================== */
function renderServices() {
  const container = document.getElementById('servicesListContainer');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-10 text-center rounded-xl border border-slate-200 text-slate-400 text-xs space-y-2.5">
        <p>No services registered in catalog.</p>
        <button onclick="openModal('addServiceModalBackdrop')" class="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg">
          <i data-lucide="plus" class="w-3 h-3"></i> Add Service
        </button>
      </div>
    `;
    initIcons();
    return;
  }

  container.innerHTML = state.services.map(svc => {
    const subServices = svc.subServices || [];
    return `
      <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-medium">
              <i data-lucide="${svc.icon || 'wrench'}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-heading font-medium text-sm text-slate-800">${svc.name}</h3>
                <span class="font-mono text-xs font-medium text-brand-600">(${svc.code})</span>
              </div>
              <p class="text-[11px] text-slate-400">${svc.description || ''} • Rating: ⭐ ${svc.rating || 4.8}</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="openAddSubServiceModal('${svc.id}', '${escapeHtml(svc.name)}')" class="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg flex items-center gap-1 transition-all">
              <i data-lucide="plus" class="w-3 h-3"></i> Add Sub-Service
            </button>
            <button onclick="deleteService('${svc.id}')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          ${subServices.map(sub => `
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1.5 relative">
              <div class="flex justify-between items-start">
                <div class="font-medium text-xs text-slate-800">${sub.titleEn}</div>
                <button onclick="deleteSubService('${sub.id}')" class="text-slate-400 hover:text-red-600"><i data-lucide="x" class="w-3 h-3"></i></button>
              </div>
              ${sub.titleHi ? `<div class="text-[10.5px] font-medium text-brand-600">${sub.titleHi}</div>` : ''}
              <div class="text-[10.5px] text-slate-500 font-light">${sub.desc || ''}</div>
              ${sub.checklist && sub.checklist.length > 0 ? `
                <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-light">
                  <span class="font-medium text-slate-600">Checklist:</span>
                  <ul class="list-disc list-inside mt-0.5 space-y-0.5">
                    ${sub.checklist.map(ch => `<li>${ch}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }).join('');

  initIcons();
}

async function deleteService(serviceId) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/services/${serviceId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Service deleted', 'success');
      fetchServices();
      fetchStats();
    }
  } catch (e) {
    showToast('Failed to delete service', 'error');
  }
}

async function deleteSubService(subId) {
  if (!confirm('Delete this sub-service?')) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/sub-services/${subId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Sub-service deleted', 'success');
      fetchServices();
    }
  } catch (e) {
    showToast('Failed to delete sub-service', 'error');
  }
}

/* ==========================================================================
   RENDERERS: CUSTOMER DIRECTORY
   ========================================================================== */
function renderUsers() {
  const container = document.getElementById('usersListContainer');
  if (!container) return;

  if (state.users.length === 0) {
    container.innerHTML = `<div class="p-10 text-center text-slate-400 text-xs">No registered customers found.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-400 font-medium uppercase tracking-wider border-b border-slate-200 text-[10.5px]">
          <tr>
            <th class="p-3">Customer Name</th>
            <th class="p-3">Phone Number</th>
            <th class="p-3">Saved Addresses</th>
            <th class="p-3">Requests</th>
            <th class="p-3">Registered Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          ${state.users.map(u => {
            const addresses = u.address || [];
            const reqs = u.requests || [];
            const date = new Date(u.created_at).toLocaleDateString('en-IN');
            return `
              <tr class="hover:bg-slate-50/50">
                <td class="p-3 font-medium text-slate-800">${escapeHtml(u.name)}</td>
                <td class="p-3 font-mono font-medium text-emerald-600">${u.phoneNumber}</td>
                <td class="p-3 text-slate-500 font-light leading-tight">
                  ${addresses.map(a => `${a.type.toUpperCase()}: ${a.address}, ${a.city}`).join('<br>') || 'Default Residence'}
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">${reqs.length} Requests</span>
                </td>
                <td class="p-3 text-slate-400 font-light">${date}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ==========================================================================
   MODALS: LIGHTBOX & PRINTABLE QUOTATION
   ========================================================================== */
function initModals() {
  document.getElementById('closePhotoModalBtn')?.addEventListener('click', () => closeModal('photoModalBackdrop'));
  document.getElementById('photoModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'photoModalBackdrop') closeModal('photoModalBackdrop');
  });

  document.getElementById('closeQuoteModalBtn')?.addEventListener('click', () => closeModal('quoteModalBackdrop'));
  document.getElementById('quoteModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'quoteModalBackdrop') closeModal('quoteModalBackdrop');
  });
  document.getElementById('printQuoteModalBtn')?.addEventListener('click', () => window.print());

  // Add Service
  document.getElementById('openAddServiceModalBtn')?.addEventListener('click', () => openModal('addServiceModalBackdrop'));
  document.getElementById('closeAddServiceModalBtn')?.addEventListener('click', () => closeModal('addServiceModalBackdrop'));
  document.getElementById('cancelAddServiceBtn')?.addEventListener('click', () => closeModal('addServiceModalBackdrop'));

  document.getElementById('addServiceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('svcCode').value;
    const name = document.getElementById('svcName').value;
    const description = document.getElementById('svcDesc').value;
    const icon = document.getElementById('svcIcon').value;
    const rating = parseFloat(document.getElementById('svcRating').value || 4.8);

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, description, icon, rating })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Service created', 'success');
        closeModal('addServiceModalBackdrop');
        e.target.reset();
        fetchServices();
        fetchStats();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  });

  // Add Sub-Service
  document.getElementById('closeAddSubServiceModalBtn')?.addEventListener('click', () => closeModal('addSubServiceModalBackdrop'));
  document.getElementById('cancelAddSubServiceBtn')?.addEventListener('click', () => closeModal('addSubServiceModalBackdrop'));

  document.getElementById('addSubServiceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const serviceId = document.getElementById('subSvcParentId').value;
    const titleEn = document.getElementById('subSvcTitleEn').value;
    const titleHi = document.getElementById('subSvcTitleHi').value;
    const desc = document.getElementById('subSvcDesc').value;
    const checklist = document.getElementById('subSvcChecklist').value;

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/sub-services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, titleEn, titleHi, desc, checklist })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sub-service added', 'success');
        closeModal('addSubServiceModalBackdrop');
        e.target.reset();
        fetchServices();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  });
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('flex');
    m.classList.add('hidden');
  }
}

function openPhotoModal(requestId, activeIdx = 0) {
  const req = state.requests.find(r => r.id === requestId);
  if (!req || !req.mediaUrl || req.mediaUrl.length === 0) {
    showToast('No photos uploaded for this request', 'error');
    return;
  }

  state.activeInspectionPhotos = req.mediaUrl;
  state.activePhotoIndex = activeIdx;

  const stageImg = document.getElementById('activeInspectionImage');
  const title = document.getElementById('photoModalTitle');
  const strip = document.getElementById('photoThumbnailsContainer');

  title.textContent = `${req.requestNumber} — Damage Inspection Photo Review`;
  stageImg.src = state.activeInspectionPhotos[activeIdx];

  strip.innerHTML = state.activeInspectionPhotos.map((imgUrl, i) => `
    <div class="w-14 h-14 rounded-md overflow-hidden border-2 ${i === activeIdx ? 'border-brand-600' : 'border-slate-200'} cursor-pointer flex-shrink-0" onclick="selectPhotoIndex(${i})">
      <img src="${imgUrl}" alt="Thumb ${i + 1}" class="w-full h-full object-cover">
    </div>
  `).join('');

  openModal('photoModalBackdrop');
}

window.openPhotoModal = openPhotoModal;
window.selectPhotoIndex = function(idx) {
  state.activePhotoIndex = idx;
  const stageImg = document.getElementById('activeInspectionImage');
  if (stageImg) stageImg.src = state.activeInspectionPhotos[idx];

  const thumbs = document.querySelectorAll('#photoThumbnailsContainer div');
  thumbs.forEach((t, i) => {
    t.className = `w-14 h-14 rounded-md overflow-hidden border-2 ${i === idx ? 'border-brand-600' : 'border-slate-200'} cursor-pointer flex-shrink-0`;
  });
};

function openAddSubServiceModal(serviceId, serviceName) {
  document.getElementById('subSvcParentId').value = serviceId;
  openModal('addSubServiceModalBackdrop');
}
window.openAddSubServiceModal = openAddSubServiceModal;

function openQuotationPreviewModal(quoteId) {
  const quote = state.quotations.find(q => q.id === quoteId);
  if (!quote) return;

  const req = quote.request || {};
  const user = req.user || { name: 'Customer', phoneNumber: '+91 94618 77701' };
  const lineItems = Array.isArray(quote.lineItem) ? quote.lineItem : [];
  const dateFormatted = new Date(quote.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const content = document.getElementById('printableQuotationContent');
  content.innerHTML = `
    <div class="bg-white text-slate-800 font-sans p-5 sm:p-6 space-y-5 text-xs font-normal">
      
      <div class="flex justify-between items-start border-b border-slate-200 pb-4">
        <div>
          <h2 class="font-heading font-semibold text-xl text-slate-900 tracking-tight">HIND BUILDING SOLUTIONS</h2>
          <p class="text-[11px] text-slate-500 font-light">Technical Waterproofing, Surface Repair & Restoration</p>
          <p class="text-[11px] text-slate-500 font-light">Support Hotline: +91 94628 77757 | support@hindbuilding.com</p>
        </div>
        <div class="text-right">
          <div class="font-mono font-semibold text-base text-brand-600">${quote.quoteNumber}</div>
          <div class="text-[11px] text-slate-400">Date: ${dateFormatted}</div>
          <div class="text-[11px] text-slate-400">Ref: ${req.requestNumber || 'N/A'}</div>
          <div class="mt-1.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(quote.status)}">${quote.status}</span></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[11.5px] text-slate-600">
        <div>
          <span class="font-medium text-slate-800 uppercase text-[10px]">Customer Information:</span><br>
          ${escapeHtml(user.name)}<br>
          Phone: ${user.phoneNumber}<br>
          Property: ${req.propertyType || 'House'} (${req.propertySize || 'Standard'})
        </div>
        <div>
          <span class="font-medium text-slate-800 uppercase text-[10px]">Service Scope:</span><br>
          ${req.servicecode || 'Repair Scope'} ${req.subServiceCode ? `(${req.subServiceCode})` : ''}<br>
          Address: ${escapeHtml(req.addressline || 'Main Residence')}<br>
          Estimated Timeline: <strong>${quote.estimatedTimeline || '1-2 Working Days'}</strong>
        </div>
      </div>

      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100 text-slate-600 font-medium uppercase border-b border-slate-300 text-[10.5px]">
            <th class="p-2 w-8">#</th>
            <th class="p-2">Scope of Work & Specification</th>
            <th class="p-2 w-14">Qty</th>
            <th class="p-2 w-20">Unit</th>
            <th class="p-2 w-20">Rate (₹)</th>
            <th class="p-2 w-24 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${lineItems.map((li, idx) => {
            const amt = (parseFloat(li.qty || 0) * parseFloat(li.rate || 0)).toFixed(2);
            return `
              <tr>
                <td class="p-2 font-medium text-slate-400">${idx + 1}</td>
                <td class="p-2 text-slate-800 font-normal">${escapeHtml(li.item || li.description || '')}</td>
                <td class="p-2 font-light">${li.qty}</td>
                <td class="p-2 font-light">${li.unit || 'Unit'}</td>
                <td class="p-2 font-light">₹${(li.rate || 0).toLocaleString('en-IN')}</td>
                <td class="p-2 text-right font-medium text-slate-900">₹${Number(amt).toLocaleString('en-IN')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="flex justify-end pt-1">
        <div class="w-64 space-y-1.5 text-xs border-t border-slate-200 pt-2.5">
          <div class="flex justify-between text-slate-500 font-light">
            <span>Material Cost:</span>
            <span>₹${(quote.materialCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-slate-500 font-light">
            <span>Labor & Application:</span>
            <span>₹${(quote.laborCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between font-medium text-slate-800">
            <span>Subtotal:</span>
            <span>₹${(quote.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          ${quote.discount > 0 ? `
            <div class="flex justify-between text-red-600 font-light">
              <span>Discount:</span>
              <span>- ₹${quote.discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-slate-400 font-light">
            <span>GST (${quote.taxRate || 18}%):</span>
            <span>₹${(quote.taxGST || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-800 pt-1.5 font-mono">
            <span>Grand Total:</span>
            <span>₹${(quote.grandtotal || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div class="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-[10.5px] text-slate-500 space-y-0.5 font-light">
        <div><strong>Warranty Terms:</strong> ${escapeHtml(quote.warranty_coverage || '1 Year Service Warranty')}</div>
        <div><strong>Commercial Terms:</strong> ${escapeHtml(quote.termsAndConditions || 'Standard payment terms apply.')}</div>
      </div>

    </div>
  `;

  openModal('quoteModalBackdrop');
}
window.openQuotationPreviewModal = openQuotationPreviewModal;

/* ==========================================================================
   DIAGNOSTICS & SYSTEM
   ========================================================================== */
function initDiagnostics() {
  document.getElementById('runDiagnosticsBtn')?.addEventListener('click', runDiagnostics);
}

async function runDiagnostics() {
  const endpoints = [
    { id: 'diagHealth', url: `${API_BASE}/api/health` },
    { id: 'diagServices', url: `${API_BASE}/api/v1/services` },
    { id: 'diagRequests', url: `${API_BASE}/api/v1/requests` },
    { id: 'diagQuotations', url: `${API_BASE}/api/v1/quotations` },
    { id: 'diagStats', url: `${API_BASE}/api/v1/admin/stats` }
  ];

  for (const ep of endpoints) {
    const el = document.getElementById(ep.id);
    if (!el) continue;
    el.textContent = 'Testing...';
    el.className = 'text-xs font-medium text-slate-400';

    const start = performance.now();
    try {
      const res = await fetch(ep.url);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        el.textContent = `200 OK (${latency}ms)`;
        el.className = 'text-xs font-medium text-emerald-600';
      } else {
        el.textContent = `${res.status} Error`;
        el.className = 'text-xs font-medium text-red-600';
      }
    } catch (e) {
      el.textContent = 'Failed';
      el.className = 'text-xs font-medium text-red-600';
    }
  }
}

/* ==========================================================================
   SEARCH & FILTERS
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const statusFilter = document.getElementById('requestStatusFilter');
  const propertyFilter = document.getElementById('requestPropertyFilter');

  searchInput?.addEventListener('input', () => {
    if (state.activeTab === 'requests') renderRequests();
  });

  statusFilter?.addEventListener('change', renderRequests);
  propertyFilter?.addEventListener('change', renderRequests);
}

/* ==========================================================================
   HELPERS & TOASTS
   ========================================================================== */
function getStatusBadgeClass(status) {
  switch ((status || '').toUpperCase()) {
    case 'SUBMITTED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ESTIMATING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'QUOTED':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'IN_PROGRESS':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'COMPLETED':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colorClass = type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white';
  
  toast.className = `pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-lg shadow-lg text-xs font-medium ${colorClass} transition-all duration-300`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-3.5 h-3.5"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  initIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ==========================================================================
   SETTINGS & ENV CREDENTIALS MANAGEMENT
   ========================================================================== */
let showPrivateKeyFlag = false;

function initSettings() {
  const form = document.getElementById('settingsForm');
  const toggleBtn = document.getElementById('togglePrivateKeyBtn');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      showPrivateKeyFlag = !showPrivateKeyFlag;
      const keyInput = document.getElementById('env_IMAGEKIT_PRIVATE_KEY');
      const toggleText = document.getElementById('togglePrivateKeyText');
      if (keyInput) keyInput.type = showPrivateKeyFlag ? 'text' : 'password';
      if (toggleText) toggleText.textContent = showPrivateKeyFlag ? 'Hide Key' : 'Reveal Key';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtnText = document.getElementById('saveSettingsBtnText');
      if (saveBtnText) saveBtnText.textContent = 'Saving...';

      const payload = {
        PORT: document.getElementById('env_PORT')?.value || '5000',
        BASE_URL: document.getElementById('env_BASE_URL')?.value || 'http://localhost:5000',
        NODE_ENV: document.getElementById('env_NODE_ENV')?.value || 'development',
        DATABASE_URL: document.getElementById('env_DATABASE_URL')?.value || '',
        IMAGEKIT_PUBLIC_KEY: document.getElementById('env_IMAGEKIT_PUBLIC_KEY')?.value || '',
        IMAGEKIT_PRIVATE_KEY: document.getElementById('env_IMAGEKIT_PRIVATE_KEY')?.value || '',
        IMAGEKIT_URL_ENDPOINT: document.getElementById('env_IMAGEKIT_URL_ENDPOINT')?.value || '',
        COMPANY_NAME: document.getElementById('env_COMPANY_NAME')?.value || '',
        SUPPORT_PHONE: document.getElementById('env_SUPPORT_PHONE')?.value || '',
        SUPPORT_EMAIL: document.getElementById('env_SUPPORT_EMAIL')?.value || ''
      };

      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Environment credentials updated in backend/.env successfully!', 'success');
        } else {
          showToast(data.message || 'Failed to update settings', 'error');
        }
      } catch (err) {
        showToast('Error saving settings to backend', 'error');
      } finally {
        if (saveBtnText) saveBtnText.textContent = 'Save & Update .env';
      }
    });
  }
}

async function loadEnvSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/settings`);
    const data = await res.json();
    if (data.success && data.data) {
      const env = data.data;
      if (document.getElementById('env_PORT')) document.getElementById('env_PORT').value = env.PORT || '';
      if (document.getElementById('env_BASE_URL')) document.getElementById('env_BASE_URL').value = env.BASE_URL || '';
      if (document.getElementById('env_NODE_ENV')) document.getElementById('env_NODE_ENV').value = env.NODE_ENV || 'development';
      if (document.getElementById('env_DATABASE_URL')) document.getElementById('env_DATABASE_URL').value = env.DATABASE_URL || '';
      if (document.getElementById('env_IMAGEKIT_PUBLIC_KEY')) document.getElementById('env_IMAGEKIT_PUBLIC_KEY').value = env.IMAGEKIT_PUBLIC_KEY || '';
      if (document.getElementById('env_IMAGEKIT_PRIVATE_KEY')) document.getElementById('env_IMAGEKIT_PRIVATE_KEY').value = env.IMAGEKIT_PRIVATE_KEY || '';
      if (document.getElementById('env_IMAGEKIT_URL_ENDPOINT')) document.getElementById('env_IMAGEKIT_URL_ENDPOINT').value = env.IMAGEKIT_URL_ENDPOINT || '';
      if (document.getElementById('env_COMPANY_NAME')) document.getElementById('env_COMPANY_NAME').value = env.COMPANY_NAME || '';
      if (document.getElementById('env_SUPPORT_PHONE')) document.getElementById('env_SUPPORT_PHONE').value = env.SUPPORT_PHONE || '';
      if (document.getElementById('env_SUPPORT_EMAIL')) document.getElementById('env_SUPPORT_EMAIL').value = env.SUPPORT_EMAIL || '';
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

// Window exposes
window.updateRequestStatus = updateRequestStatus;
window.deleteRequest = deleteRequest;
window.startQuotationForRequest = startQuotationForRequest;
window.triggerCustomerDecision = triggerCustomerDecision;
window.deleteQuotation = deleteQuotation;
window.deleteService = deleteService;
window.deleteSubService = deleteSubService;
window.updateLineItem = updateLineItem;
window.removeLineItem = removeLineItem;
window.loadEnvSettings = loadEnvSettings;
