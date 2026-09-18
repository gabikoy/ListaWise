// Centralized API Client for ListaWise

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('lw_auth_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    // If unauthorized, clear token and notify session listeners
    localStorage.removeItem('lw_auth_token');
    localStorage.removeItem('lw_auth_user');
    window.dispatchEvent(new CustomEvent('lw-unauthorized'));
  }

  const contentType = res.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
    data = await res.blob();
    return data;
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : 'Request failed.');
    throw new ApiError(errorMsg, res.status, data);
  }

  return data;
}

export const api = {
  async get(endpoint, params = {}) {
    const url = new URL(API_BASE + endpoint, window.location.origin);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async post(endpoint, body = {}) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(endpoint, body = {}) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getExportUrl() {
    const token = localStorage.getItem('lw_auth_token');
    return `${API_BASE}/export?token=${encodeURIComponent(token || '')}`;
  },
};
