// feedback.controller.js - Xử lý Góp ý & Khiếu nại (HCP-35, 36)
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/prisma');

// Validation khi gửi góp ý / khiếu nại (HCP-35)
const createFeedbackValidation = [
  body('type')
    .isIn(['GOP_Y', 'KHIEU_NAI'])
    .withMessage('Loại phản hồi phải là GOP_Y (Góp ý) hoặc KHIEU_NAI (Khiếu nại).'),
  body('content')
    .trim()
    .notEmpty().withMessage('Nội dung góp ý / khiếu nại không được để trống.')
    .isLength({ min: 10, max: 1000 }).withMessage('Nội dung từ 10 đến 1000 ký tự.'),
];

// Validation khi quản lý phản hồi (HCP-36)
const respondFeedbackValidation = [
  body('response')
    .trim()
    .notEmpty().withMessage('Nội dung phản hồi của quản lý không được để trống.')
    .isLength({ min: 5, max: 1000 }).withMessage('Nội dung phản hồi từ 5 đến 1000 ký tự.'),
];

/**
 * POST /api/feedbacks
 * Khách gửi góp ý hoặc khiếu nại mới (HCP-35)
 * Trạng thái ban đầu: MOI (Mới), trả về mã tham chiếu
 */
const createFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { type, content } = req.body;
  const guestId = req.user.id;

  try {
    const feedback = await prisma.feedback.create({
      data: {
        guest_id: guestId,
        type,
        content,
        status: 'MOI',
      },
      include: {
        guest: { select: { id: true, full_name: true, email: true } },
      },
    });

    const refCode = `FB-${String(feedback.id).padStart(5, '0')}`;

    return res.status(201).json({
      message: `Gửi ${type === 'GOP_Y' ? 'góp ý' : 'khiếu nại'} thành công! Mã tham chiếu: ${refCode}`,
      ref_code: refCode,
      feedback,
    });
  } catch (err) {
    console.error('Lỗi gửi góp ý / khiếu nại:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * GET /api/feedbacks
 * Lấy danh sách góp ý / khiếu nại:
 * - GUEST: Xem các mục của chính mình
 * - MANAGER: Xem toàn bộ để xử lý
 */
const getFeedbacks = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (req.user.role === 'GUEST') {
      where.guest_id = req.user.id;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          guest: { select: { id: true, full_name: true, email: true } },
          handler: { select: { id: true, full_name: true, role: true } },
        },
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
      prisma.feedback.count({ where }),
    ]);

    return res.status(200).json({
      data: feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách feedbacks:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * PATCH /api/feedbacks/:id/respond
 * Quản lý xử lý khiếu nại và gửi phản hồi (HCP-36)
 * Trạng thái chuyển thành: DA_GIAI_QUYET
 */
const respondFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const feedbackId = parseInt(req.params.id);
  const { response } = req.body;

  try {
    const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy mục phản hồi này.' });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        response,
        status: 'DA_GIAI_QUYET',
        handled_by: req.user.id,
      },
      include: {
        guest: { select: { id: true, full_name: true, email: true } },
        handler: { select: { id: true, full_name: true } },
      },
    });

    return res.status(200).json({
      message: 'Đã gửi phản hồi và giải quyết khiếu nại thành công!',
      feedback: updated,
    });
  } catch (err) {
    console.error('Lỗi phản hồi feedback:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  respondFeedback,
  createFeedbackValidation,
  respondFeedbackValidation,
};
