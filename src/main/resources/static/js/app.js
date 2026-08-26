// GHMC Civic Portal Frontend Application Script

const API_BASE = '/api/v1';
let activeZone = 'KHAIRATABAD';
let citizenJwt = localStorage.getItem('ghmc_citizen_jwt') || null;
let citizenUser = JSON.parse(localStorage.getItem('ghmc_citizen_user') || 'null');
let officialUser = null;

document.addEventListener('DOMContentLoaded', () => {
  initZoneSelector();
  setupNavigationTabs();
  checkAuthStates();
  loadGrievances();
});

// 1. Multi-Tenant Zone Selection Management
function initZoneSelector() {
  const zoneSelect = document.getElementById('zoneSelect');
  if (!zoneSelect) return;

  fetch(`${API_BASE}/zones`)
    .then(res => res.json())
    .then(zones => {
      zoneSelect.innerHTML = zones.map(z => 
        `<option value="${z.code}">${z.name} (${z.code})</option>`
      ).join('');
      zoneSelect.value = activeZone;
    })
    .catch(err => console.error('Error fetching zones:', err));

  zoneSelect.addEventListener('change', (e) => {
    activeZone = e.target.value;
    document.getElementById('displayActiveTenant').innerText = activeZone;
    loadGrievances();
  });
}

// 2. Tab Navigation System
function setupNavigationTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// 3. Auth State Checks
function checkAuthStates() {
  const citizenInfo = document.getElementById('citizenAuthStatus');
  if (citizenJwt && citizenUser) {
    citizenInfo.innerHTML = `
      <div style="background: #EBF8FF; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem;">
        <strong>Logged in as Citizen:</strong> ${citizenUser.fullName} (${citizenUser.email})<br>
        <span style="font-size: 0.8rem; color: #2B6CB0;">Auth Type: Stateless JWT Bearer Token</span>
        <button class="btn btn-outline" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; margin-left: 1rem;" onclick="logoutCitizen()">Logout JWT</button>
      </div>
    `;
  } else {
    citizenInfo.innerHTML = `<p style="font-size: 0.85rem; color: #718096;">Not logged in as Citizen. Use login or register below to get a JWT.</p>`;
  }
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

// 4. Citizen Registration (JWT)
function handleCitizenRegister(e) {
  e.preventDefault();
  const payload = {
    fullName: document.getElementById('regFullName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPassword').value,
    phone: document.getElementById('regPhone').value,
    zoneCode: activeZone
  };

  fetch(`${API_BASE}/auth/citizen/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Server returned non-JSON response' }));
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  })
  .then(data => {
    if (data.token) {
      citizenJwt = data.token;
      citizenUser = data;
      localStorage.setItem('ghmc_citizen_jwt', citizenJwt);
      localStorage.setItem('ghmc_citizen_user', JSON.stringify(citizenUser));
      showToast('Citizen Registration Successful! JWT Token Issued.', 'success', 'Account Registered');
      checkAuthStates();
    }
  })
  .catch(err => showToast(err.message || 'Registration failed', 'error', 'Registration Error'));
}

// 5. Citizen Login (JWT)
function handleCitizenLogin(e) {
  e.preventDefault();
  const payload = {
    email: document.getElementById('citizenLoginEmail').value,
    password: document.getElementById('citizenLoginPassword').value
  };

  fetch(`${API_BASE}/auth/citizen/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Server returned invalid response' }));
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  })
  .then(data => {
    if (data.token) {
      citizenJwt = data.token;
      citizenUser = data;
      localStorage.setItem('ghmc_citizen_jwt', citizenJwt);
      localStorage.setItem('ghmc_citizen_user', JSON.stringify(citizenUser));
      showToast('Citizen JWT Login Successful!', 'success', 'Signed In');
      checkAuthStates();
    }
  })
  .catch(err => showToast(err.message || 'Login failed', 'error', 'Login Error'));
}

function logoutCitizen() {
  localStorage.removeItem('ghmc_citizen_jwt');
  localStorage.removeItem('ghmc_citizen_user');
  citizenJwt = null;
  citizenUser = null;
  checkAuthStates();
  showToast('Logged out of Citizen session.', 'info', 'Logged Out');
}

// 6. Official Login (Session Cookie)
function handleOfficialLogin(e) {
  e.preventDefault();
  const payload = {
    email: document.getElementById('officialLoginEmail').value,
    password: document.getElementById('officialLoginPassword').value
  };

  fetch(`${API_BASE}/auth/official/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Server returned invalid response' }));
    if (!res.ok) throw new Error(data.message || 'Official Login Failed');
    return data;
  })
  .then(data => {
    if (data.role) {
      officialUser = data;
      document.getElementById('officialAuthStatus').innerHTML = `
        <div style="background: #F0FFF4; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem;">
          <strong>Official Session Active:</strong> ${data.fullName} (${data.role})<br>
          <span style="font-size: 0.8rem; color: #276749;">Auth Type: HTTP-Only JSESSIONID Cookie</span>
          <button class="btn btn-outline" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; margin-left: 1rem;" onclick="logoutOfficial()">Logout Session</button>
        </div>
      `;
      showToast(`Official Session Established for ${data.fullName} [${data.role}]!`, 'success', 'Official Session');
      loadGrievances();
    }
  })
  .catch(err => showToast(err.message || 'Official Login Failed', 'error', 'Official Login Error'));
}

function logoutOfficial() {
  fetch(`${API_BASE}/auth/official/logout`, { method: 'POST' })
    .then(() => {
      officialUser = null;
      document.getElementById('officialAuthStatus').innerHTML = `<p style="font-size: 0.85rem; color: #718096;">Not logged in as Official. Session Cookie is empty.</p>`;
      showToast('Official Session Destroyed.', 'info', 'Session Ended');
    });
}

// 7. Grievance Operations (Multi-Tenant + Scoped)
function handleCreateGrievance(e) {
  e.preventDefault();
  if (!citizenJwt) {
    showToast('Please log in as a Citizen (JWT) first to submit a grievance!', 'warning', 'Authentication Required');
    return;
  }

  const payload = {
    title: document.getElementById('grvTitle').value,
    category: document.getElementById('grvCategory').value,
    location: document.getElementById('grvLocation').value,
    wardNo: document.getElementById('grvWard').value,
    description: document.getElementById('grvDescription').value,
    zoneCode: activeZone
  };

  fetch(`${API_BASE}/grievances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenJwt}`,
      'X-Zone-Id': activeZone
    },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Server error' }));
    if (!res.ok) throw new Error(data.message || 'Submission failed');
    return data;
  })
  .then(data => {
    showToast(`Grievance Submitted Successfully! Scoped to Zone: ${activeZone}`, 'success', 'Grievance Filed');
    loadGrievances();
  })
  .catch(err => showToast(err.message || 'Submission error', 'error', 'Grievance Submission Error'));
}

function loadGrievances() {
  const headers = { 'X-Zone-Id': activeZone };
  if (citizenJwt) {
    headers['Authorization'] = `Bearer ${citizenJwt}`;
  }

  fetch(`${API_BASE}/grievances`, { headers })
    .then(res => res.json())
    .then(grievances => {
      const container = document.getElementById('grievanceList');
      if (!container) return;

      if (!Array.isArray(grievances) || grievances.length === 0) {
        container.innerHTML = `<p style="color: #718096; padding: 1rem;">No grievances registered in <strong>${activeZone}</strong> zone.</p>`;
        return;
      }

      container.innerHTML = grievances.map(g => `
        <div class="grievance-item">
          <div class="grievance-header">
            <strong>${g.title}</strong>
            <span class="badge badge-${g.status.toLowerCase()}">${g.status}</span>
          </div>
          <p style="font-size: 0.9rem; color: #4A5568; margin-bottom: 0.4rem;">${g.description}</p>
          <div class="grievance-meta">
            📍 Location: ${g.location} | Ward: ${g.wardNo} | Category: <strong>${g.category}</strong> | Zone: <strong>${g.zone.name}</strong>
          </div>
          ${(officialUser && (officialUser.role === 'ROLE_WARD_INSPECTOR' || officialUser.role === 'ROLE_ZONAL_COMMISSIONER' || officialUser.role === 'ROLE_MUNICIPAL_COMMISSIONER')) ? `
            <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 600;">Update Status (RBAC):</span>
              <button class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="updateStatus('${g.id}', 'IN_PROGRESS')">In Progress</button>
              <button class="btn btn-saffron" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="updateStatus('${g.id}', 'RESOLVED')">Resolved</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    })
    .catch(err => console.error('Error loading grievances:', err));
}

function updateStatus(id, newStatus) {
  fetch(`${API_BASE}/grievances/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Zone-Id': activeZone
    },
    body: JSON.stringify({ status: newStatus })
  })
  .then(async res => {
    if (res.status === 403) {
      showToast('RBAC Error 403 Forbidden: You do not have permissions to update grievance status!', 'error', 'Permission Denied');
      return null;
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || 'Update failed');
    return data;
  })
  .then(data => {
    if (data) {
      showToast(`Status updated to ${newStatus} successfully!`, 'success', 'Status Updated');
      loadGrievances();
    }
  })
  .catch(err => showToast(err.message || 'Error updating status', 'error', 'Update Error'));
}
