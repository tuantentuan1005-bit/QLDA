// RequestDetailPage.jsx - Chi tiết yêu cầu + Timeline + Đánh giá dịch vụ (HCP-34, HCP-37)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestByIdApi } from '../../services/request.service';
import { createRatingApi } from '../../services/rating.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rating Modal state (HCP-37)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRequestByIdApi(id);
      setRequest(data);
    } catch (err) {
      console.error('Lỗi lấy chi tiết yêu cầu:', err);
      toast.error('Không tìm thấy yêu cầu hoặc bạn không có quyền xem.');
      navigate('/guest/requests');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingScore) {
      toast.warning('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    setSubmittingRating(true);
    try {
      const res = await createRatingApi({
        request_id: parseInt(id),
        score: ratingScore,
        comment: ratingComment.trim(),
      });
      toast.success(res.message || 'Đánh giá thành công! Cảm ơn quý khách.');
      setIsRatingModalOpen(false);
      fetchDetail(); // Tải lại để cập nhật hiển thị đánh giá
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá.';
      toast.error(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <Spinner fullPage text="Đang tải chi tiết yêu cầu..." />;
  }

  if (!request) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Chi Tiết Yêu Cầu #HCP-${request.id}`}
        subtitle={`Loại dịch vụ: ${request.category?.name} · Phòng ${request.stay?.room?.room_number || '101'}`}
        icon="🛎️"
        breadcrumb={
          <button
            onClick={() => navigate('/guest/requests')}
            className="text-gray-500 hover:text-[#1e3a5f] transition-colors cursor-pointer"
          >
            &larr; Quay lại danh sách yêu cầu
          </button>
        }
        action={<Badge status={request.status} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái (2 phần): Thông tin yêu cầu & Đánh giá */}
        <div className="md:col-span-2 space-y-6">
          {/* Card Nội dung yêu cầu */}
          <Card title="Nội dung dịch vụ yêu cầu">
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {request.content}
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Thời gian tạo:</p>
                <p className="font-semibold text-gray-700 mt-0.5">
                  {new Date(request.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Thời gian hoàn tất:</p>
                <p className="font-semibold text-gray-700 mt-0.5">
                  {request.completed_at
                    ? new Date(request.completed_at).toLocaleString('vi-VN')
                    : 'Chưa hoàn tất'}
                </p>
              </div>
            </div>
          </Card>

          {/* Card Đánh giá chất lượng (HCP-37) */}
          <Card
            title="Đánh giá mức độ hài lòng"
            subtitle="Phản hồi của quý khách giúp chúng tôi nâng cao chất lượng phục vụ"
          >
            {request.rating ? (
              // Đã đánh giá trước đó
              <div className="p-4 bg-[#faf7ef] rounded-xl border border-[#c9a24b]/20">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={request.rating.score} readonly size="md" />
                  <span className="text-sm font-bold text-gray-800">
                    {request.rating.score} / 5 sao
                  </span>
                </div>
                {request.rating.comment && (
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    "{request.rating.comment}"
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-3">
                  Đã đánh giá lúc:{' '}
                  {new Date(request.rating.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            ) : request.status === 'HOAN_TAT' ? (
              // AC: Chỉ hiển thị nút Đánh giá khi yêu cầu Hoàn tất
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Dịch vụ đã hoàn tất!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Quý khách có hài lòng với chất lượng phục vụ của nhân viên không?
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setIsRatingModalOpen(true)}
                  className="bg-[#c9a24b] hover:bg-[#b58d38]"
                >
                  ⭐ Đánh giá ngay
                </Button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                * Nút đánh giá sẽ tự động hiển thị sau khi nhân viên hoàn tất yêu cầu dịch vụ.
              </p>
            )}
          </Card>
        </div>

        {/* Cột phải: Timeline Dòng thời gian trạng thái (HCP-34) */}
        <div className="space-y-6">
          <Card title="Dòng thời gian xử lý" subtitle="Lịch sử các bước chuyển trạng thái">
            {request.history && request.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {request.history.map((h, idx) => (
                  <div key={h.id || idx} className="relative">
                    {/* Chấm tròn biểu thị bước */}
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#1e3a5f] border-2 border-white shadow-xs"></div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge status={h.new_status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Bởi: <strong className="text-gray-800">{h.changed_by_user?.full_name || 'Hệ thống'}</strong>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(h.changed_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Chưa có lịch sử trạng thái.</p>
            )}
          </Card>

          {/* Thông tin nhân viên phụ trách */}
          <Card title="Nhân viên phụ trách">
            {request.staff ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                  {request.staff.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {request.staff.full_name}
                  </p>
                  <p className="text-xs text-gray-400">{request.staff.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Đang chờ lễ tân phân công nhân viên chuyên trách.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Đánh giá dịch vụ (HCP-37) */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title="Đánh giá chất lượng dịch vụ"
        subtitle={`Yêu cầu #${request.id} · ${request.category?.name}`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRatingModalOpen(false)}
              disabled={submittingRating}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSubmitRating}
              loading={submittingRating}
              className="bg-[#c9a24b] hover:bg-[#b58d38]"
            >
              Gửi đánh giá
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitRating} className="space-y-4">
          <div className="text-center py-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
              Chọn mức độ hài lòng (1 - 5 sao)
            </p>
            <div className="flex justify-center">
              <StarRating
                value={ratingScore}
                onChange={(score) => setRatingScore(score)}
                size="lg"
              />
            </div>
            <p className="text-xs text-gray-600 font-semibold mt-2">
              {ratingScore === 5 && '🌟 Rất tuyệt vời! Hoàn toàn hài lòng.'}
              {ratingScore === 4 && '😊 Dịch vụ tốt, phục vụ chu đáo.'}
              {ratingScore === 3 && '😐 Tạm được, cần cải thiện thêm.'}
              {ratingScore === 2 && '🙁 Chưa hài lòng với dịch vụ.'}
              {ratingScore === 1 && '😡 Rất thất vọng, dịch vụ kém.'}
            </p>
          </div>

          <Textarea
            label="Nhận xét của quý khách (tùy chọn)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            rows={3}
            placeholder="Chia sẻ thêm cảm nhận về tốc độ phục vụ hoặc thái độ của nhân viên..."
          />
        </form>
      </Modal>
    </div>
  );
}
