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
- 🔐 Đăng ký / Đăng nhập với JWT
- 🏠 Tìm kiếm và lọc phòng theo giá, sức chứa, tiện nghi
- 📅 Đặt phòng với chọn ngày check-in/check-out
- 💳 Thanh toán qua VietQR/VNPay
- 📱 Mã QR check-in
- 👤 Quản lý profile và lịch sử đặt phòng

### Admin
- 📊 Dashboard thống kê doanh thu, đặt phòng
- 🛏️ Quản lý phòng (CRUD)
- 📋 Quản lý đặt phòng
- 🎫 Quản lý khuyến mãi
- 📷 Quét QR check-in khách

## Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB (local hoặc Atlas)
- pnpm (khuyến nghị) hoặc npm

### Bước 1: Clone và cài đặt dependencies

```bash
git clone <repository-url>
cd next15-jwt-project
pnpm install
```

### Bước 2: Cấu hình environment

Tạo file `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/stayeasy

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment (optional)
VNPAY_TMN_CODE=your-vnpay-tmn-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret
SEPAY_API_KEY=your-sepay-api-key
```

### Bước 3: Seed dữ liệu mẫu

```bash
# Chạy dev server trước
pnpm dev

# Sau đó gọi API seed
curl http://localhost:3000/api/seed
```

### Bước 4: Chạy ứng dụng

```bash
# Development (với Turbopack)
pnpm dev

# Production build
pnpm build
pnpm start
```

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

## Tài khoản mặc định

Sau khi seed dữ liệu:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stayeasy.com | admin123 |
| User | user@example.com | user123 |

## Screenshots

### Trang chủ
![Home](docs/screenshots/home.png)

### Danh sách phòng
![Rooms](docs/screenshots/rooms.png)

### Admin Dashboard
![Admin](docs/screenshots/admin.png)

## Deploy

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Import project vào [Vercel](https://vercel.com)
3. Cấu hình Environment Variables
4. Deploy

### Docker

```bash
docker build -t stayeasy .
docker run -p 3000:3000 stayeasy
```

## License

MIT
