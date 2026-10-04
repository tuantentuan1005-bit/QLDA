// api.js - Cấu hình axios client để gọi Backend API
// Tự động gắn token vào header và xử lý lỗi 401

import axios from 'axios';

// Lấy URL API từ biến môi trường Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== INTERCEPTOR: Gắn token vào mỗi request =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== INTERCEPTOR: Xử lý lỗi 401 (hết hạn token) =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token cũ và chuyển về trang đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
