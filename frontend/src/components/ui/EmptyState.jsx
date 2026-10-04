// EmptyState.jsx - Trạng thái trống khi chưa có dữ liệu
import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon = '📭',
  title = 'Chưa có dữ liệu nào',
  description = 'Hiện tại không có mục nào để hiển thị trong danh sách này.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-gray-200 ${className}`}>
      <span className="text-4xl sm:text-5xl mb-3 select-none">{icon}</span>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
