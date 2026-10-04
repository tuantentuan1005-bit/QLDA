// Navbar.jsx - Thanh điều hướng dùng chung cho tất cả dashboard
// Hiển thị tên user, vai trò và nút đăng xuất (HCP-29)

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Nhãn hiển thị theo vai trò
const ROLE_LABELS = {
  GUEST: { label: 'Khách lưu trú', icon: '🛎️', color: 'bg-green-100 text-green-700' },
  RECEPTIONIST: { label: 'Lễ tân', icon: '🏨', color: 'bg-blue-100 text-blue-700' },
  STAFF: { label: 'Nhân viên', icon: '🔧', color: 'bg-orange-100 text-orange-700' },
  MANAGER: { label: 'Quản lý', icon: '📊', color: 'bg-purple-100 text-purple-700' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleInfo = ROLE_LABELS[user?.role] || { label: user?.role, icon: '👤', color: 'bg-gray-100 text-gray-700' };

  const handleLogout = () => {
    logout(); // Xóa token + user khỏi context và localStorage
    navigate('/login', { replace: true }); // Chuyển về trang đăng nhập
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🏨</span>
        <span className="font-bold text-gray-800 text-sm md:text-base">HotelCare Portal</span>
      </div>

      {/* Thông tin user + nút logout */}
      <div className="flex items-center gap-3">
        {/* Badge vai trò */}
        <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
          {roleInfo.icon} {roleInfo.label}
        </span>

        {/* Tên user */}
        <span className="text-sm text-gray-700 font-medium hidden md:block">
          {user?.full_name}
        </span>

        {/* Nút đăng xuất */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600
                     hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Đăng xuất"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}
