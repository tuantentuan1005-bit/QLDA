// App.jsx - Hệ thống định tuyến toàn ứng dụng HotelCarePortal
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/ui/Spinner';

// Trang công khai
import LoginPage from './pages/LoginPage';

// Các trang Khách lưu trú (Guest)
import GuestOverviewPage from './pages/guest/GuestOverviewPage';
import NewRequestPage from './pages/guest/NewRequestPage';
import GuestRequestsPage from './pages/guest/GuestRequestsPage';
import RequestDetailPage from './pages/guest/RequestDetailPage';
import GuestFeedbacksPage from './pages/guest/GuestFeedbacksPage';

// Các trang Lễ tân (Receptionist)
import ReceptionistPage from './pages/receptionist/ReceptionistPage';

// Các trang Nhân viên (Staff)
import StaffPage from './pages/staff/StaffPage';

// Các trang Quản lý (Manager)
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import UserManagementPage from './pages/manager/UserManagementPage';
import ManagerFeedbacksPage from './pages/manager/ManagerFeedbacksPage';

// Tuyến đường bảo vệ theo vai trò RBAC
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage text="Đang xác thực quyền truy cập..." />;
  }

  // Chưa đăng nhập -> quay về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sai vai trò -> điều hướng về trang chủ của vai trò đó
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Đường dẫn mặc định của từng vai trò
function getRoleHomePath(role) {
  const paths = {
    GUEST: '/guest',
    RECEPTIONIST: '/receptionist',
    STAFF: '/staff',
    MANAGER: '/manager',
  };
  return paths[role] || '/login';
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Trang gốc */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* ===== GUEST (Khách lưu trú) ===== */}
      <Route
        path="/guest"
        element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/requests"
        element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/requests/new"
        element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <NewRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/requests/:id"
        element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <RequestDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/feedbacks"
        element={
          <ProtectedRoute allowedRoles={['GUEST']}>
            <GuestFeedbacksPage />
          </ProtectedRoute>
        }
      />

      {/* ===== RECEPTIONIST (Lễ tân) ===== */}
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'MANAGER']}>
            <ReceptionistPage />
          </ProtectedRoute>
        }
      />

      {/* ===== STAFF (Nhân viên dịch vụ) ===== */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'MANAGER']}>
            <StaffPage />
          </ProtectedRoute>
        }
      />

      {/* ===== MANAGER (Quản lý) ===== */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/users"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/feedbacks"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerFeedbacksPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Điều hướng lại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
