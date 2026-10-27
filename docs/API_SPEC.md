# Đặc Tả Giao Tiếp API (API Contract Specification)

- **Mã công việc Jira:** `HCP-60`
- **Base URL (Local):** `http://localhost:3000/api`
- **Base URL (Production):** `https://<ten-backend>.onrender.com/api`
- **Định dạng dữ liệu:** `application/json` (trừ API xuất CSV trả về `text/csv; charset=utf-8`)
- **Cơ chế xác thực:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Bảng Tổng Hợp Toàn Bộ Endpoints & Phân Quyền (RBAC)

| STT | Phân hệ | Method | Endpoint | Vai trò được phép | Mã Story |
|-----|---------|--------|----------|-------------------|----------|
| 1 | Health | `GET` | `/api/health` | Public (Mọi người) | — |
| 2 | Auth | `POST` | `/api/auth/login` | Public (Mọi người) | HCP-29 |
| 3 | Auth | `GET` | `/api/auth/me` | `GUEST`, `RECEPTIONIST`, `STAFF`, `MANAGER` | HCP-29 |
| 4 | Users | `GET` | `/api/users` | `MANAGER` | HCP-30 |
| 5 | Users | `POST` | `/api/users` | `MANAGER` | HCP-30 |
| 6 | Users | `PUT` | `/api/users/:id` | `MANAGER` | HCP-30 |
| 7 | Users | `PATCH` | `/api/users/:id/toggle-status` | `MANAGER` | HCP-30 |
| 8 | Requests | `GET` | `/api/requests/categories` | Đã đăng nhập (Mọi vai trò) | HCP-31 |
| 9 | Requests | `GET` | `/api/requests/staff-list` | `RECEPTIONIST`, `MANAGER` | HCP-32 |
| 10 | Requests | `POST` | `/api/requests` | `GUEST` | HCP-31 |
| 11 | Requests | `GET` | `/api/requests` | Đã đăng nhập (lọc theo vai trò) | HCP-32, 33, 34 |
| 12 | Requests | `GET` | `/api/requests/:id` | Đã đăng nhập (GUEST chỉ xem của mình) | HCP-34 |
| 13 | Requests | `PATCH` | `/api/requests/:id/assign` | `RECEPTIONIST`, `MANAGER` | HCP-32 |
| 14 | Requests | `PATCH` | `/api/requests/:id/status` | `STAFF` (được giao), `MANAGER` | HCP-33 |
| 15 | Feedbacks | `POST` | `/api/feedbacks` | `GUEST` | HCP-35 |
| 16 | Feedbacks | `GET` | `/api/feedbacks` | `GUEST` (của mình), `MANAGER` (toàn bộ) | HCP-35, 36 |
| 17 | Feedbacks | `PATCH` | `/api/feedbacks/:id/respond` | `MANAGER` | HCP-36 |
| 18 | Ratings | `POST` | `/api/ratings` | `GUEST` | HCP-37 |
| 19 | Dashboard | `GET` | `/api/dashboard/stats` | `MANAGER` | HCP-38 |
| 20 | Dashboard | `GET` | `/api/dashboard/export-csv` | `MANAGER` | HCP-38 |

---

## 2. Quy Ước Mã Trạng Thái HTTP (Error Codes)

| Mã HTTP | Ý nghĩa | Trường hợp trả về |
|---------|---------|-------------------|
| `200 OK` | Thành công | Lấy dữ liệu, đăng nhập hoặc cập nhật thành công |
| `201 Created` | Tạo mới thành công | Tạo tài khoản, yêu cầu dịch vụ, góp ý/khiếu nại, đánh giá |
| `400 Bad Request` | Dữ liệu không hợp lệ | Lỗi validation tiếng Việt, tự khóa chính mình, đánh giá khi chưa `HOAN_TAT` hoặc đánh giá lần 2 |
| `401 Unauthorized` | Chưa xác thực | Không gửi JWT token, token hết hạn hoặc sai mật khẩu đăng nhập |
| `403 Forbidden` | Không đủ quyền | Sai vai trò RBAC, tài khoản bị khóa (`is_active = false`), khách xem yêu cầu của người khác, nhân viên cập nhật việc không giao cho mình |
| `404 Not Found` | Không tìm thấy | ID tài khoản, yêu cầu hoặc phản hồi không tồn tại |
| `409 Conflict` | Trùng dữ liệu | Tạo tài khoản mới bị trùng `email` đã có trong hệ thống |
| `500 Internal Server Error` | Lỗi máy chủ | Lỗi hệ thống hoặc mất kết nối cơ sở dữ liệu |

---

## 3. Chi Tiết Từng Nhóm API

### 3.1. Xác thực & Phân quyền (` HCP-29 `)

#### `POST /api/auth/login`
- **Vai trò:** Public
- **Input (Body JSON):**
  ```json
  {
    "email": "guest@demo.com",
    "password": "Demo@123"
  }
  ```
- **Output `200 OK`:**
  ```json
  {
    "message": "Đăng nhập thành công.",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 9,
      "full_name": "Nguyễn Văn An",
      "email": "guest@demo.com",
      "role": "GUEST"
    }
  }
  ```
- **Mã lỗi:**
  - `400`: Email không hợp lệ / Mật khẩu dưới 6 ký tự.
  - `401`: `"Email hoặc mật khẩu không đúng."`
  - `403`: `"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý."`

#### `GET /api/auth/me`
- **Vai trò:** Mọi tài khoản đã đăng nhập
- **Output `200 OK`:** `{ "user": { "id", "full_name", "email", "role", "is_active", "created_at" } }`
- **Mã lỗi:** `401` (Không có token hoặc tài khoản đã bị khóa).

---

### 3.2. Quản lý tài khoản (` HCP-30 `)

#### `GET /api/users`
- **Vai trò:** `MANAGER`
- **Input (Query):** `?role=STAFF&search=an&page=1&limit=10`
- **Output `200 OK`:**
  ```json
  {
    "data": [
      {
        "id": 7,
        "full_name": "Lê Văn Cường",
        "email": "staff@demo.com",
        "role": "STAFF",
        "is_active": true,
        "created_at": "2026-10-07T14:40:46.099Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
  }
  ```
- **Mã lỗi:** `401`, `403`.

#### `POST /api/users`
- **Vai trò:** `MANAGER`
- **Input (Body JSON):**
  ```json
  {
    "full_name": "Trần Văn Mới",
    "email": "newstaff@demo.com",
    "password": "Demo@123",
    "role": "STAFF"
  }
  ```
- **Output `201 Created`:** `{ "message": "Tạo tài khoản thành công.", "user": { ... } }` (*không chứa `password_hash`*)
- **Mã lỗi:** `400` (Validation), `401`, `403`, `409` (`"Email này đã được sử dụng trong hệ thống."`).

#### `PUT /api/users/:id`
- **Vai trò:** `MANAGER`
- **Input (Body JSON):** `{ "full_name": "Tên Mới", "role": "RECEPTIONIST", "password": "NewPassword123" }` *(các trường đều optional)*
- **Output `200 OK`:** `{ "message": "Cập nhật tài khoản thành công.", "user": { ... } }`
- **Mã lỗi:** `400`, `401`, `403`, `404`.

#### `PATCH /api/users/:id/toggle-status`
- **Vai trò:** `MANAGER`
- **Input:** Không cần body (`:id` trên URL)
- **Output `200 OK`:** `{ "message": "Khóa tài khoản thành công.", "user": { "id": 9, "is_active": false, ... } }`
- **Mã lỗi:** `400` (`"Bạn không thể tự khóa tài khoản của chính mình."`), `404`.

---

### 3.3. Yêu cầu dịch vụ (` HCP-31, HCP-32, HCP-33, HCP-34 `)

#### `GET /api/requests/categories`
- **Vai trò:** Đã đăng nhập
- **Output `200 OK`:** `[{ "id": 1, "name": "Ăn uống & Đồ uống", "description": "..." }, ...]`

#### `GET /api/requests/staff-list`
- **Vai trò:** `RECEPTIONIST`, `MANAGER`
- **Output `200 OK`:** Danh sách nhân viên `STAFF` đang hoạt động (`is_active: true`).

#### `POST /api/requests` (`HCP-31`)
- **Vai trò:** `GUEST`
- **Input (Body JSON):**
  ```json
  {
    "category_id": 1,
    "content": "Cho tôi 2 chai nước suối và 1 khăn tắm mới lên phòng"
  }
  ```
- **Output `201 Created`:**
  ```json
  {
    "message": "Gửi yêu cầu dịch vụ thành công! Lễ tân sẽ tiếp nhận ngay.",
    "request": {
      "id": 25,
      "stay_id": 1,
      "category_id": 1,
      "content": "Cho tôi 2 chai nước suối và 1 khăn tắm mới lên phòng",
      "status": "MOI"
    }
  }
  ```
- **Mã lỗi:** `400` (Nội dung < 5 ký tự hoặc `category_id` không tồn tại), `401`, `403`.

#### `GET /api/requests` (`HCP-32, HCP-33, HCP-34`)
- **Vai trò:**
  - `GUEST`: Chỉ trả về yêu cầu thuộc đợt lưu trú của chính khách đó.
  - `STAFF`: Chỉ trả về yêu cầu được phân công cho nhân viên đó (`assigned_to = req.user.id`).
  - `RECEPTIONIST` / `MANAGER`: Trả về toàn bộ yêu cầu của khách sạn.
- **Input (Query):** `?status=MOI&category_id=1&search=101&page=1&limit=10`
- **Output `200 OK`:** `{ "data": [...], "pagination": { ... } }`

#### `GET /api/requests/:id` (`HCP-34`)
- **Vai trò:** Đã đăng nhập (`GUEST` chỉ xem được yêu cầu của chính mình)
- **Output `200 OK`:** Chi tiết yêu cầu kèm mảng `history` (dòng thời gian chuyển trạng thái) và `rating`.
- **Mã lỗi:** `403` (`"Bạn không có quyền xem yêu cầu của khách hàng khác."`), `404`.

#### `PATCH /api/requests/:id/assign` (`HCP-32`)
- **Vai trò:** `RECEPTIONIST`, `MANAGER`
- **Input (Body JSON):** `{ "staff_id": 7 }`
- **Output `200 OK`:** Chuyển trạng thái sang `DA_PHAN_CONG` và ghi nhận bản ghi vào `request_history`.
- **Mã lỗi:** `400` (Thiếu `staff_id` hoặc nhân viên không hợp lệ/đang bị khóa), `403`, `404`.

#### `PATCH /api/requests/:id/status` (`HCP-33`)
- **Vai trò:** `STAFF` (chỉ nhân viên được phân công), `MANAGER`
- **Input (Body JSON):** `{ "status": "DANG_XU_LY" }` hoặc `{ "status": "HOAN_TAT" }`
- **Output `200 OK`:** Cập nhật trạng thái, tự động gán `completed_at` nếu `HOAN_TAT`, lưu vào `request_history`.
- **Mã lỗi:**
  - `400`: Trạng thái ngoài `DANG_XU_LY`, `HOAN_TAT`.
  - `403`: `"Bạn không được phép cập nhật yêu cầu này vì chưa được phân công cho bạn."`
  - `404`: Không tìm thấy yêu cầu.

---

### 3.4. Góp ý & Khiếu nại (` HCP-35, HCP-36 `)

#### `POST /api/feedbacks` (`HCP-35`)
- **Vai trò:** `GUEST`
- **Input (Body JSON):**
  ```json
  {
    "type": "KHIEU_NAI",
    "content": "Điều hòa phòng 101 kêu to vào ban đêm, nhờ kiểm tra giúp."
  }
  ```
- **Output `201 Created`:** Trả về `ref_code` (ví dụ `FB-00005`) và đối tượng `feedback` với `status: "MOI"`.
- **Mã lỗi:** `400` (`type` khác `GOP_Y`/`KHIEU_NAI` hoặc `content` < 10 ký tự), `403`.

#### `GET /api/feedbacks` (`HCP-35, HCP-36`)
- **Vai trò:** `GUEST` (chỉ xem của mình), `MANAGER` (xem toàn bộ)
- **Input (Query):** `?type=KHIEU_NAI&status=MOI&page=1&limit=10`
- **Output `200 OK`:** `{ "data": [...], "pagination": { ... } }`
- **Mã lỗi:** `401`, `403` (`STAFF` và `RECEPTIONIST` bị chặn).

#### `PATCH /api/feedbacks/:id/respond` (`HCP-36`)
- **Vai trò:** `MANAGER`
- **Input (Body JSON):**
  ```json
  {
    "response": "Ban quản lý xin lỗi quý khách và đã cử kỹ thuật kiểm tra ngay."
  }
  ```
- **Output `200 OK`:** Cập nhật `response`, `handled_by` và chuyển `status` sang `DA_GIAI_QUYET`.
- **Mã lỗi:** `400` (Nội dung phản hồi < 5 ký tự), `403`, `404`.

---

### 3.5. Đánh giá dịch vụ (` HCP-37 `)

#### `POST /api/ratings`
- **Vai trò:** `GUEST`
- **Input (Body JSON):**
  ```json
  {
    "request_id": 25,
    "score": 5,
    "comment": "Nhân viên phục vụ rất nhiệt tình!"
  }
  ```
- **Output `201 Created`:** `{ "message": "Cảm ơn quý khách đã gửi đánh giá dịch vụ!", "rating": { ... } }`
- **Mã lỗi:**
  - `400`: Điểm ngoài khoảng `1..5`, yêu cầu chưa ở trạng thái `HOAN_TAT`, hoặc yêu cầu đã được đánh giá trước đó (chỉ đánh giá 1 lần).
  - `403`: Đánh giá yêu cầu của khách khác.
  - `404`: Không tìm thấy yêu cầu.

---

### 3.6. Dashboard & Xuất Báo Cáo CSV (` HCP-38 `)

#### `GET /api/dashboard/stats`
- **Vai trò:** `MANAGER`
- **Input (Query):** `?from_date=2026-10-01&to_date=2026-10-31` *(optional)*
- **Output `200 OK`:**
  ```json
  {
    "summary": {
      "total_requests": 20,
      "in_progress": 8,
      "completed": 11,
      "avg_duration_minutes": 120,
      "avg_rating": 4.3,
      "total_ratings": 7
    },
    "status_counts": {
      "MOI": 4,
      "DA_PHAN_CONG": 3,
      "DANG_XU_LY": 3,
      "HOAN_TAT": 9,
      "DA_HUY": 1
    },
    "chart_data": [ ... ]
  }
  ```

#### `GET /api/dashboard/export-csv`
- **Vai trò:** `MANAGER`
- **Input (Query):** `?from_date=2026-10-01&to_date=2026-10-31` *(optional)*
- **Output `200 OK`:** File `.csv` mã hóa UTF-8 có BOM (`\uFEFF`) hiển thị đúng tiếng Việt trong Microsoft Excel.
