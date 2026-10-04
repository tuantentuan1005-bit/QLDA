// Sidebar.jsx - Thanh menu bên hông theo vai trò người dùng
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS_BY_ROLE = {
  GUEST: [
    { label: 'Tổng quan', path: '/guest', icon: '🛎️' },
    { label: 'Gửi yêu cầu mới', path: '/guest/requests/new', icon: '✍️' },
    { label: 'Yêu cầu của tôi', path: '/guest/requests', icon: '📋' },
    { label: 'Góp ý & Khiếu nại', path: '/guest/feedbacks', icon: '💬' },
  ],
  RECEPTIONIST: [
    { label: 'Bàn tiếp nhận', path: '/receptionist', icon: '🏨' },
  ],
  STAFF: [
    { label: 'Công việc của tôi', path: '/staff', icon: '🔧' },
  ],
  MANAGER: [
    { label: 'Dashboard & Báo cáo', path: '/manager', icon: '📊' },
    { label: 'Quản lý tài khoản', path: '/manager/users', icon: '👥' },
    { label: 'Xử lý khiếu nại', path: '/manager/feedbacks', icon: '⚖️' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navItems = NAV_ITEMS_BY_ROLE[user?.role] || [];

  return (
    <>
      {/* Lớp nền mờ trên Mobile khi mở Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-2xs"
          onClick={onClose}
        />
      )}

      {/* Menu Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Menu Chức Năng
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/guest' || item.path === '/manager' || item.path === '/receptionist' || item.path === '/staff'}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Chân sidebar */}
        <div className="p-4 bg-gray-50/70 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hệ thống trực tuyến</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Phiên bản đồ án MVP 1.0</p>
        </div>
      </aside>
    </>
  );
}
