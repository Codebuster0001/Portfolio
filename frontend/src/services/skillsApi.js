import axios from 'axios';

// ============================================================
// Axios instance — points to existing ASP.NET Core backend
// ============================================================
const api = axios.create({
  baseURL: 'http://localhost:5225/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// SKILL CATEGORIES API
// ============================================================
export const skillCategoriesApi = {
  /** GET /api/skillcategories — all categories with nested skills */
  getAll: () => api.get('/skillcategories'),

  /** GET /api/skillcategories/:id */
  getById: (id) => api.get(`/skillcategories/${id}`),

  /** POST /api/skillcategories (admin) */
  create: (data) => api.post('/skillcategories', data),

  /** PUT /api/skillcategories/:id (admin) */
  update: (id, data) => api.put(`/skillcategories/${id}`, data),

  /** DELETE /api/skillcategories/:id (admin) */
  delete: (id) => api.delete(`/skillcategories/${id}`),

  /** PUT /api/skillcategories/reorder — drag-and-drop sort (admin) */
  reorder: (items) => api.put('/skillcategories/reorder', items),
};

// ============================================================
// SKILLS API
// ============================================================
export const skillsApi = {
  /**
   * GET /api/skills?search=&categoryId=&page=&pageSize=
   * Returns paginated skills with optional search + filter.
   */
  getAll: (params = {}) => api.get('/skills', { params }),

  /** GET /api/skills/category/:categoryId */
  getByCategory: (categoryId) => api.get(`/skills/category/${categoryId}`),

  /** GET /api/skills/:id */
  getById: (id) => api.get(`/skills/${id}`),

  /** POST /api/skills (admin) */
  create: (data) => api.post('/skills', data),

  /** PUT /api/skills/:id (admin) */
  update: (id, data) => api.put(`/skills/${id}`, data),

  /** DELETE /api/skills/:id (admin) */
  delete: (id) => api.delete(`/skills/${id}`),

  /** PUT /api/skills/reorder — drag-and-drop sort (admin) */
  reorder: (items) => api.put('/skills/reorder', items),
};

export default api;
