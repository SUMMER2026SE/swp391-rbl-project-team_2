# 🧪 Hướng Dẫn Test Các Fix

## 🚀 Khởi Động Ứng Dụng

### Backend (Server)
```bash
cd server
npm start
```
✅ Server chạy trên: `http://localhost:5000`

### Frontend (Client)
```bash
cd client
npm run dev
```
✅ Frontend chạy trên: `http://localhost:5174`

---

## 👤 Tài Khoản Test

### Landlord Account
- **Email:** `landlord@example.com`
- **Password:** `123456`
- **Role:** Landlord

### Tenant Account
- **Email:** `test@example.com`
- **Password:** `123456`
- **Role:** Tenant

---

## ✅ Test Case 1: Rental Requests

### Bước 1: Đăng Nhập
1. Truy cập `http://localhost:5174`
2. Click "Login"
3. Nhập email: `landlord@example.com`
4. Nhập password: `123456`
5. Click "Login"

### Bước 2: Vào Rental Requests
1. Từ dashboard, click menu "Rental Requests"
2. Hoặc truy cập trực tiếp: `http://localhost:5174/landlord/requests`

### Bước 3: Kiểm Tra Danh Sách
- ✅ Danh sách requests được load từ API
- ✅ Hiển thị: Tenant name, Room, Request date, Move-in date, Status
- ✅ Có filter theo status (All, pending, approved, rejected, cancelled)
- ✅ Có search box để tìm kiếm

### Bước 4: Xem Chi Tiết Request
1. Click "View Details" trên một request
2. Modal hiển thị:
   - ✅ Tenant Information (name, email, phone)
   - ✅ Room Information (title, price, move-in date, lease duration)
   - ✅ Message from Tenant
3. Nếu status = "pending":
   - ✅ Nút "Approve Request"
   - ✅ Nút "Reject Request"

### Bước 5: Approve Request
1. Click "Approve Request"
2. Confirm dialog hiển thị
3. Click "OK" để confirm
4. ✅ Request status thay đổi thành "approved"
5. ✅ Modal đóng tự động
6. ✅ Danh sách được refresh

### Bước 6: Reject Request
1. Click "Reject Request"
2. Modal "Reject Request" hiển thị
3. Nhập lý do từ chối
4. Click "Reject Request"
5. ✅ Request status thay đổi thành "rejected"
6. ✅ Modal đóng tự động

---

## ✅ Test Case 2: Landlord Profile

### Bước 1: Vào Profile
1. Đăng nhập với landlord account
2. Click menu "Profile" hoặc "Settings"
3. Hoặc truy cập: `http://localhost:5174/landlord/profile`

### Bước 2: Kiểm Tra Loading State
- ✅ Khi page load, hiển thị spinner "Loading profile..."
- ✅ Sau 1-2 giây, dữ liệu được load

### Bước 3: Kiểm Tra Dữ Liệu Hiển Thị
- ✅ Full Name: Hiển thị tên từ database
- ✅ Email: Hiển thị email từ database
- ✅ Phone: Hiển thị phone (nếu có)
- ✅ Member Since: Hiển thị năm tạo account
- ✅ Account Status: Hiển thị "Active" hoặc "Inactive"

### Bước 4: Kiểm Tra Verification Status
- ✅ Email Address: Verified (nếu email tồn tại)
- ✅ Phone Number: Verified (nếu phone tồn tại)
- ✅ Account Status: Active/Inactive

### Bước 5: Edit Profile
1. Click "Edit Profile"
2. ✅ Chuyển đến trang settings
3. (Chức năng edit sẽ được implement sau)

---

## ✅ Test Case 3: Messages

### Bước 1: Vào Messages
1. Đăng nhập với landlord account
2. Click menu "Messages"
3. Hoặc truy cập: `http://localhost:5174/landlord/messages`

### Bước 2: Kiểm Tra Loading State
- ✅ Khi page load, hiển thị spinner "Loading messages..."
- ✅ Sau 1-2 giây, danh sách conversations được load

### Bước 3: Kiểm Tra Danh Sách Conversations
- ✅ Hiển thị danh sách conversations (nếu có)
- ✅ Mỗi conversation hiển thị:
  - Avatar của participant
  - Tên participant
  - Last message snippet
  - Thời gian
  - Unread count (nếu có)

### Bước 4: Chọn Conversation
1. Click vào một conversation
2. ✅ Conversation được highlight
3. ✅ Chat panel bên phải hiển thị messages

### Bước 5: Xem Messages
- ✅ Hiển thị danh sách messages
- ✅ Messages từ landlord: hiển thị bên phải (sent)
- ✅ Messages từ tenant: hiển thị bên trái (received)
- ✅ Mỗi message hiển thị: content, time

### Bước 6: Gửi Message
1. Gõ tin nhắn vào input box
2. Click nút Send (hoặc nhấn Enter)
3. ✅ Tin nhắn được gửi qua API
4. ✅ Tin nhắn xuất hiện trong chat
5. ✅ Input box được clear
6. ✅ Auto-scroll to bottom

### Bước 7: Kiểm Tra Empty State
1. Nếu chưa chọn conversation
2. ✅ Hiển thị "Select a conversation to start messaging"

---

## 🐛 Troubleshooting

### Lỗi: "Cannot GET /api/landlord/rental-requests"
**Nguyên Nhân:** Server chưa chạy hoặc endpoint không tồn tại
**Cách Fix:**
1. Kiểm tra server đã chạy: `npm start` ở thư mục `server`
2. Kiểm tra endpoint trong `server/src/routes/landlordRoutes.js`

### Lỗi: "Unauthorized"
**Nguyên Nhân:** Token hết hạn hoặc không hợp lệ
**Cách Fix:**
1. Đăng xuất
2. Đăng nhập lại
3. Kiểm tra token trong localStorage

### Lỗi: "No conversations"
**Nguyên Nhân:** Chưa có conversation nào
**Cách Fix:**
1. Tạo conversation mới từ tenant side
2. Hoặc tạo conversation từ landlord side

### Lỗi: "Profile không hiển thị"
**Nguyên Nhân:** API chưa trả về dữ liệu
**Cách Fix:**
1. Kiểm tra user đã đăng nhập
2. Kiểm tra token hợp lệ
3. Kiểm tra endpoint `/api/landlord/profile`

---

## 📊 API Endpoints Được Test

### Rental Requests
```
GET    /api/landlord/rental-requests
PUT    /api/landlord/rental-requests/:id/approve
PUT    /api/landlord/rental-requests/:id/reject
```

### Profile
```
GET    /api/landlord/profile
```

### Messages
```
GET    /api/landlord/conversations
GET    /api/landlord/conversations/:id/messages
POST   /api/landlord/conversations/:id/messages
```

---

## ✨ Kết Quả Mong Đợi

### Rental Requests ✅
- [x] Danh sách requests load từ API
- [x] Filter theo status hoạt động
- [x] Search hoạt động
- [x] View details modal hiển thị đúng
- [x] Approve request hoạt động
- [x] Reject request hoạt động
- [x] Danh sách refresh sau khi approve/reject

### Landlord Profile ✅
- [x] Profile load từ API
- [x] Loading state hiển thị
- [x] Dữ liệu thực hiển thị đúng
- [x] Verification status hiển thị đúng
- [x] Không có mock data

### Messages ✅
- [x] Conversations load từ API
- [x] Messages load từ API
- [x] Có thể gửi message
- [x] Message xuất hiện trong chat
- [x] Auto-scroll to bottom
- [x] Empty state hiển thị đúng

---

## 📝 Ghi Chú

- Tất cả dữ liệu được lưu trong database SQL Server
- Token JWT hết hạn sau 7 ngày
- Các fix này chỉ là bước đầu, có thể cần thêm features khác

---

**Cập Nhật:** 2026-06-01
**Phiên Bản:** 1.0.0
