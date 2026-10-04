// Textarea.jsx - Khung nhập văn bản nhiều dòng
import React from 'react';

export default function Textarea({
  label,
  error,
  helper,
  className = '',
  id,
  required,
  rows = 4,
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-colors
          ${error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-gray-300 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
          }
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          focus:outline-none resize-y ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}
