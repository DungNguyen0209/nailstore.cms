// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js';
import { config } from '@/helpers/config.js';


const api = axios.create({
  baseURL: config.baseURL,
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
    config.params = {
        ...config.params,
        'culture': 'vi',
        'ui-culture': 'vi-VN',
    }
    return config
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authStore.getRefreshToken();
        if (authStore.isTokenValid) {
          originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;