# HotelCarePortal — Hệ Thống Cổng Chăm Sóc Khách Hàng Cho Khách Sạn

Đồ án môn Quản Lý Dự Án Phần Mềm — Nhóm 5 sinh viên.

## 1. Giới thiệu & Thành viên nhóm

**HotelCarePortal** là hệ thống web hỗ trợ tiếp nhận, phân công, xử lý yêu cầu dịch vụ phòng và giải quyết góp ý/khiếu nại cho khách lưu trú tại khách sạn theo thời gian thực. Hệ thống phân quyền chặt chẽ (RBAC) cho 4 vai trò: **Khách lưu trú (`GUEST`)**, **Lễ tân (`RECEPTIONIST`)**, **Nhân viên dịch vụ (`STAFF`)** và **Quản lý (`MANAGER`)**.

| Thành viên | Vai trò phụ trách |
|------------|-------------------|
| **Kiều Linh** | Backend API, Xác thực/RBAC & DevOps triển khai |
| **Ý Phi** | Giao diện Frontend (React + Tailwind CSS v4) |
| **Châu Gia Vĩ** | Cơ sở dữ liệu (Prisma/PostgreSQL) & Kiểm thử tự động (Jest/Supertest) |
| **Lê Hoàng Trung Lâm** | Phân tích nghiệp vụ & Kiểm tra tiêu chí chấp nhận (10 User Stories) |
| **Võ Anh Tuấn** | Quản lý dự án (Jira/Git) & Tích hợp hệ thống |

---

## 2. Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 + React Router v7 + Recharts + Axios |
| **Backend** | Node.js + Express 5 + Express Validator |
| **Database & ORM** | PostgreSQL (Neon Serverless) + Prisma ORM v6 |
| **Bảo mật** | JWT (`jsonwebtoken`) + Mã hóa mật khẩu `bcryptjs` + CORS + RBAC Middleware |
| **Kiểm thử** | Jest + Supertest (14 kịch bản kiểm thử tích hợp API) |
| **Triển khai (Cloud)** | Vercel (Frontend) + Render (Backend) + Neon (PostgreSQL Database) |

---

## 3. Tài khoản Demo (4 vai trò)

> 🔑 **Mật khẩu chung cho cả 4 tài khoản demo:** `Demo@123`  
> *(Trên màn hình Đăng nhập có sẵn 4 nút điền nhanh cho từng vai trò)*

| Vai trò | Mã Role | Email đăng nhập | Chức năng chính |
|---------|---------|-----------------|-----------------|
| 🛎️ **Khách lưu trú** | `GUEST` | `guest@demo.com` | Gửi yêu cầu dịch vụ (HCP-31), theo dõi tiến độ & timeline (HCP-34), gửi góp ý/khiếu nại (HCP-35), đánh giá 1–5 sao khi hoàn tất (HCP-37) |
| 🏨 **Lễ tân** | `RECEPTIONIST` | `receptionist@demo.com` | Tiếp nhận toàn bộ yêu cầu, lọc/tìm kiếm và phân công nhân viên phụ trách (HCP-32) |
| 🔧 **Nhân viên dịch vụ** | `STAFF` | `staff@demo.com` | Xem danh sách việc được giao, cập nhật trạng thái `Đang xử lý` → `Hoàn tất` (HCP-33) |
| 📊 **Quản lý** | `MANAGER` | `manager@demo.com` | Quản lý tài khoản & khóa/mở khóa (HCP-30), phản hồi & đóng khiếu nại (HCP-36), xem Dashboard thống kê & xuất báo cáo CSV (HCP-38) |

---

## 4. Hướng dẫn cài đặt và chạy ở máy Local

### Yêu cầu môi trường
- **Node.js** >= 18
- **Git**

### Bước 1: Clone dự án
```bash
git clone https://github.com/tuantentuan1005-bit/QLDA.git
cd HotelCarePortal
```

### Bước 2: Cài đặt và chạy Backend (Cổng `3000`)
```bash
cd backend

# 1. Tạo file .env từ file mẫu .env.example và điền DATABASE_URL, JWT_SECRET
cp .env.example .env

# 2. Cài đặt thư viện
npm install

# 3. Sinh Prisma Client và đồng bộ bảng lên PostgreSQL
npm run db:generate
npm run db:push

# 4. Nạp dữ liệu mẫu (4 tài khoản demo, 10 phòng, 20 yêu cầu, 5 góp ý/khiếu nại)
npm run db:seed

# 5. Khởi chạy server ở chế độ phát triển (http://localhost:3000)
npm run dev
```

### Bước 3: Cài đặt và chạy Frontend (Cổng `5173`)
Mở một cửa sổ terminal mới:
```bash
cd frontend

# 1. Tạo file .env từ file mẫu
cp .env.example .env

# 2. Cài đặt thư viện
npm install

# 3. Khởi chạy giao diện (http://localhost:5173)
npm run dev
```
👉 Mở trình duyệt truy cập: **`http://localhost:5173`**

---

## 5. Kiểm thử tự động & Sao lưu / Khôi phục Database

Tại thư mục `backend`:

```bash
cd backend

# Chạy bộ 14 test case tự động (Jest + Supertest)
npm test

# Sao lưu cơ sở dữ liệu ra file SQL (lưu tại backend/backups/)
npm run db:backup

# Khôi phục cơ sở dữ liệu từ bản sao lưu mới nhất
npm run db:restore
```

---

## 6. Cấu trúc thư mục dự án

```text
HotelCarePortal/
├── backend/                        # Backend Node.js + Express + Prisma
│   ├── scripts/
│   │   ├── backup-db.js            # Script sao lưu DB (pg_dump / Prisma SQL exporter)
│   │   └── restore-db.js           # Script khôi phục DB từ file .sql
│   ├── src/
│   │   ├── controllers/            # Xử lý nghiệp vụ (auth, user, request, feedback, rating, dashboard)
│   │   ├── middleware/             # Xác thực JWT (authenticate) & phân quyền (authorize)
│   │   ├── prisma/                 # schema.prisma, kết nối prisma.js và dữ liệu mẫu seed.js
│   │   ├── routes/                 # Định nghĩa RESTful API routes
│   │   └── server.js               # Điểm khởi chạy Express app
│   ├── tests/
│   │   └── api.test.js             # Bộ kiểm thử tích hợp API (Jest + Supertest)
│   ├── .env.example                # Mẫu biến môi trường Backend
│   └── package.json
├── frontend/                       # Frontend React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Navbar, Sidebar, AppLayout
│   │   │   └── ui/                 # Badge, Button, Card, Modal, Table, Toast, StarRating...
│   │   ├── context/                # AuthContext quản lý phiên đăng nhập
│   │   ├── pages/                  # Các màn hình theo 4 vai trò (guest, receptionist, staff, manager)
│   │   ├── services/               # Axios client và các hàm gọi API
│   │   ├── App.jsx                 # Cấu hình định tuyến và ProtectedRoute
│   │   └── main.jsx                # Điểm khởi chạy React
│   ├── .env.example                # Mẫu biến môi trường Frontend
│   ├── vercel.json                 # Cấu hình rewrite SPA cho Vercel
│   └── package.json
└── docs/                           # Tài liệu kỹ thuật phục vụ báo cáo & vấn đáp
    ├── README.md                   # Quy trình làm việc nhóm
    ├── API_SPEC.md                 # Đặc tả chi tiết toàn bộ API (HCP-60)
    ├── ARCHITECTURE.md             # Kiến trúc hệ thống & sơ đồ triển khai Mermaid (HCP-47)
    └── CODE_WALKTHROUGH.md         # Hướng dẫn giải thích code theo từng thành viên (HCP-47)
```

---

## 7. Hướng dẫn triển khai bản Demo Cloud (Neon + Render + Vercel)

### Bước 7.1 — Database PostgreSQL trên Neon (`neon.tech`)
1. Đăng nhập [https://neon.tech](https://neon.tech), tạo Project mới (PostgreSQL 16, vùng Singapore `ap-southeast-1`).
2. Tại **Connection Details**, sao chép chuỗi kết nối `postgresql://...?sslmode=require`.
3. Đặt chuỗi này vào biến `DATABASE_URL` ở máy local rồi chạy `npm run db:push` và `npm run db:seed` để khởi tạo cấu trúc bảng và dữ liệu mẫu.

### Bước 7.2 — Triển khai Backend lên Render (`render.com`)
1. Đăng nhập [https://render.com](https://render.com) → chọn **New +** → **Web Service** → kết nối repository GitHub `QLDA`.
2. Thiết lập cấu hình dịch vụ:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run db:generate`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
3. Tại mục **Environment Variables**, thêm các biến sau:

| Tên biến | Giá trị |
|----------|---------|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL từ Neon |
| `JWT_SECRET` | Chuỗi bí mật ngẫu nhiên tối thiểu 32 ký tự |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | URL chính thức của Frontend trên Vercel (ví dụ: `https://qlda-hotelcare.vercel.app`) — *không có dấu `/` ở cuối* |

4. Nhấn **Deploy Web Service**. Sau khi hoàn tất, kiểm tra bằng cách mở: `https://<ten-service>.onrender.com/api/health`.

### Bước 7.3 — Triển khai Frontend lên Vercel (`vercel.com`)
1. Đăng nhập [https://vercel.com](https://vercel.com) → **Add New...** → **Project** → Import repository GitHub `QLDA`.
2. Thiết lập cấu hình:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Tại mục **Environment Variables**, thêm biến:

| Tên biến | Giá trị |
|----------|---------|
| `VITE_API_URL` | `https://<ten-service>.onrender.com/api` *(nhớ có hậu tố `/api`)* |

4. Nhấn **Deploy**. Sau khi có tên miền Vercel (ví dụ `https://qlda-hotelcare.vercel.app`), quay lại **Render → Environment** cập nhật đúng giá trị `CLIENT_URL` khớp với tên miền Vercel để không bị chặn CORS.

---

## ⚠️ 8. Cảnh báo quan trọng khi Bảo vệ Đồ án (Render Free Tier Spin-down)

> **Cảnh báo:** Gói miễn phí (Free Tier) của **Render** sẽ **tự động đưa Backend vào trạng thái ngủ (spin down) sau 15 phút không có request**. Khi đang ngủ, request đầu tiên gọi tới sẽ mất **30 – 50 giây** để khởi động lại container (Cold Start). Tương tự, **Neon DB** gói miễn phí cũng ngủ sau 5 phút và mất ~2–3 giây để thức dậy ở truy vấn đầu tiên.

### Cách xử lý để buổi Bảo vệ mượt mà 100%:
1. **Cách 1 — Đánh thức trước khi lên thuyết trình (Khuyên dùng):**
   - Trước khi đến lượt nhóm bảo vệ **3–5 phút**, mở sẵn đường dẫn `https://<ten-service>.onrender.com/api/health` trên trình duyệt và đăng nhập thử 1 lần tại trang Vercel. Khi thấy trả về `{"status":"ok",...}`, cả Render và Neon đều đã thức và phản hồi tức thì (< 200ms).
2. **Cách 2 — Giữ thức tự động trong ngày bảo vệ:**
   - Tạo một monitor miễn phí trên [UptimeRobot](https://uptimerobot.com) hoặc [cron-job.org](https://cron-job.org) trỏ vào URL `https://<ten-service>.onrender.com/api/health` với chu kỳ **10 phút/lần** trong suốt buổi bảo vệ.
3. **Phương án dự phòng tại chỗ (Local Fallback):**
   - Luôn mở sẵn 2 cửa sổ PowerShell chạy `backend` (`localhost:3000`) và `frontend` (`localhost:5173`) trên laptop của nhóm phòng trường hợp mạng Wifi phòng bảo vệ bị chập chờn.
