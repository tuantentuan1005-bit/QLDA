// StaffPage.jsx - Danh sách công việc và cập nhật trạng thái xử lý (HCP-33)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRequestsApi, updateRequestStatusApi } from '../../services/request.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StaffPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Backend tự động lọc theo req.user.id nếu vai trò là STAFF
      const res = await getRequestsApi({ my_tasks: 'true' });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Lỗi tải công việc:', err);
      toast.error('Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Đổi trạng thái xử lý (AC: chuyển "Đang xử lý" / "Hoàn tất")
  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const res = await updateRequestStatusApi(requestId, newStatus);
      toast.success(res.message || 'Cập nhật trạng thái thành công!');
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái.';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingTasks = requests.filter((r) => r.status === 'DA_PHAN_CONG');
  const inProgressTasks = requests.filter((r) => r.status === 'DANG_XU_LY');
  const completedTasks = requests.filter((r) => r.status === 'HOAN_TAT');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Công Việc Phục Vụ Của Tôi"
        subtitle={`Xin chào ${user?.full_name}, đây là danh sách yêu cầu dịch vụ được phân công cho bạn`}
        icon="🔧"
      />

      {/* Thẻ thống kê tiến độ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Việc chờ bắt đầu"
          value={pendingTasks.length}
          icon="⏳"
          color="amber"
        />
        <StatCard
          title="Đang thực hiện"
          value={inProgressTasks.length}
          icon="⚡"
          color="blue"
        />
        <StatCard
          title="Đã hoàn thành"
          value={completedTasks.length}
          icon="✅"
          color="emerald"
        />
      </div>

      {/* Danh sách nhiệm vụ */}
      <Card title="Danh sách yêu cầu được giao" subtitle="Cập nhật tiến độ theo từng bước xử lý">
        {loading ? (
          <Spinner text="Đang tải nhiệm vụ..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Hiện tại bạn không có việc nào"
            description="Tất cả các công việc được phân công đã được hoàn tất hoặc đang chờ lễ tân bàn giao."
          />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isAssignedToMe = req.assigned_to === user?.id;
              const isUpdating = updatingId === req.id;

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-xl border transition-all ${
                    req.status === 'DANG_XU_LY'
                      ? 'border-orange-300 bg-orange-50/20'
                      : req.status === 'HOAN_TAT'
                      ? 'border-gray-200 bg-gray-50/40 opacity-80'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          #HCP-{req.id}
                        </span>
                        <span className="text-xs font-bold text-[#1e3a5f]">
                          Phòng {req.stay?.room?.room_number || '101'}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {req.category?.name}
                        </span>
                        <Badge status={req.status} size="sm" />
                      </div>

                      <p className="text-sm text-gray-900 font-medium pt-1">
                        {req.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                        <span>Khách: <strong className="text-gray-600">{req.stay?.guest?.full_name || 'Khách'}</strong></span>
                        <span>· Nhận lúc: {new Date(req.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {req.completed_at && (
                          <span className="text-emerald-600 font-medium">
                            · Hoàn tất: {new Date(req.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* NÚT THAO TÁC CẬP NHẬT TRẠNG THÁI (HCP-33) */}
                    {/* AC: chỉ nhân viên được phân công mới sửa được. Ẩn nút với việc không phải của tôi. */}
                    {isAssignedToMe && (
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        {/* Bước 1: Đổi sang Đang xử lý */}
                        {req.status === 'DA_PHAN_CONG' && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isUpdating}
                            onClick={() => handleUpdateStatus(req.id, 'DANG_XU_LY')}
                            className="w-full bg-[#1e3a5f] hover:bg-[#162c49]"
                          >
                            ▶ Bắt đầu xử lý
                          </Button>
                        )}

                        {/* Bước 2: Đổi sang Hoàn tất */}
                        {req.status === 'DANG_XU_LY' && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isUpdating}
                            onClick={() => handleUpdateStatus(req.id, 'HOAN_TAT')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            ✓ Hoàn tất công việc
                          </Button>
                        )}

                        {/* Đã hoàn tất */}
                        {req.status === 'HOAN_TAT' && (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 py-1">
                            <span>✅</span> Đã hoàn tất
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
