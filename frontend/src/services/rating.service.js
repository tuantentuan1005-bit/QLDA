// rating.service.js - Các hàm gọi API Đánh giá dịch vụ (HCP-37)
import api from './api';

export const createRatingApi = async (data) => {
  const res = await api.post('/ratings', data);
  return res.data;
};
