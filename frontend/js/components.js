/**
 * Reusable Components & UI Helpers (Navbar, Footer, Admin Sidebar, SweetAlert2, Real-time Validation)
 * PAW Final Project - Kelompok 5
 */

// ==========================================
// 1. SWEETALERT2 UNIFIED WRAPPER
// ==========================================

function ensureSweetAlert(callback) {
  if (typeof Swal !== 'undefined') {
    if (callback) callback();
    return true;
  }
  // If not yet loaded, dynamically inject CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
  script.onload = () => {
    if (callback) callback();
  };
  document.head.appendChild(script);
  return false;
}

function showSuccessAlert(title, text = '', timer = 2000) {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      timer: timer,
      showConfirmButton: timer <= 0,
      confirmButtonColor: '#4f46e5',
      timerProgressBar: timer > 0
    });
  }
  alert(`✅ ${title}\n${text}`);
  return Promise.resolve();
}

function showErrorAlert(title, text = '') {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#ef4444'
    });
  }
  alert(`❌ ${title}\n${text}`);
  return Promise.resolve();
}

function showConfirmDialog({ title, text, confirmButtonText = 'Ya, Lanjutkan', cancelButtonText = 'Batal', icon = 'warning' }) {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText,
      cancelButtonText
    });
  }
  const res = confirm(`${title}\n${text}`);
  return Promise.resolve({ isConfirmed: res });
}

function showPromptDialog({ title, text, inputPlaceholder = 'Tuliskan catatan...', inputValue = '', confirmButtonText = 'Simpan' }) {
  if (typeof Swal !== 'undefined') {
    return Swal.fire({
      title,
      text,
      input: 'textarea',
      inputPlaceholder,
      inputValue,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText,
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Catatan tidak boleh kosong!';
        }
      }
    });
  }
  const res = prompt(`${title}\n${text}`, inputValue);
  return Promise.resolve({ isConfirmed: Boolean(res), value: res });
}

// ==========================================
// 2. REAL-TIME FORM VALIDATION UI HELPER
// ==========================================

function validateField(inputEl, isValid, errorMsg, feedbackElId) {
  if (!inputEl) return isValid;

  let feedbackEl = feedbackElId ? document.getElementById(feedbackElId) : null;
  if (!feedbackEl) {
    feedbackEl = inputEl.parentNode.querySelector('.invalid-feedback-custom');
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.className = 'invalid-feedback-custom';
      inputEl.parentNode.appendChild(feedbackEl);
    }
  }

  if (isValid) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    if (feedbackEl) feedbackEl.style.display = 'none';
  } else {
    inputEl.classList.remove('is-valid');
    inputEl.classList.add('is-invalid');
    if (feedbackEl) {
      feedbackEl.innerHTML = `<i class="bi bi-exclamation-circle-fill me-1"></i> ${errorMsg}`;
      feedbackEl.style.display = 'flex';
    }
  }
  return isValid;
}

// ==========================================
// 3. UMY KRS ONLINE STYLE NAVBAR & COLLAPSIBLE SIDEBAR
// ==========================================

function toggleUmySidebar() {
  const isMobile = window.innerWidth < 992;
  if (isMobile) {
    document.body.classList.toggle('sidebar-mobile-open');
  } else {
    document.body.classList.toggle('sidebar-closed');
    const isClosed = document.body.classList.contains('sidebar-closed');
    localStorage.setItem('laf_sidebar_closed', isClosed ? 'true' : 'false');
  }
}

function renderNavbar(activePage = '') {
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const admin = isAdmin();
  const prefix = typeof getRootPrefix === 'function' ? getRootPrefix() : './';

  // Restore desktop sidebar closed state
  const isClosed = localStorage.getItem('laf_sidebar_closed') === 'true';
  if (isClosed && window.innerWidth >= 992) {
    document.body.classList.add('sidebar-closed');
  }

  const userName = user?.name || (admin ? 'Petugas Posko' : 'Mahasiswa UMY');
  const userNim = user?.nim || (admin ? 'Admin Posko' : '-');
  const userAvatar = (user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') ? user.avatar.trim() : null;
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : (admin ? 'AD' : 'U');

  const navHtml = `
    <!-- 1. TOP HEADER (KRS ONLINE STYLE) -->
    <header class="umy-header">
      <div class="umy-header-left">
        <!-- Hamburger Toggle Button (Buka/Tutup Sidebar Fleksibel) -->
        <button id="sidebar-toggle" onclick="toggleUmySidebar()" class="sidebar-hamburger-btn" title="Buka / Tutup Menu Navigasi">
          <i class="bi bi-list"></i>
        </button>

        <!-- Brand Logo & Campus Title -->
        <a href="${prefix}index.html" class="d-flex align-items-center gap-2 text-decoration-none">
          <div class="brand-icon" style="width: 32px; height: 32px; font-size: 1rem;">
                <i class="bi bi-compass-fill"></i>
          </div>
          <div class="fw-bold" style="font-size: 0.95rem; letter-spacing: -0.2px;">
            <span class="text-white">Lost & Found</span> <span style="color: #93c5fd; font-weight: 600; font-size: 0.82rem;">AI System</span>
          </div>
        </a>
      </div>

      <!-- Right Header Actions (User Identity & Profile KRS Style) -->
      <div class="d-flex align-items-center" style="gap: 12px;">
        ${authenticated ? `
          <!-- User Identity Badge (Nama Mahasiswa | NIM + Foto Profil dari Database) -->
          <div class="d-flex align-items-center" style="gap: 12px;">
            <span class="d-none d-sm-inline text-white" style="font-weight: 600; font-size: 0.92rem; letter-spacing: -0.2px;">
              ${userName} <span style="color: rgba(255, 255, 255, 0.45);">|</span> <span class="font-monospace" style="color: #93c5fd;">${userNim}</span>
            </span>
            ${userAvatar ? `
              <div class="rounded-circle overflow-hidden shadow-xs" style="width: 36px; height: 36px; min-width: 36px; border: 1.5px solid rgba(255, 255, 255, 0.35);">
                <img src="${userAvatar}" 
                     alt="${userName}" 
                     onerror="this.parentElement.outerHTML='<div class=\'rounded-circle bg-white text-primary d-flex align-items-center justify-content-center shadow-xs\' style=\'width: 36px; height: 36px; min-width: 36px; font-weight: 700; font-size: 0.82rem;\' title=\'${userName}\'>${userInitials}</div>';"
                     style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            ` : `
              <div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center shadow-xs" style="width: 36px; height: 36px; min-width: 36px; font-weight: 700; font-size: 0.82rem;" title="${userName}">
                ${userInitials}
              </div>
            `}
          </div>
        ` : `
          <div class="d-flex align-items-center gap-2">
            <a href="${prefix}auth/login.html" class="btn btn-sm btn-outline-light rounded-pill px-3.5 py-1.5 fw-semibold" style="font-size: 0.82rem;">Masuk</a>
            <a href="${prefix}auth/register.html" class="btn btn-sm btn-light text-primary rounded-pill px-3.5 py-1.5 fw-semibold" style="font-size: 0.82rem;">Daftar Akun</a>
          </div>
        `}
      </div>
    </header>

    <!-- 2. COLLAPSIBLE SIDEBAR NAVIGATION (KRS STYLE) -->
    <aside class="umy-sidebar" id="umy-sidebar">
      ${!admin ? `
        <!-- SIDEBAR MAHASISWA / CIVITAS -->
        <div class="umy-nav-heading">Menu Utama</div>
        <a href="${prefix}index.html" class="umy-nav-link ${activePage === 'home' ? 'active' : ''}">
          <i class="bi bi-house-door"></i>
          <span>Beranda</span>
        </a>
        ${authenticated ? `
          <a href="${prefix}user/dashboard.html" class="umy-nav-link ${activePage === 'user-dashboard' ? 'active' : ''}">
            <i class="bi bi-speedometer2 text-primary"></i>
            <span>Dashboard Saya</span>
          </a>
        ` : ''}
        <a href="${prefix}user/report-lost.html" class="umy-nav-link ${activePage === 'report-lost' ? 'active' : ''}">
          <i class="bi bi-plus-circle text-danger"></i>
          <span>Lapor Barang Hilang</span>
        </a>
        <a href="${prefix}user/matches.html" class="umy-nav-link ${activePage === 'matches' ? 'active' : ''}">
          <i class="bi bi-stars text-primary"></i>
          <span>Pencocokan AI Semantik</span>
        </a>
        <a href="${prefix}user/chatbot.html" class="umy-nav-link ${activePage === 'chatbot' ? 'active' : ''}">
          <i class="bi bi-robot text-info"></i>
          <span>Asisten AI Chatbot</span>
        </a>
        ${authenticated ? `
          <a href="${prefix}user/my-reports.html" class="umy-nav-link ${activePage === 'my-reports' ? 'active' : ''}">
            <i class="bi bi-card-checklist text-success"></i>
            <span>Laporan Saya & Klaim</span>
          </a>
        ` : ''}

        <div class="umy-nav-heading mt-2">Layanan & Pengaturan</div>
        <a href="javascript:void(0)" onclick="openTelegramModal()" class="umy-nav-link">
          <i class="bi bi-telegram text-info"></i>
          <span>Bot Notifikasi Telegram</span>
        </a>
        ${authenticated ? `
          <a href="javascript:void(0)" onclick="logout()" class="umy-nav-link text-danger">
            <i class="bi bi-box-arrow-right text-danger"></i>
            <span>Logout / Keluar</span>
          </a>
        ` : `
          <a href="${prefix}auth/login.html" class="umy-nav-link">
            <i class="bi bi-box-arrow-in-right text-primary"></i>
            <span>Masuk ke Akun</span>
          </a>
        `}
      ` : `
        <!-- SIDEBAR KHUSUS ADMIN POSKO -->
        <div class="umy-nav-heading">Panel Pengelolaan Posko</div>
        <a href="${prefix}admin/dashboard.html" class="umy-nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}">
          <i class="bi bi-graph-up-arrow text-primary"></i>
          <span>Dashboard & Analitik</span>
        </a>
        <a href="${prefix}admin/reports.html" class="umy-nav-link ${activePage === 'admin-reports' ? 'active' : ''}">
          <i class="bi bi-file-earmark-text-fill text-info"></i>
          <span>Kelola Laporan Hilang</span>
        </a>
        <a href="${prefix}admin/inventory.html" class="umy-nav-link ${activePage === 'admin-inventory' ? 'active' : ''}">
          <i class="bi bi-box-seam-fill text-success"></i>
          <span>Kelola Inventaris Posko</span>
        </a>
        <a href="${prefix}admin/inbox.html" class="umy-nav-link ${activePage === 'admin-inbox' ? 'active' : ''}">
          <i class="bi bi-patch-check-fill text-warning"></i>
          <span>Validasi AI & Inbox</span>
        </a>
        <a href="${prefix}admin/users.html" class="umy-nav-link ${activePage === 'admin-users' ? 'active' : ''}">
          <i class="bi bi-people-fill text-purple"></i>
          <span>Kelola Civitas (Users)</span>
        </a>
        <a href="${prefix}admin/broadcast.html" class="umy-nav-link ${activePage === 'admin-broadcast' ? 'active' : ''}">
          <i class="bi bi-telegram text-info"></i>
          <span>Broadcast Telegram</span>
        </a>

        <div class="umy-nav-heading mt-2">Aksi Posko</div>
        <a href="${prefix}user/report-found.html" class="umy-nav-link ${activePage === 'report-found' ? 'active' : ''}">
          <i class="bi bi-plus-circle-fill text-success"></i>
          <span>Catat Temuan Posko</span>
        </a>
        <a href="javascript:void(0)" onclick="logout()" class="umy-nav-link text-danger">
          <i class="bi bi-box-arrow-right text-danger"></i>
          <span>Logout / Keluar</span>
        </a>
      `}
    </aside>

    <!-- 3. BACKDROP OVERLAY FOR MOBILE -->
    <div class="umy-backdrop" id="umy-backdrop" onclick="toggleUmySidebar()"></div>
  `;

  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    navContainer.innerHTML = navHtml;
  }
}

// ==========================================
// 4. FOOTER & MODAL TELEGRAM LOGS
// ==========================================

function renderFooter() {
  const footerHtml = `
    <footer class="bg-white border-top py-5 mt-auto umy-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-6">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="brand-icon" style="width: 32px; height: 32px; font-size: 1rem;">
                <i class="bi bi-compass-fill"></i>
              </div>
              <span class="fw-bold text-dark">Lost & Found AI System</span>
            </div>
            <p class="text-muted small mb-3" style="max-width: 480px; line-height: 1.6;">
              Sistem pelaporan dan pencarian barang hilang berbasis pencocokan semantik cerdas (AI Semantic Engine) dan notifikasi bot Telegram instan untuk civitas akademika Universitas Muhammadiyah Yogyakarta.
            </p>
            <div class="d-flex gap-3 small fw-bold text-primary">
              <span><i class="bi bi-stars"></i> Semantic Text Matching</span>
              <span><i class="bi bi-robot"></i> Chatbot Pelaporan</span>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <h6 class="fw-bold text-uppercase small text-dark mb-3">Tim Pengembang (Kelompok 5)</h6>
            <ul class="list-unstyled text-muted small lh-lg mb-0">
              <li>• Zaky Rizqi Hasanain (20240140109)</li>
              <li>• Muh Husen Nabil R (20240140223)</li>
              <li>• Masayu Eqfalarissa (20240140134)</li>
              <li>• Lailansyahda Azalia (20240140182)</li>
              <li>• Ayuningtyas Dyah Septiani (20240140191)</li>
            </ul>
          </div>
          <div class="col-lg-3 col-6">
            <h6 class="fw-bold text-uppercase small text-dark mb-3">Akses Cepat</h6>
            <ul class="list-unstyled small lh-lg mb-0">
              <li><a href="report-lost.html" class="text-decoration-none text-muted">Lapor Kehilangan</a></li>
              <li><a href="report-found.html" class="text-decoration-none text-muted">Lapor Penemuan</a></li>
              <li><a href="matches.html" class="text-decoration-none text-muted">Pencocokan AI</a></li>
              <li><a href="chatbot.html" class="text-decoration-none text-muted">AI Chatbot</a></li>
              <li><a href="login.html" class="text-decoration-none text-muted">Masuk Akun</a></li>
            </ul>
          </div>
        </div>
        <div class="border-top pt-3 mt-3 text-center small text-muted">
          <div>&copy; 2026 Lost & Found AI System • Tugas Akhir Pengembangan Aplikasi Web (Kelompok 5)</div>
        </div>
      </div>
    </footer>
  `;

  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerHtml;
  }
}

function showTelegramLiveToast(recipient, message) {
  let toastEl = document.getElementById('live-telegram-toast');
  if (!toastEl) {
    const toastWrapper = document.createElement('div');
    toastWrapper.className = 'position-fixed bottom-0 end-0 p-3';
    toastWrapper.style.zIndex = '1090';
    toastWrapper.innerHTML = `
      <div id="live-telegram-toast" class="toast telegram-toast show shadow-lg border-0" role="alert">
        <div class="toast-header bg-primary text-white border-0 py-2">
          <i class="bi bi-telegram me-2 fs-5 text-info"></i>
          <strong class="me-auto" style="font-size: 0.85rem;">Telegram Bot Alert</strong>
          <small class="text-white-50">Baru saja</small>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body bg-white text-dark p-3">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-primary-subtle text-primary font-monospace" id="toast-recipient">@username</span>
            <span class="badge bg-success-subtle text-success">Terkirim</span>
          </div>
          <div class="small text-secondary lh-base" id="toast-body-text">
            Pesan notifikasi berhasil dikirim.
          </div>
          <div class="mt-2 text-end" id="toast-direct-link"></div>
        </div>
      </div>
    `;
    document.body.appendChild(toastWrapper);
    toastEl = document.getElementById('live-telegram-toast');
  }

  const cleanRecipient = (recipient || '@pelapor').replace('@', '');
  document.getElementById('toast-recipient').textContent = `@${cleanRecipient}`;
  document.getElementById('toast-body-text').innerHTML = (message || '').replace(/\n/g, '<br>');

  const linkContainer = document.getElementById('toast-direct-link');
  if (linkContainer) {
    linkContainer.innerHTML = `<a href="https://t.me/${cleanRecipient}" target="_blank" class="btn btn-xs btn-outline-info rounded-pill px-2 py-1 small" style="font-size: 0.75rem;"><i class="bi bi-box-arrow-up-right me-1"></i> Buka di Telegram</a>`;
  }

  const bsToast = new bootstrap.Toast(toastEl, { delay: 8000 });
  bsToast.show();
}

async function openTelegramModal() {
  let modalContainer = document.getElementById('telegram-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade" id="telegramHistoryModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header bg-dark text-white border-0 py-3">
            <div class="d-flex align-items-center gap-2">
              <div class="brand-icon" style="width: 32px; height: 32px; font-size: 1rem; background: #0284c7;">
                <i class="bi bi-telegram"></i>
              </div>
              <h6 class="modal-title fw-bold">Riwayat Log Notifikasi Bot Telegram (FR-3)</h6>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <p class="text-muted small mb-3">
              Log pengiriman pesan otomatis saat AI mendeteksi kecocokan dan broadcast manual dari Admin Posko Keamanan ke civitas kampus.
            </p>
            <div class="d-flex flex-column gap-2" id="telegram-logs-list">
              <div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary"></div> Memuat log...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const myModal = new bootstrap.Modal(document.getElementById('telegramHistoryModal'));
  myModal.show();

  try {
    const res = await api.getTelegramLogs();
    const listContainer = document.getElementById('telegram-logs-list');
    const logs = res?.data || [];

    if (logs.length === 0) {
      listContainer.innerHTML = '<div class="text-center py-4 text-muted">Belum ada riwayat pesan terkirim.</div>';
      return;
    }

    listContainer.innerHTML = logs.map(l => {
      const cleanUser = (l.recipient || '').replace('@', '');
      return `
        <div class="card p-3 border shadow-sm rounded-3 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary-subtle text-primary font-monospace">${l.recipient}</span>
              ${cleanUser ? `<a href="https://t.me/${cleanUser}" target="_blank" class="small text-info text-decoration-none"><i class="bi bi-box-arrow-up-right"></i> Chat</a>` : ''}
            </div>
            <small class="text-muted" style="font-size: 0.75rem;">${l.timestamp ? l.timestamp.split('T')[0] : 'Hari ini'}</small>
          </div>
          <div class="small text-dark font-monospace mb-1 fw-bold">${l.type}</div>
          <div class="small text-secondary bg-light p-2 rounded">${l.message.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Gagal mengambil logs telegram:', e);
  }
}
