// LoginPage.jsx - Trang đăng nhập cho tất cả vai trò
// Sau khi đăng nhập thành công, tự redirect theo vai trò

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu đã đăng nhập → redirect
  if (user) {
    const paths = {
      GUEST: '/guest',
      RECEPTIONIST: '/receptionist',
      STAFF: '/staff',
      MANAGER: '/manager',
    };
    navigate(paths[user.role] || '/', { replace: true });
  }

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Xóa lỗi khi user gõ lại
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);
      const { user: userData, token } = res.data;

      // Lưu vào AuthContext
      login(userData, token);

      // Redirect theo vai trò
      const paths = {
        GUEST: '/guest',
        RECEPTIONIST: '/receptionist',
        STAFF: '/staff',
        MANAGER: '/manager',
      };
      navigate(paths[userData.role] || '/', { replace: true });
    } catch (err) {
      // Hiển thị thông báo lỗi rõ ràng
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Điền tài khoản demo nhanh
  const fillDemo = (email) => {
    setForm({ email, password: 'Demo@123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Tiêu đề */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏨</div>
          <h1 className="text-2xl font-bold text-gray-800">HotelCare Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống chăm sóc khách hàng</p>
        </div>

        {/* Card đăng nhập */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Đăng nhập</h2>

          {/* Thông báo lỗi */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ❌ {error}
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Tài khoản demo */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">
              Tài khoản demo (mật khẩu: Demo@123)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '🛎️ Khách', email: 'guest@demo.com' },
                { label: '🏨 Lễ tân', email: 'receptionist@demo.com' },
                { label: '🔧 Nhân viên', email: 'staff@demo.com' },
                { label: '📊 Quản lý', email: 'manager@demo.com' },
              ].map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 transition-colors"
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
