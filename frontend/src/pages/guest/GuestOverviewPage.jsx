// GuestOverviewPage.jsx - Màn hình tổng quan dành cho khách lưu trú
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequestsApi } from '../../services/request.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function GuestOverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getRequestsApi({ limit: 4 });
        setRecentRequests(res.data || []);
      } catch (err) {
        console.error('Lỗi lấy yêu cầu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner Chào Mừng Phong Cách Khách Sạn */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#294c7a] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-[#c9a24b] text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            Dịch vụ Chăm sóc Khách hàng
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Kính chào Quý khách, {user?.full_name}!
          </h1>
          <p className="text-sm text-gray-200 mt-2 leading-relaxed">
            Chúng tôi luôn sẵn sàng hỗ trợ để kỳ nghỉ của quý khách trở nên hoàn hảo nhất.
            Hãy gửi yêu cầu dịch vụ hoặc phản hồi bất cứ lúc nào.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 text-8xl opacity-10 select-none hidden md:block">
          🏨
        </div>
      </div>

      {/* 2 NÚT HÀNH ĐỘNG LỚN (AC: 2 nút lớn) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Nút lớn 1: Gửi yêu cầu dịch vụ */}
        <div
          onClick={() => navigate('/guest/requests/new')}
          className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#1e3a5f] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
            🛎️
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#1e3a5f] transition-colors">
                Gửi yêu cầu dịch vụ
              </h2>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gọi món ăn, dọn phòng, thêm khăn gối, hỗ trợ kỹ thuật hoặc phương tiện đưa đón.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center text-xs font-semibold text-[#1e3a5f] group-hover:underline">
                Bấm để gửi yêu cầu ngay &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Nút lớn 2: Góp ý / Khiếu nại */}
        <div
          onClick={() => navigate('/guest/feedbacks')}
          className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#c9a24b] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#c9a24b]/15 text-[#b58d38] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
            💬
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#b58d38] transition-colors">
                Góp ý & Khiếu nại
              </h2>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gửi phản ánh, góp ý nâng cao chất lượng hoặc khiếu nại trực tiếp đến Quản lý khách sạn.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center text-xs font-semibold text-[#c9a24b] group-hover:underline">
                Gửi phản hồi cho Ban quản lý &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Yêu cầu gần đây của khách */}
      <Card
        title="Yêu cầu gần đây của quý khách"
        subtitle="Theo dõi tiến độ xử lý theo thời gian thực"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/guest/requests')}
          >
            Xem tất cả ({recentRequests.length}) &rarr;
          </Button>
        }
      >
        {loading ? (
          <Spinner text="Đang tải các yêu cầu gần đây..." />
        ) : recentRequests.length === 0 ? (
          <EmptyState
            icon="🛎️"
            title="Chưa có yêu cầu nào"
            description="Quý khách chưa gửi yêu cầu dịch vụ nào. Hãy gửi yêu cầu đầu tiên để chúng tôi phục vụ!"
            actionText="Gửi yêu cầu ngay"
            onAction={() => navigate('/guest/requests/new')}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/guest/requests/${req.id}`)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 -mx-5 px-5 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-blue-50 text-blue-700 rounded-lg text-lg shrink-0">
                    🛎️
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        {req.category?.name}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        Phòng {req.stay?.room?.room_number || '101'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">
                      {req.content}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Gửi lúc: {new Date(req.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <Badge status={req.status} />
                  <span className="text-xs text-[#1e3a5f] font-medium hidden sm:inline">
                    Chi tiết &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
