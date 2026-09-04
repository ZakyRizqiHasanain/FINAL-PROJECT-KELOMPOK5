/**
 * API Service Client (Vanilla JavaScript)
 * Terhubung ke Express Backend (http://localhost:3000/api)
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('laf_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    // Jika server merespons 401 Unauthorized (token tidak valid / sesi habis), auto redirect
    if (res.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      console.warn('[API 401]: Sesi login tidak valid. Mengarahkan ke halaman login.');
      localStorage.removeItem('laf_token');
      localStorage.removeItem('laf_user');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const prefix = typeof getRootPrefix === 'function' ? getRootPrefix() : './';
      if (currentPage !== 'login.html' && currentPage !== 'register.html') {
        window.location.replace(`${prefix}auth/login.html?redirect=${encodeURIComponent(currentPage)}`);
      }
    }

    return json;
  } catch (error) {
    console.warn(`[API Network Warning] ${endpoint}:`, error.message);
    return {
      code: 500,
      success: false,
      message: 'Gagal terhubung ke server backend Express.',
      data: null
    };
  }
}

const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),

  // Lost Reports
  getLostReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lost-reports${query ? `?${query}` : ''}`);
  },
  getLostReportById: (id) => request(`/lost-reports/${id}`),
  createLostReport: (reportData) => request('/lost-reports', { method: 'POST', body: JSON.stringify(reportData) }),

  // Found Items
  getFoundItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/found-items${query ? `?${query}` : ''}`);
  },
  getFoundItemById: (id) => request(`/found-items/${id}`),
  createFoundItem: (itemData) => request('/found-items', { method: 'POST', body: JSON.stringify(itemData) }),

  // AI Matching & Chatbot
  calculateMatches: (queryData) => request('/ai/match', { method: 'POST', body: JSON.stringify(queryData) }),
  sendChatbotMessage: (payload) => request('/ai/chatbot', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin Management Suite
  getAdminStats: () => request('/admin/stats'),
  validateMatch: (payload) => request('/admin/validate-match', { method: 'POST', body: JSON.stringify(payload) }),
  completeClaim: (payload) => request('/admin/complete-claim', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Admin User Management - FULL CRUD
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateAdminUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  // Admin Reports Management - FULL CRUD
  createAdminLostReport: (reportData) => request('/admin/lost-reports', { method: 'POST', body: JSON.stringify(reportData) }),
  updateLostReport: (id, data) => request(`/admin/lost-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLostReport: (id) => request(`/admin/lost-reports/${id}`, { method: 'DELETE' }),

  // Admin Inventory Management - FULL CRUD
  createAdminFoundItem: (itemData) => request('/admin/found-items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateFoundItem: (id, data) => request(`/admin/found-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFoundItem: (id) => request(`/admin/found-items/${id}`, { method: 'DELETE' }),

  // Telegram
  getTelegramLogs: () => request('/admin/telegram-logs'),
  sendTelegramBroadcast: (payload) => request('/telegram/broadcast', { method: 'POST', body: JSON.stringify(payload) })
};
