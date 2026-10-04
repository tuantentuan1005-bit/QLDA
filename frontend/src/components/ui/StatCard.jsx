// StatCard.jsx - Thẻ hiển thị chỉ số thống kê
import React from 'react';

export default function StatCard({ title, value, icon, change, changeType = 'positive', color = 'navy' }) {
  const colorMap = {
    navy: { bg: 'bg-[#1e3a5f]/10', text: 'text-[#1e3a5f]', border: 'border-l-4 border-l-[#1e3a5f]' },
    gold: { bg: 'bg-[#c9a24b]/15', text: 'text-[#b58d38]', border: 'border-l-4 border-l-[#c9a24b]' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-4 border-l-emerald-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-l-4 border-l-rose-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-4 border-l-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-4 border-l-amber-600' },
  };

  const selectedColor = colorMap[color] || colorMap.navy;

  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs transition-all hover:shadow-sm ${selectedColor.border}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${selectedColor.bg} ${selectedColor.text}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        {change && (
          <span
            className={`text-xs font-medium ${
              changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
