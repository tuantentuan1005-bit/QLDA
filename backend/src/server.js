// server.js - Điểm khởi động của backend
// Cấu hình Express, kết nối middleware, đăng ký routes

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

// Cho phép CORS từ frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse request body dạng JSON
app.use(express.json());

// ===== ROUTES =====
// Import các router (sẽ thêm dần ở các bước sau)
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

// Route kiểm tra server hoạt động
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HotelCarePortal API đang chạy',
    time: new Date().toISOString(),
  });
});

// ===== XỬ LÝ LỖI 404 =====
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy route này' });
});

// ===== XỬ LÝ LỖI TOÀN CỤC =====
app.use((err, req, res, next) => {
  console.error('Lỗi server:', err);
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

// ===== KHỞI ĐỘNG SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Môi trường: ${process.env.NODE_ENV || 'development'}`);
});
