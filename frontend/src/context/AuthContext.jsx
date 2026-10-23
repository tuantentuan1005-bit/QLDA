// AuthContext.jsx - Quản lý trạng thái xác thực toàn ứng dụng
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Đọc dữ liệu đăng nhập ngay lập tức từ localStorage để KHÔNG bị màn hình trắng
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Xác thực token chạy ngầm, không block giao diện
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) return;

      try {
        const userData = await getMeApi();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        // Nếu token hết hạn hoặc tài khoản bị khóa -> đăng xuất
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    verifyToken();
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (...roles) => roles.includes(user?.role);

  const value = { user, token, loading, login, logout, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}
