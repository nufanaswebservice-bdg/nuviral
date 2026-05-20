import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
};

// AI API
export const aiApi = {
  generateScript: (data: any) => api.post('/ai/generate/script', data),
  generateHook: (data: any) => api.post('/ai/generate/hook', data),
  generateCaption: (data: any) => api.post('/ai/generate/caption', data),
  generateHashtags: (data: any) => api.post('/ai/generate/hashtags', data),
  predictViralScore: (data: any) => api.post('/ai/predict/viral-score', data),
  rewriteContent: (data: any) => api.post('/ai/rewrite', data),
  getJobs: (page?: number) => api.get('/ai/jobs', { params: { page } }),
};

// Videos API
export const videosApi = {
  create: (data: any) => api.post('/videos', data),
  getAll: (page?: number) => api.get('/videos', { params: { page } }),
  getById: (id: string) => api.get(`/videos/${id}`),
  delete: (id: string) => api.delete(`/videos/${id}`),
  getProgress: (id: string) => api.get(`/videos/${id}/progress`),
  batchRender: (videoIds: string[]) => api.post('/videos/batch-render', { videoIds }),
};

// Upload API
export const uploadApi = {
  schedule: (data: any) => api.post('/uploads/schedule', data),
  getQueue: (page?: number) => api.get('/uploads/queue', { params: { page } }),
  cancel: (id: string) => api.put(`/uploads/${id}/cancel`),
  retry: (id: string) => api.post(`/uploads/${id}/retry`),
  bulk: (data: any) => api.post('/uploads/bulk', data),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPlatform: (platform?: string) => api.get('/analytics/platform', { params: { platform } }),
  getVideo: (id: string) => api.get(`/analytics/video/${id}`),
  getGrowth: (days?: number) => api.get('/analytics/growth', { params: { days } }),
  getBestTimes: () => api.get('/analytics/best-times'),
};

// Trends API
export const trendsApi = {
  analyze: (platform: string, niche?: string) => api.get('/trends/analyze', { params: { platform, niche } }),
  getHashtags: (platform: string) => api.get('/trends/hashtags', { params: { platform } }),
  analyzeCompetitor: (data: { username: string; platform: string }) => api.post('/trends/competitor', data),
};

// Projects API
export const projectsApi = {
  create: (data: any) => api.post('/projects', data),
  getAll: (page?: number) => api.get('/projects', { params: { page } }),
  getById: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Social Accounts API
export const socialApi = {
  connect: (data: any) => api.post('/social-accounts/connect', data),
  getAll: () => api.get('/social-accounts'),
  disconnect: (id: string) => api.delete(`/social-accounts/${id}`),
};

// Subscription API
export const subscriptionApi = {
  getCurrent: () => api.get('/subscription/current'),
  checkout: (plan: string) => api.post('/subscription/checkout', { plan }),
};
