// App.jsx - Định nghĩa routing chính của ứng dụng
// Dùng React Router v6 với route bảo vệ theo vai trò

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import các trang (sẽ thêm dần ở các bước sau)
import LoginPage from './pages/LoginPage';

import Navbar from './components/layout/Navbar';

// Component layout cơ bản cho các dashboard có thanh Navbar
function DashboardLayout({ title, icon, description }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-gray-500 text-sm">{description}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-900 font-medium">
              👋 Xin chào, <span className="font-semibold">{user?.full_name}</span> ({user?.email})!
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Bạn đang đăng nhập với quyền: <span className="font-semibold uppercase tracking-wider">{user?.role}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function GuestDashboard() {
  return <DashboardLayout title="Cổng Khách Lưu Trú" icon="🛎️" description="Gửi yêu cầu dịch vụ, theo dõi tiến độ và gửi góp ý" />;
}
function ReceptionistDashboard() {
  return <DashboardLayout title="Bàn Tiếp Nhận Lễ Tân" icon="🏨" description="Tiếp nhận, phân công và quản lý trạng thái yêu cầu dịch vụ" />;
}
function StaffDashboard() {
  return <DashboardLayout title="Cổng Nhân Viên Dịch Vụ" icon="🔧" description="Xử lý công việc được phân công và cập nhật tiến độ" />;
}
function ManagerDashboard() {
  return <DashboardLayout title="Bảng Điều Khiển Quản Lý" icon="📊" description="Giám sát hoạt động, xử lý khiếu nại và xem báo cáo thống kê" />;
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
