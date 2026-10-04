// App.jsx - Định nghĩa routing chính của ứng dụng
// Dùng React Router v6 với route bảo vệ theo vai trò

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import các trang (sẽ thêm dần ở các bước sau)
import LoginPage from './pages/LoginPage';

// Component placeholder đơn giản cho các dashboard
function GuestDashboard() {
  return <div className="p-8 text-xl">🛎️ Dashboard Khách - đang xây dựng...</div>;
}
function ReceptionistDashboard() {
  return <div className="p-8 text-xl">🏨 Dashboard Lễ tân - đang xây dựng...</div>;
}
function StaffDashboard() {
  return <div className="p-8 text-xl">🔧 Dashboard Nhân viên - đang xây dựng...</div>;
}
function ManagerDashboard() {
  return <div className="p-8 text-xl">📊 Dashboard Quản lý - đang xây dựng...</div>;
}

// ===== ROUTE BẢO VỆ THEO VAI TRÒ =====
// Kiểm tra user đã đăng nhập và có đúng vai trò không
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Đang kiểm tra token từ localStorage
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Chưa đăng nhập → chuyển về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Không có quyền → chuyển về trang phù hợp với vai trò
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
}

// Trả về đường dẫn trang chủ theo vai trò
function getRoleHomePath(role) {
  const paths = {
    GUEST: '/guest',
    RECEPTIONIST: '/receptionist',
    STAFF: '/staff',
    MANAGER: '/manager',
  };
  return paths[role] || '/login';
}

// ===== REDIRECT TỰ ĐỘNG SAU ĐĂNG NHẬP =====
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

// ===== ĐỊNH NGHĨA ROUTES =====
export default function App() {
  return (
    <Routes>
      {/* Trang gốc: tự redirect theo vai trò */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Trang đăng nhập (public) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes bảo vệ theo vai trò */}
      <Route
        path="/guest/*"
        element={
          <PrivateRoute allowedRoles={['GUEST']}>
            <GuestDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/receptionist/*"
        element={
          <PrivateRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/staff/*"
        element={
          <PrivateRoute allowedRoles={['STAFF']}>
            <StaffDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/*"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'RECEPTIONIST']}>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />

      {/* 404 - không tìm thấy trang */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
