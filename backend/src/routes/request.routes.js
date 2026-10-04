// request.routes.js - Tuyến đường cho yêu cầu dịch vụ (HCP-31..34)
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getStaffList,
  createRequest,
  getRequests,
  getRequestById,
  assignRequest,
  updateRequestStatus,
  createRequestValidation,
} = require('../controllers/request.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public hoặc cho mọi tài khoản đã đăng nhập
router.get('/categories', authenticate, getCategories);
router.get('/staff-list', authenticate, authorize('RECEPTIONIST', 'MANAGER'), getStaffList);

// Gửi yêu cầu mới (Khách: GUEST)
router.post('/', authenticate, authorize('GUEST'), createRequestValidation, createRequest);

// Lấy danh sách yêu cầu (Mọi vai trò đều gọi nhưng controller lọc theo vai trò)
router.get('/', authenticate, getRequests);

// Chi tiết yêu cầu + timeline lịch sử
router.get('/:id', authenticate, getRequestById);

// Phân công nhân viên (Lễ tân, Quản lý)
router.patch('/:id/assign', authenticate, authorize('RECEPTIONIST', 'MANAGER'), assignRequest);

// Cập nhật trạng thái xử lý (Nhân viên dịch vụ, Quản lý)
router.patch('/:id/status', authenticate, authorize('STAFF', 'MANAGER'), updateRequestStatus);

module.exports = router;
