// user.controller.js - Quản lý tài khoản và phân quyền người dùng (HCP-30)
// Chỉ vai trò MANAGER mới có quyền thực hiện

const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/prisma');

// Quy tắc validation khi tạo tài khoản mới
const createUserValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống.')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2 đến 100 ký tự.'),
  body('email')
    .isEmail().withMessage('Email không hợp lệ.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống.')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải từ 6 ký tự trở lên.'),
  body('role')
    .isIn(['GUEST', 'RECEPTIONIST', 'STAFF', 'MANAGER'])
    .withMessage('Vai trò không hợp lệ (GUEST, RECEPTIONIST, STAFF, MANAGER).'),
];

// Quy tắc validation khi cập nhật tài khoản
const updateUserValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2 đến 100 ký tự.'),
  body('role')
    .optional()
    .isIn(['GUEST', 'RECEPTIONIST', 'STAFF', 'MANAGER'])
    .withMessage('Vai trò không hợp lệ.'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải từ 6 ký tự trở lên.'),
];

/**
 * GET /api/users
 * Lấy danh sách tài khoản kèm tìm kiếm, lọc theo vai trò và phân trang
 */
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
        },
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách user:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tài khoản.' });
  }
};

/**
 * POST /api/users
 * Tạo tài khoản người dùng mới (chỉ Manager)
 */
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { full_name, email, password, role } = req.body;

  try {
    // Kiểm tra trùng email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email này đã được sử dụng trong hệ thống.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    return res.status(201).json({
      message: 'Tạo tài khoản thành công.',
      user: newUser,
    });
  } catch (err) {
    console.error('Lỗi tạo tài khoản:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo tài khoản.' });
  }
};

/**
 * PUT /api/users/:id
 * Cập nhật thông tin hoặc đổi vai trò của người dùng
 */
const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const userId = parseInt(req.params.id);
  const { full_name, role, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
    }

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    return res.status(200).json({
      message: 'Cập nhật tài khoản thành công.',
      user: updated,
    });
  } catch (err) {
    console.error('Lỗi cập nhật tài khoản:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tài khoản.' });
  }
};

/**
 * PATCH /api/users/:id/toggle-status
 * Khóa hoặc Mở khóa tài khoản người dùng
 */
const toggleUserStatus = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Không cho phép tự khóa chính mình
    if (req.user.id === userId) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
    }

    const newStatus = !user.is_active;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { is_active: newStatus },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    const actionText = newStatus ? 'Mở khóa' : 'Khóa';
    return res.status(200).json({
      message: `${actionText} tài khoản thành công.`,
      user: updated,
    });
  } catch (err) {
    console.error('Lỗi đổi trạng thái tài khoản:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đổi trạng thái tài khoản.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  createUserValidation,
  updateUserValidation,
};
