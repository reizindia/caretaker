import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production');
}

function getStoredToken() {
  if (typeof window === 'undefined') return null;

  try {
    const auth = localStorage.getItem('caretaker-auth');
    if (!auth) return null;
    return JSON.parse(auth)?.state?.token || null;
  } catch {
    return null;
  }
}

function getStoredUserRole() {
  if (typeof window === 'undefined') return null;

  try {
    const auth = localStorage.getItem('caretaker-auth');
    if (!auth) return null;
    return JSON.parse(auth)?.state?.user?.role || null;
  } catch {
    return null;
  }
}

function getSelectedAdminFlatSlug() {
  if (typeof window === 'undefined') return '';

  try {
    const stored = localStorage.getItem('caretaker-admin-flat');
    if (!stored) return '';
    return JSON.parse(stored)?.state?.selectedFlat?.slug || '';
  } catch {
    return '';
  }
}

const apiClient = axios.create({
  baseURL: apiBaseUrl || 'http://localhost:3005/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token and tenant slug
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    const hasTenantHeader = Boolean(config.headers?.['X-Tenant-Slug']);
    if (!hasTenantHeader) {
      const isSuperAdmin = getStoredUserRole() === 'SUPER_ADMIN';
      const slug = isSuperAdmin
        ? getSelectedAdminFlatSlug()
        : document.cookie.match(/tenant-slug=([^;]+)/)?.[1] ||
          new URLSearchParams(window.location.search).get('tenant') || '';

      if (slug) config.headers['X-Tenant-Slug'] = slug;
    }
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('caretaker-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
