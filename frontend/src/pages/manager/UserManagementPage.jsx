// UserManagementPage.jsx - Quản lý tài khoản và phân quyền người dùng (HCP-30)
import React, { useState, useEffect, useCallback } from 'react';
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
} from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/ui/PageHeader';

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'GUEST', label: 'Khách lưu trú (GUEST)' },
  { value: 'RECEPTIONIST', label: 'Lễ tân (RECEPTIONIST)' },
  { value: 'STAFF', label: 'Nhân viên dịch vụ (STAFF)' },
  { value: 'MANAGER', label: 'Quản lý (MANAGER)' },
];

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Tạo / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'STAFF',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Modal Xác nhận Khóa / Mở khóa (ConfirmDialog)
  const [lockTarget, setLockTarget] = useState(null);
  const [locking, setLocking] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        page,
        limit: 10,
      });
      setUsers(res.data || []);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      toast.error('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm({
      full_name: '',
      email: '',
      password: '',
      role: 'STAFF',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.full_name.trim()) errors.full_name = 'Họ tên không được để trống.';
    if (!editingUser) {
      if (!form.email.trim()) errors.email = 'Email không được để trống.';
      if (!form.password) errors.password = 'Mật khẩu phải từ 6 ký tự trở lên.';
      else if (form.password.length < 6) errors.password = 'Mật khẩu phải từ 6 ký tự trở lên.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        // Cập nhật thông tin / đổi vai trò
        const updatePayload = {
          full_name: form.full_name.trim(),
          role: form.role,
        };
        if (form.password) updatePayload.password = form.password;

        const res = await updateUserApi(editingUser.id, updatePayload);
        toast.success(res.message || 'Cập nhật tài khoản thành công!');
      } else {
        // Tạo tài khoản mới
        const res = await createUserApi({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
        toast.success(res.message || 'Tạo tài khoản mới thành công!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xác nhận khóa / mở khóa
  const handleConfirmToggleLock = async () => {
    if (!lockTarget) return;

    setLocking(true);
    try {
      const res = await toggleUserStatusApi(lockTarget.id);
      toast.success(res.message || 'Thay đổi trạng thái tài khoản thành công!');
      setLockTarget(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đổi trạng thái tài khoản.';
      toast.error(msg);
    } finally {
      setLocking(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'font-mono text-xs text-gray-500',
    },
    {
      header: 'Họ và tên',
      render: (u) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{u.full_name}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      render: (u) => <Badge status={u.role} size="sm" />,
    },
    {
      header: 'Trạng thái',
      render: (u) => (
        <Badge
          status={u.is_active ? 'ACTIVE' : 'LOCKED'}
          size="sm"
        />
      ),
    },
    {
      header: 'Ngày tạo',
      render: (u) => (
        <span className="text-xs text-gray-400">
          {new Date(u.created_at).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEdit(u)}
              className="text-xs text-gray-600 hover:text-[#1e3a5f]"
            >
              Sửa
            </Button>

            {/* Nút Khóa / Mở khóa (AC: hộp xác nhận khi khóa tài khoản) */}
            <Button
              variant={u.is_active ? 'danger' : 'secondary'}
              size="sm"
              disabled={isSelf}
              title={isSelf ? 'Không thể tự khóa tài khoản của mình' : ''}
              onClick={() => setLockTarget(u)}
              className="text-xs"
            >
              {u.is_active ? 'Khóa' : 'Mở khóa'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Tài Khoản & Phân Quyền"
        subtitle="Quản trị người dùng, gán vai trò RBAC và kiểm soát trạng thái hoạt động"
        icon="👥"
        action={
          <Button
            variant="primary"
            size="md"
            icon="+"
            onClick={handleOpenCreate}
            className="bg-[#1e3a5f] hover:bg-[#162c49]"
          >
            Tạo tài khoản mới
          </Button>
        }
      />

      {/* Tìm kiếm và Lọc vai trò */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="🔍 Tìm kiếm theo họ tên hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={ROLE_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* Bảng dữ liệu người dùng */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        pageSize={10}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
        emptyText="Không tìm thấy tài khoản người dùng nào"
      />

      {/* Modal Thêm / Sửa Tài Khoản (HCP-30) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Chỉnh sửa tài khoản #${editingUser.id}` : 'Tạo tài khoản mới'}
        subtitle="Thông tin tài khoản và vai trò phân quyền trên hệ thống"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFormSubmit}
              loading={submitting}
              className="bg-[#1e3a5f] hover:bg-[#162c49]"
            >
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            error={formErrors.full_name}
            placeholder="Nguyễn Văn A"
            required
          />

          <Input
            label="Địa chỉ Email"
            type="email"
            value={form.email}
            disabled={Boolean(editingUser)}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={formErrors.email}
            placeholder="user@demo.com"
            helper={editingUser ? 'Email không thể thay đổi sau khi tạo' : ''}
            required={!editingUser}
          />

          <Input
            label={editingUser ? 'Mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={formErrors.password}
            placeholder="••••••••"
            required={!editingUser}
          />

          <Select
            label="Vai trò người dùng (RBAC)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
            helper="Quyền hạn truy cập các chức năng tương ứng trên hệ thống"
          >
            <option value="GUEST">🛎️ Khách lưu trú (GUEST)</option>
            <option value="RECEPTIONIST">🏨 Lễ tân (RECEPTIONIST)</option>
            <option value="STAFF">🔧 Nhân viên dịch vụ (STAFF)</option>
            <option value="MANAGER">📊 Quản lý / Quản trị viên (MANAGER)</option>
          </Select>
        </form>
      </Modal>

      {/* Hộp xác nhận Khóa / Mở khóa tài khoản (HCP-30 AC) */}
      <ConfirmDialog
        isOpen={Boolean(lockTarget)}
        onClose={() => setLockTarget(null)}
        onConfirm={handleConfirmToggleLock}
        title={lockTarget?.is_active ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={
          lockTarget?.is_active
            ? `Bạn có chắc chắn muốn KHÓA tài khoản của "${lockTarget?.full_name}" (${lockTarget?.email})? Khi bị khóa, người dùng này sẽ không thể đăng nhập vào hệ thống.`
            : `Bạn có muốn MỞ KHÓA tài khoản cho "${lockTarget?.full_name}" (${lockTarget?.email}) để họ có thể đăng nhập bình thường?`
        }
        confirmText={lockTarget?.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
        variant={lockTarget?.is_active ? 'danger' : 'primary'}
        loading={locking}
      />
    </div>
  );
}
