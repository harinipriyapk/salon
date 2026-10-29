const API_BASE = import.meta.env.VITE_API_URL || 'https://salon-backend-t79s.onrender.com/api';

export function getAuthToken() {
  return localStorage.getItem('vv_token') || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('vv_token', token);
  } else {
    localStorage.removeItem('vv_token');
  }
}

export function getStoredUser() {
  const data = localStorage.getItem('vv_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('vv_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vv_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr) {
    console.error(`API Network Failure [${endpoint}]:`, netErr);
    const err = new Error(
      netErr.message?.includes('fetch')
        ? 'Cannot connect to backend server. Please ensure http://localhost:5000 is running.'
        : netErr.message || 'Network request failed'
    );
    err.original = netErr;
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// API Methods
export const api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),

  // Services
  getServices: () => apiRequest('/services'),
  getAllServicesAdmin: () => apiRequest('/services/all'),
  createService: (data) => apiRequest('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => apiRequest(`/services/${id}`, { method: 'DELETE' }),

  // Bookings
  getAvailability: (date) => apiRequest(`/bookings/availability?date=${date}`),
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/bookings${query ? `?${query}` : ''}`);
  },
  getBookingById: (id) => apiRequest(`/bookings/${id}`),
  createBooking: (data) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id, data) => apiRequest(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelBooking: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' }),
  sendFeedbackReminder: (id) => apiRequest(`/bookings/${id}/send-reminder`, { method: 'POST' }),
  sendMessageToClient: (id, data) => apiRequest(`/bookings/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  markMessagesRead: (id) => apiRequest(`/bookings/${id}/messages/read`, { method: 'PUT' }),
  getBookingMessages: (id) => apiRequest(`/bookings/${id}/messages`),

  // Feedback
  getPublicFeedback: () => apiRequest('/feedback'),
  getEligibleBookings: () => apiRequest('/feedback/eligible'),
  getFeedbackAnalytics: () => apiRequest('/feedback/analytics'),
  getAdminFeedback: () => apiRequest('/feedback/admin'),
  submitFeedback: (data) => apiRequest('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  moderateFeedback: (id, approved) => apiRequest(`/feedback/${id}/moderate`, { method: 'PUT', body: JSON.stringify({ approved }) }),
  deleteFeedback: (id) => apiRequest(`/feedback/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  sendTestNotification: (data) => apiRequest('/notifications/test', { method: 'POST', body: JSON.stringify(data) }),
};

