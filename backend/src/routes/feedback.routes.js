// feedback.routes.js - Tuyến đường cho Góp ý & Khiếu nại (HCP-35, 36)
const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  respondFeedback,
  createFeedbackValidation,
  respondFeedbackValidation,
} = require('../controllers/feedback.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Gửi góp ý / khiếu nại (Khách)
router.post('/', authenticate, authorize('GUEST'), createFeedbackValidation, createFeedback);

// Xem danh sách phản hồi (Chỉ Khách xem của mình, Quản lý xem toàn bộ)
router.get('/', authenticate, authorize('GUEST', 'MANAGER'), getFeedbacks);

// Quản lý phản hồi và giải quyết (Quản lý)
router.patch('/:id/respond', authenticate, authorize('MANAGER'), respondFeedbackValidation, respondFeedback);

module.exports = router;
