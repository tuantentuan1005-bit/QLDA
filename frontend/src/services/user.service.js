// user.service.js - Các hàm gọi API quản lý tài khoản người dùng (HCP-30)
import api from './api';

export const getUsersApi = async (params = {}) => {
  const res = await api.get('/users', { params });
  return res.data; // { data: [...users], pagination: {...} }
};

export const createUserApi = async (userData) => {
  const res = await api.post('/users', userData);
  return res.data;
};

export const updateUserApi = async (id, userData) => {
  const res = await api.put(`/users/${id}`, userData);
  return res.data;
};

export const toggleUserStatusApi = async (id) => {
  const res = await api.patch(`/users/${id}/toggle-status`);
  return res.data;
};
