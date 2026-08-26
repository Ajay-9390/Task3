// GHMC Landing & Auth Portal JS

const API_BASE = '/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in, redirect straight to dashboard
  const user = JSON.parse(localStorage.getItem('ghmc_user') || sessionStorage.getItem('ghmc_user') || 'null');
  if (user) {
    window.location.href = '/dashboard.html';
    return;
  }

  loadZones();
});

function loadZones() {
  fetch(`${API_BASE}/zones`)
    .then(res => res.json())
    .then(zones => {
      const loginZoneSelect = document.getElementById('loginZoneSelect');
      const regZoneSelect = document.getElementById('regZoneSelect');
      
      const optionsHtml = zones.map(z => 
        `<option value="${z.code}">${z.name} (${z.code})</option>`
      ).join('');

      if (loginZoneSelect) loginZoneSelect.innerHTML = optionsHtml;
      if (regZoneSelect) regZoneSelect.innerHTML = optionsHtml;
    })
    .catch(err => console.error('Error loading zones:', err));
}

function switchAuthTab(tabName) {
  const signInBtn = document.getElementById('signInTabBtn');
  const regBtn = document.getElementById('registerTabBtn');
  const signInPanel = document.getElementById('signInFormPanel');
  const regPanel = document.getElementById('registerFormPanel');

  if (tabName === 'signin') {
    signInBtn.classList.add('active');
    regBtn.classList.remove('active');
    signInPanel.style.display = 'block';
    regPanel.style.display = 'none';
  } else {
    regBtn.classList.add('active');
    signInBtn.classList.remove('active');
    regPanel.style.display = 'block';
    signInPanel.style.display = 'none';
  }
}

function onRoleChange() {
  const role = document.getElementById('loginRoleSelect').value;
  const emailInput = document.getElementById('loginEmail');
  
  if (role === 'ROLE_CITIZEN') {
    emailInput.value = 'citizen.ravi@gmail.com';
  } else if (role === 'ROLE_WARD_INSPECTOR') {
    emailInput.value = 'inspector.khairatabad@ghmc.gov.in';
  } else if (role === 'ROLE_ZONAL_COMMISSIONER') {
    emailInput.value = 'zonal.secunderabad@ghmc.gov.in';
  } else if (role === 'ROLE_MUNICIPAL_COMMISSIONER') {
    emailInput.value = 'commissioner@ghmc.gov.in';
  }
}

function quickFill(role, email, zoneCode) {
  document.getElementById('loginRoleSelect').value = role;
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = 'ghmc123';
  if (document.getElementById('loginZoneSelect')) {
    document.getElementById('loginZoneSelect').value = zoneCode;
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

function handleSignIn(e) {
  e.preventDefault();
  const role = document.getElementById('loginRoleSelect').value;
  const zoneCode = document.getElementById('loginZoneSelect').value;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const endpoint = role === 'ROLE_CITIZEN' 
    ? `${API_BASE}/auth/citizen/login` 
    : `${API_BASE}/auth/official/login`;

  fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Zone-Id': zoneCode
    },
    body: JSON.stringify({ email, password })
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Server returned invalid response' }));
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  })
  .then(data => {
    // Save user profile & token
    const userSession = {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      zoneCode: zoneCode,
      token: data.token || null
    };

    if (role === 'ROLE_CITIZEN') {
      localStorage.setItem('ghmc_user', JSON.stringify(userSession));
      if (data.token) localStorage.setItem('ghmc_jwt', data.token);
    } else {
      sessionStorage.setItem('ghmc_user', JSON.stringify(userSession));
    }

    showToast(`Welcome back, ${data.fullName}! Redirecting...`, 'success', 'Signed In Successfully');

    // Smooth redirection to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 600);
  })
  .catch(err => {
    showToast(err.message || 'Invalid email or password', 'error', 'Sign In Failed');
  });
}

function handleRegister(e) {
  e.preventDefault();
  const payload = {
    fullName: document.getElementById('regFullName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    password: document.getElementById('regPassword').value,
    zoneCode: document.getElementById('regZoneSelect').value
  };

  fetch(`${API_BASE}/auth/citizen/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json().catch(() => ({ message: 'Registration failed' }));
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  })
  .then(data => {
    const userSession = {
      email: data.email,
      fullName: data.fullName,
      role: 'ROLE_CITIZEN',
      zoneCode: data.zoneCode,
      token: data.token
    };

    localStorage.setItem('ghmc_user', JSON.stringify(userSession));
    localStorage.setItem('ghmc_jwt', data.token);

    showToast('Citizen Registration Successful! Redirecting to your dashboard...', 'success', 'Account Created');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 700);
  })
  .catch(err => {
    showToast(err.message || 'Unable to register account', 'error', 'Registration Error');
  });
}
