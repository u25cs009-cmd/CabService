const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'pipippip_admin_token';

async function fetchWithAuth(endpoint, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    sessionStorage.clear();
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized session expired');
  }

  return response;
}

export const adminApi = {
  // Stats
  getStats: async () => {
    const res = await fetchWithAuth('/admin/stats');
    return res.json();
  },

  // Bookings
  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithAuth(`/admin/bookings?${query}`);
    return res.json();
  },

  updateBooking: async (id, data) => {
    const res = await fetchWithAuth(`/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  exportBookingsUrl: (params = {}) => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const query = new URLSearchParams({ ...params, token }).toString();
    return `${API_BASE_URL}/admin/bookings/export?${query}`;
  },

  // Vehicles
  getVehicles: async () => {
    const res = await fetchWithAuth('/admin/vehicles');
    return res.json();
  },

  createVehicle: async (data) => {
    const res = await fetchWithAuth('/admin/vehicles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateVehicle: async (id, data) => {
    const res = await fetchWithAuth(`/admin/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Drivers
  getDrivers: async () => {
    const res = await fetchWithAuth('/admin/drivers');
    return res.json();
  },

  createDriver: async (data) => {
    const res = await fetchWithAuth('/admin/drivers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateDriver: async (id, data) => {
    const res = await fetchWithAuth(`/admin/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
