// tests/api.test.js - Bộ kiểm thử tự động API Backend (Jest + Supertest)
// Mã công việc Jira: HCP-44 (Phụ trách: Châu Gia Vĩ)
// Bao phủ: Đăng nhập, Phân quyền RBAC, Tạo yêu cầu, Phân công, Cập nhật trạng thái, Đánh giá, Dashboard

const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/prisma/prisma');

// Tăng timeout cho kết nối PostgreSQL trên Neon
jest.setTimeout(30000);

describe('HotelCarePortal Backend API Tests (HCP-44)', () => {
  let guestToken = '';
  let receptionToken = '';
  let staffToken = '';
  let managerToken = '';
  let staffUserId = null;
  let validCategoryId = null;
  let createdRequestId = null;

  // Đóng kết nối Prisma sau khi chạy xong toàn bộ test
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // =========================================================================
  // 1. ĐĂNG NHẬP (HCP-29)
  // =========================================================================
  describe('1. Đăng nhập & Xác thực (HCP-29)', () => {
    test('TC01 - Đăng nhập sai mật khẩu phải trả về 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'guest@demo.com', password: 'WrongPassword123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/không đúng/i);
    });

    test('TC02 - Đăng nhập thiếu mật khẩu phải trả về 400 (Validation tiếng Việt)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'guest@demo.com', password: '' });

      expect(res.statusCode).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('TC03 - Đăng nhập thành công cả 4 vai trò (GUEST, RECEPTIONIST, STAFF, MANAGER) và không lộ password_hash', async () => {
      const guestRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'guest@demo.com', password: 'Demo@123' });
      expect(guestRes.statusCode).toBe(200);
      expect(guestRes.body.token).toBeDefined();
      expect(guestRes.body.user.password_hash).toBeUndefined();
      guestToken = guestRes.body.token;

      const recepRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'receptionist@demo.com', password: 'Demo@123' });
      expect(recepRes.statusCode).toBe(200);
      receptionToken = recepRes.body.token;

      const staffRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'staff@demo.com', password: 'Demo@123' });
      expect(staffRes.statusCode).toBe(200);
      staffToken = staffRes.body.token;
      staffUserId = staffRes.body.user.id;

      const managerRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'manager@demo.com', password: 'Demo@123' });
      expect(managerRes.statusCode).toBe(200);
      managerToken = managerRes.body.token;
    });
  });

  // =========================================================================
  // 2. PHÂN QUYỀN RBAC (HCP-29, HCP-30, HCP-35)
  // =========================================================================
  describe('2. Phân quyền RBAC (401 khi không có token, 403 khi sai vai trò)', () => {
    test('TC04 - Gọi API bảo vệ mà không gửi token phải trả về 401', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
    });

    test('TC05 - GUEST truy cập danh sách tài khoản (/api/users) phải bị chặn 403', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${guestToken}`);
      expect(res.statusCode).toBe(403);
    });

    test('TC06 - STAFF truy cập danh sách góp ý/khiếu nại (/api/feedbacks) phải bị chặn 403', async () => {
      const res = await request(app)
        .get('/api/feedbacks')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  // =========================================================================
  // 3. TẠO YÊU CẦU DỊCH VỤ (HCP-31)
  // =========================================================================
  describe('3. Tạo yêu cầu dịch vụ (HCP-31)', () => {
    test('TC07 - Lấy danh mục dịch vụ và GUEST tạo yêu cầu mới thành công (201, trạng thái MOI)', async () => {
      const catRes = await request(app)
        .get('/api/requests/categories')
        .set('Authorization', `Bearer ${guestToken}`);
      expect(catRes.statusCode).toBe(200);
      expect(catRes.body.length).toBeGreaterThan(0);
      validCategoryId = catRes.body[0].id;

      const createRes = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          category_id: validCategoryId,
          content: 'Yêu cầu dọn phòng và thêm 2 chai nước suối (Jest Test)',
        });

      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.request.status).toBe('MOI');
      createdRequestId = createRes.body.request.id;
    });

    test('TC08 - Gửi yêu cầu với category_id không tồn tại phải trả về 400', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          category_id: 999999,
          content: 'Yêu cầu có mã danh mục không tồn tại',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/không tồn tại/i);
    });
  });

  // =========================================================================
  // 4. TIẾP NHẬN & PHÂN CÔNG (HCP-32)
  // =========================================================================
  describe('4. Tiếp nhận & Phân công nhân viên (HCP-32)', () => {
    test('TC09 - Lễ tân (RECEPTIONIST) phân công yêu cầu cho nhân viên thành công (DA_PHAN_CONG)', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}/assign`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ staff_id: staffUserId });

      expect(res.statusCode).toBe(200);
      expect(res.body.request.status).toBe('DA_PHAN_CONG');
      expect(res.body.request.assigned_to).toBe(staffUserId);
    });
  });

  // =========================================================================
  // 5. CẬP NHẬT TRẠNG THÁI (HCP-33)
  // =========================================================================
  describe('5. Nhân viên cập nhật trạng thái xử lý (HCP-33)', () => {
    test('TC10 - Nhân viên được giao cập nhật trạng thái sang DANG_XU_LY rồi HOAN_TAT', async () => {
      // Chuyển sang Đang xử lý
      const step1 = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'DANG_XU_LY' });
      expect(step1.statusCode).toBe(200);
      expect(step1.body.request.status).toBe('DANG_XU_LY');

      // Chuyển sang Hoàn tất
      const step2 = await request(app)
        .patch(`/api/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'HOAN_TAT' });
      expect(step2.statusCode).toBe(200);
      expect(step2.body.request.status).toBe('HOAN_TAT');
      expect(step2.body.request.completed_at).toBeTruthy();
    });
  });

  // =========================================================================
  // 6. ĐÁNH GIÁ DỊCH VỤ (HCP-37)
  // =========================================================================
  describe('6. Khách đánh giá dịch vụ sau khi Hoàn tất (HCP-37)', () => {
    test('TC11 - Khách đánh giá 5 sao cho yêu cầu đã HOAN_TAT thành công (201)', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          request_id: createdRequestId,
          score: 5,
          comment: 'Nhân viên phục vụ rất nhanh và chu đáo!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.rating.score).toBe(5);
    });

    test('TC12 - Khách đánh giá lần thứ 2 cho cùng một yêu cầu phải bị từ chối (400)', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          request_id: createdRequestId,
          score: 4,
          comment: 'Đánh giá lại lần 2',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/đã được đánh giá/i);
    });
  });

  // =========================================================================
  // 7. DASHBOARD & XUẤT BÁO CÁO CSV (HCP-38)
  // =========================================================================
  describe('7. Dashboard thống kê & Xuất CSV (HCP-38)', () => {
    test('TC13 - Quản lý (MANAGER) lấy số liệu thống kê Dashboard thành công (200)', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(typeof res.body.summary.total_requests).toBe('number');
      expect(Array.isArray(res.body.chart_data)).toBe(true);
    });

    test('TC14 - Quản lý (MANAGER) xuất báo cáo CSV thành công (200, text/csv)', async () => {
      const res = await request(app)
        .get('/api/dashboard/export-csv')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('Mã Yêu Cầu');
    });
  });
});
