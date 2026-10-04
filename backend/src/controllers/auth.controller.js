// auth.controller.js - Xử lý logic đăng nhập và lấy thông tin người dùng hiện tại
// HCP-29: Đăng nhập, đăng xuất

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/prisma');

// ===== VALIDATION RULES cho API đăng nhập =====
const loginValidation = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống.')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
];

/**
 * POST /api/auth/login
 * Đăng nhập bằng email + mật khẩu → trả về JWT token và thông tin user.
 */
const login = async (req, res) => {
  // Kiểm tra validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { email, password } = req.body;

  try {
    // Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.is_active) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý.' });
    }

    // So sánh mật khẩu với hash trong database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Tạo JWT token — payload chứa các thông tin cần thiết
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Trả về token và thông tin user (KHÔNG trả password_hash)
    return res.status(200).json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
  }
};

/**
 * GET /api/auth/me
 * Lấy thông tin người dùng hiện tại (dựa vào JWT token).
 * Dùng để frontend kiểm tra token còn hợp lệ không khi reload trang.
 */
const getMe = async (req, res) => {
  try {
    // req.user đã được gắn bởi middleware authenticate
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Tài khoản không còn hoạt động.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Lỗi lấy thông tin user:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

module.exports = { login, loginValidation, getMe };
