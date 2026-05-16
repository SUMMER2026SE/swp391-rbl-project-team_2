-- =========================================================
-- DATABASE: SMART RENTAL ROOM SYSTEM (MVP SCOPE)
-- SQL Server
-- =========================================================

CREATE DATABASE SmartRentalRoomSystem;
GO

USE SmartRentalRoomSystem;
GO

-- =========================================================
-- ROLES
-- =========================================================
CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE, -- 'GUEST', 'TENANT', 'LANDLORD', 'ADMIN'
    description NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'BANNED'
    last_login_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,

    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- =========================================================
-- USER ADDRESSES
-- =========================================================
CREATE TABLE user_addresses (
    address_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    province NVARCHAR(100),
    district NVARCHAR(100),
    ward NVARCHAR(100),
    street_address NVARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_user_addresses_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- PROPERTIES (Tòa nhà / Chung cư / Dãy trọ)
-- =========================================================
CREATE TABLE properties (
    property_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    property_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    province NVARCHAR(100),
    district NVARCHAR(100),
    ward NVARCHAR(100),
    street_address NVARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,

    CONSTRAINT FK_properties_users FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- =========================================================
-- ROOMS (Chi tiết từng phòng trọ trống bên trong)
-- =========================================================
CREATE TABLE rooms (
    room_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    property_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price_per_month DECIMAL(18,2) NOT NULL,
    deposit_amount DECIMAL(18,2) DEFAULT 0, -- Số tiền cọc cần đóng để giữ chỗ
    area_m2 DECIMAL(6,2),
    max_tenants INT,
    electricity_price DECIMAL(18,2),
    water_price DECIMAL(18,2),
    internet_price DECIMAL(18,2),
    room_status VARCHAR(30) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'DEPOSITED' (Đã cọc giữ chỗ)
    available_from DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,

    CONSTRAINT FK_rooms_properties FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

-- =========================================================
-- ROOM IMAGES
-- =========================================================
CREATE TABLE room_images (
    image_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_thumbnail BIT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_room_images_rooms FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- AMENITIES (Tiện ích phòng)
-- =========================================================
CREATE TABLE amenities (
    amenity_id INT IDENTITY(1,1) PRIMARY KEY,
    amenity_name NVARCHAR(100) NOT NULL UNIQUE, -- 'air_conditioner', 'washing_machine', 'fridge'...
    icon VARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =========================================================
-- ROOM AMENITIES (Bảng trung gian n-n)
-- =========================================================
CREATE TABLE room_amenities (
    room_id BIGINT NOT NULL,
    amenity_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),

    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT FK_room_amenities_rooms FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT FK_room_amenities_amenities FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id)
);

-- =========================================================
-- ROOM POSTS (Quản lý tin đăng của chủ trọ)
-- =========================================================
CREATE TABLE room_posts (
    post_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_id BIGINT NOT NULL,
    approved_by BIGINT NULL,
    post_title NVARCHAR(255) NOT NULL,
    post_content NVARCHAR(MAX),
    post_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    rejection_reason NVARCHAR(500),
    published_at DATETIME2,
    expired_at DATETIME2,
    view_count BIGINT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,

    CONSTRAINT FK_room_posts_rooms FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT FK_room_posts_users FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- =========================================================
-- FAVORITE ROOMS
-- =========================================================
CREATE TABLE favorite_rooms (
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),

    PRIMARY KEY (user_id, room_id),
    CONSTRAINT FK_favorite_rooms_users FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT FK_favorite_rooms_rooms FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- RENTAL REQUESTS (Khách gửi yêu cầu xin thuê phòng)
-- =========================================================
CREATE TABLE rental_requests (
    request_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    message NVARCHAR(1000),
    expected_move_in_date DATE,
    number_of_people INT,
    request_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED' (Chủ trọ chịu), 'REJECTED'
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_rental_requests_rooms FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT FK_rental_requests_users FOREIGN KEY (tenant_id) REFERENCES users(user_id)
);

-- =========================================================
-- BOOKINGS (Quản lý thông tin Đặt cọc giữ chỗ sau khi được duyệt)
-- =========================================================
CREATE TABLE bookings (
    booking_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    request_id BIGINT NOT NULL UNIQUE,
    booking_code VARCHAR(50) NOT NULL UNIQUE, -- Mã booking sinh ngẫu nhiên hiển thị cho user
    agreed_price DECIMAL(18,2) NOT NULL,
    deposit_amount DECIMAL(18,2) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'WAITING_PAYMENT', -- 'WAITING_PAYMENT', 'COMPLETED' (Đã nhận tiền cọc), 'CANCELLED' (Hết hạn quét mã hoặc chủ trọ hủy)
    check_in_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_bookings_rental_requests FOREIGN KEY (request_id) REFERENCES rental_requests(request_id)
);

-- =========================================================
-- PAYMENTS (Lịch sử giao dịch tích hợp cổng thanh toán VNPay)
-- =========================================================
CREATE TABLE payments (
    payment_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    transaction_code VARCHAR(100) NOT NULL UNIQUE, -- Mã giao dịch đầu ra/đầu vào của VNPay (vnp_TxnRef hoặc vnp_TransactionNo)
    payment_method VARCHAR(50) DEFAULT 'VNPAY',
    amount DECIMAL(18,2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
    paid_at DATETIME2, -- Thời gian VNPay callback xác nhận thành công
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_payments_bookings FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- =========================================================
-- AI CHAT SESSIONS
-- =========================================================
CREATE TABLE ai_chat_sessions (
    session_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_title NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_ai_chat_sessions_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- AI CHAT MESSAGES
-- =========================================================
CREATE TABLE ai_chat_messages (
    message_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender_type VARCHAR(20), -- 'USER', 'AI'
    message_content NVARCHAR(MAX),
    token_usage INT,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_ai_chat_messages_sessions FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id)
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title NVARCHAR(255),
    content NVARCHAR(1000),
    notification_type VARCHAR(50), -- 'REQUEST_APPROVED', 'PAYMENT_SUCCESS', 'NEW_POST_PENDING'
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_notifications_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);
GO

-- =========================================================
-- PERFORMANCE INDEXES (Hỗ trợ lọc & tìm kiếm tải cao)
-- =========================================================

-- USERS INDEXES
CREATE INDEX IX_users_role_id ON users(role_id);
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_phone_number ON users(phone_number);

-- PROPERTIES INDEXES (Tối ưu tìm kiếm địa lý hành chính)
CREATE INDEX IX_properties_location ON properties(province, district, ward);
CREATE INDEX IX_properties_coordinates ON properties(latitude, longitude);

-- ROOMS INDEXES (Bộ lọc nâng cao)
CREATE INDEX IX_rooms_price ON rooms(price_per_month);
CREATE INDEX IX_rooms_area ON rooms(area_m2);
CREATE INDEX IX_rooms_status ON rooms(room_status);
CREATE INDEX IX_rooms_price_area ON rooms(price_per_month, area_m2);

-- ROOM POSTS INDEXES (Trang chủ & hiển thị bài viết được duyệt)
CREATE INDEX IX_room_posts_status ON room_posts(post_status);
CREATE INDEX IX_room_posts_published ON room_posts(published_at);
CREATE INDEX IX_room_posts_view_count ON room_posts(view_count);

-- RENTAL REQUESTS & BOOKINGS
CREATE INDEX IX_rental_requests_status ON rental_requests(request_status);
CREATE INDEX IX_rental_requests_tenant ON rental_requests(tenant_id);

-- PAYMENTS (Tra cứu giao dịch từ Webhook VNPay gửi về cực nhanh)
CREATE INDEX IX_payments_transaction ON payments(transaction_code);
CREATE INDEX IX_payments_status ON payments(payment_status);
GO