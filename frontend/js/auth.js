/**
 * Auth & Session Guard Helper (Pure Vanilla JavaScript)
 * Menangani pengecekan sesi login instan, redirect, dan role guard.
 */

function getRootPrefix() {
  const path = window.location.pathname.replace(/\\/g, '/');
  if (path.includes('/admin/') || path.includes('/user/') || path.includes('/auth/')) {
    return '../';
  }
  return './';
}

function getCurrentUser() {
  const userJson = localStorage.getItem('laf_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('laf_token') || '';
}

function isAuthenticated() {
  const user = getCurrentUser();
  const token = getToken();
  return Boolean(user && token);
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Pengecekan otorisasi instan (dijalankan sebelum render halaman)
 */
function requireAuth(adminOnly = false) {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();
  const prefix = getRootPrefix();

  // 1. Jika belum login sama sekali -> Lempar ke auth/login.html
  if (!isAuth || !user) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'login.html' && currentPath !== 'register.html') {
      window.location.replace(`${prefix}auth/login.html?redirect=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    return false;
  }

  // 2. Jika butuh role Admin tapi user saat ini bukan Admin -> Lempar ke user dashboard
  if (adminOnly && user.role !== 'admin') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak (403 Forbidden)',
        text: 'Halaman ini dikhususkan untuk Petugas Posko Keamanan (Admin).',
        confirmButtonColor: '#3b82f6'
      }).then(() => {
        window.location.replace(`${prefix}user/dashboard.html`);
      });
    } else {
      alert('Akses Ditolak: Halaman ini dikhususkan untuk Petugas Posko Keamanan (Admin).');
      window.location.replace(`${prefix}user/dashboard.html`);
    }
    return false;
  }

  return true;
}

async function logout() {
  const prefix = getRootPrefix();
  if (typeof showConfirmDialog !== 'undefined') {
    const confirm = await showConfirmDialog({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari sistem?',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });
    if (confirm.isConfirmed) {
      localStorage.removeItem('laf_token');
      localStorage.removeItem('laf_user');
      window.location.replace(`${prefix}auth/login.html`);
    }
  } else {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      localStorage.removeItem('laf_token');
      localStorage.removeItem('laf_user');
      window.location.replace(`${prefix}auth/login.html`);
    }
  }
}

