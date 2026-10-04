// Spinner.jsx - Hiển thị vòng xoay đang tải
import React from 'react';

export default function Spinner({ size = 'md', text = 'Đang tải...', className = '', fullPage = false }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-gray-500 ${className}`}>
      <div className={`animate-spin rounded-full border-t-[#1e3a5f] border-gray-200 ${sizeMap[size] || sizeMap.md}`}></div>
      {text && <span className="text-xs text-gray-500 font-medium">{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}
