// auth.routes.js - Định nghĩa các route xác thực
// HCP-29: POST /login, GET /me

const express = require('express');
const router = express.Router();
const { login, loginValidation, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/auth/login — Đăng nhập (public, không cần token)
router.post('/login', loginValidation, login);

// GET /api/auth/me — Lấy thông tin user hiện tại (cần token hợp lệ)
router.get('/me', authenticate, getMe);

// GET /api/auth/ping — Kiểm tra route hoạt động
router.get('/ping', (req, res) => {
  res.json({ message: 'Auth route hoạt động' });
});

module.exports = router;
