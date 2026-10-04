// feedback.service.js - Các hàm gọi API Góp ý & Khiếu nại (HCP-35, 36)
import api from './api';

export const createFeedbackApi = async (data) => {
  const res = await api.post('/feedbacks', data);
  return res.data; // { message, ref_code, feedback }
};

export const getFeedbacksApi = async (params = {}) => {
  const res = await api.get('/feedbacks', { params });
  return res.data; // { data: [...feedbacks], pagination: {...} }
};

export const respondFeedbackApi = async (id, responseText) => {
  const res = await api.patch(`/feedbacks/${id}/respond`, { response: responseText });
  return res.data;
};
