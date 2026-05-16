import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token and tenant slug
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('caretaker_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    const slug = document.cookie.match(/tenant-slug=([^;]+)/)?.[1] ||
                 new URLSearchParams(window.location.search).get('tenant') || '';
    if (slug) config.headers['X-Tenant-Slug'] = slug;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('caretaker_token');
      localStorage.removeItem('caretaker_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
