// rating.controller.js - Đánh giá mức độ hài lòng dịch vụ (HCP-37)
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/prisma');

const createRatingValidation = [
  body('request_id')
    .notEmpty().withMessage('Mã yêu cầu không được để trống.')
    .isInt().withMessage('Mã yêu cầu phải là số nguyên.'),
  body('score')
    .notEmpty().withMessage('Vui lòng chọn số sao đánh giá.')
    .isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1 đến 5 sao.'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Nhận xét tối đa 500 ký tự.'),
];

/**
 * POST /api/ratings
 * Khách đánh giá mức độ hài lòng sau khi yêu cầu đã HOAN_TAT (HCP-37)
 */
const createRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ.',
      errors: errors.array().map((e) => e.msg),
    });
  }

  const { request_id, score, comment } = req.body;
  const guestId = req.user.id;

  try {
    // 1. Kiểm tra yêu cầu có tồn tại không
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: parseInt(request_id) },
      include: {
        stay: true,
        rating: true,
      },
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu dịch vụ này.' });
    }

    // 2. AC: Chỉ khách của đợt lưu trú này mới được đánh giá
    if (serviceRequest.stay.guest_id !== guestId) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá yêu cầu của khách hàng khác.' });
    }

    // 3. AC: Chỉ đánh giá khi yêu cầu đã Hoàn tất (HOAN_TAT)
    if (serviceRequest.status !== 'HOAN_TAT') {
      return res.status(400).json({
        message: 'Chỉ có thể đánh giá khi yêu cầu dịch vụ đã được hoàn tất.',
      });
    }

    // 4. AC: Mỗi yêu cầu chỉ đánh giá một lần
    if (serviceRequest.rating) {
      return res.status(400).json({
        message: 'Yêu cầu này đã được đánh giá trước đó. Không thể gửi lại.',
      });
    }

    // 5. Tạo đánh giá mới
    const rating = await prisma.rating.create({
      data: {
        request_id: parseInt(request_id),
        guest_id: guestId,
        score: parseInt(score),
        comment: comment || null,
      },
    });

    return res.status(201).json({
      message: 'Cảm ơn quý khách đã gửi đánh giá dịch vụ!',
      rating,
    });
  } catch (err) {
    console.error('Lỗi lưu đánh giá:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  createRating,
  createRatingValidation,
};
