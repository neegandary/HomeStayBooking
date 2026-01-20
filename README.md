# StayEasy - Hệ thống đặt phòng Homestay

Ứng dụng đặt phòng homestay full-stack được xây dựng với Next.js 15, React 19, MongoDB và JWT Authentication.

## Tech Stack

- **Frontend:** Next.js 15.5, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Authentication:** JWT (jose), bcryptjs
- **Payment:** VietQR, VNPay, SePay webhook
- **UI Components:** Swiper, React DatePicker, QRCode.react
- **Testing:** Jest, React Testing Library

## Tính năng

### Người dùng
- Đăng ký / Đăng nhập với JWT
- Tìm kiếm và lọc phòng theo giá, sức chứa, tiện nghi
- Đặt phòng với chọn ngày check-in/check-out
- Thanh toán qua VietQR/VNPay
- Mã QR check-in
- Quản lý profile và lịch sử đặt phòng

### Admin
- Dashboard thống kê doanh thu, đặt phòng
- Quản lý phòng (CRUD)
- Quản lý đặt phòng
- Quản lý khuyến mãi
- Quét QR check-in khách

## Scripts

| Script | Mô tả |
|--------|-------|
| `pnpm dev` | Chạy development server với Turbopack |
| `pnpm build` | Build production |
| `pnpm start` | Chạy production server |
| `pnpm lint` | Kiểm tra ESLint |
| `pnpm test` | Chạy Jest tests |
| `pnpm test:watch` | Chạy tests ở watch mode |
| `pnpm test:coverage` | Chạy tests với coverage report |

## Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Public pages (rooms, about, booking)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API Routes
│   └── dashboard/         # User dashboard
├── components/
│   ├── admin/             # Admin components
│   ├── features/          # Feature components
│   ├── layout/            # Layout components (Header, Footer)
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (auth, db)
├── models/                # Mongoose models
├── services/              # API services
└── types/                 # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `POST /api/auth/refresh` - Refresh token

### Rooms
- `GET /api/rooms` - Danh sách phòng (có filter, pagination)
- `GET /api/rooms/[id]` - Chi tiết phòng
- `GET /api/rooms/[id]/availability` - Kiểm tra phòng trống

### Bookings
- `GET /api/bookings` - Danh sách đặt phòng của user
- `POST /api/bookings` - Tạo đặt phòng mới
- `GET /api/bookings/[id]` - Chi tiết đặt phòng
- `POST /api/bookings/[id]/pay` - Thanh toán
- `POST /api/bookings/checkin` - Check-in (Admin)

### Admin
- `GET /api/admin/stats` - Thống kê dashboard
- `GET/POST /api/admin/rooms` - Quản lý phòng
- `GET/POST /api/admin/bookings` - Quản lý đặt phòng

### Promotions
- `GET /api/promotions` - Danh sách khuyến mãi
- `POST /api/promotions/validate` - Kiểm tra mã khuyến mãi
