// request.controller.js - Xử lý nghiệp vụ yêu cầu dịch vụ (HCP-31, 32, 33, 34)
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/prisma');

// Validation khi gửi yêu cầu dịch vụ mới (HCP-31)
const createRequestValidation = [
  body('category_id')
    .notEmpty().withMessage('Vui lòng chọn loại dịch vụ.')
    .isInt().withMessage('Mã loại dịch vụ không hợp lệ.'),
  body('content')
    .trim()
    .notEmpty().withMessage('Nội dung yêu cầu không được để trống.')
    .isLength({ min: 5, max: 1000 }).withMessage('Nội dung yêu cầu từ 5 đến 1000 ký tự.'),
];

/**
 * GET /api/categories
 * Lấy danh sách danh mục dịch vụ (cho dropdown chọn món / dịch vụ)
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Lỗi lấy danh mục dịch vụ:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh mục.' });
  }
};

/**
 * GET /api/staff-list
 * Lấy danh sách nhân viên dịch vụ đang hoạt động (cho lễ tân phân công)
 */
const getStaffList = async (req, res) => {
  try {
    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF', is_active: true },
      select: { id: true, full_name: true, email: true },
      orderBy: { full_name: 'asc' },
    });
    return res.status(200).json(staffMembers);
  } catch (err) {
    console.error('Lỗi lấy danh sách nhân viên:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * POST /api/requests
 * Khách gửi yêu cầu dịch vụ mới (HCP-31)
 * Trạng thái ban đầu: MOI (Mới)
 */
const createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { category_id, content } = req.body;
  const guestId = req.user.id;

  try {
    // Tìm đợt lưu trú (stay) của khách
    let stay = await prisma.stay.findFirst({
      where: { guest_id: guestId },
      orderBy: { id: 'desc' },
      include: { room: true },
    });

    // Nếu khách chưa có stay (tạo tự động đợt lưu trú gắn phòng 101 để tiện demo)
    if (!stay) {
      const room = await prisma.room.findFirst({ where: { status: 'AVAILABLE' } }) ||
                   await prisma.room.findFirst();

      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 5);

      stay = await prisma.stay.create({
        data: {
          guest_id: guestId,
          room_id: room.id,
          check_in: today,
          check_out: nextWeek,
        },
        include: { room: true },
      });
    }

    // Tạo yêu cầu dịch vụ mới với trạng thái MOI
    const newRequest = await prisma.serviceRequest.create({
      data: {
        stay_id: stay.id,
        category_id: parseInt(category_id),
        content,
        status: 'MOI',
      },
      include: {
        category: true,
        stay: { include: { room: true } },
      },
    });

    // Ghi nhận lịch sử trạng thái ban đầu
    await prisma.requestHistory.create({
      data: {
        request_id: newRequest.id,
        old_status: null,
        new_status: 'MOI',
        changed_by: guestId,
      },
    });

    return res.status(201).json({
      message: 'Gửi yêu cầu dịch vụ thành công! Lễ tân sẽ tiếp nhận ngay.',
      request: newRequest,
    });
  } catch (err) {
    console.error('Lỗi tạo yêu cầu dịch vụ:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi yêu cầu.' });
  }
};

/**
 * GET /api/requests
 * Lấy danh sách yêu cầu dịch vụ theo vai trò:
 * - GUEST (HCP-34): Chỉ thấy yêu cầu của chính mình
 * - STAFF (HCP-33): Thấy việc được giao cho mình
 * - RECEPTIONIST / MANAGER (HCP-32): Thấy toàn bộ, có tìm kiếm, lọc trạng thái, phân trang
 */
const getRequests = async (req, res) => {
  try {
    const { status, category_id, search, page = 1, limit = 10, my_tasks } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // 1. Phân quyền theo vai trò
    if (req.user.role === 'GUEST') {
      where.stay = { guest_id: req.user.id };
    } else if (req.user.role === 'STAFF' || my_tasks === 'true') {
      where.assigned_to = req.user.id;
    }

    // 2. Bộ lọc trạng thái
    if (status) {
      where.status = status;
    }

    // 3. Bộ lọc loại dịch vụ
    if (category_id) {
      where.category_id = parseInt(category_id);
    }

    // 4. Tìm kiếm nội dung hoặc số phòng
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { stay: { room: { room_number: { contains: search, mode: 'insensitive' } } } },
        { stay: { guest: { full_name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          category: true,
          stay: {
            include: {
              room: true,
              guest: { select: { id: true, full_name: true, email: true } },
            },
          },
          staff: { select: { id: true, full_name: true, email: true } },
          rating: true,
        },
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return res.status(200).json({
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách yêu cầu:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách yêu cầu.' });
  }
};

/**
 * GET /api/requests/:id
 * Lấy chi tiết yêu cầu kèm timeline lịch sử xử lý (HCP-34)
 */
const getRequestById = async (req, res) => {
  const requestId = parseInt(req.params.id);

  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        category: true,
        stay: {
          include: {
            room: true,
            guest: { select: { id: true, full_name: true, email: true } },
          },
        },
        staff: { select: { id: true, full_name: true, email: true } },
        history: {
          include: {
            changed_by_user: { select: { id: true, full_name: true, role: true } },
          },
          orderBy: { changed_at: 'asc' },
        },
        rating: true,
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    // Bảo mật: Nếu là GUEST thì chỉ xem được yêu cầu của chính mình
    if (req.user.role === 'GUEST' && request.stay.guest_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem yêu cầu của khách hàng khác.' });
    }

    return res.status(200).json(request);
  } catch (err) {
    console.error('Lỗi lấy chi tiết yêu cầu:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * PATCH /api/requests/:id/assign
 * Lễ tân / Quản lý tiếp nhận và phân công nhân viên (HCP-32)
 * Trạng thái chuyển thành: DA_PHAN_CONG
 */
const assignRequest = async (req, res) => {
  const requestId = parseInt(req.params.id);
  const { staff_id } = req.body;

  if (!staff_id) {
    return res.status(400).json({ message: 'Vui lòng chọn nhân viên thực hiện.' });
  }

  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    // Kiểm tra nhân viên tồn tại và có vai trò STAFF
    const staff = await prisma.user.findFirst({
      where: { id: parseInt(staff_id), role: 'STAFF', is_active: true },
    });
    if (!staff) {
      return res.status(400).json({ message: 'Nhân viên được chọn không hợp lệ hoặc đang bị khóa.' });
    }

    const oldStatus = request.status;
    const newStatus = 'DA_PHAN_CONG';

    // Cập nhật yêu cầu
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assigned_to: staff.id,
        status: newStatus,
      },
      include: {
        category: true,
        staff: { select: { id: true, full_name: true, email: true } },
      },
    });

    // Ghi lịch sử chuyển trạng thái
    await prisma.requestHistory.create({
      data: {
        request_id: requestId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: req.user.id,
      },
    });

    return res.status(200).json({
      message: `Đã phân công thành công cho nhân viên ${staff.full_name}.`,
      request: updated,
    });
  } catch (err) {
    console.error('Lỗi phân công yêu cầu:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ khi phân công.' });
  }
};

/**
 * PATCH /api/requests/:id/status
 * Nhân viên cập nhật trạng thái xử lý (HCP-33)
 * AC: Chỉ nhân viên được phân công mới được đổi trạng thái
 * Các trạng thái hợp lệ: DANG_XU_LY, HOAN_TAT
 */
const updateRequestStatus = async (req, res) => {
  const requestId = parseInt(req.params.id);
  const { status } = req.body;

  if (!['DANG_XU_LY', 'HOAN_TAT'].includes(status)) {
    return res.status(400).json({
      message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Đang xử lý (DANG_XU_LY) hoặc Hoàn tất (HOAN_TAT).',
    });
  }

  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    // AC: Chỉ nhân viên được phân công (hoặc Manager) mới được phép cập nhật
    if (req.user.role === 'STAFF' && request.assigned_to !== req.user.id) {
      return res.status(403).json({
        message: 'Bạn không được phép cập nhật yêu cầu này vì chưa được phân công cho bạn.',
      });
    }

    const oldStatus = request.status;
    const updateData = { status };

    // Nếu hoàn tất, lưu thời điểm completed_at
    if (status === 'HOAN_TAT') {
      updateData.completed_at = new Date();
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        category: true,
        stay: { include: { room: true } },
      },
    });

    // Ghi nhận lịch sử
    await prisma.requestHistory.create({
      data: {
        request_id: requestId,
        old_status: oldStatus,
        new_status: status,
        changed_by: req.user.id,
      },
    });

    const statusText = status === 'DANG_XU_LY' ? 'Đang xử lý' : 'Hoàn tất';
    return res.status(200).json({
      message: `Cập nhật trạng thái thành "${statusText}" thành công!`,
      request: updated,
    });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  getCategories,
  getStaffList,
  createRequest,
  getRequests,
  getRequestById,
  assignRequest,
  updateRequestStatus,
  createRequestValidation,
};
