// Button.jsx - Nút bấm theo phong cách HotelCare
import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs select-none';

  const variants = {
    // Màu xanh navy sang trọng (#1e3a5f)
    primary: 'bg-[#1e3a5f] hover:bg-[#162c49] text-white focus:ring-2 focus:ring-[#1e3a5f]/30',
    // Màu vàng đồng nhấn (#c9a24b)
    gold: 'bg-[#c9a24b] hover:bg-[#b58d38] text-white focus:ring-2 focus:ring-[#c9a24b]/30',
    // Nền trắng viền xám
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-gray-200',
    // Nút nguy hiểm / xóa / hủy
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-2 focus:ring-rose-500/30',
    // Nút ghost / không nền
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 shadow-none',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
