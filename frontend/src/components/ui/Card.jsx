// Card.jsx - Khối giao diện chứa nội dung với bóng nhẹ và góc bo
import React from 'react';

export default function Card({ children, className = '', title, subtitle, action, footer }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}
