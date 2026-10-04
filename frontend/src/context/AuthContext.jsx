// AuthContext.jsx - Quản lý trạng thái xác thực toàn ứng dụng
// Dùng React Context để chia sẻ thông tin user cho mọi component

import { createContext, useContext, useState, useEffect } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Provider bao bọc toàn bộ app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Kiểm tra token ban đầu

  // Khi app khởi động, kiểm tra xem có token lưu sẵn không
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Hàm đăng nhập: lưu token và thông tin user
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm đăng xuất: xóa toàn bộ thông tin
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Kiểm tra xem user có quyền cụ thể không
  const hasRole = (role) => user?.role === role;

  const value = { user, token, loading, login, logout, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook để dùng context dễ hơn
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng bên trong AuthProvider');
  }
  return context;
}
