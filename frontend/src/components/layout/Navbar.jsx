// Navbar.jsx - Thanh điều hướng trên cùng phong cách khách sạn sang trọng
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1e3a5f] text-white shadow-md border-b border-[#294c7a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Nút Hamburger (Mobile) + Logo Khách sạn */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Mở menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#c9a24b] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              H
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-white">
                  HotelCare
                </span>
                <span className="text-[#c9a24b] text-xs font-semibold uppercase tracking-widest hidden sm:inline">
                  Portal
                </span>
              </div>
              <p className="text-[10px] text-gray-300 tracking-wider uppercase hidden sm:block">
                Cổng Chăm Sóc Khách Hàng
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin người dùng & Nút Đăng xuất */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <>
              {/* Badge vai trò */}
              <div className="hidden sm:block">
                <Badge status={user.role} size="sm" />
              </div>

              {/* Tên người dùng */}
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[11px] text-gray-300 font-mono leading-tight">
                  {user.email}
                </p>
              </div>

              {/* Nút Đăng xuất */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-gray-200 hover:text-white bg-white/10 hover:bg-rose-600/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline font-medium">Đăng xuất</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
