// ManagerFeedbacksPage.jsx - Xử lý khiếu nại và phản hồi khách hàng (HCP-36)
import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbacksApi, respondFeedbackApi } from '../../services/feedback.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

export default function ManagerFeedbacksPage() {
  const toast = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Xử lý & Phản hồi (HCP-36)
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeedbacksApi({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 10,
      });
      setFeedbacks(res.data || []);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách phản hồi:', err);
      toast.error('Không thể tải danh sách khiếu nại & góp ý.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page, toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenRespond = (fb) => {
    setSelectedFeedback(fb);
    setResponseText(fb.response || '');
  };

  const handleConfirmRespond = async () => {
    if (!responseText.trim()) {
      toast.warning('Vui lòng nhập nội dung câu trả lời cho khách.');
      return;
    }

    setSubmittingResponse(true);
    try {
      const res = await respondFeedbackApi(selectedFeedback.id, responseText.trim());
      toast.success(res.message || 'Đã gửi phản hồi và giải quyết thành công!');
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi khi gửi phản hồi.';
      toast.error(msg);
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Thống kê nhanh
  const complaintsCount = feedbacks.filter((f) => f.type === 'KHIEU_NAI').length;
  const pendingCount = feedbacks.filter((f) => f.status === 'MOI').length;

  const columns = [
    {
      header: 'Mã tham chiếu',
      render: (f) => (
        <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
          FB-{String(f.id).padStart(5, '0')}
        </span>
      ),
    },
    {
      header: 'Khách hàng',
      render: (f) => (
        <div>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">
            {f.guest?.full_name || 'Khách lưu trú'}
          </p>
          <p className="text-[11px] text-gray-400">{f.guest?.email}</p>
        </div>
      ),
    },
    {
      header: 'Phân loại',
      render: (f) => <Badge status={f.type} size="sm" />,
    },
    {
      header: 'Nội dung phản ánh',
      render: (f) => (
        <div className="max-w-xs sm:max-w-sm">
          <p className="text-xs text-gray-800 line-clamp-2">{f.content}</p>
          {f.response && (
            <p className="text-[11px] text-emerald-700 italic mt-1 line-clamp-1">
              ✓ Đã trả lời: "{f.response}"
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      render: (f) => <Badge status={f.status} size="sm" />,
    },
    {
      header: 'Ngày gửi',
      render: (f) => (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(f.created_at).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (f) => (
        <Button
          variant={f.status === 'MOI' ? 'gold' : 'secondary'}
          size="sm"
          onClick={() => handleOpenRespond(f)}
          className="text-xs whitespace-nowrap"
        >
          {f.response ? 'Xem / Sửa' : '⚡ Xử lý & Phản hồi'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xử Lý Góp Ý & Khiếu Nại"
        subtitle="Tiếp nhận phản ánh của khách hàng, nhập câu trả lời và đóng khiếu nại"
        icon="⚖️"
      />

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tổng phản ánh"
          value={totalItems}
          icon="💬"
          color="navy"
        />
        <StatCard
          title="Khiếu nại cần giải quyết"
          value={complaintsCount}
          icon="⚠️"
          color="rose"
        />
        <StatCard
          title="Chưa phản hồi (Mới)"
          value={pendingCount}
          icon="⏳"
          color="amber"
        />
      </div>

      {/* Bộ lọc */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Lọc theo loại phản hồi"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả loại (Góp ý & Khiếu nại)</option>
            <option value="GOP_Y">💡 Góp ý xây dựng</option>
            <option value="KHIEU_NAI">⚠️ Khiếu nại dịch vụ</option>
          </Select>

          <Select
            label="Lọc theo trạng thái xử lý"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="MOI">Mới (Chưa giải quyết)</option>
            <option value="DA_GIAI_QUYET">Đã giải quyết</option>
          </Select>
        </div>
      </Card>

      {/* Bảng danh sách khiếu nại */}
      <Table
        columns={columns}
        data={feedbacks}
        loading={loading}
        page={page}
        pageSize={10}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
        emptyText="Không có góp ý hoặc khiếu nại nào"
      />

      {/* Modal Phản Hồi và Đổi Đã Giải Quyết (HCP-36) */}
      <Modal
        isOpen={Boolean(selectedFeedback)}
        onClose={() => setSelectedFeedback(null)}
        title={`Xử lý phản ánh #FB-${String(selectedFeedback?.id).padStart(5, '0')}`}
        subtitle={`Người gửi: ${selectedFeedback?.guest?.full_name || 'Khách'} (${selectedFeedback?.guest?.email})`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedFeedback(null)}
              disabled={submittingResponse}
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmRespond}
              loading={submittingResponse}
              className="bg-[#1e3a5f] hover:bg-[#162c49]"
            >
              Gửi phản hồi & Đóng khiếu nại
            </Button>
          </>
        }
      >
        {selectedFeedback && (
          <div className="space-y-4">
            {/* Nội dung khiếu nại của khách */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge status={selectedFeedback.type} size="sm" />
                <Badge status={selectedFeedback.status} size="sm" />
                <span className="text-xs text-gray-400">
                  Gửi lúc: {new Date(selectedFeedback.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-800 text-sm font-medium leading-relaxed">
                "{selectedFeedback.content}"
              </div>
            </div>

            {/* Ô nhập phản hồi của quản lý */}
            <div>
              <Textarea
                label="Phản hồi chính thức của Ban Quản Lý"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Nhập nội dung giải trình, lời xin lỗi hoặc hướng giải quyết đền bù cho khách..."
                helper="Câu trả lời này sẽ hiển thị trực tiếp trong trang quản lý phản hồi của khách hàng"
                required
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
