// auth.routes.js - Định nghĩa các route xác thực
// Placeholder — sẽ thêm chi tiết ở Bước 3

const express = require('express');
const router = express.Router();

// Sẽ được implement ở HCP-3
router.get('/ping', (req, res) => {
  res.json({ message: 'Auth route hoạt động' });
});

module.exports = router;
