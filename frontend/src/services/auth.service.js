// auth.service.js - Các hàm gọi API xác thực
// HCP-29: login, logout, getMe

import api from './api';

/**
 * Đăng nhập bằng email + mật khẩu.
 * @returns {{ user, token }} — thông tin user và JWT token
 */
export const loginApi = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { message, user, token }
};

/**
 * Lấy thông tin user hiện tại từ token.
 * Dùng khi reload trang để kiểm tra token còn hợp lệ không.
 */
export const getMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data.user;
};
