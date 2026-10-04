// AuthContext.jsx - Quản lý trạng thái xác thực toàn ứng dụng
// HCP-29: login, logout, kiểm tra token khi reload

import { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Đang kiểm tra token ban đầu

  // Khi app khởi động: kiểm tra token trong localStorage còn hợp lệ không
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Gọi API /auth/me để xác thực token với backend
        // (tránh trường hợp token giả mạo hoặc user bị khóa)
        const userData = await getMeApi();
        setToken(savedToken);
        setUser(userData);
      } catch {
        // Token hết hạn hoặc không hợp lệ → xóa đi
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Lưu thông tin sau khi đăng nhập thành công
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Xóa toàn bộ thông tin khi đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Kiểm tra user có vai trò cụ thể không
  const hasRole = (...roles) => roles.includes(user?.role);

  const value = { user, token, loading, login, logout, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — dùng thay vì useContext(AuthContext) trực tiếp
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}
