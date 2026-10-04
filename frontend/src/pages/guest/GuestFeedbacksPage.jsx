// GuestFeedbacksPage.jsx - Gửi Góp ý & Khiếu nại và xem phản hồi từ Quản lý (HCP-35)
import React, { useState, useEffect, useCallback } from 'react';
import { createFeedbackApi, getFeedbacksApi } from '../../services/feedback.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function GuestFeedbacksPage() {
  const toast = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: 'GOP_Y',
    content: '',
  });

  const [error, setError] = useState('');
  const [newRefCode, setNewRefCode] = useState('');

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeedbacksApi();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy phản hồi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (AC: nội dung trống báo lỗi)
    if (!form.content.trim()) {
      setError('Nội dung góp ý hoặc khiếu nại không được để trống.');
      return;
    }
    if (form.content.trim().length < 10) {
      setError('Vui lòng nhập chi tiết hơn (tối thiểu 10 ký tự).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await createFeedbackApi({
        type: form.type,
        content: form.content.trim(),
      });

      // AC: khách nhận mã tham chiếu
      setNewRefCode(res.ref_code);
      toast.success(res.message || 'Gửi phản hồi thành công!');

      // Reset form
      setForm({ type: 'GOP_Y', content: '' });
      fetchFeedbacks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Góp Ý & Khiếu Nại Dịch Vụ"
        subtitle="Gửi ý kiến đóng góp hoặc phản ánh trực tiếp tới Ban Quản Lý khách sạn"
        icon="💬"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form gửi mới (Cột trái 1 phần) */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Gửi phản ánh mới">
            {newRefCode && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-800">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <span>✅</span> Gửi thành công!
                </p>
                <p className="mt-1">
                  Mã tham chiếu của bạn:{' '}
                  <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {newRefCode}
                  </strong>
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">
                  Ban quản lý sẽ phản hồi trong thời gian sớm nhất.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Loại phản ánh"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="GOP_Y">💡 Góp ý xây dựng (cải thiện chất lượng)</option>
                <option value="KHIEU_NAI">⚠️ Khiếu nại dịch vụ (sự cố cần xử lý)</option>
              </Select>

              <Textarea
                label="Nội dung chi tiết"
                value={form.content}
                onChange={(e) => {
                  setForm({ ...form, content: e.target.value });
                  if (error) setError('');
                }}
                error={error}
                required
                rows={5}
                placeholder="Mô tả cụ thể trải nghiệm hoặc vấn đề của quý khách..."
                helper="Nội dung sẽ được bảo mật và chuyển thẳng đến quản lý trực tiếp"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                className="w-full bg-[#1e3a5f] hover:bg-[#162c49]"
              >
                Gửi tới Quản lý
              </Button>
            </form>
          </Card>
        </div>

        {/* Danh sách phản hồi đã gửi & phản hồi từ quản lý (Cột phải 2 phần) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Lịch sử phản hồi của quý khách"
            subtitle="Theo dõi trạng thái tiếp nhận và câu trả lời từ Ban Quản Lý"
          >
            {loading ? (
              <Spinner text="Đang tải danh sách phản hồi..." />
            ) : feedbacks.length === 0 ? (
              <EmptyState
                icon="💬"
                title="Chưa có phản hồi nào"
                description="Quý khách chưa gửi góp ý hoặc khiếu nại nào."
              />
            ) : (
              <div className="space-y-4">
                {feedbacks.map((fb) => {
                  const refCode = `FB-${String(fb.id).padStart(5, '0')}`;
                  return (
                    <div
                      key={fb.id}
                      className="p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1e3a5f]/30 transition-colors space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {refCode}
                          </span>
                          <Badge status={fb.type} size="sm" />
                          <Badge status={fb.status} size="sm" />
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(fb.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {fb.content}
                      </p>

                      {/* Phản hồi từ Quản lý (nếu có) */}
                      {fb.response ? (
                        <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs mt-2">
                          <div className="flex items-center gap-1.5 text-[#1e3a5f] font-bold mb-1">
                            <span>👔</span>
                            <span>
                              Phản hồi từ Quản lý ({fb.handler?.full_name || 'Ban Quản Lý'}):
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed pl-5 font-normal">
                            {fb.response}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 italic flex items-center gap-1">
                          <span>⏳</span> Đang chờ Ban Quản Lý xem xét và phản hồi...
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
