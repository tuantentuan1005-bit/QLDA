// Badge.jsx - Huy hiệu hiển thị trạng thái và vai trò
import React from 'react';

const STATUS_CONFIG = {
  // Trạng thái yêu cầu dịch vụ
  MOI: { label: 'Mới', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  DA_PHAN_CONG: { label: 'Đã phân công', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  DANG_XU_LY: { label: 'Đang xử lý', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  HOAN_TAT: { label: 'Hoàn tất', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  DA_HUY: { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },

  // Trạng thái khiếu nại / góp ý
  DA_GIAI_QUYET: { label: 'Đã giải quyết', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },

  // Loại feedback
  GOP_Y: { label: 'Góp ý', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  KHIEU_NAI: { label: 'Khiếu nại', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },

  // Vai trò
  GUEST: { label: 'Khách lưu trú', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  RECEPTIONIST: { label: 'Lễ tân', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  STAFF: { label: 'Nhân viên', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  MANAGER: { label: 'Quản lý', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },

  // Trạng thái tài khoản
  ACTIVE: { label: 'Hoạt động', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  LOCKED: { label: 'Đã khóa', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

export default function Badge({ status, label: customLabel, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: customLabel || status,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  };

  const displayText = customLabel || config.label;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{displayText}</span>
    </span>
  );
}
