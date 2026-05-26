Tạo cho tôi cấu trúc dự án NodeJS + ExpressJS chuẩn, sạch, dễ mở rộng cho Rental Room System.

Yêu cầu stack:
- NodeJS
- ExpressJS
- SQL Server
- Sequelize ORM
- JWT Authentication
- bcrypt
- dotenv
- cors
- morgan
- nodemon

Hãy tạo cấu trúc thư mục như sau:

src/
├── config/
│   └── database.js
├── models/
│   ├── index.js
│   ├── Role.js
│   ├── User.js
│   ├── UserProfile.js
│   ├── UserGoogleAccount.js
│   ├── OtpVerification.js
│   ├── Room.js
│   ├── RoomImage.js
│   ├── RoomFacility.js
│   ├── SearchHistory.js
│   ├── RoomView.js
│   ├── RoomViewingSchedule.js
│   ├── RentalRequest.js
│   ├── Payment.js
│   ├── Contract.js
│   ├── ContractRenewal.js
│   ├── Complaint.js
│   ├── Conversation.js
│   ├── Message.js
│   ├── AiChatLog.js
│   ├── PostModeration.js
│   ├── PostReport.js
│   ├── AdminLog.js
│   └── Notification.js
├── controllers/
├── routes/
├── middlewares/
├── services/
├── utils/
├── validations/
└── server.js

Tạo file package.json đầy đủ scripts:
- npm run dev
- npm start

Tạo file .env.example gồm:
PORT=5000
DB_HOST=localhost
DB_PORT=1433
DB_NAME=RentalRoomSystemComplete
DB_USER=sa
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key

Tạo config database.js kết nối SQL Server bằng Sequelize.

Generate đầy đủ Sequelize model class cho database Rental Room System gồm các bảng:

1. roles
2. users
3. user_google_accounts
4. otp_verifications
5. user_profiles
6. rooms
7. room_images
8. room_facilities
9. search_history
10. room_views
11. room_viewing_schedule
12. rental_requests
13. payments
14. contracts
15. contract_renewals
16. complaints
17. conversations
18. messages
19. ai_chat_logs
20. post_moderations
21. post_reports
22. admin_logs
23. notifications

Yêu cầu model:
- Dùng Sequelize DataTypes
- Đặt tableName đúng với SQL
- timestamps false
- primaryKey và autoIncrement đúng
- allowNull đúng theo database
- datatype tương ứng SQL Server
- Tạo associations đầy đủ trong models/index.js

Quan hệ chính:
- Role hasMany User
- User belongsTo Role
- User hasOne UserProfile
- User hasOne UserGoogleAccount
- User hasMany OtpVerification
- User hasMany Room as landlord rooms
- Room belongsTo User as landlord
- Room hasMany RoomImage
- Room hasMany RoomFacility
- Room hasMany RoomView
- Room hasMany RoomViewingSchedule
- Room hasMany RentalRequest
- Room hasMany Payment
- Room hasMany Contract
- Room hasMany Complaint
- RentalRequest belongsTo User as tenant
- RentalRequest belongsTo User as landlord
- RentalRequest belongsTo Room
- Payment belongsTo RentalRequest
- Payment belongsTo User as tenant
- Payment belongsTo Room
- Contract belongsTo User as tenant
- Contract belongsTo User as landlord
- Contract belongsTo User as creator
- Contract belongsTo Room
- Contract belongsTo Payment
- Contract hasMany ContractRenewal
- Complaint belongsTo User as tenant
- Complaint belongsTo User as landlord
- Complaint belongsTo Room
- Conversation belongsTo User as user
- Conversation belongsTo User as tenant
- Conversation belongsTo User as landlord
- Conversation belongsTo Room
- Conversation hasMany Message
- Message belongsTo Conversation
- Message belongsTo User as sender
- PostModeration belongsTo Room
- PostModeration belongsTo User as admin
- PostReport belongsTo Room
- PostReport belongsTo User as reporter
- AdminLog belongsTo User as admin
- Notification belongsTo User

Tạo sẵn các controller cơ bản:
- authController
- roomController
- rentalRequestController
- paymentController
- contractController
- chatController
- adminController

Tạo route tương ứng:
- /api/auth
- /api/rooms
- /api/rental-requests
- /api/payments
- /api/contracts
- /api/chat
- /api/admin

Tạo middleware:
- authMiddleware kiểm tra JWT
- roleMiddleware kiểm tra role Admin/Landlord/Tenant
- errorHandler

Tạo API mẫu:
Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/verify-otp

Rooms:
- GET /api/rooms
- GET /api/rooms/:id
- POST /api/rooms chỉ Landlord
- PUT /api/rooms/:id chỉ Landlord
- DELETE /api/rooms/:id chỉ Landlord

Rental Request:
- POST /api/rental-requests chỉ Tenant
- GET /api/rental-requests/landlord chỉ Landlord
- PUT /api/rental-requests/:id/approve chỉ Landlord
- PUT /api/rental-requests/:id/reject chỉ Landlord

Payment:
- POST /api/payments/deposit chỉ Tenant
- GET /api/payments/history chỉ Tenant

Contract:
- POST /api/contracts chỉ Landlord tạo hợp đồng
- GET /api/contracts/my-contracts cho Tenant
- PUT /api/contracts/:id/cancel
- POST /api/contracts/:id/renew

Chat:
- POST /api/chat/ai
- POST /api/chat/messages
- GET /api/chat/conversations/:id/messages

Admin:
- GET /api/admin/users
- PUT /api/admin/users/:id/ban
- PUT /api/admin/users/:id/unban
- GET /api/admin/post-moderations
- PUT /api/admin/post-moderations/:id/approve
- PUT /api/admin/post-moderations/:id/reject
- GET /api/admin/dashboard

Code cần chạy được ngay, sạch, không viết demo nửa vời.
Không dùng MongoDB.
Không dùng Prisma.
Không dùng TypeScript.
Dùng CommonJS require/module.exports.