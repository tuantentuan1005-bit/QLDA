# HotelCarePortal - Hệ thống cổng chăm sóc khách hàng khách sạn

Đồ án môn học - Nhóm sinh viên.

## Giới thiệu

Hệ thống quản lý và xử lý yêu cầu dịch vụ, góp ý/khiếu nại của khách lưu trú tại khách sạn. Hỗ trợ 4 vai trò: Guest (Khách), Receptionist (Lễ tân), Staff (Nhân viên), Manager (Quản lý).

## Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deploy | Vercel (FE) + Render (BE) + Neon (DB) |

## Cài đặt và chạy local

### Yêu cầu
- Node.js >= 18
- PostgreSQL (hoặc tài khoản Neon miễn phí)

### 1. Clone và cài đặt

```bash
git clone <repo-url>
cd HotelCarePortal
```

### 2. Cài đặt Backend

```bash
cd backend

# Sao chép file môi trường
cp .env.example .env
# Điền DATABASE_URL và JWT_SECRET vào .env

# Cài package
npm install

# Tạo bảng trong database
npm run db:push

# Tạo Prisma Client
npm run db:generate

# Seed dữ liệu mẫu
npm run db:seed

# Chạy server (port 3000)
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend

# Sao chép file môi trường
cp .env.example .env
# Điền VITE_API_URL nếu cần (mặc định: http://localhost:3000/api)

# Cài package
npm install

# Chạy dev server (port 5173)
npm run dev
```

## Tài khoản demo

> Mật khẩu tất cả tài khoản: `Demo@123`

| Vai trò | Email | Mô tả |
|---------|-------|-------|
| Guest (Khách) | `guest@demo.com` | Gửi yêu cầu, góp ý, đánh giá |
| Receptionist (Lễ tân) | `receptionist@demo.com` | Tiếp nhận, phân công yêu cầu |
| Staff (Nhân viên) | `staff@demo.com` | Xử lý và cập nhật trạng thái |
| Manager (Quản lý) | `manager@demo.com` | Quản lý hệ thống, xử lý khiếu nại |

## Kiểm tra nhanh

```bash
# Kiểm tra backend hoạt động
curl http://localhost:3000/api/health

# Kết quả mong đợi:
# {"status":"ok","message":"HotelCarePortal API đang chạy",...}
```

## Quy trình nghiệp vụ

### Yêu cầu dịch vụ
```
Khách gửi (Mới) → Lễ tân phân công (Đã phân công) → Nhân viên xử lý (Đang xử lý) → Hoàn tất → Khách đánh giá
```

### Góp ý / Khiếu nại
```
Khách gửi (Mới) → Quản lý xử lý (Đang xử lý) → Phản hồi (Đã giải quyết) → Khách xem phản hồi
```

## Cấu trúc thư mục

```
HotelCarePortal/
├── frontend/                  # React + Vite + Tailwind
│   └── src/
│       ├── pages/             # Các trang theo vai trò
│       ├── components/        # Component tái sử dụng
│       ├── services/          # Hàm gọi API (axios)
│       └── context/           # React Context (Auth)
├── backend/                   # Node.js + Express
│   └── src/
│       ├── routes/            # Định nghĩa endpoints
│       ├── controllers/       # Logic xử lý request
│       ├── middleware/        # Auth, RBAC, validation
│       └── prisma/            # Schema, seed, client
└── docs/                      # Tài liệu nhóm
```

## Deploy

### Database (Neon)
1. Tạo project tại [neon.tech](https://neon.tech)
2. Copy connection string vào `DATABASE_URL`
3. Chạy `npm run db:push` và `npm run db:seed`

### Backend (Render)
1. Connect GitHub repo
2. Build command: `npm install && npm run db:generate`
3. Start command: `npm start`
4. Thêm environment variables từ `.env`

### Frontend (Vercel)
1. Connect GitHub repo, chọn thư mục `frontend`
2. Framework: Vite
3. Thêm `VITE_API_URL` trỏ đến Render URL

## Commit convention

```
HCP-<số>: <mô tả ngắn>
Ví dụ: HCP-3: thêm API đăng nhập
```
