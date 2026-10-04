// dashboard.routes.js - Tuyến đường Dashboard & Báo cáo (HCP-38)
const express = require('express');
const router = express.Router();
const { getDashboardStats, exportRequestsCsv } = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Chỉ Quản lý (MANAGER) mới được xem dashboard thống kê và xuất CSV
router.use(authenticate, authorize('MANAGER'));

router.get('/stats', getDashboardStats);
router.get('/export-csv', exportRequestsCsv);

module.exports = router;
