const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_BASE = `${BASE_URL}/api/v1`;

const apiFetch = async (endpoint, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export default apiFetch;
