// rating.routes.js - Tuyến đường đánh giá dịch vụ (HCP-37)
const express = require('express');
const router = express.Router();
const { createRating, createRatingValidation } = require('../controllers/rating.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Chỉ khách (GUEST) mới gửi đánh giá
router.post('/', authenticate, authorize('GUEST'), createRatingValidation, createRating);

module.exports = router;
