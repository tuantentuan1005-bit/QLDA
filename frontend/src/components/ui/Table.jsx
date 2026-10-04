// Table.jsx - Bảng dữ liệu có phân trang, hỗ trợ loading và responsive
import React from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import Button from './Button';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'Không tìm thấy bản ghi nào',
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className={`w-full overflow-hidden bg-white rounded-xl border border-gray-200/80 shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3.5 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Spinner size="md" text="Đang tải dữ liệu..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState title={emptyText} description="Hãy thử thay đổi bộ lọc hoặc thêm mới dữ liệu." />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3.5 text-gray-700 align-middle ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalItems > 0 && (
        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Hiển thị{' '}
            <span className="font-semibold text-gray-700">
              {Math.min((page - 1) * pageSize + 1, totalItems)}
            </span>{' '}
            đến{' '}
            <span className="font-semibold text-gray-700">
              {Math.min(page * pageSize, totalItems)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-gray-700">{totalItems}</span> bản ghi
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              Trang trước
            </Button>
            <span className="px-2 font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
