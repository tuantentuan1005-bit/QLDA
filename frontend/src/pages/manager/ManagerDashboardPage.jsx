// ManagerDashboardPage.jsx - Bảng điều khiển quản lý và xuất báo cáo CSV (HCP-38)
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getDashboardStatsApi,
  exportRequestsCsvApi,
} from '../../services/dashboard.service';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';

export default function ManagerDashboardPage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState(null);

  // Bộ lọc khoảng ngày (HCP-38 AC: bộ lọc khoảng ngày)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStatsApi({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      setStats(data);
    } catch (err) {
      console.error('Lỗi lấy số liệu dashboard:', err);
      toast.error('Không thể tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Nút Xuất CSV (HCP-38 AC: nút "Xuất CSV")
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blobData = await exportRequestsCsvApi({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });

      // Tạo đường dẫn tải file trực tiếp trên trình duyệt
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_yeu_cau_dich_vu_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Xuất file CSV thành công! File đã được tải xuống.');
    } catch (err) {
      console.error('Lỗi xuất CSV:', err);
      toast.error('Lỗi khi xuất file báo cáo CSV.');
    } finally {
      setExporting(false);
    }
  };

  const summary = stats?.summary || {
    total_requests: 0,
    in_progress: 0,
    completed: 0,
    avg_duration_minutes: 0,
    avg_rating: 0,
    total_ratings: 0,
  };

  const chartData = stats?.chart_data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng Điều Khiển & Thống Kê Quản Lý"
        subtitle="Tổng hợp hiệu suất hoạt động, chất lượng dịch vụ và xuất báo cáo"
        icon="📊"
        action={
          <Button
            variant="gold"
            size="md"
            loading={exporting}
            onClick={handleExportCsv}
            className="bg-[#c9a24b] hover:bg-[#b58d38] font-semibold"
          >
            📥 Xuất Báo Cáo CSV
          </Button>
        }
      />

      {/* Bộ Lọc Khoảng Ngày (HCP-38 AC) */}
      <Card>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <Input
              label="Từ ngày"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <Input
              label="Đến ngày"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={fetchStats}
              className="bg-[#1e3a5f] hover:bg-[#162c49] w-full sm:w-auto"
            >
              Áp dụng lọc
            </Button>
            {(fromDate || toDate) && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <Spinner fullPage text="Đang tổng hợp dữ liệu thống kê..." />
        </Card>
      ) : (
        <>
          {/* 4 THẺ SỐ LIỆU (HCP-38 AC: 4 thẻ số liệu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Thẻ 1: Tổng yêu cầu */}
            <StatCard
              title="Tổng yêu cầu dịch vụ"
              value={summary.total_requests}
              icon="🛎️"
              color="navy"
            />

            {/* Thẻ 2: Đang xử lý */}
            <StatCard
              title="Yêu cầu đang xử lý"
              value={summary.in_progress}
              icon="⏳"
              color="amber"
            />

            {/* Thẻ 3: Thời gian xử lý trung bình */}
            <StatCard
              title="Thời gian xử lý TB"
              value={`${summary.avg_duration_minutes} phút`}
              icon="⏱️"
              color="blue"
            />

            {/* Thẻ 4: Điểm hài lòng trung bình */}
            <StatCard
              title="Điểm hài lòng trung bình"
              value={`${summary.avg_rating} / 5 ⭐`}
              icon="⭐"
              change={`Dựa trên ${summary.total_ratings} lượt đánh giá`}
              color="gold"
            />
          </div>

          {/* BIỂU ĐỒ CỘT SỐ YÊU CẦU THEO TRẠNG THÁI (HCP-38 AC) */}
          <Card
            title="Số Lượng Yêu Cầu Theo Trạng Thái"
            subtitle="Phân bố các bước trong quy trình xử lý yêu cầu khách sạn"
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <Tooltip
                    formatter={(val) => [`${val} yêu cầu`, 'Số lượng']}
                    contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb', fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
              {chartData.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.label}: <strong className="text-gray-900">{item.count}</strong></span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
