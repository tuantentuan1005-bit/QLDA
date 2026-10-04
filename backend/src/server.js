// server.js - Điểm khởi động của backend HotelCarePortal
// Cấu hình Express, middleware, routes

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE TOÀN CỤC =====

// Cho phép CORS từ frontend (Vite dev hoặc Vercel)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON body
app.use(express.json());

// ===== ROUTES =====
const authRoutes = require('./routes/auth.routes');
// Các routes khác sẽ được thêm dần theo từng HCP story
// const userRoutes = require('./routes/user.routes');       // HCP-30
// const requestRoutes = require('./routes/request.routes'); // HCP-31..34
// const feedbackRoutes = require('./routes/feedback.routes'); // HCP-35..36
// const ratingRoutes = require('./routes/rating.routes');   // HCP-37
// const dashboardRoutes = require('./routes/dashboard.routes'); // HCP-38

app.use('/api/auth', authRoutes);

// Health check — kiểm tra server hoạt động
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HotelCarePortal API đang chạy',
    time: new Date().toISOString(),
  });
});

// ===== XỬ LÝ 404 =====
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.method} ${req.url}` });
});

// ===== XỬ LÝ LỖI TOÀN CỤC =====
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Lỗi server không xử lý được:', err);
  res.status(500).json({ message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' });
});

// ===== KHỞI ĐỘNG SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Môi trường: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Đã cấu hình' : '❌ Chưa cấu hình!'}`);
  console.log(`🗄️  DATABASE: ${process.env.DATABASE_URL ? '✅ Đã cấu hình' : '❌ Chưa cấu hình!'}`);
});
