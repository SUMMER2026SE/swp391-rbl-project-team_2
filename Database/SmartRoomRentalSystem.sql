-- =========================================================
-- SMART ROOM RENTAL SYSTEM
-- Database schema synced with Sequelize models
-- Last updated: 2026-06-20
-- =========================================================

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'RentalRoomSystem')
BEGIN
    ALTER DATABASE RentalRoomSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE RentalRoomSystem;
END
GO

CREATE DATABASE RentalRoomSystem;
GO
USE RentalRoomSystem;
GO

-- =========================================================
-- 1. ROLES
-- =========================================================
CREATE TABLE roles (
    role_id INT IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description NVARCHAR(255)
);

-- =========================================================
-- 2. USERS
-- =========================================================
CREATE TABLE users (
    user_id INT IDENTITY PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,          -- NULL for Google login users
    phone VARCHAR(20) NULL,
    role_id INT NOT NULL,
    avatar_url NVARCHAR(500) NULL,
    google_id VARCHAR(255) NULL,
    is_active BIT DEFAULT 1,
    is_banned BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- =========================================================
-- 3. OTP VERIFICATIONS
-- =========================================================
CREATE TABLE otp_verifications (
    otp_id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL,             -- 'verify_email' or 'forgot_password'
    expired_at DATETIME NOT NULL,
    is_used BIT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 4. ROOMS
-- =========================================================
CREATE TABLE rooms (
    room_id INT IDENTITY PRIMARY KEY,
    landlord_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    address NVARCHAR(500) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    district NVARCHAR(100) NULL,
    ward NVARCHAR(100) NULL,
    price_per_month DECIMAL(10,2) NOT NULL,
    area_sqm DECIMAL(8,2) NULL,
    room_type VARCHAR(15) DEFAULT 'single',   -- 'single', 'double', 'shared', 'apartment', 'house'
    bedrooms INT DEFAULT 1,
    max_occupants INT DEFAULT 1,
    status VARCHAR(15) DEFAULT 'available',   -- 'available', 'rented', 'maintenance', 'inactive'
    thumbnail_url NVARCHAR(500) NULL,
    rejection_reason NVARCHAR(MAX) NULL,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 5. ROOM IMAGES
-- =========================================================
CREATE TABLE room_images (
    image_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    is_primary BIT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 6. FACILITIES (Master Table for Room & Nearby Amenities)
-- =========================================================
CREATE TABLE facilities (
    facility_id INT IDENTITY PRIMARY KEY,
    facility_name NVARCHAR(100) NOT NULL,
    category VARCHAR(15) DEFAULT 'room',      -- 'room', 'nearby'
    facility_type VARCHAR(50) DEFAULT 'other',
    created_at DATETIME DEFAULT GETDATE()
);

-- =========================================================
-- 6.1 ROOM_FACILITIES (Junction Table)
-- =========================================================
CREATE TABLE room_facilities (
    id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    facility_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Room_Facility UNIQUE(room_id, facility_id)
);

-- =========================================================
-- 7. RENTAL REQUESTS
-- =========================================================
CREATE TABLE rental_requests (
    request_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    status VARCHAR(15) DEFAULT 'pending',     -- 'pending', 'approved', 'rejected', 'cancelled'
    requested_move_in_date DATETIME NULL,
    lease_duration_months INT DEFAULT 12,
    message NVARCHAR(MAX) NULL,
    rejection_reason NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 8. CONTRACTS
-- =========================================================
CREATE TABLE contracts (
    contract_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NULL,
    status VARCHAR(50) DEFAULT 'pending',     -- 'pending', 'active', 'expired', 'terminated', 'renewed'
    tenant_agreed BIT DEFAULT 0,              -- Whether tenant has agreed to the contract
    terms_and_conditions NVARCHAR(MAX) NULL,
    document_url NVARCHAR(500) NULL,
    is_renewed BIT DEFAULT 0,
    renewal_contract_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 9. PAYMENTS
-- =========================================================
CREATE TABLE payments (
    payment_id INT IDENTITY PRIMARY KEY,
    contract_id INT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    room_id INT NOT NULL,
    viewing_schedule_id INT NULL,             -- Link to viewing schedule for deposit payments
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'rent',  -- 'rent', 'deposit', 'viewing_deposit', 'utility', 'maintenance', 'other'
    status VARCHAR(50) DEFAULT 'pending',     -- 'pending', 'completed', 'failed', 'cancelled', 'refunded'
    payment_method VARCHAR(20) NULL,          -- 'bank_transfer', 'cash', 'credit_card', 'e_wallet', 'vnpay'
    transaction_id VARCHAR(255) NULL,
    due_date DATETIME NULL,
    paid_date DATETIME NULL,
    notes NVARCHAR(MAX) NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,     -- Admin commission fee
    refund_amount DECIMAL(10,2) DEFAULT 0,    -- Amount to be refunded to tenant
    net_amount DECIMAL(10,2) DEFAULT 0,       -- Amount to be paid to landlord
    payout_status VARCHAR(15) DEFAULT 'pending', -- 'pending', 'processing', 'completed'
    payout_date DATETIME NULL,                -- When admin sent money to landlord
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 10. VIEWING SCHEDULES
-- =========================================================
CREATE TABLE viewing_schedules (
    schedule_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_payment', -- 'pending_payment', 'pending', 'scheduled', 'completed', 'cancelled', 'no_show', 'rejected', 'contract_requested', 'contract_created', 'disputed', 'dispute_resolved', 'expired'
    deposit_amount DECIMAL(10,2) NULL,        -- Deposit amount paid by tenant for viewing
    tenant_decision VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    payment_deadline DATETIME NULL,           -- Deadline for tenant to pay viewing deposit
    dispute_reason NVARCHAR(MAX) NULL,        -- Reason if tenant disputes the viewing result
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 11. COMPLAINTS
-- =========================================================
CREATE TABLE complaints (
    complaint_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    complaint_type VARCHAR(15) DEFAULT 'other', -- 'maintenance', 'noise', 'cleanliness', 'safety', 'utilities', 'other'
    status VARCHAR(15) DEFAULT 'open',          -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(10) DEFAULT 'medium',      -- 'low', 'medium', 'high', 'urgent'
    resolution_notes NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 12. CONVERSATIONS
-- =========================================================
CREATE TABLE conversations (
    conversation_id INT IDENTITY PRIMARY KEY,
    room_id INT NULL,
    participant_1_id INT NOT NULL,
    participant_2_id INT NOT NULL,
    last_message NVARCHAR(MAX) NULL,
    last_message_at DATETIME NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (participant_1_id) REFERENCES users(user_id),
    FOREIGN KEY (participant_2_id) REFERENCES users(user_id)
);

-- =========================================================
-- 13. MESSAGES
-- =========================================================
CREATE TABLE messages (
    message_id INT IDENTITY PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

-- =========================================================
-- 14. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    notification_id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    notification_type VARCHAR(20) DEFAULT 'system', -- 'rental_request', 'payment', 'complaint', 'message', 'viewing_schedule', 'contract', 'system'
    related_id INT NULL,
    is_read BIT DEFAULT 0,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 15. BOOKINGS
-- =========================================================
CREATE TABLE bookings (
    booking_id INT IDENTITY PRIMARY KEY,
    listing_id INT NOT NULL,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    type VARCHAR(15) NOT NULL,                -- 'view', 'rent', 'view_request', 'deposit'
    status VARCHAR(10) DEFAULT 'pending',     -- 'pending', 'accepted', 'rejected'
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (listing_id) REFERENCES rooms(room_id),
    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 16. FAVORITES
-- =========================================================
CREATE TABLE favorites (
    favorite_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT UQ_favorites_tenant_room UNIQUE (tenant_id, room_id)
);

-- =========================================================
-- 17. INDEXES (PERFORMANCE)
-- =========================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rooms_landlord ON rooms(landlord_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rental_requests_room ON rental_requests(room_id);
CREATE INDEX idx_rental_requests_tenant ON rental_requests(tenant_id);
CREATE INDEX idx_rental_requests_landlord ON rental_requests(landlord_id);
CREATE INDEX idx_rental_requests_status ON rental_requests(status);
CREATE INDEX idx_contracts_room ON contracts(room_id);
CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_landlord ON payments(landlord_id);
CREATE INDEX idx_payments_room ON payments(room_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_viewing_schedules_room ON viewing_schedules(room_id);
CREATE INDEX idx_viewing_schedules_tenant ON viewing_schedules(tenant_id);
CREATE INDEX idx_viewing_schedules_landlord ON viewing_schedules(landlord_id);
CREATE INDEX idx_viewing_schedules_status ON viewing_schedules(status);
CREATE INDEX idx_complaints_room ON complaints(room_id);
CREATE INDEX idx_complaints_tenant ON complaints(tenant_id);
CREATE INDEX idx_complaints_landlord ON complaints(landlord_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_room ON conversations(room_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_room_facilities_room ON room_facilities(room_id);
CREATE INDEX idx_room_images_room ON room_images(room_id);
CREATE INDEX idx_favorites_tenant ON favorites(tenant_id);
CREATE INDEX idx_favorites_room ON favorites(room_id);

-- =========================================================
-- 18. SEED DATA
-- =========================================================

-- Roles
INSERT INTO roles (role_name, description) VALUES
('Admin', N'System Administrator with full access'),
('Landlord', N'Property Owner who manages boarding houses & listings'),
('Tenant', N'Renters who search rooms, sign contracts, and send requests');



-- Facility Seed Data
INSERT INTO facilities (facility_name, category, facility_type) VALUES
(N'WiFi', 'room', 'utility'),
(N'Air Conditioner', 'room', 'appliance'),
(N'Parking', 'room', 'utility'),
(N'Private Bathroom', 'room', 'utility'),
(N'Balcony', 'room', 'utility'),
(N'Bed', 'room', 'furniture'),
(N'Wardrobe', 'room', 'furniture'),
(N'Kitchen', 'room', 'utility'),
(N'Security Camera', 'room', 'security'),
(N'Near University', 'nearby', 'education'),
(N'Near Hospital', 'nearby', 'hospital'),
(N'Near Supermarket', 'nearby', 'shopping'),
(N'Near Bus Station', 'nearby', 'transport'),
(N'Near Market', 'nearby', 'shopping'),
(N'Near Park', 'nearby', 'recreation'),
(N'Near Convenience Store', 'nearby', 'shopping');

PRINT '=========================================================';
PRINT 'Database [RentalRoomSystem] created successfully!';
PRINT 'Admin account: admin@smartroom.com / admin123';
PRINT '=========================================================';

-- =========================================
-- Table: users
-- =========================================
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1, N'Đức Trần', N'ductran281206@gmail.com', N'$2b$12$.ZGsNZB7D3TUrj0HlUzz9ewAVDP2IfPsmxUtvoU45Whzu36f4qiFC', NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLEh19aZ_gZpyAvEEaezF40fpkJ5USMN8HU5oeEswc0Ed5vcXGM=s96-c', N'107547421603725758963', 1, 0, 0, '2026-06-12 02:25:34.000', '2026-06-21 21:14:38.686');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (2, N'Duc', N'williamlata01@gmail.com', N'$2b$12$1NZ.anBIqI4QVFP9M6ot3O7zfCy7fR0LBMMjcxQ5NHDgWB9rRUzN2', N'09891207893', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117675/rental_rooms/ypzdgtlz7zj8pm9wftkm.jpg', NULL, 1, 0, 0, '2026-06-12 02:26:49.000', '2026-06-22 08:41:15.771');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1002, N'System Administrator', N'admin@smartroom.com', N'$2b$12$qnO3.m20cjJDkqY5uVUlneDfhtX1PuuKEQ8e1ZY1V4SMpsTF7hcEa', NULL, 1, NULL, NULL, 1, 0, 0, '2026-06-13 06:22:55.000', '2026-06-13 06:22:55.000');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1003, N'Hai', N'ductran28122k6@gmail.com', N'$2b$12$7C1V2UOpw30flZsRKDA5c.7U8h2AgW7TwssT9XOBpgTdHDVYi0K0S', N'0925134567', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109099/rental_rooms/xg0ysluci3ijemuxuoi5.png', NULL, 1, 0, 0, '2026-06-13 07:39:46.000', '2026-06-22 13:18:20.008');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1004, N'Nhat Kha', N'ductran28122006@gmail.com', N'$2b$12$apexARYaycd1JbZd5OhiJeOLvQqpwTRc0kbaR5tCUalBDCYQpU4GG', N'0989123456', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781958478/rental_rooms/bysd37o8oaf2lishapgs.jpg', NULL, 1, 0, 0, '2026-06-20 06:21:08.000', '2026-06-22 08:38:45.952');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1005, N'Nguyen Kha', N'nguyenkhoi190305@gmail.com', N'$2b$12$My1mpv8C0sZfOueBHY1PDu6tp/EIPrgz..ua.0sVUKvYbpZQ1ax2y', N'0989123673', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782118046/rental_rooms/rklc9cwggn8nrohwatdg.jpg', NULL, 1, 0, 0, '2026-06-22 08:46:04.035', '2026-06-22 08:47:44.393');
SET IDENTITY_INSERT [users] OFF;

-- =========================================
-- Table: rooms
-- =========================================
SET IDENTITY_INSERT [rooms] ON;
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (21, 2, N'Phòng trọ gần đại học FPT', N'Đẹp
', N'123 Đoàn Ngọc Nhạc', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, 1500000, 26, N'single', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108239/rental_rooms/e57he3puqba14a02cwhl.jpg', NULL, 0, '2026-06-22 13:04:00.325', '2026-06-22 13:04:00.325');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (22, 2, N'Phòng trọ gần đại học Bách Khoa', N'Đẹp
Thoáng mát', N'20 Lê Duẩn', N'Thành phố Đà Nẵng', N'Quận Thanh Khê', NULL, 3500000, 40, N'single', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108345/rental_rooms/pkd2uqj8k0ueh37hczx2.jpg', NULL, 0, '2026-06-22 13:05:45.979', '2026-06-22 13:05:45.979');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (23, 1003, N'Phòng trọ giá rẻ', N'Rộng rãi', N'123 Nguyễn Công Trứ', N'Thành phố Hồ Chí Minh', N'Quận Tân Bình', NULL, 1800000, 56, N'apartment', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109248/rental_rooms/ov6sbcunegel9xlv0hi3.jpg', NULL, 0, '2026-06-22 13:20:49.170', '2026-06-22 13:20:49.170');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (24, 1003, N'Căn hộ mini', N'Mát mẻ
Nhiều tiện nghi', N'10 Trần Phú', N'Tỉnh Quảng Bình', N'Huyện Lệ Thủy', NULL, 6000000, 70, N'apartment', 4, 5, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109523/rental_rooms/rmr571qyxuuchf3tvu60.jpg', NULL, 0, '2026-06-22 13:25:24.420', '2026-06-22 13:25:24.420');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (25, 1003, N'Phòng đôi ', N'Thoáng mát', N'35, Võ Chí Công', N'Tỉnh Quảng Nam', N'Thành phố Hội An', NULL, 7000000, 59, N'double', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/a8gslbormmlekb5c9cmv.jpg', NULL, 0, '2026-06-22 13:32:01.625', '2026-06-22 13:32:01.625');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (26, 1003, N'Nhà trọ ', N'Good', N'123, Nguyễn Lương Bằng', N'Tỉnh Bà Rịa - Vũng Tàu', N'Thành phố Vũng Tàu', NULL, 4560000, 60, N'house', 3, 5, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/rp3cxtv2dhjkygsbfvxs.jpg', NULL, 0, '2026-06-22 13:34:11.573', '2026-06-22 13:34:11.573');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (27, 1003, N'Phòng trọ', N'Good', N'456 Hoàn Kiếm', N'Tỉnh Ninh Thuận', N'Huyện Ninh Sơn', NULL, 10500000, 50, N'shared', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110220/rental_rooms/eanyhor8g3cociufnnqm.jpg', NULL, 0, '2026-06-22 13:37:00.936', '2026-06-22 13:37:00.936');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (28, 2, N'Phòng trọ giá rẻ', N'Good
Spacious', N'Số 30, Nam Kì Khởi Nghĩa', N'Tỉnh Bến Tre', N'Thành phố Bến Tre', NULL, 6000000, 40, N'shared', 2, 4, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110677/rental_rooms/vlrtdkryq4sptzfhf5pd.jpg', NULL, 0, '2026-06-22 13:44:37.641', '2026-06-22 13:44:37.641');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (29, 2, N'Nhà cho thuê giá rẻ', N'Good
', N'200, Phù Đổng Thiên Vương', N'Tỉnh Thừa Thiên Huế', N'Thành phố Huế', NULL, 3450000, 70, N'house', 3, 5, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111117/rental_rooms/ywevjk3tbvjvt5s4kbb8.jpg', NULL, 0, '2026-06-22 13:51:58.116', '2026-06-22 13:51:58.116');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (30, 2, N'Phòng trọ Đà Nẵng', N'Good', N'01, Nguyễn Duy Hiệu', N'Thành phố Đà Nẵng', N'Quận Sơn Trà', NULL, 800000, 60, N'double', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113106/rental_rooms/n1ntgwxd2qazejcays9t.jpg', NULL, 0, '2026-06-22 07:25:06.738', '2026-06-22 07:25:06.738');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (31, 2, N'Nhà cho thuê', N'Đẹp
Sạch sẽ', N'67, Trần Cao Vân', N'Thành phố Đà Nẵng', N'Huyện Hòa Vang', NULL, 4000000, 59, N'house', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116669/rental_rooms/vmhtchllnslqo3vto8zw.jpg', NULL, 0, '2026-06-22 08:24:30.170', '2026-06-22 08:24:30.170');
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [rejection_reason], [is_deleted], [created_at], [updated_at]) VALUES (32, 2, N'Phòng trọ gần đại học FPT', N'Good
Beautiful', N'30, Lý Thường Kiệt', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 1200000, 19, N'single', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117821/rental_rooms/nyh4jaapqt788lm0a3or.jpg', NULL, 0, '2026-06-22 08:43:42.067', '2026-06-22 08:43:42.067');
SET IDENTITY_INSERT [rooms] OFF;

-- =========================================
-- Table: room_images
-- =========================================
SET IDENTITY_INSERT [room_images] ON;
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (1, 21, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108239/rental_rooms/e57he3puqba14a02cwhl.jpg', 1, 0, '2026-06-22 13:04:00.355');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (2, 21, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108240/rental_rooms/wsktzsnfljvfhpd4dhvv.jpg', 0, 1, '2026-06-22 13:04:01.168');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (3, 22, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108345/rental_rooms/pkd2uqj8k0ueh37hczx2.jpg', 1, 0, '2026-06-22 13:05:46.011');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (4, 22, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108346/rental_rooms/tyiliopsul4vagwxwbsw.jpg', 0, 1, '2026-06-22 13:05:47.258');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (5, 23, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109248/rental_rooms/ov6sbcunegel9xlv0hi3.jpg', 1, 0, '2026-06-22 13:20:49.211');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (6, 23, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109249/rental_rooms/xfs1nvdgybrrljphg1a9.jpg', 0, 1, '2026-06-22 13:20:49.985');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (7, 24, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109523/rental_rooms/rmr571qyxuuchf3tvu60.jpg', 1, 0, '2026-06-22 13:25:24.460');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (8, 24, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109524/rental_rooms/oxqw7x2lkt85qyoxe8l1.jpg', 0, 1, '2026-06-22 13:25:25.176');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (9, 25, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/a8gslbormmlekb5c9cmv.jpg', 1, 0, '2026-06-22 13:32:01.644');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (10, 25, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/t8ns6vdqoteeh3hug3wg.jpg', 0, 1, '2026-06-22 13:32:02.365');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (11, 26, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/rp3cxtv2dhjkygsbfvxs.jpg', 1, 0, '2026-06-22 13:34:11.636');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (12, 26, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/yvhmanzmj1qvhtfevijm.jpg', 0, 1, '2026-06-22 13:34:12.400');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (13, 27, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110220/rental_rooms/eanyhor8g3cociufnnqm.jpg', 1, 0, '2026-06-22 13:37:00.969');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (14, 28, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110677/rental_rooms/vlrtdkryq4sptzfhf5pd.jpg', 1, 0, '2026-06-22 13:44:37.705');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (15, 28, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110678/rental_rooms/bvokh0h1ou7xaio5nl4o.jpg', 0, 1, '2026-06-22 13:44:38.464');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (16, 29, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111117/rental_rooms/ywevjk3tbvjvt5s4kbb8.jpg', 1, 0, '2026-06-22 13:51:58.143');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (17, 29, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111118/rental_rooms/nlpwguuzwcxp27ddssuh.jpg', 0, 1, '2026-06-22 13:51:58.809');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (18, 30, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113106/rental_rooms/n1ntgwxd2qazejcays9t.jpg', 1, 0, '2026-06-22 07:25:06.770');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (19, 30, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113107/rental_rooms/tnrghmvkk134gcjdj8cr.jpg', 0, 1, '2026-06-22 07:25:07.564');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (20, 31, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116669/rental_rooms/vmhtchllnslqo3vto8zw.jpg', 1, 0, '2026-06-22 08:24:30.205');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (21, 31, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116670/rental_rooms/gixxnvcijzcremanmec4.jpg', 0, 1, '2026-06-22 08:24:31.306');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (22, 32, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117821/rental_rooms/nyh4jaapqt788lm0a3or.jpg', 1, 0, '2026-06-22 08:43:42.091');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (23, 32, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117822/rental_rooms/pjff9dewltr48pkggtwg.jpg', 0, 1, '2026-06-22 08:43:42.845');
SET IDENTITY_INSERT [room_images] OFF;

-- =========================================
-- Table: viewing_schedules
-- =========================================
SET IDENTITY_INSERT [viewing_schedules] ON;
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (1, 28, 1004, 2, '2026-06-23 10:05:00.000', N'completed', 600000, N'rented', '2026-06-22 14:08:28.630', NULL, N'Viewing request for 2026-06-23 at 10:05. Requested from room detail page.
[TENANT]: Good', '2026-06-22 13:53:28.631', '2026-06-22 07:11:32.019');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (2, 29, 1004, 2, '2026-06-23 03:18:00.000', N'cancelled', 345000, N'pending', '2026-06-22 07:58:08.219', NULL, N'Viewing request for 2026-06-23 at 10:18. Requested from room detail page.', '2026-06-22 07:43:08.220', '2026-06-22 07:50:20.936');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (3, 29, 1004, 2, '2026-06-23 03:00:00.000', N'completed', 0, N'rejected', '2026-06-22 08:05:58.834', NULL, N'Viewing request for 2026-06-23 at 10:00. Requested from room detail page.', '2026-06-22 07:50:58.834', '2026-06-22 07:55:48.682');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (4, 29, 1004, 2, '2026-06-23 02:53:00.000', N'no_show', 0, N'pending', NULL, NULL, N'Viewing request for 2026-06-23 at 09:53. Requested from room detail page.', '2026-06-22 08:15:24.941', '2026-06-22 08:17:41.114');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (5, 29, 1005, 2, '2026-06-23 03:10:00.000', N'completed', 0, N'rented', NULL, NULL, N'Viewing request for 2026-06-23 at 10:10. Requested from room detail page.
[TENANT]: I want to rent', '2026-06-22 08:48:59.554', '2026-06-22 08:50:55.902');
SET IDENTITY_INSERT [viewing_schedules] OFF;

-- =========================================
-- Table: contracts
-- =========================================
SET IDENTITY_INSERT [contracts] ON;
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at]) VALUES (1, 28, 1004, 2, N'CT-275501-502', '2026-06-23 00:00:00.000', '2026-12-23 00:00:00.000', 6000000, 6000000, N'active', 1, N'', NULL, 0, NULL, '2026-06-22 07:11:15.519', '2026-06-22 07:11:32.000');
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at]) VALUES (2, 29, 1005, 2, N'CT-225835-036', '2026-06-25 00:00:00.000', '2026-12-25 00:00:00.000', 3450000, 3450000, N'active', 1, N'adsfsad', NULL, 0, NULL, '2026-06-22 08:50:25.849', '2026-06-22 08:50:55.887');
SET IDENTITY_INSERT [contracts] OFF;

-- =========================================
-- Table: payments
-- =========================================
SET IDENTITY_INSERT [payments] ON;
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (2, 1, 1004, 2, 28, NULL, 12000000, N'deposit', N'completed', N'vnpay', N'15593277', NULL, '2026-06-22 07:13:12.527', NULL, 600000, 0, 11400000, N'completed', '2026-06-22 07:19:25.073', '2026-06-22 07:12:04.431', '2026-06-22 07:13:12.527');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (5, 2, 1005, 2, 29, NULL, 6900000, N'deposit', N'completed', N'vnpay', N'15593491', NULL, '2026-06-22 08:51:44.335', NULL, 345000, 0, 6555000, N'completed', '2026-06-22 08:52:49.171', '2026-06-22 08:51:20.368', '2026-06-22 08:51:44.335');
SET IDENTITY_INSERT [payments] OFF;

-- =========================================
-- Table: notifications
-- =========================================
SET IDENTITY_INSERT [notifications] ON;
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (1, 2, N'New Message', N'Long sent you a message', N'message', 1, 0, NULL, '2026-06-22 13:53:35.731');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (2, 1004, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 1, 0, NULL, '2026-06-22 07:10:26.370');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (3, 2, N'Contract Request', N'Tenant wants to rent "Phòng trọ giá rẻ". Please review the draft contract and add terms.', N'contract', 1, 0, NULL, '2026-06-22 07:11:15.562');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (4, 1004, N'Contract Created', N'Landlord has created a rental contract for "Phòng trọ giá rẻ". Please review and sign.', N'contract', 1, 0, NULL, '2026-06-22 07:11:32.035');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (5, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 1, 0, NULL, '2026-06-22 07:13:12.493');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (6, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 1, 0, NULL, '2026-06-22 07:13:12.591');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (7, 1004, N'New Message', N'Duc sent you a message', N'message', 2, 0, NULL, '2026-06-22 07:19:49.531');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (8, 2, N'Viewing Schedule Cancelled', N'Tenant has cancelled the viewing for "Nhà cho thuê giá rẻ".', N'viewing_schedule', 2, 0, NULL, '2026-06-22 07:50:20.982');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (9, 1004, N'Viewing Confirmed', N'Your room viewing for "Nhà cho thuê giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 3, 0, NULL, '2026-06-22 07:54:00.971');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (10, 2, N'Tenant Declined to Rent', N'Tenant has decided not to rent "Nhà cho thuê giá rẻ" after viewing.', N'viewing_schedule', 3, 0, NULL, '2026-06-22 07:55:48.711');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (11, 1004, N'No-Show Recorded', N'You did not attend the viewing for "Nhà cho thuê giá rẻ".', N'viewing_schedule', 4, 0, NULL, '2026-06-22 08:17:41.149');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (12, 2, N'Listing Approved', N'Good news! Your listing "Nhà cho thuê" has been approved and is now live.', N'system', 31, 0, NULL, '2026-06-22 08:25:25.719');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (13, 2, N'Listing Approved', N'Good news! Your listing "Phòng trọ Đà Nẵng" has been approved and is now live.', N'system', 30, 0, NULL, '2026-06-22 08:35:19.624');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (14, 2, N'Listing Approved', N'Good news! Your listing "Phòng trọ gần đại học FPT" has been approved and is now live.', N'system', 32, 0, NULL, '2026-06-22 08:43:52.186');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (15, 2, N'New Message', N'Nguyen Kha sent you a message', N'message', 3, 0, NULL, '2026-06-22 08:48:09.528');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (16, 1005, N'New Message', N'Duc sent you a message', N'message', 4, 0, NULL, '2026-06-22 08:48:19.516');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (17, 1005, N'Viewing Confirmed', N'Your room viewing for "Nhà cho thuê giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 5, 0, NULL, '2026-06-22 08:49:43.730');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (18, 2, N'Contract Request', N'Tenant wants to rent "Nhà cho thuê giá rẻ". Please review the draft contract and add terms.', N'contract', 2, 0, NULL, '2026-06-22 08:50:25.888');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (19, 1005, N'Contract Created', N'Landlord has created a rental contract for "Nhà cho thuê giá rẻ". Please review and sign.', N'contract', 2, 0, NULL, '2026-06-22 08:50:55.916');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (20, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà cho thuê giá rẻ". The rental is now active.', N'contract', 2, 0, NULL, '2026-06-22 08:51:44.315');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (21, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà cho thuê giá rẻ". The rental is now active.', N'contract', 2, 0, NULL, '2026-06-22 08:51:44.364');
SET IDENTITY_INSERT [notifications] OFF;

