const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('gt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  updateProfile: (id, data) => request(`/auth/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Cities
  getCities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cities?${query}`);
  },
  getCityById: (id) => request(`/cities/${id}`),
  addCustomCity: (data) => request('/cities/add-custom', { method: 'POST', body: JSON.stringify(data) }),
  toggleFavoriteCity: (userId, cityId) => request('/cities/favorite', { method: 'POST', body: JSON.stringify({ userId, cityId }) }),
  getFavoriteCities: (userId) => request(`/cities/favorites/${userId}`),

  // Activities
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activities?${query}`);
  },
  createActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),

  // Trips
  getUserTrips: (userId) => request(`/trips/user/${userId}`),
  getTripById: (id) => request(`/trips/${id}`),
  getSharedTrip: (slug) => request(`/trips/share/${slug}`),
  createTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id, data) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  copyTrip: (userId, tripId) => request('/trips/copy', { method: 'POST', body: JSON.stringify({ userId, tripId }) }),

  // Stops & Activities
  addStop: (tripId, data) => request(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(data) }),
  updateStop: (stopId, data) => request(`/trips/stops/${stopId}`, { method: 'PUT', body: JSON.stringify(data) }),
  reorderStops: (tripId, stopIds) => request(`/trips/${tripId}/reorder-stops`, { method: 'POST', body: JSON.stringify({ stop_ids: stopIds }) }),
  deleteStop: (stopId) => request(`/trips/stops/${stopId}`, { method: 'DELETE' }),
  addActivityToStop: (stopId, data) => request(`/trips/stops/${stopId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  deleteStopActivity: (saId) => request(`/trips/stop-activities/${saId}`, { method: 'DELETE' }),

  // Budget
  getBudgetAnalytics: (tripId) => request(`/budget/${tripId}`),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // AI Assistant
  generateAiTrip: (data) => request('/ai/generate-trip', { method: 'POST', body: JSON.stringify(data) }),
};
