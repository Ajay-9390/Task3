// GHMC Dashboard JS (Working Navigation Tabs & RBAC Controller)

const API_BASE = '/api/v1';
let currentUser = null;
let activeZone = 'KHAIRATABAD';

document.addEventListener('DOMContentLoaded', () => {
  // Read session/local storage for authenticated user
  const rawUser = localStorage.getItem('ghmc_user') || sessionStorage.getItem('ghmc_user');
  if (!rawUser) {
    window.location.href = '/index.html';
    return;
  }

  currentUser = JSON.parse(rawUser);
  activeZone = currentUser.zoneCode || 'KHAIRATABAD';

  renderHeaderProfile();
  renderUserProfileCard();
  initDashboardZoneSelector();
  setupRoleFormVisibility();
  loadDashboardGrievances();
  initNotificationWebSocket();
  loadNotificationHistory();
});

// 1. Render Header Profile Info
function renderHeaderProfile() {
  const nameEl = document.getElementById('userFullNameDisplay');
  const roleEl = document.getElementById('userRoleDisplay');
  
  if (nameEl) nameEl.innerText = currentUser.fullName;
  if (roleEl) roleEl.innerText = formatRoleName(currentUser.role);
}

function renderUserProfileCard() {
  const avatar = document.getElementById('profileAvatar');
  const name = document.getElementById('profileFullName');
  const role = document.getElementById('profileRoleBadge');
  const email = document.getElementById('profileEmail');
  const zone = document.getElementById('profileZone');
  const auth = document.getElementById('profileAuthType');

  if (avatar && currentUser.fullName) avatar.innerText = currentUser.fullName.charAt(0).toUpperCase();
  if (name) name.innerText = currentUser.fullName;
  if (role) role.innerText = formatRoleName(currentUser.role);
  if (email) email.innerText = currentUser.email;
  
  const userHomeZone = currentUser.zoneCode || 'KHAIRATABAD';
  if (zone) zone.innerText = `${userHomeZone} Zone (${userHomeZone})`;
  
  if (auth) auth.innerText = currentUser.role === 'ROLE_CITIZEN' ? 'JWT Stateless Token' : 'Session JSESSIONID Cookie';
}

function formatRoleName(role) {
  switch(role) {
    case 'ROLE_CITIZEN': return '👤 Citizen';
    case 'ROLE_WARD_INSPECTOR': return '🛠️ Ward Inspector';
    case 'ROLE_ZONAL_COMMISSIONER': return '👔 Zonal Commissioner';
    case 'ROLE_MUNICIPAL_COMMISSIONER': return '👑 Municipal Commissioner';
    default: return role;
  }
}

// 2. Zone Selector Setup
function initDashboardZoneSelector() {
  const select = document.getElementById('dashZoneSelect');
  const badge = document.getElementById('dashZoneBadge');
  if (!select) return;

  fetch(`${API_BASE}/zones`)
    .then(res => res.json())
    .then(zones => {
      select.innerHTML = zones.map(z => 
        `<option value="${z.code}">${z.name} (${z.code})</option>`
      ).join('');
      select.value = activeZone;
      if (badge) badge.innerText = activeZone;
      
      // Update zone labels across tabs
      document.querySelectorAll('.activeZoneLabel').forEach(el => el.innerText = activeZone);
    })
    .catch(err => console.error('Error fetching zones:', err));
}

function onZoneSwitch() {
  const select = document.getElementById('dashZoneSelect');
  activeZone = select.value;
  document.getElementById('dashZoneBadge').innerText = activeZone;
  document.querySelectorAll('.activeZoneLabel').forEach(el => el.innerText = activeZone);

  loadDashboardGrievances();
}

let currentGrievanceCache = [];
let currentSelectedModalGrievanceId = null;

// 3. Setup Role Form & Navigation Visibility (RBAC Enforcement)
function setupRoleFormVisibility() {
  const role = currentUser ? currentUser.role : 'ROLE_CITIZEN';

  // 1. Sidebar Tab Visibility Rules
  const navNew = document.getElementById('nav-new');
  const navAnalytics = document.getElementById('nav-analytics');
  const navMyRecent = document.getElementById('nav-my-recent');

  if (navNew) {
    navNew.style.display = role === 'ROLE_CITIZEN' ? 'block' : 'none';
  }

  if (navMyRecent) {
    navMyRecent.style.display = role === 'ROLE_CITIZEN' ? 'block' : 'none';
  }

  if (navAnalytics) {
    const isCommissioner = role === 'ROLE_ZONAL_COMMISSIONER' || role === 'ROLE_MUNICIPAL_COMMISSIONER';
    navAnalytics.style.display = isCommissioner ? 'block' : 'none';
  }

  // 2. Forms Visibility in Overview
  const citizenPanel = document.getElementById('citizenFormPanel');
  const officialPanel = document.getElementById('officialInfoPanel');

  if (role === 'ROLE_CITIZEN') {
    if (citizenPanel) citizenPanel.style.display = 'block';
    if (officialPanel) officialPanel.style.display = 'none';
  } else {
    if (citizenPanel) citizenPanel.style.display = 'none';
    if (officialPanel) officialPanel.style.display = 'block';
  }

  // 3. Zone Switcher Security Rules
  const zoneSelect = document.getElementById('dashZoneSelect');
  if (zoneSelect) {
    if (role === 'ROLE_MUNICIPAL_COMMISSIONER') {
      zoneSelect.disabled = false;
      zoneSelect.title = "Super Admin Access: Full cross-zone visibility across GHMC";
    } else {
      zoneSelect.disabled = true;
      zoneSelect.title = "Jurisdiction is locked strictly to your assigned GHMC zone";
    }
  }
}

// 4. Load Grievances & Render Feed Across Tabs
function loadDashboardGrievances() {
  const jwt = localStorage.getItem('ghmc_jwt');
  const headers = { 'X-Zone-Id': activeZone };
  if (jwt && currentUser.role === 'ROLE_CITIZEN') {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  // 1. Always fetch Zonal Grievances (Issues reported by all citizens in this zone)
  fetch(`${API_BASE}/grievances`, { headers })
    .then(res => res.json())
    .then(grievances => {
      const feed = document.getElementById('recentActivityFeed');
      const fullFeed = document.getElementById('fullRecentActivityList');
      
      if (!Array.isArray(grievances) || grievances.length === 0) {
        currentGrievanceCache = [];
        const emptyMsg = `<p style="color: #718096; padding: 1.5rem; text-align: center;">No grievances registered in <strong>${activeZone}</strong> zone.</p>`;
        if (feed) feed.innerHTML = emptyMsg;
        if (fullFeed) fullFeed.innerHTML = emptyMsg;
        updateMetrics([]);
      } else {
        currentGrievanceCache = grievances;
        updateMetrics(grievances);
        const feedHtml = renderGrievanceFeedHtml(grievances);
        if (feed) feed.innerHTML = feedHtml;
        if (fullFeed) fullFeed.innerHTML = feedHtml;
      }
    })
    .catch(err => console.error('Error loading zonal grievances feed:', err));

  // 2. For Citizen, also fetch My Recent Activities (Issues reported by logged-in citizen)
  if (currentUser && currentUser.role === 'ROLE_CITIZEN') {
    loadMyGrievances();
  }
}

function loadMyGrievances() {
  const jwt = localStorage.getItem('ghmc_jwt');
  if (!jwt) return;

  fetch(`${API_BASE}/grievances/my`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'X-Zone-Id': activeZone
    }
  })
  .then(res => res.json())
  .then(myGrievances => {
    const myFeed = document.getElementById('myRecentActivityList');
    if (!myFeed) return;

    if (!Array.isArray(myGrievances) || myGrievances.length === 0) {
      myFeed.innerHTML = `<p style="color: #718096; padding: 1.5rem; text-align: center;">You have not submitted any grievances yet.</p>`;
      return;
    }

    // Cache citizen grievances so modal detail works seamlessly
    myGrievances.forEach(mg => {
      if (!currentGrievanceCache.some(g => g.id === mg.id)) {
        currentGrievanceCache.push(mg);
      }
    });

    myFeed.innerHTML = renderGrievanceFeedHtml(myGrievances);
  })
  .catch(err => console.error('Error loading my grievances:', err));
}

function updateMetrics(grievances) {
  const total = grievances.length;
  const submitted = grievances.filter(g => g.status === 'SUBMITTED').length;
  const inProgress = grievances.filter(g => g.status === 'IN_PROGRESS').length;
  const resolved = grievances.filter(g => g.status === 'RESOLVED').length;

  if (document.getElementById('dashTotalCount')) document.getElementById('dashTotalCount').innerText = total;
  if (document.getElementById('dashSubmittedCount')) document.getElementById('dashSubmittedCount').innerText = submitted;
  if (document.getElementById('dashInProgressCount')) document.getElementById('dashInProgressCount').innerText = inProgress;
  if (document.getElementById('dashResolvedCount')) document.getElementById('dashResolvedCount').innerText = resolved;
}

function renderGrievanceFeedHtml(grievances) {
  const isWardInspector = currentUser && currentUser.role === 'ROLE_WARD_INSPECTOR';

  return grievances.map(g => `
    <div class="grievance-item" onclick="openGrievanceModal('${g.id}')" style="cursor: pointer;" title="Click to view complete details">
      <div class="grievance-header">
        <strong>${g.title}</strong>
        <span class="badge badge-${g.status.toLowerCase()}">${g.status}</span>
      </div>
      <p style="font-size: 0.88rem; color: #4A5568; margin-bottom: 0.4rem;">${g.description}</p>
      ${(g.beforePhotoUrl || g.afterPhotoUrl) ? `
        <div style="display: flex; gap: 0.6rem; margin-bottom: 0.5rem;" onclick="event.stopPropagation();">
          ${g.beforePhotoUrl ? `
            <div style="position: relative; cursor: pointer;" onclick="openGrievanceModal('${g.id}')">
              <img src="${g.beforePhotoUrl}" style="width: 75px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #CBD5E0;">
              <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(0,0,0,0.7); color: #FFF; font-size: 0.6rem; padding: 1px 4px; border-radius: 2px;">📷 Before</span>
            </div>
          ` : ''}
          ${g.afterPhotoUrl ? `
            <div style="position: relative; cursor: pointer;" onclick="openGrievanceModal('${g.id}')">
              <img src="${g.afterPhotoUrl}" style="width: 75px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #38A169;">
              <span style="position: absolute; bottom: 2px; left: 2px; background: #276749; color: #FFF; font-size: 0.6rem; padding: 1px 4px; border-radius: 2px;">✅ After Proof</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      <div class="grievance-meta">
        📍 ${g.location} | Ward: ${g.wardNo} | Category: <strong>${g.category}</strong>
      </div>
      ${isWardInspector ? `
        <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px dashed #CBD5E0; display: flex; gap: 0.4rem; align-items: center;" onclick="event.stopPropagation();">
          <span style="font-size: 0.78rem; font-weight: 600;">Update Status (RBAC):</span>
          <button class="btn btn-outline" style="padding: 0.15rem 0.45rem; font-size: 0.75rem;" onclick="updateGrievanceStatus('${g.id}', 'IN_PROGRESS')">In Progress</button>
          <button class="btn btn-saffron" style="padding: 0.15rem 0.45rem; font-size: 0.75rem;" onclick="updateGrievanceStatus('${g.id}', 'RESOLVED')">Resolved</button>
          <button class="btn btn-danger" style="padding: 0.15rem 0.45rem; font-size: 0.75rem;" onclick="updateGrievanceStatus('${g.id}', 'REJECTED')">Reject</button>
        </div>
      ` : `
        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--ghmc-navy); text-decoration: underline; font-weight: 600;">
          🔍 Click card to inspect full details
        </div>
      `}
    </div>
  `).join('');
}

// 5. Complete Grievance Details Modal Handlers
function openGrievanceModal(id) {
  const grievance = currentGrievanceCache.find(g => g.id === id);
  if (!grievance) return;

  currentSelectedModalGrievanceId = grievance.id;

  const idEl = document.getElementById('modalGrievanceId');
  const titleEl = document.getElementById('modalGrievanceTitle');
  const statusEl = document.getElementById('modalGrievanceStatus');
  const categoryEl = document.getElementById('modalGrievanceCategory');
  const locationEl = document.getElementById('modalGrievanceLocation');
  const zoneEl = document.getElementById('modalGrievanceZone');
  const descEl = document.getElementById('modalGrievanceDescription');
  const citizenEl = document.getElementById('modalGrievanceCitizen');
  const actionsEl = document.getElementById('modalInspectorActions');

  if (idEl) idEl.innerText = `ID: ${grievance.id}`;
  if (titleEl) titleEl.innerText = grievance.title;
  if (statusEl) {
    statusEl.innerText = grievance.status;
    statusEl.className = `badge badge-${grievance.status.toLowerCase()}`;
  }
  if (categoryEl) categoryEl.innerText = grievance.category;
  if (locationEl) locationEl.innerText = `${grievance.location} (Ward ${grievance.wardNo})`;
  if (zoneEl) zoneEl.innerText = grievance.zone ? `${grievance.zone.name} (${grievance.zone.code})` : `${activeZone} Zone`;
  if (descEl) descEl.innerText = grievance.description;
  if (citizenEl) {
    citizenEl.innerText = grievance.citizen ? `${grievance.citizen.fullName} (${grievance.citizen.email})` : 'Registered Citizen';
  }

  // Populate Photos
  const beforeCard = document.getElementById('beforePhotoCard');
  const beforeImg = document.getElementById('modalBeforePhotoImg');
  const beforeLink = document.getElementById('modalBeforePhotoLink');

  const afterCard = document.getElementById('afterPhotoCard');
  const afterImg = document.getElementById('modalAfterPhotoImg');
  const afterLink = document.getElementById('modalAfterPhotoLink');
  const noPhotosMsg = document.getElementById('noPhotosMsg');

  let hasPhotos = false;

  if (beforeCard && beforeImg && beforeLink) {
    if (grievance.beforePhotoUrl) {
      beforeImg.src = grievance.beforePhotoUrl;
      beforeLink.href = grievance.beforePhotoUrl;
      beforeCard.style.display = 'block';
      hasPhotos = true;
    } else {
      beforeCard.style.display = 'none';
    }
  }

  if (afterCard && afterImg && afterLink) {
    if (grievance.afterPhotoUrl) {
      afterImg.src = grievance.afterPhotoUrl;
      afterLink.href = grievance.afterPhotoUrl;
      afterCard.style.display = 'block';
      hasPhotos = true;
    } else {
      afterCard.style.display = 'none';
    }
  }

  if (noPhotosMsg) {
    noPhotosMsg.style.display = hasPhotos ? 'none' : 'block';
  }

  // Reset Inspector Proof File Input
  const proofInput = document.getElementById('inspectorProofPhotoInput');
  if (proofInput) proofInput.value = '';

  // Show status update controls ONLY for Ward Inspectors
  if (actionsEl) {
    actionsEl.style.display = (currentUser && currentUser.role === 'ROLE_WARD_INSPECTOR') ? 'block' : 'none';
  }

  const modal = document.getElementById('grievanceDetailModal');
  if (modal) modal.style.display = 'flex';
}

function closeGrievanceModal() {
  const modal = document.getElementById('grievanceDetailModal');
  if (modal) modal.style.display = 'none';
  currentSelectedModalGrievanceId = null;
}

function updateModalGrievanceStatus(newStatus) {
  if (!currentSelectedModalGrievanceId) return;
  updateGrievanceStatus(currentSelectedModalGrievanceId, newStatus);
  closeGrievanceModal();
}

// Global Toast Notification Helper
function showToast(message, type = 'info', title = '') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span>${icons[type] || 'ℹ️'}</span>
    <div>
      ${title ? `<div style="font-weight: 700; margin-bottom: 0.1rem;">${title}</div>` : ''}
      <div>${message}</div>
    </div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 3500);
}

// Upload helper for photo attachments
async function uploadPhotoFile(inputEl) {
  if (!inputEl || !inputEl.files || inputEl.files.length === 0) {
    return null;
  }
  const formData = new FormData();
  formData.append('file', inputEl.files[0]);

  const res = await fetch(`${API_BASE}/grievances/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to upload photo file');
  }

  const data = await res.json();
  return data.url;
}

// Submit Grievance Handlers
async function handleCitizenSubmitGrievance(e) {
  e.preventDefault();
  const jwt = localStorage.getItem('ghmc_jwt');
  if (!jwt) {
    showToast('Session expired. Please log in again.', 'warning', 'Session Expired');
    handleLogout();
    return;
  }

  const title = document.getElementById('citizenGrvTitle')?.value || document.getElementById('citizenGrvTitle2')?.value;
  const category = document.getElementById('citizenGrvCategory')?.value || document.getElementById('citizenGrvCategory2')?.value;
  const location = document.getElementById('citizenGrvLocation')?.value || document.getElementById('citizenGrvLocation2')?.value;
  const wardNo = document.getElementById('citizenGrvWard')?.value || document.getElementById('citizenGrvWard2')?.value;
  const description = document.getElementById('citizenGrvDescription')?.value || document.getElementById('citizenGrvDescription2')?.value;

  const photoInput = document.getElementById('citizenGrvPhoto')?.files?.length ? document.getElementById('citizenGrvPhoto') : document.getElementById('citizenGrvPhoto2');

  try {
    let beforePhotoUrl = null;
    if (photoInput && photoInput.files && photoInput.files.length > 0) {
      showToast('Uploading photo proof...', 'info', 'Uploading Media');
      beforePhotoUrl = await uploadPhotoFile(photoInput);
    }

    const payload = { title, category, location, wardNo, description, beforePhotoUrl, zoneCode: activeZone };

    const res = await fetch(`${API_BASE}/grievances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
        'X-Zone-Id': activeZone
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({ message: 'Submission failed' }));
    if (!res.ok) throw new Error(data.message || 'Submission failed');

    showToast(`Grievance Submitted Successfully to ${activeZone} Zone!`, 'success', 'Grievance Filed');

    ['citizenGrvTitle', 'citizenGrvTitle2', 'citizenGrvLocation', 'citizenGrvLocation2', 'citizenGrvWard', 'citizenGrvWard2', 'citizenGrvDescription', 'citizenGrvDescription2', 'citizenGrvPhoto', 'citizenGrvPhoto2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    loadDashboardGrievances();
    switchSidebarTab(null, 'overview');
  } catch (err) {
    showToast(err.message || 'Failed to submit grievance', 'error', 'Submission Error');
  }
}

// Update Status Handler (Strict Ward Inspector RBAC + Proof Upload)
async function updateGrievanceStatus(id, newStatus) {
  try {
    let afterPhotoUrl = null;
    const proofInput = document.getElementById('inspectorProofPhotoInput');
    if (proofInput && proofInput.files && proofInput.files.length > 0) {
      showToast('Uploading inspector proof photo...', 'info', 'Uploading Proof');
      afterPhotoUrl = await uploadPhotoFile(proofInput);
    }

    const res = await fetch(`${API_BASE}/grievances/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Zone-Id': activeZone
      },
      body: JSON.stringify({ status: newStatus, afterPhotoUrl })
    });

    if (res.status === 403) {
      showToast('RBAC 403 Forbidden: Status updates are strictly restricted to Ward Inspectors.', 'error', 'Permission Denied');
      return;
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || 'Update failed');

    showToast(`Complaint status updated to ${newStatus} successfully!`, 'success', 'Status Updated');
    if (proofInput) proofInput.value = '';
    loadDashboardGrievances();
  } catch (err) {
    showToast(err.message || 'Status update failed', 'error', 'Update Failed');
  }
}

// 7. DYNAMIC SIDEBAR NAVIGATION TAB SWITCHER
function switchSidebarTab(e, targetTabId) {
  if (e) e.preventDefault();

  const sidebarItems = document.querySelectorAll('.sidebar-nav li');
  sidebarItems.forEach(li => li.classList.remove('active'));

  const activeNavItem = document.getElementById(`nav-${targetTabId}`);
  if (activeNavItem) activeNavItem.classList.add('active');

  const allPanels = document.querySelectorAll('.tab-panel');
  allPanels.forEach(panel => panel.style.display = 'none');

  const targetPanel = document.getElementById(`tab-panel-${targetTabId}`);
  if (targetPanel) {
    targetPanel.style.display = 'block';
  }

  const globalFooter = document.querySelector('.ghmc-footer');
  if (targetTabId === 'profile') {
    if (globalFooter) globalFooter.style.display = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } else {
    if (globalFooter) globalFooter.style.display = 'block';
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  }

  if (targetTabId === 'overview' || targetTabId === 'recent' || targetTabId === 'analytics' || targetTabId === 'my-recent') {
    loadDashboardGrievances();
    if (targetTabId === 'analytics') {
      loadZoneAnalytics();
    }
  }

  if (targetTabId === 'notifications') {
    unreadNotificationCount = 0;
    updateNotificationBadgeUI();
    loadNotificationHistory();
  }
}

// 8. Zone Analytics Report Handlers
function loadZoneAnalytics() {
  const isCommissioner = currentUser && (currentUser.role === 'ROLE_ZONAL_COMMISSIONER' || currentUser.role === 'ROLE_MUNICIPAL_COMMISSIONER');
  if (!isCommissioner) return;

  if (currentUser.role === 'ROLE_MUNICIPAL_COMMISSIONER') {
    const toggle = document.getElementById('superAdminReportToggle');
    if (toggle) toggle.style.display = 'flex';
    loadCombinedAnalyticsReport();
  } else {
    const toggle = document.getElementById('superAdminReportToggle');
    if (toggle) toggle.style.display = 'none';
    const zoneBtns = document.getElementById('zoneReportButtonsContainer');
    if (zoneBtns) zoneBtns.style.display = 'none';
    loadSingleZoneAnalyticsReport(currentUser.zoneCode || activeZone);
  }
}

function loadCombinedAnalyticsReport() {
  fetch(`${API_BASE}/analytics/combined`)
    .then(res => res.json())
    .then(data => {
      if (!data) return;
      if (document.getElementById('analyticsTotalCount')) document.getElementById('analyticsTotalCount').innerText = data.totalGrievances;
      if (document.getElementById('analyticsOpenCount')) document.getElementById('analyticsOpenCount').innerText = data.openCount;
      if (document.getElementById('analyticsResolvedCount')) document.getElementById('analyticsResolvedCount').innerText = data.resolvedCount;
      if (document.getElementById('analyticsResolutionRate')) document.getElementById('analyticsResolutionRate').innerText = `${data.resolutionRate}%`;
      if (document.getElementById('analyticsZoneReportTitle')) document.getElementById('analyticsZoneReportTitle').innerText = "Combined All-Zones GHMC";

      const zoneBtns = document.getElementById('zoneReportButtonsContainer');
      if (zoneBtns) zoneBtns.style.display = 'block';

      const btnCombined = document.getElementById('btnCombinedReport');
      const btnSingle = document.getElementById('btnSingleZoneReport');
      if (btnCombined) { btnCombined.className = 'btn btn-primary'; }
      if (btnSingle) { btnSingle.className = 'btn btn-outline'; }
    })
    .catch(err => console.error('Error loading combined analytics:', err));
}

function loadSingleZoneAnalyticsReport(zoneCode) {
  const targetZone = zoneCode || activeZone;
  fetch(`${API_BASE}/analytics/zone/${targetZone}`)
    .then(res => {
      if (res.status === 403) {
        showToast('RBAC 403: You do not have access to view this zone report', 'error', 'Permission Denied');
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      if (document.getElementById('analyticsTotalCount')) document.getElementById('analyticsTotalCount').innerText = data.totalGrievances;
      if (document.getElementById('analyticsOpenCount')) document.getElementById('analyticsOpenCount').innerText = data.openCount;
      if (document.getElementById('analyticsResolvedCount')) document.getElementById('analyticsResolvedCount').innerText = data.resolvedCount;
      if (document.getElementById('analyticsResolutionRate')) document.getElementById('analyticsResolutionRate').innerText = `${data.resolutionRate}%`;
      if (document.getElementById('analyticsZoneReportTitle')) document.getElementById('analyticsZoneReportTitle').innerText = `${data.zoneCode} Zone`;

      if (currentUser.role === 'ROLE_MUNICIPAL_COMMISSIONER') {
        const btnCombined = document.getElementById('btnCombinedReport');
        const btnSingle = document.getElementById('btnSingleZoneReport');
        if (btnCombined) { btnCombined.className = 'btn btn-outline'; }
        if (btnSingle) { btnSingle.className = 'btn btn-primary'; }
      }
    })
    .catch(err => console.error('Error loading zone analytics:', err));
}

function inspectZoneReport(zoneCode) {
  loadSingleZoneAnalyticsReport(zoneCode);
}

// 9. Logout Handler
function handleLogout() {
  if (currentUser && currentUser.role !== 'ROLE_CITIZEN') {
    fetch(`${API_BASE}/auth/official/logout`, { method: 'POST' }).catch(() => {});
  }

  localStorage.removeItem('ghmc_user');
  localStorage.removeItem('ghmc_jwt');
  sessionStorage.removeItem('ghmc_user');

  window.location.href = '/index.html';
}

// 10. REAL-TIME WEBSOCKET NOTIFICATION ENGINE
let notificationWebSocket = null;
let unreadNotificationCount = 0;

function initNotificationWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

  try {
    notificationWebSocket = new WebSocket(wsUrl);

    notificationWebSocket.onopen = () => {
      console.log('Real-Time Notification WebSocket Connected to', wsUrl);
    };

    notificationWebSocket.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        handleIncomingRealtimeNotification(notif);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    notificationWebSocket.onclose = () => {
      console.log('WebSocket closed, attempting reconnect in 5s...');
      setTimeout(initNotificationWebSocket, 5000);
    };

    notificationWebSocket.onerror = (err) => {
      console.warn('WebSocket connection error:', err);
    };
  } catch (err) {
    console.error('Failed to initialize WebSocket:', err);
  }
}

let recentNotificationsCache = [];

function handleIncomingRealtimeNotification(notif) {
  if (!notif || !currentUser) return;

  // Check relevance for logged-in user
  const isRecipient = !notif.recipientEmail || notif.recipientEmail === currentUser.email;
  const isRoleMatch = !notif.recipientRole || notif.recipientRole === 'ALL_ROLES' || notif.recipientRole === currentUser.role || currentUser.role === 'ROLE_MUNICIPAL_COMMISSIONER';

  if (!isRecipient && !isRoleMatch) return;

  // Toast type mapping
  let type = 'info';
  if (notif.type === 'NEW_GRIEVANCE') type = 'warning';
  if (notif.type === 'RESOLVED') type = 'success';

  // 1. Display Real-Time Animated Toast Notification Alert!
  showToast(notif.message, type, notif.title || 'Real-Time Alert');

  // 2. Increment unread notification badge
  unreadNotificationCount++;
  updateNotificationBadgeUI();

  // 3. FIFO Queue Eviction (Max 10 Items):
  // Prevent duplicate insertion
  if (!recentNotificationsCache.some(n => n.id === notif.id)) {
    recentNotificationsCache.unshift(notif);
  }

  // Evict oldest items beyond 10 (FIFO Policy)
  if (recentNotificationsCache.length > 10) {
    recentNotificationsCache = recentNotificationsCache.slice(0, 10);
  }

  renderNotificationFeedUI();

  // 4. Auto-refresh dashboard feeds so new complaints/status updates show live!
  loadDashboardGrievances();
}

function updateNotificationBadgeUI() {
  const badge = document.getElementById('notifBadgeCount');
  if (!badge) return;

  if (unreadNotificationCount > 0) {
    badge.innerText = unreadNotificationCount;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function loadNotificationHistory() {
  fetch(`${API_BASE}/notifications`)
    .then(res => res.json())
    .then(notifications => {
      if (Array.isArray(notifications)) {
        // Enforce top 10 limit with FIFO eviction on older items
        recentNotificationsCache = notifications.slice(0, 10);
      } else {
        recentNotificationsCache = [];
      }
      renderNotificationFeedUI();
    })
    .catch(err => console.error('Error fetching notification history:', err));
}

function renderNotificationFeedUI() {
  const feed = document.getElementById('notificationFeedList');
  if (!feed) return;

  if (recentNotificationsCache.length === 0) {
    feed.innerHTML = `<p style="color: #718096; padding: 1.5rem; text-align: center;">No notifications received yet.</p>`;
    return;
  }

  const headerNotice = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: #F8FAFC; border-radius: 6px; border: 1px solid var(--ghmc-border); margin-bottom: 0.85rem; font-size: 0.8rem; color: var(--ghmc-text-dark); font-weight: 600;">
      <span>📌 Displaying Recent 10 Notifications</span>
      <span class="badge" style="background:#E2E8F0; color:var(--ghmc-navy);">FIFO Queue Policy (Max 10)</span>
    </div>
  `;

  feed.innerHTML = headerNotice + recentNotificationsCache.map(n => renderNotificationCardHtml(n)).join('');
}

function renderNotificationCardHtml(n) {
  const isResolved = n.type === 'RESOLVED';
  const isNew = n.type === 'NEW_GRIEVANCE';
  const icon = isResolved ? '✅' : (isNew ? '🚨' : 'ℹ️');

  return `
    <div class="grievance-item" onclick="openGrievanceModal('${n.grievanceId}')" style="cursor: pointer; border-left: 4px solid ${isResolved ? '#38A169' : (isNew ? '#DD6B20' : '#3182CE')}; margin-bottom: 0.75rem;">
      <div class="grievance-header">
        <strong>${icon} ${n.title}</strong>
        <span class="badge" style="background:#EDF2F7; color:var(--ghmc-navy); font-size:0.72rem;">${n.zoneCode || activeZone} Zone</span>
      </div>
      <p style="font-size: 0.88rem; color: #2D3748; margin: 0.4rem 0;">${n.message}</p>
      <div class="grievance-meta">
        ⏰ ${new Date(n.createdAt || Date.now()).toLocaleString()} | Click card to inspect complaint details
      </div>
    </div>
  `;
}

// 11. GOOGLE GEMINI 1.5 FLASH AI INTEGRATION
function triggerAiFormCategorize(formNum) {
  const titleEl = document.getElementById(formNum === 1 ? 'citizenGrvTitle' : 'citizenGrvTitle2');
  const descEl = document.getElementById(formNum === 1 ? 'citizenGrvDescription' : 'citizenGrvDescription2');
  const categoryEl = document.getElementById(formNum === 1 ? 'citizenGrvCategory' : 'citizenGrvCategory2');
  const resultBox = document.getElementById(`aiAnalysisResultBox${formNum}`);
  const resultText = document.getElementById(`aiAnalysisText${formNum}`);

  const title = titleEl ? titleEl.value : '';
  const description = descEl ? descEl.value : '';

  if (!title && !description) {
    showToast('Please enter a title or description first for Gemini AI analysis.', 'warning', 'Gemini AI Assist');
    return;
  }

  showToast('Analyzing complaint with Google Gemini 1.5 Flash...', 'info', '✨ Gemini AI');

  fetch(`${API_BASE}/ai/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  })
  .then(res => res.json())
  .then(ai => {
    if (categoryEl && ai.category) {
      categoryEl.value = ai.category;
    }
    if (resultBox && resultText) {
      resultBox.style.display = 'block';
      resultText.innerHTML = `<strong>Category:</strong> ${ai.category} | <strong>Urgency:</strong> ${ai.urgency} (Score: ${ai.priorityScore}/100) | Est. ${ai.estimatedHours}h<br><em>"${ai.rationale}"</em>`;
    }
    showToast(`Gemini AI categorized as ${ai.category} (${ai.urgency} Urgency)`, 'success', '✨ Gemini AI');
  })
  .catch(err => {
    console.error('Error with Gemini AI categorization:', err);
    showToast('AI categorization fallback active.', 'warning');
  });
}

function toggleAiChatWidget() {
  const widget = document.getElementById('aiChatWidgetModal');
  if (!widget) return;
  widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
}

function handleAiChatKeyPress(event) {
  if (event.key === 'Enter') {
    submitAiChatMessage();
  }
}

function submitAiChatMessage() {
  const input = document.getElementById('aiChatInput');
  const list = document.getElementById('aiChatMessagesList');
  if (!input || !list || !input.value.trim()) return;

  const query = input.value.trim();
  input.value = '';

  // Append user message
  list.innerHTML += `<div class="user-msg">${query}</div>`;
  list.scrollTop = list.scrollHeight;

  // Fetch Gemini AI response
  fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userEmail: currentUser ? currentUser.email : '' })
  })
  .then(res => res.json())
  .then(data => {
    list.innerHTML += `<div class="ai-msg">${data.answer}</div>`;
    list.scrollTop = list.scrollHeight;
  })
  .catch(err => {
    list.innerHTML += `<div class="ai-msg">🤖 **GHMC Gemini AI Assist**: I am processing your request. Please try again!</div>`;
    list.scrollTop = list.scrollHeight;
  });
}

function generateAiExecutiveSummary() {
  const box = document.getElementById('aiExecutiveReportBox');
  const content = document.getElementById('aiExecutiveReportContent');
  if (!box || !content) return;

  showToast('Generating AI Executive Summary with Gemini 1.5 Flash...', 'info', '🤖 Gemini AI');

  fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneCode: activeZone })
  })
  .then(res => res.json())
  .then(data => {
    box.style.display = 'block';
    content.innerHTML = data.summaryText;
    showToast('Gemini AI Executive Summary Report generated!', 'success', '🤖 Gemini AI');
  })
  .catch(err => {
    console.error('Error generating AI executive summary:', err);
  });
}
