// auth.middleware.js - Middleware xác thực JWT và kiểm tra quyền (RBAC)
// Được dùng ở MỌI route cần đăng nhập

const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực: kiểm tra token hợp lệ.
 * Nếu hợp lệ → gắn thông tin user vào req.user rồi cho qua.
 * Nếu không → trả 401 Unauthorized.
 */
const authenticate = (req, res, next) => {
  // Lấy token từ header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token bằng JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, full_name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
  }
};

/**
 * Middleware phân quyền (RBAC): kiểm tra vai trò được phép.
 * Dùng sau authenticate.
 * Ví dụ: authorize('MANAGER', 'RECEPTIONIST')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Bạn không có quyền thực hiện thao tác này. Vai trò yêu cầu: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
