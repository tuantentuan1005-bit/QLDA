// dashboard.service.js - Các hàm gọi API Dashboard & Thống kê (HCP-38)
import api from './api';

export const getDashboardStatsApi = async (params = {}) => {
  const res = await api.get('/dashboard/stats', { params });
  return res.data;
};

export const exportRequestsCsvApi = async (params = {}) => {
  const res = await api.get('/dashboard/export-csv', {
    params,
    responseType: 'blob', // Nhận file dạng blob để tải về
  });
  return res.data;
};
