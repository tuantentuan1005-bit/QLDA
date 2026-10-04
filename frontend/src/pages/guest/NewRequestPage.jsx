// NewRequestPage.jsx - Form gửi yêu cầu dịch vụ mới (HCP-31)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoriesApi, createRequestApi } from '../../services/request.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';

export default function NewRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    category_id: '',
    content: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, category_id: String(data[0].id) }));
        }
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
        toast.error('Không thể tải danh sách loại dịch vụ.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra hợp lệ đầu vào phía client (AC: thiếu loại dịch vụ/nội dung thì báo lỗi)
    const newErrors = {};
    if (!form.category_id) {
      newErrors.category_id = 'Vui lòng chọn loại dịch vụ.';
    }
    if (!form.content.trim()) {
      newErrors.content = 'Vui lòng nhập chi tiết yêu cầu của quý khách.';
    } else if (form.content.trim().length < 5) {
      newErrors.content = 'Nội dung yêu cầu quá ngắn (tối thiểu 5 ký tự).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createRequestApi({
        category_id: parseInt(form.category_id),
        content: form.content.trim(),
      });

      toast.success(res.message || 'Yêu cầu của quý khách đã được gửi tới Lễ tân!');
      navigate('/guest/requests');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Gửi Yêu Cầu Dịch Vụ Mới"
        subtitle="Chọn loại dịch vụ và mô tả nhu cầu để nhân viên phục vụ tốt nhất"
        icon="✍️"
        breadcrumb={
          <button
            onClick={() => navigate('/guest')}
            className="text-gray-500 hover:text-[#1e3a5f] transition-colors cursor-pointer"
          >
            &larr; Quay lại Tổng quan
          </button>
        }
      />

      <Card>
        {loadingCategories ? (
          <Spinner text="Đang tải danh mục dịch vụ..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Chọn loại dịch vụ */}
            <Select
              label="Loại dịch vụ cần hỗ trợ"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              error={errors.category_id}
              required
              helper="Chọn dịch vụ phù hợp để lễ tân phân công đúng bộ phận chuyên trách"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.description ? `— ${cat.description}` : ''}
                </option>
              ))}
            </Select>

            {/* Chi tiết nội dung yêu cầu */}
            <Textarea
              label="Chi tiết nội dung yêu cầu"
              name="content"
              value={form.content}
              onChange={handleChange}
              error={errors.content}
              required
              rows={4}
              placeholder="Ví dụ: Xin vui lòng mang thêm 2 chiếc gối mềm và 1 bộ khăn tắm lên phòng 101 giúp tôi..."
              helper="Mô tả cụ thể món ăn, thời gian mong muốn hoặc vấn đề kỹ thuật trong phòng"
            />

            {/* Gợi ý yêu cầu nhanh */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Gợi ý nhanh (nhấn để điền):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Dọn phòng và thay ga trải giường mới',
                  'Cho tôi thêm 2 chai nước suối và 2 khăn tắm',
                  'Điều hòa trong phòng không mát, nhờ kỹ thuật kiểm tra',
                  'Cần gọi taxi đưa ra sân bay vào 7:00 sáng mai',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, content: sample }));
                      setErrors((prev) => ({ ...prev, content: '' }));
                    }}
                    className="text-xs bg-white hover:bg-blue-50 border border-gray-200 text-gray-700 hover:text-[#1e3a5f] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút gửi form */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/guest')}
                disabled={submitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                className="bg-[#1e3a5f] hover:bg-[#162c49]"
              >
                Gửi yêu cầu ngay
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
