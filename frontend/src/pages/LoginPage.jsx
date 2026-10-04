// LoginPage.jsx - Trang đăng nhập cho tất cả vai trò
// HCP-29: Đăng nhập bằng email + mật khẩu, redirect theo vai trò

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../services/auth.service';

// Map vai trò → đường dẫn dashboard tương ứng
const ROLE_PATHS = {
  GUEST: '/guest',
  RECEPTIONIST: '/receptionist',
  STAFF: '/staff',
  MANAGER: '/manager',
};

// Tài khoản demo để điền nhanh khi test
const DEMO_ACCOUNTS = [
  { label: '🛎️ Khách', email: 'guest@demo.com' },
  { label: '🏨 Lễ tân', email: 'receptionist@demo.com' },
  { label: '🔧 Nhân viên', email: 'staff@demo.com' },
  { label: '📊 Quản lý', email: 'manager@demo.com' },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Đã đăng nhập → tự redirect (tránh quay lại trang login)
  if (user) {
    return <Navigate to={ROLE_PATHS[user.role] || '/'} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // Xóa lỗi khi user bắt đầu gõ lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user: userData, token } = await loginApi(form.email, form.password);
      login(userData, token); // Lưu vào AuthContext + localStorage
      navigate(ROLE_PATHS[userData.role] || '/', { replace: true });
    } catch (err) {
      // Lấy thông báo lỗi từ backend (đã viết bằng tiếng Việt)
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Điền nhanh tài khoản demo vào form
  const fillDemo = (email) => {
    setForm({ email, password: 'Demo@123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏨</div>
          <h1 className="text-2xl font-bold text-gray-800">HotelCare Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống chăm sóc khách hàng khách sạn</p>
        </div>

        {/* Card đăng nhập */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Đăng nhập</h2>

          {/* Thông báo lỗi */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
              <span className="mt-0.5">❌</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50"
                disabled={loading}
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50"
                disabled={loading}
              />
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-medium py-2.5 rounded-lg transition-colors
                         flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Tài khoản demo */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide">
              Tài khoản demo · mật khẩu: Demo@123
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  disabled={loading}
                  className="text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200
                             hover:border-blue-300 rounded-lg px-3 py-2 text-gray-600
                             hover:text-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
