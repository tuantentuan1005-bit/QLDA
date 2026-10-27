# Hướng Dẫn Giải Thích Mã Nguồn & Vấn Đáp Theo Thành Viên (Code Walkthrough)

- **Mã công việc Jira:** `HCP-47`
- **Mục đích:** Giúp cả 5 thành viên nắm rõ file code, hàm xử lý và trả lời câu hỏi phản biện nhanh, chính xác khi bảo vệ đồ án (26/10 – 01/11/2026).

---

## 1. Bảng Phân Công Trách Nhiệm Tổng Thể

| Thành viên | Mảng phụ trách | Các Module / File chính cần nắm |
|------------|----------------|---------------------------------|
| **kieulinh** | Backend & DevOps | `server.js`, `auth.middleware.js`, `auth.controller.js`, `user.controller.js`, `backup-db.js`, cấu hình Render/CORS |
| **Ý Phi** | Frontend (UI/UX & State) | `main.jsx`, `App.jsx`, `AuthContext.jsx`, `api.js`, `components/ui/*`, toàn bộ các trang trong `src/pages/*` |
| **Châu Gia Vĩ** | Database & Kiểm thử | `schema.prisma`, `prisma.js`, `seed.js`, `tests/api.test.js` (Jest + Supertest) |
| **Lê Hoàng Trung Lâm** | Nghiệp vụ & Yêu cầu | `request.controller.js`, `feedback.controller.js`, `rating.controller.js`, quy tắc Validation & luồng trạng thái HCP-29..38 |
| **võ anh tuấn** | Quản lý & Tích hợp | `dashboard.controller.js`, tích hợp Frontend–Backend, quản lý nhánh Git/Jira, kịch bản demo tổng thể |

---

## 2. Giải Thích Ngắn Gọn Từng Module Nghiệp Vụ

### Module 1: Xác thực & Phân quyền (`auth`) — *Story HCP-29*
- **File Backend:** `backend/src/middleware/auth.middleware.js`, `backend/src/controllers/auth.controller.js`
- **File Frontend:** `frontend/src/context/AuthContext.jsx`, `frontend/src/pages/LoginPage.jsx`
- **Cơ chế hoạt động:**
  1. Khi đăng nhập (`POST /api/auth/login`), hệ thống tìm user theo `email`, kiểm tra `is_active === true` (nếu `false` trả ngay `403 Tài khoản đã bị khóa`).
  2. Dùng `bcrypt.compare(password, user.password_hash)` để đối chiếu mật khẩu.
  3. Ký JWT bằng `jwt.sign({ id, email, role, full_name }, process.env.JWT_SECRET, { expiresIn: '7d' })`.
  4. Middleware `authenticate` kiểm tra chữ ký token (thiếu/hết hạn → `401`), còn `authorize(...allowedRoles)` đối chiếu `req.user.role` (sai vai trò → `403`).

### Module 2: Quản lý tài khoản (`users`) — *Story HCP-30*
- **File Backend:** `backend/src/controllers/user.controller.js`, `backend/src/routes/user.routes.js`
- **File Frontend:** `frontend/src/pages/manager/UserManagementPage.jsx`
- **Cơ chế hoạt động:**
  - Toàn bộ router được gắn `router.use(authenticate, authorize('MANAGER'))`.
  - Hỗ trợ tìm kiếm theo tên/email, lọc theo vai trò, phân trang (`skip`, `take`), tạo mới (kiểm tra trùng email trả `409`), cập nhật và khóa/mở khóa (`toggleUserStatus`).
  - Có chốt chặn không cho Quản lý tự khóa chính mình (`if (req.user.id === userId) return res.status(400)`).
  - Mọi câu lệnh Prisma đều dùng `select` không lấy trường `password_hash`.

### Module 3: Yêu cầu dịch vụ (`requests`) — *Story HCP-31, 32, 33, 34*
- **File Backend:** `backend/src/controllers/request.controller.js`
- **File Frontend:** `NewRequestPage.jsx`, `ReceptionistPage.jsx`, `StaffPage.jsx`, `RequestDetailPage.jsx`
- **Cơ chế hoạt động:**
  - **HCP-31 (Tạo yêu cầu):** Chỉ `GUEST` được gửi. Kiểm tra `category_id` tồn tại, gắn với đợt lưu trú (`Stay`), tạo bản ghi trạng thái `MOI` và lưu dòng đầu tiên vào `request_history`.
  - **HCP-32 (Tiếp nhận & Phân công):** Lễ tân (`RECEPTIONIST`) hoặc Quản lý chọn nhân viên `STAFF` đang hoạt động → chuyển trạng thái sang `DA_PHAN_CONG` + ghi `request_history`.
  - **HCP-33 (Cập nhật trạng thái):** Nhân viên được giao (`request.assigned_to === req.user.id`) chuyển trạng thái sang `DANG_XU_LY` rồi `HOAN_TAT` (tự động đóng dấu thời gian `completed_at`).
  - **HCP-34 (Theo dõi):** Khách xem danh sách của riêng mình (`where.stay = { guest_id: req.user.id }`) và xem chi tiết dòng thời gian (`history` sắp xếp tăng dần theo `changed_at`).

### Module 4: Góp ý & Khiếu nại (`feedbacks`) — *Story HCP-35, 36*
- **File Backend:** `backend/src/controllers/feedback.controller.js`, `backend/src/routes/feedback.routes.js`
- **File Frontend:** `GuestFeedbacksPage.jsx`, `ManagerFeedbacksPage.jsx`
- **Cơ chế hoạt động:**
  - **HCP-35:** Khách gửi `GOP_Y` hoặc `KHIEU_NAI` (nội dung 10–1000 ký tự), nhận mã tham chiếu dạng `FB-00001`.
  - **HCP-36:** Chỉ `GUEST` (xem của mình) và `MANAGER` (xem toàn bộ) được gọi `GET /api/feedbacks`. Khi Quản lý nhập nội dung phản hồi (`PATCH /api/feedbacks/:id/respond`), hệ thống lưu `response`, `handled_by` và đổi trạng thái sang `DA_GIAI_QUYET`.

### Module 5: Đánh giá sau dịch vụ (`ratings`) — *Story HCP-37*
- **File Backend:** `backend/src/controllers/rating.controller.js`
- **File Frontend:** Modal đánh giá sao trong `RequestDetailPage.jsx` + component `StarRating.jsx`
- **Cơ chế hoạt động:**
  - Kiểm tra 3 điều kiện nghiêm ngặt trước khi lưu đánh giá (1–5 sao):
    1. Yêu cầu phải thuộc về chính khách đang đăng nhập (`serviceRequest.stay.guest_id === req.user.id`).
    2. Yêu cầu phải ở trạng thái `HOAN_TAT`.
    3. Yêu cầu chưa từng được đánh giá (`!serviceRequest.rating` kết hợp ràng buộc `@unique` trên cột `request_id` trong DB).

### Module 6: Dashboard & Xuất báo cáo CSV (`dashboard`) — *Story HCP-38*
- **File Backend:** `backend/src/controllers/dashboard.controller.js`
- **File Frontend:** `frontend/src/pages/manager/ManagerDashboardPage.jsx`
- **Cơ chế hoạt động:**
  - Tính tổng số yêu cầu, số lượng theo từng trạng thái, thời gian xử lý trung bình (phút, tính từ `created_at` đến `completed_at`) và điểm đánh giá trung bình.
  - Xuất báo cáo CSV có gắn ký tự BOM UTF-8 (`\uFEFF`) ở đầu chuỗi để khi mở bằng Microsoft Excel hiển thị đúng tiếng Việt có dấu.

---

## 3. Cẩm Nang Vấn Đáp Cho Từng Thành Viên

### 👤 1. kieulinh (Backend & DevOps)
- **Câu hỏi thường gặp 1:** *Làm sao hệ thống phân biệt được người chưa đăng nhập (`401`) và người đăng nhập rồi nhưng không đủ quyền (`403`)?*
  - **Trả lời:** Trong `backend/src/middleware/auth.middleware.js`, em tách làm 2 middleware: `authenticate` kiểm tra header `Authorization: Bearer <token>` bằng `jwt.verify()` — nếu thiếu hoặc sai token sẽ trả về `401 Unauthorized`. Nếu đúng, thông tin user được gắn vào `req.user` và đi tiếp qua `authorize(...allowedRoles)` — nếu `req.user.role` không nằm trong danh sách cho phép sẽ trả về `403 Forbidden`.
- **Câu hỏi thường gặp 2:** *Khi triển khai lên Render và Vercel, làm sao tránh lỗi CORS và xử lý việc Render gói miễn phí bị ngủ?*
  - **Trả lời:** Trong `server.js`, CORS được cấu hình `origin: process.env.CLIENT_URL` chỉ cho phép đúng tên miền Vercel gọi vào. Với Render Free Tier tự ngủ sau 15 phút, nhóm đã tạo endpoint `/api/health` để ping đánh thức trước khi demo 3 phút hoặc cài UptimeRobot ping định kỳ 10 phút/lần.

### 👤 2. Ý Phi (Frontend)
- **Câu hỏi thường gặp 1:** *Frontend làm thế nào để tự động gắn JWT token vào mọi API và tự đăng xuất khi token hết hạn?*
  - **Trả lời:** Trong `frontend/src/services/api.js`, em cấu hình 2 Interceptor của Axios: Request Interceptor tự động đọc `localStorage.getItem('token')` gắn vào header `Authorization`; còn Response Interceptor bắt mã lỗi `401`, xóa `localStorage` và chuyển hướng về `/login`.
- **Câu hỏi thường gặp 2:** *Nếu người dùng gõ thẳng đường dẫn `/manager/users` trên thanh địa chỉ trình duyệt khi đang là tài khoản Khách thì sao?*
  - **Trả lời:** Trong `frontend/src/App.jsx`, mọi route đều bọc trong component `<ProtectedRoute allowedRoles={[...]}>`. Nếu `user.role` không khớp, Frontend lập tức điều hướng (`<Navigate />`) về trang chủ đúng vai trò của người đó, đồng thời ở Backend cũng chặn `403` nên hoàn toàn an toàn.

### 👤 3. Châu Gia Vĩ (Database & Kiểm thử)
- **Câu hỏi thường gặp 1:** *Làm sao đảm bảo ở tầng Database mỗi yêu cầu dịch vụ chỉ được đánh giá đúng 1 lần và lịch sử trạng thái không bị mất?*
  - **Trả lời:** Trong `backend/src/prisma/schema.prisma`, bảng `Rating` đặt ràng buộc `@unique` trên khóa ngoại `request_id` (quan hệ 1–1 với `ServiceRequest`). Còn lịch sử trạng thái được tách thành bảng riêng `RequestHistory` (quan hệ 1–nhiều), mỗi lần tạo mới, phân công hay đổi trạng thái đều `INSERT` thêm 1 dòng mới kèm `old_status`, `new_status`, `changed_by` và `changed_at`.
- **Câu hỏi thường gặp 2:** *Bộ kiểm thử tự động trong dự án được viết như thế nào?*
  - **Trả lời:** Em dùng **Jest + Supertest** trong `backend/tests/api.test.js` gồm 14 test case chạy bằng lệnh `npm test`, kiểm tra xuyên suốt từ đăng nhập, chặn RBAC 401/403, tạo yêu cầu, lễ tân phân công, nhân viên hoàn tất, khách đánh giá 1 lần cho tới xuất CSV.

### 👤 4. Lê Hoàng Trung Lâm (Nghiệp vụ & Yêu cầu)
- **Câu hỏi thường gặp 1:** *Quy tắc nghiệp vụ nào ngăn Nhân viên A tự ý bấm hoàn tất công việc được giao cho Nhân viên B?*
  - **Trả lời:** Tại hàm `updateRequestStatus` (`request.controller.js` dòng 345), hệ thống kiểm tra `if (req.user.role === 'STAFF' && request.assigned_to !== req.user.id)` thì trả về `403` với thông báo tiếng Việt. Ngoài ra danh sách việc của nhân viên cũng chỉ lọc những yêu cầu có `assigned_to = req.user.id`.
- **Câu hỏi thường gặp 2:** *Khi nào khách hàng mới được phép đánh giá sao?*
  - **Trả lời:** Phải thỏa đồng thời 3 điều kiện trong `rating.controller.js`: (1) Là chủ của yêu cầu đó, (2) Trạng thái yêu cầu phải là `HOAN_TAT`, và (3) Yêu cầu chưa có đánh giá nào trước đó.

### 👤 5. võ anh tuấn (Quản lý & Tích hợp)
- **Câu hỏi thường gặp 1:** *Nhóm quản lý mã nguồn và liên kết với công việc trên Jira như thế nào?*
  - **Trả lời:** Nhóm chia 10 chức năng thành 10 User Story từ `HCP-29` đến `HCP-38` (cùng các task kỹ thuật `HCP-39`, `HCP-44`, `HCP-46`, `HCP-47`, `HCP-60`). Mỗi chức năng phát triển trên nhánh `feature/HCP-<số>` và mọi commit message đều bắt đầu bằng mã Jira tương ứng để truy vết hai chiều giữa GitHub và Jira.
- **Câu hỏi thường gặp 2:** *Tại sao file báo cáo CSV tải từ Dashboard về mở bằng Excel lại không bị lỗi font tiếng Việt?*
  - **Trả lời:** Trong `dashboard.controller.js` (dòng 154), trước khi ghép nội dung các cột, nhóm thêm ký tự **UTF-8 BOM (`\uFEFF`)** ở đầu file kết hợp header `Content-Type: text/csv; charset=utf-8`, giúp Excel trên Windows nhận diện ngay bảng mã UTF-8.
