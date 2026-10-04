// PageHeader.jsx - Tiêu đề đầu trang chuẩn hóa cho mọi màn hình
import React from 'react';

export default function PageHeader({ title, subtitle, icon, action, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {breadcrumb && <div className="text-xs text-gray-500 mb-1">{breadcrumb}</div>}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center text-xl shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
