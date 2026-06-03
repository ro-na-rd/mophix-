// API Service - Fetch wrapper (no axios to avoid webpack Node polyfill issues)

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function buildHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : null),
    ...extraHeaders,
  };
}

async function request(path, { method = 'GET', params, body, headers } = {}) {
  let url = API_URL.replace(/\/$/, '') + path;

  if (params && typeof params === 'object') {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      sp.append(k, String(v));
    });
    url += `?${sp.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers: buildHeaders(headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    // keep behavior similar to axios interceptor
    throw new Error('Unauthorized');
  }

  // Some endpoints may return empty body
  const text = await res.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const message = data?.message || data?.error || data?.errors?.[0]?.msg || res.statusText;
    throw new Error(message);
  }

  // Match axios previous behavior: resolve to response.data
  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function upload(path, formData) {
  let url = API_URL.replace(/\/$/, '') + path;

  const token = getToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    credentials: 'include',
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const text = await res.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const message = data?.message || data?.error || data?.errors?.[0]?.msg || res.statusText;
    throw new Error(message);
  }

  return data;
}

// ============ AUTH SERVICES ============

export const authService = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getCurrentUser: () => request('/auth/me', { method: 'GET' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  requestPasswordReset: (email) => request('/auth/request-password-reset', { method: 'POST', body: { email } }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),
};

// ============ SERVICES SERVICES ============

export const servicesService = {
  getAll: (params) => request('/services', { method: 'GET', params }),
  getById: (id) => request(`/services/${id}`, { method: 'GET' }),
  create: (data) => request('/services', { method: 'POST', body: data }),
  update: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
};

// ============ GALLERIES SERVICES ============

export const galleriesService = {
  getAll: (params) => request('/galleries', { method: 'GET', params }),
  getById: (id) => request(`/galleries/${id}`, { method: 'GET' }),
  create: (data) => request('/galleries', { method: 'POST', body: data }),
  update: (id, data) => request(`/galleries/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/galleries/${id}`, { method: 'DELETE' }),
  getPhotos: (galleryId, params) => request(`/galleries/${galleryId}/photos`, { method: 'GET', params }),
  uploadPhoto: (galleryId, formData) => upload(`/galleries/${galleryId}/photos`, formData),
  updatePhoto: (photoId, data) => request(`/galleries/photos/${photoId}`, { method: 'PUT', body: data }),
  deletePhoto: (photoId) => request(`/galleries/photos/${photoId}`, { method: 'DELETE' }),
};

// ============ BOOKINGS SERVICES ============

export const bookingsService = {
  getAll: (params) => request('/bookings', { method: 'GET', params }),
  getById: (id) => request(`/bookings/${id}`, { method: 'GET' }),
  create: (data) => request('/bookings', { method: 'POST', body: data }),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  updateStatus: (id, status, notes) => request(`/bookings/${id}/status`, { method: 'PATCH', body: { status, notes } }),
  updatePaymentStatus: (id, payment_status) => request(`/bookings/${id}/payment`, { method: 'PATCH', body: { payment_status } }),
  uploadCompletedFile: (id, formData) => upload(`/bookings/${id}/completed-file`, formData),
  pay: (id, { mobile_number } = {}) => request(`/bookings/${id}/pay`, { method: 'PATCH', body: { mobile_number } }),
  delete: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  getCalendar: (month, year) => request(`/bookings/calendar/${month}/${year}`, { method: 'GET' }),
};

// ============ TESTIMONIALS SERVICES ============

export const testimonialsService = {
  getAll: (params) => request('/testimonials', { method: 'GET', params }),
  getAverageRating: () => request('/testimonials/rating/average', { method: 'GET' }),
  create: (data) => request('/testimonials', { method: 'POST', body: data }),
  getPending: (params) => request('/testimonials/pending', { method: 'GET', params }),
  approve: (id, data) => request(`/testimonials/${id}/approve`, { method: 'POST', body: data }),
  reject: (id) => request(`/testimonials/${id}/reject`, { method: 'POST' }),
};

// ============ CONTACT SERVICES ============

export const contactService = {
  submit: (data) => request('/contact', { method: 'POST', body: data }),
  getAll: (params) => request('/contact', { method: 'GET', params }),
  getById: (id) => request(`/contact/${id}`, { method: 'GET' }),
  updateStatus: (id, status) => request(`/contact/${id}/status`, { method: 'PATCH', body: { status } }),
  respond: (id, response_message) => request(`/contact/${id}/respond`, { method: 'POST', body: { response_message } }),
  getStats: () => request('/contact/stats', { method: 'GET' }),
};

// ============ BLOG SERVICES ============

export const blogService = {
  getPosts: (params) => request('/blog', { method: 'GET', params }),
  getCategories: () => request('/blog/categories', { method: 'GET' }),
  getPostBySlug: (slug) => request(`/blog/post/${slug}`, { method: 'GET' }),
  create: (data) => request('/blog', { method: 'POST', body: data }),
  update: (id, data) => request(`/blog/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/blog/${id}`, { method: 'DELETE' }),
  getDrafts: (params) => request('/blog/drafts', { method: 'GET', params }),
  createCategory: (data) => request('/blog/categories', { method: 'POST', body: data }),
};

// ============ USERS SERVICES ============

export const usersService = {
  getAll: (params) => request('/users', { method: 'GET', params }),
  getById: (id) => request(`/users/${id}`, { method: 'GET' }),
  updateProfile: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  updateRole: (id, role) => request(`/users/${id}/role`, { method: 'PUT', body: { role } }),
  toggleActive: (id) => request(`/users/${id}/toggle-active`, { method: 'PATCH' }),
};

// ============ DASHBOARD SERVICES ============

export const dashboardService = {
  getStats: () => request('/dashboard/stats', { method: 'GET' }),
  getBookingAnalytics: (params) => request('/dashboard/bookings/analytics', { method: 'GET', params }),
  getRevenueReport: (params) => request('/dashboard/revenue/report', { method: 'GET', params }),
};

// default export for backward compatibility (some code may import api default)
const api = {
  request,
  upload,
  get baseURL() {
    return API_URL;
  },
};

export default api;

