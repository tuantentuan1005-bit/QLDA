// ReceptionistPage.jsx - Bàn tiếp nhận, tìm kiếm/lọc và phân công nhân viên (HCP-32)
import React, { useState, useEffect, useCallback } from 'react';
import {
  getRequestsApi,
  getStaffListApi,
  assignRequestApi,
} from '../../services/request.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'MOI', label: 'Mới (Chưa phân công)' },
  { value: 'DA_PHAN_CONG', label: 'Đã phân công' },
  { value: 'DANG_XU_LY', label: 'Đang xử lý' },
  { value: 'HOAN_TAT', label: 'Hoàn tất' },
  { value: 'DA_HUY', label: 'Đã hủy' },
];

export default function ReceptionistPage() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Bộ lọc và tìm kiếm (HCP-32 AC: lọc và tìm kiếm trả đúng kết quả)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal phân công (HCP-32 AC: chọn nhân viên -> chuyển "Đã phân công")
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Modal xem chi tiết yêu cầu
  const [viewRequest, setViewRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequestsApi({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setRequests(res.data || []);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách yêu cầu:', err);
      toast.error('Không thể tải danh sách yêu cầu dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, page, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staff = await getStaffListApi();
        setStaffList(staff);
      } catch (err) {
        console.error('Lỗi tải nhân viên:', err);
      }
    };
    fetchStaff();
  }, []);

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedStaffId(req.assigned_to ? String(req.assigned_to) : (staffList[0]?.id ? String(staffList[0].id) : ''));
  };

  const handleConfirmAssign = async () => {
    if (!selectedStaffId) {
      toast.warning('Vui lòng chọn nhân viên thực hiện.');
      return;
    }

    setAssigning(true);
    try {
      const res = await assignRequestApi(selectedRequest.id, selectedStaffId);
      toast.success(res.message || 'Phân công thành công!');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi phân công nhân viên.';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  // Thống kê nhanh trên đầu trang
  const newRequestsCount = requests.filter((r) => r.status === 'MOI').length;

  const columns = [
    {
      header: 'Mã & Phòng',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
            #HCP-{r.id}
          </span>
          <p className="text-xs font-semibold text-[#1e3a5f] mt-1">
            Phòng {r.stay?.room?.room_number || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      header: 'Khách hàng',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800 text-xs sm:text-sm">
            {r.stay?.guest?.full_name || 'Khách vãng lai'}
          </p>
          <p className="text-[11px] text-gray-400">{r.stay?.guest?.email}</p>
        </div>
      ),
    },
    {
      header: 'Loại dịch vụ & Nội dung',
      render: (r) => (
        <div className="max-w-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            {r.category?.name}
          </span>
          <p className="text-xs text-gray-800 line-clamp-2 mt-0.5">{r.content}</p>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      render: (r) => <Badge status={r.status} size="sm" />,
    },
    {
      header: 'Phụ trách',
      render: (r) => (
        <span className="text-xs font-medium text-gray-700">
          {r.staff?.full_name || (
            <span className="text-amber-600 font-normal italic">Chưa phân công</span>
          )}
        </span>
      ),
    },
    {
      header: 'Thời gian',
      render: (r) => (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(r.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
          {new Date(r.created_at).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (r) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewRequest(r)}
            className="text-xs text-gray-600 hover:text-[#1e3a5f]"
          >
            Chi tiết
          </Button>

          {/* AC: xem chi tiết yêu cầu Mới; chọn nhân viên thì chuyển "Đã phân công" */}
          <Button
            variant={r.status === 'MOI' ? 'gold' : 'secondary'}
            size="sm"
            onClick={() => handleOpenAssign(r)}
            className="text-xs"
          >
            {r.assigned_to ? 'Đổi người' : '⚡ Phân công'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bàn Tiếp Nhận Yêu Cầu Lễ Tân"
        subtitle="Tiếp nhận yêu cầu dịch vụ của khách lưu trú và điều phối nhân viên phục vụ"
        icon="🏨"
      />

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tổng yêu cầu"
          value={totalItems}
          icon="📋"
          color="navy"
        />
        <StatCard
          title="Yêu cầu mới chờ phân công"
          value={newRequestsCount}
          icon="🔔"
          color="amber"
        />
        <StatCard
          title="Nhân viên đang trực"
          value={staffList.length}
          icon="🔧"
          color="emerald"
        />
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="🔍 Tìm kiếm theo số phòng, tên khách hoặc nội dung yêu cầu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* Bảng danh sách yêu cầu (có phân trang) */}
      <Table
        columns={columns}
        data={requests}
        loading={loading}
        page={page}
        pageSize={10}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
        emptyText="Không tìm thấy yêu cầu dịch vụ nào"
      />

      {/* Modal Phân công nhân viên (HCP-32) */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Phân công nhân viên xử lý"
        subtitle={`Yêu cầu #HCP-${selectedRequest?.id} · Phòng ${selectedRequest?.stay?.room?.room_number || '101'}`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedRequest(null)}
              disabled={assigning}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAssign}
              loading={assigning}
              className="bg-[#1e3a5f] hover:bg-[#162c49]"
            >
              Xác nhận phân công
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs">
              <p className="font-bold text-blue-900 mb-1">
                {selectedRequest.category?.name}:
              </p>
              <p className="text-gray-700 italic">"{selectedRequest.content}"</p>
            </div>

            <Select
              label="Chọn nhân viên dịch vụ phụ trách"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
              helper="Nhân viên được chọn sẽ nhận được việc trong danh sách công việc của họ"
            >
              <option value="" disabled>-- Chọn nhân viên --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  🔧 {s.full_name} ({s.email})
                </option>
              ))}
            </Select>
          </div>
        )}
      </Modal>

      {/* Modal Xem chi tiết yêu cầu */}
      <Modal
        isOpen={Boolean(viewRequest)}
        onClose={() => setViewRequest(null)}
        title={`Chi tiết yêu cầu #HCP-${viewRequest?.id}`}
        subtitle={`Khách hàng: ${viewRequest?.stay?.guest?.full_name || 'Khách'} · Phòng ${viewRequest?.stay?.room?.room_number || '101'}`}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setViewRequest(null)}>
            Đóng
          </Button>
        }
      >
        {viewRequest && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Nội dung yêu cầu
              </p>
              <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">
                {viewRequest.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Loại dịch vụ:</p>
                <p className="font-semibold text-gray-800">{viewRequest.category?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Trạng thái:</p>
                <div className="mt-0.5"><Badge status={viewRequest.status} size="sm" /></div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Nhân viên phụ trách:</p>
                <p className="font-semibold text-gray-800">
                  {viewRequest.staff?.full_name || 'Chưa phân công'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Thời gian tạo:</p>
                <p className="font-semibold text-gray-800">
                  {new Date(viewRequest.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
