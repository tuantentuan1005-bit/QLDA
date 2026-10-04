// user.routes.js - Tuyến đường quản lý người dùng (HCP-30)
// Bảo vệ bởi RBAC: Chỉ vai trò MANAGER mới được truy cập

const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Mọi route bên dưới đều phải đăng nhập VÀ có quyền MANAGER
router.use(authenticate, authorize('MANAGER'));

router.get('/', getUsers);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;
