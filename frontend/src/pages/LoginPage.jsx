// LoginPage.jsx - Trang đăng nhập phong cách khách sạn sang trọng
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../services/auth.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ROLE_PATHS = {
  GUEST: '/guest',
  RECEPTIONIST: '/receptionist',
  STAFF: '/staff',
  MANAGER: '/manager',
};

const DEMO_ACCOUNTS = [
  { label: '🛎️ Khách', email: 'guest@demo.com', role: 'Khách lưu trú' },
  { label: '🏨 Lễ tân', email: 'receptionist@demo.com', role: 'Lễ tân' },
  { label: '🔧 Nhân viên', email: 'staff@demo.com', role: 'Nhân viên dịch vụ' },
  { label: '📊 Quản lý', email: 'manager@demo.com', role: 'Quản lý' },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={ROLE_PATHS[user.role] || '/'} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user: userData, token } = await loginApi(form.email, form.password);
      login(userData, token);
      navigate(ROLE_PATHS[userData.role] || '/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'Demo@123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header Thương hiệu Khách sạn */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1e3a5f] text-[#c9a24b] shadow-md mb-3 font-serif text-2xl font-bold">
            H
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e3a5f] tracking-tight">
            HotelCare Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-widest">
            Hệ thống Chăm sóc Khách hàng Khách sạn
          </p>
        </div>

        {/* Khung đăng nhập */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Đăng nhập tài khoản</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Vui lòng nhập thông tin để truy cập hệ thống
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-xs flex items-start gap-2.5">
              <span className="text-sm">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Địa chỉ Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nhap.email@khachsan.com"
              required
              disabled={loading}
              autoComplete="email"
            />

            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#162c49]"
              >
                Đăng nhập
              </Button>
            </div>
          </form>

          {/* Tài khoản Demo hỗ trợ chấm bài / bảo vệ đồ án */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Tài khoản Demo
              </p>
              <span className="text-[11px] font-mono text-[#c9a24b] font-medium">
                Pass: Demo@123
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ label, email, role }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  disabled={loading}
                  className="text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#c9a24b] hover:bg-[#fbf9f4] transition-all cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-[#1e3a5f]">
                    {label}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 HotelCare Portal · Đồ án Quản lý Dự án Phần mềm
        </p>
      </div>
    </div>
  );
}
