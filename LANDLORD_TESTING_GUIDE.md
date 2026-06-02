# LANDLORD FEATURE TESTING GUIDE

## ✅ Đã Fix Thành Công

### Backend Issues Fixed
1. ✅ **User Model Timestamps**: Đã thêm `created_at` và `updated_at` columns vào database
2. ✅ **Profile API**: Endpoint `/api/landlord/profile` đã hoạt động
3. ✅ **Rooms API**: Endpoint `/api/landlord/rooms` đã hoạt động
4. ✅ **Rental Requests API**: Endpoint `/api/landlord/rental-requests` đã hoạt động
5. ✅ **Dashboard Stats API**: Endpoint `/api/landlord/dashboard/statistics` đã hoạt động

### Frontend Issues Fixed
1. ✅ **Settings Page**: Đã thêm import `Check` icon từ lucide-react
2. ✅ **Client .env**: Đã thêm `VITE_API_URL` và `VITE_GOOGLE_CLIENT_ID`

## 🧪 Test Credentials

### Landlord Account
- **Email**: `landlord@example.com`
- **Password**: `123456`

### Tenant Account
- **Email**: `test@example.com`
- **Password**: `123456`

## 📋 Testing Checklist

### 1. Login Flow
- [ ] Mở browser tại `http://localhost:5174`
- [ ] Click "Login"
- [ ] Nhập email: `landlord@example.com`
- [ ] Nhập password: `123456`
- [ ] Click "Login"
- [ ] Kiểm tra redirect đến landlord dashboard

### 2. Dashboard
- [ ] Kiểm tra 4 stat cards hiển thị đúng
- [ ] Kiểm tra revenue chart hiển thị
- [ ] Kiểm tra recent activity list
- [ ] Kiểm tra sidebar navigation

### 3. Profile Page
- [ ] Click "Profile" trong sidebar
- [ ] Kiểm tra thông tin profile hiển thị:
  - Full Name: Test Landlord
  - Email: landlord@example.com
  - Phone: 0987654321
  - Status: Active
- [ ] Test update profile
- [ ] Test change password

### 4. Rooms Management
- [ ] Click "Listings" trong sidebar
- [ ] Kiểm tra empty state (chưa có rooms)
- [ ] Test create new room
- [ ] Test upload room images
- [ ] Test add facilities
- [ ] Test update room
- [ ] Test delete room

### 5. Rental Requests
- [ ] Click "Requests" trong sidebar
- [ ] Kiểm tra empty state (chưa có requests)
- [ ] Test search và filter
- [ ] Test approve request
- [ ] Test reject request

### 6. Payments
- [ ] Click "Deposits" trong sidebar
- [ ] Kiểm tra payment history
- [ ] Kiểm tra payment statistics
- [ ] Test export payments

### 7. Contracts
- [ ] Kiểm tra contracts list
- [ ] Test create contract
- [ ] Test renew contract
- [ ] Test terminate contract

### 8. Messages
- [ ] Click "Messages" trong sidebar
- [ ] Kiểm tra conversations list
- [ ] Test send message
- [ ] Test real-time updates

### 9. Notifications
- [ ] Click "Notifications" trong sidebar
- [ ] Kiểm tra notifications list
- [ ] Test mark as read
- [ ] Test delete notification

### 10. Settings
- [ ] Click "Settings" trong sidebar
- [ ] Kiểm tra appearance settings
- [ ] Kiểm tra language settings
- [ ] Kiểm tra notification preferences
- [ ] Test change password

## 🐛 Known Issues (If Any)

### Minor Issues
- None currently

### Future Enhancements
- Add real-time notifications
- Add file upload progress
- Add image preview before upload
- Add bulk operations

## 📊 API Endpoints Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/auth/login` | POST | ✅ Working | - |
| `/api/landlord/profile` | GET | ✅ Working | - |
| `/api/landlord/profile` | PUT | ✅ Working | - |
| `/api/landlord/rooms` | GET | ✅ Working | - |
| `/api/landlord/rooms` | POST | ✅ Working | - |
| `/api/landlord/rooms/:id` | GET | ✅ Working | - |
| `/api/landlord/rooms/:id` | PUT | ✅ Working | - |
| `/api/landlord/rooms/:id` | DELETE | ✅ Working | - |
| `/api/landlord/rental-requests` | GET | ✅ Working | - |
| `/api/landlord/rental-requests/:id/approve` | PUT | ✅ Working | - |
| `/api/landlord/rental-requests/:id/reject` | PUT | ✅ Working | - |
| `/api/landlord/dashboard/statistics` | GET | ✅ Working | - |
| `/api/landlord/payments` | GET | ✅ Working | - |
| `/api/landlord/contracts` | GET | ✅ Working | - |
| `/api/landlord/messages` | GET | ✅ Working | - |
| `/api/landlord/notifications` | GET | ✅ Working | - |

## 🚀 Quick Start

### Start Backend
```bash
cd server
npm start
```

### Start Frontend
```bash
cd client
npm run dev
```

### Run API Tests
```bash
cd server
node testLandlordAPI.js
```

## 📝 Notes

- Server chạy trên port 5000
- Client chạy trên port 5174
- Database: SQL Server (localhost:1433)
- Database name: RentalRoomSystem

## 🔧 Troubleshooting

### Server không khởi động
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra .env file có đúng credentials
3. Kiểm tra port 5000 không bị chiếm

### Client không kết nối được API
1. Kiểm tra server đang chạy
2. Kiểm tra VITE_API_URL trong .env
3. Kiểm tra CORS settings

### Login không thành công
1. Kiểm tra test user đã được tạo
2. Kiểm tra password đúng: `123456`
3. Kiểm tra JWT_SECRET trong server .env
