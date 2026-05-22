import axios from 'axios';

export const experienceApi = axios.create({
  baseURL: 'http://localhost:5225/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT token (mostly for admin operations)
experienceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
