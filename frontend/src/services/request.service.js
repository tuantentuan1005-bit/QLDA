// request.service.js - Các hàm gọi API yêu cầu dịch vụ (HCP-31..34)
import api from './api';

export const getCategoriesApi = async () => {
  const res = await api.get('/requests/categories');
  return res.data;
};

export const getStaffListApi = async () => {
  const res = await api.get('/requests/staff-list');
  return res.data;
};

export const createRequestApi = async (data) => {
  const res = await api.post('/requests', data);
  return res.data;
};

export const getRequestsApi = async (params = {}) => {
  const res = await api.get('/requests', { params });
  return res.data;
};

export const getRequestByIdApi = async (id) => {
  const res = await api.get(`/requests/${id}`);
  return res.data;
};

export const assignRequestApi = async (id, staffId) => {
  const res = await api.patch(`/requests/${id}/assign`, { staff_id: staffId });
  return res.data;
};

export const updateRequestStatusApi = async (id, status) => {
  const res = await api.patch(`/requests/${id}/status`, { status });
  return res.data;
};
