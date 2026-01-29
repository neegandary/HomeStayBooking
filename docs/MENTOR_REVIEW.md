# Mentor Review Documentation - StayEasy Project

## Project Overview

**StayEasy** là ứng dụng đặt phòng khách sạn/nghỉ dưỡng được xây dựng với Next.js 15, MongoDB, và JWT authentication.

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API Routes (Server Actions pattern)
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT với access/refresh token (jose library)
- **Payment:** SePay (VietQR), VNPay
- **Testing:** Jest + React Testing Library

---

## 1. Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Public pages (rooms, home, etc.)
│   ├── (auth)/            # Auth pages (login, register)
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── features/          # Business logic components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── reviews/           # Review feature components (NEW)
├── models/                # Mongoose models
├── lib/                   # Utilities & services
│   ├── auth/              # JWT authentication
│   ├── validations/       # Zod schemas
│   └── db/                # MongoDB connection
├── types/                 # TypeScript interfaces
└── hooks/                 # Custom React hooks
```

### Data Flow
```
User → Next.js Route Handler → Mongoose Model → MongoDB
                                      ↓
                               JWT Middleware (auth)
```

---

## 2. Database Schema

### Users Collection
```typescript
User {
  _id: ObjectId
  name: string
  email: string (unique)
  password: string (bcrypt hashed)
  role: 'user' | 'admin'
  phone?: string
  createdAt, updatedAt
}
```

### Rooms Collection
```typescript
Room {
  _id: ObjectId
  name: string
  description: string
  price: number
  images: string[]
  capacity: number
  amenities: string[]
  available: boolean
  averageRating: number      // NEW: Real-time aggregated
  reviewCount: number        // NEW: Count of reviews
  deleted: boolean           // NEW: Soft delete
  createdAt, updatedAt
}
```

### Bookings Collection
```typescript
Booking {
  _id: ObjectId
  userId: ObjectId (ref User)
  roomId: ObjectId (ref Room)
  checkIn: Date
  checkOut: Date
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paymentMethod: 'vnpay' | 'sepay'
  paymentStatus: 'pending' | 'paid' | 'failed'
  promotionCode?: string
  qrCodeUrl?: string         // SePay QR
  createdAt, updatedAt
}
```

### Reviews Collection (NEW)
```typescript
Review {
  _id: ObjectId
  roomId: ObjectId (ref Room)
  userId: ObjectId (ref User)
  bookingId: ObjectId (ref Booking)  // unique: 1 review/booking
  rating: number (1-5)
  comment: string (10-2000 chars)
  isVerified: boolean  // true if booking completed
  deleted: boolean     // Soft delete
  createdAt, updatedAt
}
```

### Indexes
```javascript
// Reviews
{ roomId: 1, createdAt: -1 }     // List by room
{ userId: 1, createdAt: -1 }     // User's reviews
{ bookingId: 1 }                 // Prevent duplicate
{ deleted: 1 }                   // Soft delete filter
```

---

## 3. Authentication System

### JWT Token Structure
```typescript
// Access Token (15 min expiry)
{
  userId: string,
  email: string,
  role: 'user' | 'admin',
  type: 'access'
}

// Refresh Token (7 days expiry)
{
  userId: string,
  type: 'refresh'
}
```

### Security Measures
- Access token: 15 phút
- Refresh token: 7 ngày
- Password: bcrypt với salt rounds
- Protected routes: Middleware kiểm tra token
- Admin routes: Separate admin auth middleware

### Auth Flow
```
1. User login → Server validate credentials
2. Server generate access + refresh token
3. Refresh token stored in httpOnly cookie
4. Access token returned to client
5. Client use access token for API calls
6. Token expired → Use refresh token to get new pair
```

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Refresh token | Public* |
| GET | `/api/auth/me` | Get current user | Required |

### Rooms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | List all rooms | Public |
| GET | `/api/rooms/[id]` | Get room detail | Public |
| GET | `/api/rooms/[id]/availability` | Check availability | Public |
| GET | `/api/rooms/[id]/with-reviews` | Room + reviews | Public |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | Required |
| GET | `/api/bookings` | User's bookings | Required |
| GET | `/api/bookings/[id]` | Booking detail | Required |
| POST | `/api/bookings/[id]/pay` | Process payment | Required |
| POST | `/api/bookings/checkin` | QR check-in | Required |

### Reviews (NEW)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews?roomId=xxx` | List reviews | Public |
| POST | `/api/reviews` | Create review | Required |
| DELETE | `/api/reviews/[id]` | Delete review | Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard stats | Admin |
| GET | `/api/admin/rooms` | Manage rooms | Admin |
| GET | `/api/admin/bookings` | Manage bookings | Admin |

---

## 5. Review Feature Details (Phase 1-3)

### Phase 1: Database & Model Design ✅
- [x] `src/types/review.ts` - IReview interface
- [x] `src/models/Review.ts` - Mongoose model với indexes
- [x] `src/models/Room.ts` - Thêm averageRating, reviewCount, deleted

### Phase 2: API Endpoints ✅
- [x] `GET /api/reviews?roomId=xxx&page=1&limit=10`
- [x] `POST /api/reviews` - Create với validation
- [x] `DELETE /api/reviews/[id]` - Soft delete (admin)
- [x] `GET /api/rooms/[id]/with-reviews` - Room + stats

### Phase 3: Frontend Components ✅
- [x] `StarRating.tsx` - Interactive 5-star rating
- [x] `ReviewCard.tsx` - Review display với verified badge
- [x] `ReviewList.tsx` - Pagination + loading states
- [x] `ReviewForm.tsx` - Create review form với validation
- [x] `RatingSummary.tsx` - Average + distribution bars
- [x] Updated room detail page

### Key Design Decisions
1. **Real-time Aggregation:** Room.averageRating cập nhật mỗi khi review được tạo/xóa
2. **One Review per Booking:** bookingId unique trong Review model
3. **Soft Delete:** Thêm deleted field thay vì xóa vĩnh viễn
4. **Verified Badge:** Chỉ hiện khi booking.status === 'completed'

---

## 6. Payment Integration

### SePay (VietQR)
```typescript
// Tạo QR thanh toán
sepay.createPayment({
  amount: booking.totalPrice,
  description: `Booking #${bookingId}`,
  callbackUrl: '/api/webhooks/sepay'
})

// Webhook xử lý callback
sepay.verifySignature(body, signature)
```

### VNPay
```typescript
vnpay.createPayment({
  amount: booking.totalPrice,
  orderId: bookingId,
  returnUrl: '/booking/success'
})
```

---

## 7. Security Considerations

### Implemented
- [x] JWT access/refresh token rotation
- [x] HttpOnly cookie cho refresh token
- [x] Password hashing (bcrypt)
- [x] Input validation (Zod schemas)
- [x] Rate limiting (memory-based)
- [x] XSS protection (React escapes content)
- [x] Soft delete cho moderation

### Recommendations
- [ ] Thêm CSRF protection cho mutations
- [ ] Implement rate limiting với Redis
- [ ] Thêm audit logging cho admin actions
- [ ] HTTPS enforcement trong production

---

## 8. Testing

### Test Coverage
```
Unit Tests:
- JWT authentication (lib/auth/__tests__/)
- Review components (components/reviews/__tests__/)
- Auth middleware

Integration Tests:
- API routes với test DB
- Full booking flow

Test Results:
- 18/18 review component tests passed
- 48/87 total tests pass (existing Header tests need fix)
```

### Testing Strategy
```typescript
// Jest + React Testing Library
describe('StarRating', () => {
  it('should render 5 stars', () => {...})
  it('should call onChange when clicking', () => {...})
})
```

---

## 9. Performance Considerations

### Implemented
- [x] Next.js server components cho room details
- [] Image optimization (next/image)
- [x] Pagination cho reviews
- [x] Indexes cho MongoDB queries

### Recommendations
- [ ] Add Redis caching cho room data
- [ ] Implement lazy loading cho images
- [ ] Add connection pooling cho MongoDB
- [ ] Consider CDN cho static assets

---

## 10. Deployment Checklist

### Environment Variables Required
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=refresh-secret
SEPAY_API_KEY=...
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
```

### MongoDB Indexes
```javascript
// Chạy lần đầu khi deploy
db.reviews.createIndex({ roomId: 1, createdAt: -1 })
db.reviews.createIndex({ userId: 1, createdAt: -1 })
db.reviews.createIndex({ bookingId: 1 }, { unique: true })
db.reviews.createIndex({ deleted: 1 })
```

---

## 11. Questions for Mentor

1. **Review Aggregation Strategy:** Real-time (hiện tại) vs On-demand?
2. **Admin Review Moderation:** Cần workflow duyệt review trước khi hiển thị?
3. **Response Caching:** Có nên cache room data với Redis không?
4. **Webhooks:** Cần retry logic cho payment webhooks không?

---

## 12. Files Changed Summary

### New Files Created (Review Feature)
```
src/types/review.ts
src/models/Review.ts
src/lib/validations/review.ts
src/app/api/reviews/route.ts
src/app/api/reviews/[id]/route.ts
src/app/api/rooms/[id]/with-reviews/route.ts
src/components/reviews/StarRating.tsx
src/components/reviews/ReviewCard.tsx
src/components/reviews/ReviewList.tsx
src/components/reviews/ReviewForm.tsx
src/components/reviews/RatingSummary.tsx
src/components/reviews/index.ts
src/components/reviews/__tests__/StarRating.test.tsx
src/components/reviews/__tests__/ReviewCard.test.tsx
src/components/reviews/__tests__/RatingSummary.test.tsx
```

### Modified Files
```
src/app/(main)/rooms/[id]/page.tsx - Thêm reviews section
src/app/api/reviews/route.ts - Sửa Zod error handling
src/models/Room.ts - Thêm rating fields
```

---

## 13. Known Issues / Technical Debt

1. **Header.test.tsx** - 39 tests fail do thiếu @testing-library/jest-dom
2. **ReviewForm** - Chưa redirect khi user chưa login
3. **Rating Aggregation** - Tính lại toàn bộ review khi mỗi lần tạo/xóa (O(n))
4. **No Image Upload** - Chưa có upload ảnh cho room/review

---

## 14. Next Steps (Phase 4)

- [ ] Integration testing cho API endpoints
- [ ] E2E test cho booking + review flow
- [ ] Performance testing với large datasets
- [ ] Security audit
- [ ] Documentation update
