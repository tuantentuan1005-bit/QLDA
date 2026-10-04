// GuestRequestsPage.jsx - Danh sách yêu cầu dịch vụ của khách (HCP-34)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequestsApi } from '../../services/request.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'MOI', label: 'Mới' },
  { key: 'DA_PHAN_CONG', label: 'Đã phân công' },
  { key: 'DANG_XU_LY', label: 'Đang xử lý' },
  { key: 'HOAN_TAT', label: 'Hoàn tất' },
];

export default function GuestRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequestsApi({
        status: statusFilter || undefined,
        page,
        limit: 8,
      });
      setRequests(res.data || []);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách yêu cầu:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu Cầu Dịch Vụ Của Tôi"
        subtitle="Theo dõi tiến độ xử lý và đánh giá chất lượng phục vụ"
        icon="📋"
        action={
          <Button
            variant="primary"
            size="md"
            icon="+"
            onClick={() => navigate('/guest/requests/new')}
            className="bg-[#1e3a5f] hover:bg-[#162c49]"
          >
            Gửi yêu cầu mới
          </Button>
        }
      />

      {/* Tabs lọc trạng thái */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Danh sách yêu cầu */}
      {loading ? (
        <Card>
          <Spinner text="Đang tải danh sách yêu cầu..." />
        </Card>
      ) : requests.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Không tìm thấy yêu cầu nào"
          description={
            statusFilter
              ? 'Không có yêu cầu nào phù hợp với bộ lọc đã chọn.'
              : 'Quý khách chưa có yêu cầu dịch vụ nào.'
          }
          actionText="Gửi yêu cầu mới ngay"
          onAction={() => navigate('/guest/requests/new')}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="hover:border-[#1e3a5f]/40 transition-all duration-150 cursor-pointer"
            >
              <div
                onClick={() => navigate(`/guest/requests/${req.id}`)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg shrink-0">
                    🛎️
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900">
                        {req.category?.name}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs font-mono text-gray-500">
                        Mã: HCP-{req.id}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        Phòng {req.stay?.room?.room_number || '101'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {req.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Gửi lúc: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                      {req.staff && (
                        <span>
                          · Phụ trách: <strong className="text-gray-600">{req.staff.full_name}</strong>
                        </span>
                      )}
                      {req.rating && (
                        <span className="text-[#b58d38] font-semibold">
                          · Đã đánh giá: {req.rating.score} ⭐
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <Badge status={req.status} />
                  <Button variant="ghost" size="sm">
                    Xem chi tiết &rarr;
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
