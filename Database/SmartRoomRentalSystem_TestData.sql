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
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- =========================================================
-- 3. OTP VERIFICATIONS
-- =========================================================
CREATE TABLE otp_verifications (
    otp_id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL,             -- N'verify_email' or N'forgot_password'
    expired_at DATETIMEOFFSET NOT NULL,
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
    room_type VARCHAR(15) DEFAULT N'single',   -- N'single', N'double', N'shared', N'apartment', N'house'
    bedrooms INT DEFAULT 1,
    max_occupants INT DEFAULT 1,
    status VARCHAR(15) DEFAULT N'available',   -- N'available', N'rented', N'maintenance', N'inactive'
    thumbnail_url NVARCHAR(500) NULL,
    rejection_reason NVARCHAR(MAX) NULL,
    is_deleted BIT DEFAULT 0,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    created_at DATETIMEOFFSET DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 6. FACILITIES (Master Table for Room & Nearby Amenities)
-- =========================================================
CREATE TABLE facilities (
    facility_id INT IDENTITY PRIMARY KEY,
    facility_name NVARCHAR(100) NOT NULL,
    category VARCHAR(15) DEFAULT N'room',      -- N'room', N'nearby'
    facility_type VARCHAR(50) DEFAULT N'other',
    created_at DATETIMEOFFSET DEFAULT GETDATE()
);

-- =========================================================
-- 6.1 ROOM_FACILITIES (Junction Table)
-- =========================================================
CREATE TABLE room_facilities (
    id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    facility_id INT NOT NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    status VARCHAR(15) DEFAULT N'pending',     -- N'pending', N'approved', N'rejected', N'cancelled'
    requested_move_in_date DATETIMEOFFSET NULL,
    lease_duration_months INT DEFAULT 12,
    message NVARCHAR(MAX) NULL,
    rejection_reason NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    start_date DATETIMEOFFSET NOT NULL,
    end_date DATETIMEOFFSET NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NULL,
    status VARCHAR(50) DEFAULT N'pending',     -- N'pending', N'active', N'expired', N'terminated', N'renewed'
    tenant_agreed BIT DEFAULT 0,              -- Whether tenant has agreed to the contract
    terms_and_conditions NVARCHAR(MAX) NULL,
    document_url NVARCHAR(500) NULL,
    is_renewed BIT DEFAULT 0,
    renewal_contract_id INT NULL,
    landlord_ic VARCHAR(20) NULL,
    landlord_ic_issue_date DATE NULL,
    landlord_ic_issue_place NVARCHAR(255) NULL,
    landlord_permanent_address NVARCHAR(255) NULL,
    landlord_signature NVARCHAR(MAX) NULL,
    tenant_ic VARCHAR(20) NULL,
    tenant_ic_issue_date DATE NULL,
    tenant_ic_issue_place NVARCHAR(255) NULL,
    tenant_permanent_address NVARCHAR(255) NULL,
    tenant_signature NVARCHAR(MAX) NULL,
    landlord_name NVARCHAR(255) NULL,
    tenant_name NVARCHAR(255) NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    payment_type VARCHAR(50) DEFAULT N'rent',  -- N'rent', N'deposit', N'viewing_deposit', N'utility', N'maintenance', N'other'
    status VARCHAR(50) DEFAULT N'pending',     -- N'pending', N'completed', N'failed', N'cancelled', N'refunded'
    payment_method VARCHAR(20) NULL,          -- N'bank_transfer', N'cash', N'credit_card', N'e_wallet', N'vnpay'
    transaction_id VARCHAR(255) NULL,
    due_date DATETIMEOFFSET NULL,
    paid_date DATETIMEOFFSET NULL,
    notes NVARCHAR(MAX) NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,     -- Admin commission fee
    refund_amount DECIMAL(10,2) DEFAULT 0,    -- Amount to be refunded to tenant
    net_amount DECIMAL(10,2) DEFAULT 0,       -- Amount to be paid to landlord
    payout_status VARCHAR(15) DEFAULT N'pending', -- N'pending', N'processing', N'completed'
    payout_date DATETIMEOFFSET NULL,                -- When admin sent money to landlord
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    scheduled_date DATETIMEOFFSET NOT NULL,
    status VARCHAR(50) DEFAULT N'pending_payment', -- N'pending_payment', N'pending', N'scheduled', N'completed', N'cancelled', N'no_show', N'rejected', N'contract_requested', N'contract_created', N'disputed', N'dispute_resolved', N'expired'
    deposit_amount DECIMAL(10,2) NULL,        -- Deposit amount paid by tenant for viewing
    tenant_decision VARCHAR(50) DEFAULT N'pending', -- N'pending', N'accepted', N'rejected'
    payment_deadline DATETIMEOFFSET NULL,           -- Deadline for tenant to pay viewing deposit
    dispute_reason NVARCHAR(MAX) NULL,        -- Reason if tenant disputes the viewing result
    notes NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    complaint_type VARCHAR(15) DEFAULT N'other', -- N'maintenance', N'noise', N'cleanliness', N'safety', N'utilities', N'other'
    status VARCHAR(15) DEFAULT N'open',          -- N'open', N'in_progress', N'resolved', N'closed'
    priority VARCHAR(10) DEFAULT N'medium',      -- N'low', N'medium', N'high', N'urgent'
    resolution_notes NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    last_message_at DATETIMEOFFSET NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    read_at DATETIMEOFFSET NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    notification_type VARCHAR(20) DEFAULT N'system', -- N'rental_request', N'payment', N'complaint', N'message', N'viewing_schedule', N'contract', N'system'
    related_id INT NULL,
    is_read BIT DEFAULT 0,
    read_at DATETIMEOFFSET NULL,
    created_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    type VARCHAR(15) NOT NULL,                -- N'view', N'rent', N'view_request', N'deposit'
    status VARCHAR(10) DEFAULT N'pending',     -- N'pending', N'accepted', N'rejected'
    created_at DATETIMEOFFSET DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET DEFAULT GETDATE(),

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
    created_at DATETIMEOFFSET DEFAULT GETDATE(),

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


-- ==========================================
-- 18. SEED DATA
-- ==========================================

-- Data for roles
SET IDENTITY_INSERT [roles] ON;
INSERT INTO [roles] ([role_id], [role_name], [description]) VALUES (1, N'Admin', N'System Administrator with full access');
INSERT INTO [roles] ([role_id], [role_name], [description]) VALUES (2, N'Landlord', N'Property Owner who manages boarding houses & listings');
INSERT INTO [roles] ([role_id], [role_name], [description]) VALUES (3, N'Tenant', N'Renters who search rooms, sign contracts, and send requests');
SET IDENTITY_INSERT [roles] OFF;
GO

-- Data for users
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1, N'Đức Trần', N'ductran281206@gmail.com', N'$2b$12$.ZGsNZB7D3TUrj0HlUzz9ewAVDP2IfPsmxUtvoU45Whzu36f4qiFC', N'0989230999', 3, N'https://lh3.googleusercontent.com/a/ACg8ocLEh19aZ_gZpyAvEEaezF40fpkJ5USMN8HU5oeEswc0Ed5vcXGM=s96-c', N'107547421603725758963', 1, 0, 0, N'2026-06-12 02:25:34.000', N'2026-06-24 03:31:41.516');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (2, N'Duc', N'williamlata01@gmail.com', N'$2b$12$1NZ.anBIqI4QVFP9M6ot3O7zfCy7fR0LBMMjcxQ5NHDgWB9rRUzN2', N'0989120789', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117675/rental_rooms/ypzdgtlz7zj8pm9wftkm.jpg', NULL, 1, 0, 0, N'2026-06-12 02:26:49.000', N'2026-06-24 03:34:43.507');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1002, N'System Administrator', N'admin@smartroom.com', N'$2b$12$qnO3.m20cjJDkqY5uVUlneDfhtX1PuuKEQ8e1ZY1V4SMpsTF7hcEa', NULL, 1, NULL, NULL, 1, 0, 0, N'2026-06-13 06:22:55.000', N'2026-06-13 06:22:55.000');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1003, N'Hai', N'ductran28122k6@gmail.com', N'$2b$12$7C1V2UOpw30flZsRKDA5c.7U8h2AgW7TwssT9XOBpgTdHDVYi0K0S', N'0925134567', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782218159/rental_rooms/jkmqpmkk5is2u8aqvyw1.jpg', NULL, 1, 0, 0, N'2026-06-13 07:39:46.000', N'2026-06-23 12:35:59.513');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1004, N'Nhat Kha', N'ductran28122006@gmail.com', N'$2b$12$apexARYaycd1JbZd5OhiJeOLvQqpwTRc0kbaR5tCUalBDCYQpU4GG', N'0989123456', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781958478/rental_rooms/bysd37o8oaf2lishapgs.jpg', NULL, 1, 0, 0, N'2026-06-20 06:21:08.000', N'2026-06-22 08:38:45.952');
INSERT INTO [users] ([user_id], [full_name], [email], [password_hash], [phone], [role_id], [avatar_url], [google_id], [is_active], [is_banned], [is_deleted], [created_at], [updated_at]) VALUES (1005, N'Nguyen Kha', N'nguyenkhoi190305@gmail.com', N'$2b$12$My1mpv8C0sZfOueBHY1PDu6tp/EIPrgz..ua.0sVUKvYbpZQ1ax2y', N'0989123673', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782118046/rental_rooms/rklc9cwggn8nrohwatdg.jpg', NULL, 1, 0, 0, N'2026-06-22 08:46:04.035', N'2026-06-22 08:47:44.393');
SET IDENTITY_INSERT [users] OFF;
GO

EXEC sp_MSForEachTable N'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
GO

-- Data for facilities
SET IDENTITY_INSERT [facilities] ON;
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (1, N'WiFi', N'room', N'utility', N'2026-06-22 13:04:01.220');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (2, N'Air Conditioner', N'room', N'appliance', N'2026-06-22 13:04:01.298');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (3, N'Parking', N'room', N'utility', N'2026-06-22 13:04:01.344');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (4, N'Private Bathroom', N'room', N'utility', N'2026-06-22 13:04:01.398');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (5, N'Balcony', N'room', N'utility', N'2026-06-22 13:04:01.451');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (6, N'Bed', N'room', N'furniture', N'2026-06-22 13:04:01.523');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (7, N'Wardrobe', N'room', N'furniture', N'2026-06-22 13:04:01.586');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (8, N'Kitchen', N'room', N'utility', N'2026-06-22 13:04:01.655');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (9, N'Security Camera', N'room', N'security', N'2026-06-22 13:04:01.713');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (10, N'Near University', N'nearby', N'education', N'2026-06-22 13:04:01.767');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (11, N'Near Hospital', N'nearby', N'hospital', N'2026-06-22 13:04:01.820');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (12, N'Near Supermarket', N'nearby', N'shopping', N'2026-06-22 13:04:01.867');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (13, N'Near Bus Station', N'nearby', N'transport', N'2026-06-22 13:04:01.915');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (14, N'Near Market', N'nearby', N'shopping', N'2026-06-22 13:04:01.961');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (15, N'Near Park', N'nearby', N'recreation', N'2026-06-22 13:05:47.766');
INSERT INTO [facilities] ([facility_id], [facility_name], [category], [facility_type], [created_at]) VALUES (16, N'Near Convenience Store', N'nearby', N'shopping', N'2026-06-22 13:05:47.821');
SET IDENTITY_INSERT [facilities] OFF;
GO

-- Data for otp_verifications
SET IDENTITY_INSERT [otp_verifications] ON;
INSERT INTO [otp_verifications] ([otp_id], [user_id], [otp_code], [purpose], [expired_at], [is_used]) VALUES (1, 1005, N'646747', N'verify_email', N'2026-06-22 08:51:04.052', 1);
SET IDENTITY_INSERT [otp_verifications] OFF;
GO

-- Data for rooms
SET IDENTITY_INSERT [rooms] ON;
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (21, 2, N'Phòng trọ gần đại học FPT', N'Đẹp
', N'123 Đoàn Ngọc Nhạc', N'Thành phố Đà Nẵng', N'Quận Hải Châu', NULL, 1500000, 26, N'single', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108239/rental_rooms/e57he3puqba14a02cwhl.jpg', 0, N'2026-06-22 13:04:00.325', N'2026-06-22 13:04:00.325', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (22, 2, N'Phòng trọ gần đại học Bách Khoa', N'Đẹp
Thoáng mát', N'20 Lê Duẩn', N'Thành phố Đà Nẵng', N'Quận Thanh Khê', NULL, 3500000, 40, N'single', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108345/rental_rooms/pkd2uqj8k0ueh37hczx2.jpg', 0, N'2026-06-22 13:05:45.979', N'2026-06-22 13:05:45.979', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (23, 1003, N'Phòng trọ giá rẻ', N'Rộng rãi', N'123 Nguyễn Công Trứ', N'Thành phố Hồ Chí Minh', N'Quận Tân Bình', NULL, 1800000, 56, N'apartment', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109248/rental_rooms/ov6sbcunegel9xlv0hi3.jpg', 0, N'2026-06-22 13:20:49.170', N'2026-06-23 08:34:29.000', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (24, 1003, N'Căn hộ mini', N'Mát mẻ
Nhiều tiện nghi', N'10 Trần Phú', N'Tỉnh Quảng Bình', N'Huyện Lệ Thủy', NULL, 6000000, 70, N'apartment', 4, 5, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109523/rental_rooms/rmr571qyxuuchf3tvu60.jpg', 0, N'2026-06-22 13:25:24.420', N'2026-06-22 13:25:24.420', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (25, 1003, N'Phòng đôi ', N'Thoáng mát', N'35, Võ Chí Công', N'Tỉnh Quảng Nam', N'Thành phố Hội An', NULL, 7000000, 59, N'double', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/a8gslbormmlekb5c9cmv.jpg', 0, N'2026-06-22 13:32:01.625', N'2026-06-22 13:32:01.625', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (26, 1003, N'Nhà trọ ', N'Good', N'123, Nguyễn Lương Bằng', N'Tỉnh Bà Rịa - Vũng Tàu', N'Thành phố Vũng Tàu', NULL, 4560000, 60, N'house', 3, 5, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/rp3cxtv2dhjkygsbfvxs.jpg', 0, N'2026-06-22 13:34:11.573', N'2026-06-22 13:34:11.573', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (27, 1003, N'Phòng trọ', N'Good', N'456 Hoàn Kiếm', N'Tỉnh Ninh Thuận', N'Huyện Ninh Sơn', NULL, 10500000, 50, N'shared', 2, 4, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110220/rental_rooms/eanyhor8g3cociufnnqm.jpg', 0, N'2026-06-22 13:37:00.936', N'2026-06-22 13:37:00.936', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (28, 2, N'Phòng trọ giá rẻ', N'Good
Spacious', N'Số 30, Nam Kì Khởi Nghĩa', N'Tỉnh Bến Tre', N'Thành phố Bến Tre', NULL, 6000000, 40, N'shared', 2, 4, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110677/rental_rooms/vlrtdkryq4sptzfhf5pd.jpg', 0, N'2026-06-22 13:44:37.641', N'2026-06-23 20:36:52.000', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (29, 2, N'Nhà cho thuê giá rẻ', N'Good
', N'200, Phù Đổng Thiên Vương', N'Tỉnh Thừa Thiên Huế', N'Thành phố Huế', NULL, 3450000, 70, N'house', 3, 5, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111117/rental_rooms/ywevjk3tbvjvt5s4kbb8.jpg', 0, N'2026-06-22 13:51:58.116', N'2026-06-22 13:51:58.116', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (30, 2, N'Phòng trọ Đà Nẵng', N'Good', N'01, Nguyễn Duy Hiệu', N'Thành phố Đà Nẵng', N'Quận Sơn Trà', NULL, 800000, 60, N'double', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113106/rental_rooms/n1ntgwxd2qazejcays9t.jpg', 0, N'2026-06-22 07:25:06.738', N'2026-06-22 07:25:06.738', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (31, 2, N'Nhà cho thuê', N'Đẹp
Sạch sẽ', N'67, Trần Cao Vân', N'Thành phố Đà Nẵng', N'Huyện Hòa Vang', NULL, 4000000, 59, N'house', 2, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116669/rental_rooms/vmhtchllnslqo3vto8zw.jpg', 0, N'2026-06-22 08:24:30.170', N'2026-06-24 06:26:02.128', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (32, 2, N'Phòng trọ gần đại học FPT', N'Good
Beautiful', N'30, Lý Thường Kiệt', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 1200000, 19, N'single', 1, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117821/rental_rooms/nyh4jaapqt788lm0a3or.jpg', 0, N'2026-06-22 08:43:42.067', N'2026-06-22 08:43:42.067', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (33, 2, N'Good', N'Good', N'56, Trần Hưng Đạo', N'Thành phố Đà Nẵng', N'Quận Liên Chiểu', NULL, 4500000, 40, N'single', 2, 3, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782200684/rental_rooms/xuvgonuczerotogiggan.jpg', 0, N'2026-06-23 07:44:45.213', N'2026-06-23 07:44:45.214', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (34, 1003, N'Good', N'Good
Spaciousdfskjaf
àkfkjsahdkdsfksahkdf
ákdfhsafkjhdkfasfdsafdsa', N'10, Nguyen Van Linh', N'Tỉnh Quảng Nam', N'Huyện Thăng Bình', NULL, 3450000, 40, N'single', 1, 4, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782226538/rental_rooms/jhzxbxhnehbsqth6yxbs.jpg', 0, N'2026-06-23 14:55:38.333', N'2026-06-23 14:55:38.333', NULL);
INSERT INTO [rooms] ([room_id], [landlord_id], [title], [description], [address], [city], [district], [ward], [price_per_month], [area_sqm], [room_type], [bedrooms], [max_occupants], [status], [thumbnail_url], [is_deleted], [created_at], [updated_at], [rejection_reason]) VALUES (35, 2, N'Phòng trọ gần đại học kinh tế', N'Good
Spacious
Beautiful
Airy', N'20 Nguyễn Trãi', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 2000000, 20, N'private_room', 1, 3, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782274241/rental_rooms/skbeu3epxj1ahgqxduzl.jpg', 0, N'2026-06-24 04:10:40.825', N'2026-06-24 04:10:40.825', NULL);
SET IDENTITY_INSERT [rooms] OFF;
GO

-- Data for room_images
SET IDENTITY_INSERT [room_images] ON;
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (1, 21, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108239/rental_rooms/e57he3puqba14a02cwhl.jpg', 1, 0, N'2026-06-22 13:04:00.355');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (2, 21, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108240/rental_rooms/wsktzsnfljvfhpd4dhvv.jpg', 0, 1, N'2026-06-22 13:04:01.168');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (3, 22, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108345/rental_rooms/pkd2uqj8k0ueh37hczx2.jpg', 1, 0, N'2026-06-22 13:05:46.011');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (4, 22, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782108346/rental_rooms/tyiliopsul4vagwxwbsw.jpg', 0, 1, N'2026-06-22 13:05:47.258');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (5, 23, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109248/rental_rooms/ov6sbcunegel9xlv0hi3.jpg', 1, 0, N'2026-06-22 13:20:49.211');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (6, 23, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109249/rental_rooms/xfs1nvdgybrrljphg1a9.jpg', 0, 1, N'2026-06-22 13:20:49.985');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (7, 24, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109523/rental_rooms/rmr571qyxuuchf3tvu60.jpg', 1, 0, N'2026-06-22 13:25:24.460');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (8, 24, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109524/rental_rooms/oxqw7x2lkt85qyoxe8l1.jpg', 0, 1, N'2026-06-22 13:25:25.176');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (9, 25, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/a8gslbormmlekb5c9cmv.jpg', 1, 0, N'2026-06-22 13:32:01.644');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (10, 25, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782109921/rental_rooms/t8ns6vdqoteeh3hug3wg.jpg', 0, 1, N'2026-06-22 13:32:02.365');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (11, 26, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/rp3cxtv2dhjkygsbfvxs.jpg', 1, 0, N'2026-06-22 13:34:11.636');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (12, 26, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110051/rental_rooms/yvhmanzmj1qvhtfevijm.jpg', 0, 1, N'2026-06-22 13:34:12.400');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (13, 27, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110220/rental_rooms/eanyhor8g3cociufnnqm.jpg', 1, 0, N'2026-06-22 13:37:00.969');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (14, 28, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110677/rental_rooms/vlrtdkryq4sptzfhf5pd.jpg', 1, 0, N'2026-06-22 13:44:37.705');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (15, 28, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782110678/rental_rooms/bvokh0h1ou7xaio5nl4o.jpg', 0, 1, N'2026-06-22 13:44:38.464');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (16, 29, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111117/rental_rooms/ywevjk3tbvjvt5s4kbb8.jpg', 1, 0, N'2026-06-22 13:51:58.143');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (17, 29, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782111118/rental_rooms/nlpwguuzwcxp27ddssuh.jpg', 0, 1, N'2026-06-22 13:51:58.809');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (18, 30, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113106/rental_rooms/n1ntgwxd2qazejcays9t.jpg', 1, 0, N'2026-06-22 07:25:06.770');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (19, 30, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782113107/rental_rooms/tnrghmvkk134gcjdj8cr.jpg', 0, 1, N'2026-06-22 07:25:07.564');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (20, 31, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116669/rental_rooms/vmhtchllnslqo3vto8zw.jpg', 1, 0, N'2026-06-22 08:24:30.205');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (21, 31, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782116670/rental_rooms/gixxnvcijzcremanmec4.jpg', 0, 1, N'2026-06-22 08:24:31.306');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (22, 32, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117821/rental_rooms/nyh4jaapqt788lm0a3or.jpg', 1, 0, N'2026-06-22 08:43:42.091');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (23, 32, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782117822/rental_rooms/pjff9dewltr48pkggtwg.jpg', 0, 1, N'2026-06-22 08:43:42.845');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (24, 33, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782200684/rental_rooms/xuvgonuczerotogiggan.jpg', 1, 0, N'2026-06-23 07:44:45.249');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (25, 33, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782200685/rental_rooms/ktaq66p467nfjmi12h72.jpg', 0, 1, N'2026-06-23 07:44:45.915');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (26, 34, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782226538/rental_rooms/jhzxbxhnehbsqth6yxbs.jpg', 1, 0, N'2026-06-23 14:55:38.447');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (27, 34, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782226539/rental_rooms/abspl1mqgah6uquegahf.jpg', 0, 1, N'2026-06-23 14:55:39.669');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (28, 35, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782274241/rental_rooms/skbeu3epxj1ahgqxduzl.jpg', 1, 0, N'2026-06-24 04:10:40.847');
INSERT INTO [room_images] ([image_id], [room_id], [image_url], [is_primary], [display_order], [created_at]) VALUES (29, 35, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782274242/rental_rooms/tavtycxayb6doqfunh1o.jpg', 0, 1, N'2026-06-24 04:10:42.785');
SET IDENTITY_INSERT [room_images] OFF;
GO

-- Data for room_facilities
SET IDENTITY_INSERT [room_facilities] ON;
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (1, 21, 1, N'2026-06-22 13:04:01.250');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (2, 21, 2, N'2026-06-22 13:04:01.316');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (3, 21, 3, N'2026-06-22 13:04:01.366');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (4, 21, 4, N'2026-06-22 13:04:01.415');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (5, 21, 5, N'2026-06-22 13:04:01.475');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (6, 21, 6, N'2026-06-22 13:04:01.546');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (7, 21, 7, N'2026-06-22 13:04:01.624');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (8, 21, 8, N'2026-06-22 13:04:01.673');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (9, 21, 9, N'2026-06-22 13:04:01.736');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (10, 21, 10, N'2026-06-22 13:04:01.789');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (11, 21, 11, N'2026-06-22 13:04:01.838');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (12, 21, 12, N'2026-06-22 13:04:01.886');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (13, 21, 13, N'2026-06-22 13:04:01.932');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (14, 21, 14, N'2026-06-22 13:04:01.979');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (15, 22, 1, N'2026-06-22 13:05:47.313');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (16, 22, 2, N'2026-06-22 13:05:47.359');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (17, 22, 3, N'2026-06-22 13:05:47.400');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (18, 22, 4, N'2026-06-22 13:05:47.439');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (19, 22, 5, N'2026-06-22 13:05:47.477');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (20, 22, 6, N'2026-06-22 13:05:47.513');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (21, 22, 7, N'2026-06-22 13:05:47.551');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (22, 22, 8, N'2026-06-22 13:05:47.590');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (23, 22, 9, N'2026-06-22 13:05:47.625');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (24, 22, 11, N'2026-06-22 13:05:47.663');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (25, 22, 12, N'2026-06-22 13:05:47.697');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (26, 22, 14, N'2026-06-22 13:05:47.735');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (27, 22, 15, N'2026-06-22 13:05:47.784');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (28, 22, 16, N'2026-06-22 13:05:47.838');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (29, 23, 1, N'2026-06-22 13:20:50.042');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (30, 23, 2, N'2026-06-22 13:20:50.088');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (31, 23, 3, N'2026-06-22 13:20:50.127');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (32, 23, 4, N'2026-06-22 13:20:50.165');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (33, 23, 7, N'2026-06-22 13:20:50.207');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (34, 23, 11, N'2026-06-22 13:20:50.257');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (35, 23, 13, N'2026-06-22 13:20:50.296');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (36, 23, 14, N'2026-06-22 13:20:50.339');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (37, 24, 1, N'2026-06-22 13:25:25.235');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (38, 24, 2, N'2026-06-22 13:25:25.281');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (39, 24, 4, N'2026-06-22 13:25:25.330');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (40, 24, 9, N'2026-06-22 13:25:25.368');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (41, 24, 14, N'2026-06-22 13:25:25.406');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (42, 24, 16, N'2026-06-22 13:25:25.452');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (43, 25, 1, N'2026-06-22 13:32:02.415');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (44, 25, 2, N'2026-06-22 13:32:02.456');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (45, 25, 3, N'2026-06-22 13:32:02.490');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (46, 25, 4, N'2026-06-22 13:32:02.527');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (47, 25, 5, N'2026-06-22 13:32:02.569');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (48, 25, 6, N'2026-06-22 13:32:02.611');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (49, 25, 7, N'2026-06-22 13:32:02.649');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (50, 25, 8, N'2026-06-22 13:32:02.688');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (51, 25, 9, N'2026-06-22 13:32:02.725');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (52, 25, 10, N'2026-06-22 13:32:02.760');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (53, 25, 11, N'2026-06-22 13:32:02.794');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (54, 25, 12, N'2026-06-22 13:32:02.828');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (55, 25, 13, N'2026-06-22 13:32:02.867');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (56, 25, 14, N'2026-06-22 13:32:02.903');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (57, 25, 15, N'2026-06-22 13:32:02.937');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (58, 25, 16, N'2026-06-22 13:32:02.973');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (59, 26, 1, N'2026-06-22 13:34:12.454');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (60, 26, 2, N'2026-06-22 13:34:12.494');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (61, 26, 3, N'2026-06-22 13:34:12.529');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (62, 26, 4, N'2026-06-22 13:34:12.563');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (63, 26, 5, N'2026-06-22 13:34:12.596');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (64, 26, 6, N'2026-06-22 13:34:12.630');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (65, 26, 7, N'2026-06-22 13:34:12.664');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (66, 26, 8, N'2026-06-22 13:34:12.698');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (67, 26, 9, N'2026-06-22 13:34:12.731');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (68, 26, 11, N'2026-06-22 13:34:12.770');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (69, 26, 14, N'2026-06-22 13:34:12.803');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (70, 27, 1, N'2026-06-22 13:37:01.038');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (71, 27, 2, N'2026-06-22 13:37:01.095');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (72, 27, 3, N'2026-06-22 13:37:01.128');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (73, 27, 4, N'2026-06-22 13:37:01.164');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (74, 27, 5, N'2026-06-22 13:37:01.204');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (75, 27, 6, N'2026-06-22 13:37:01.243');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (76, 27, 7, N'2026-06-22 13:37:01.279');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (77, 27, 8, N'2026-06-22 13:37:01.320');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (78, 27, 9, N'2026-06-22 13:37:01.359');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (79, 27, 12, N'2026-06-22 13:37:01.393');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (80, 27, 14, N'2026-06-22 13:37:01.430');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (81, 27, 15, N'2026-06-22 13:37:01.461');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (82, 27, 16, N'2026-06-22 13:37:01.494');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (83, 28, 1, N'2026-06-22 13:44:38.527');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (84, 28, 2, N'2026-06-22 13:44:38.573');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (85, 28, 3, N'2026-06-22 13:44:38.611');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (86, 28, 4, N'2026-06-22 13:44:38.655');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (87, 28, 5, N'2026-06-22 13:44:38.695');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (88, 28, 7, N'2026-06-22 13:44:38.734');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (89, 28, 8, N'2026-06-22 13:44:38.774');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (90, 28, 11, N'2026-06-22 13:44:38.811');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (91, 28, 12, N'2026-06-22 13:44:38.848');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (92, 28, 14, N'2026-06-22 13:44:38.882');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (93, 28, 15, N'2026-06-22 13:44:38.916');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (94, 29, 2, N'2026-06-22 13:51:58.867');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (95, 29, 3, N'2026-06-22 13:51:58.902');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (96, 29, 5, N'2026-06-22 13:51:58.931');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (97, 29, 6, N'2026-06-22 13:51:58.959');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (98, 29, 8, N'2026-06-22 13:51:58.994');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (99, 29, 13, N'2026-06-22 13:51:59.041');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (100, 29, 14, N'2026-06-22 13:51:59.089');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (101, 29, 16, N'2026-06-22 13:51:59.134');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (102, 30, 1, N'2026-06-22 07:25:07.654');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (103, 30, 2, N'2026-06-22 07:25:07.699');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (104, 30, 3, N'2026-06-22 07:25:07.742');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (105, 30, 4, N'2026-06-22 07:25:07.784');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (106, 30, 5, N'2026-06-22 07:25:07.829');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (107, 30, 6, N'2026-06-22 07:25:07.877');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (108, 30, 7, N'2026-06-22 07:25:07.921');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (109, 30, 8, N'2026-06-22 07:25:07.961');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (110, 30, 9, N'2026-06-22 07:25:07.999');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (111, 30, 11, N'2026-06-22 07:25:08.037');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (112, 30, 12, N'2026-06-22 07:25:08.078');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (113, 31, 1, N'2026-06-22 08:24:31.397');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (114, 31, 2, N'2026-06-22 08:24:31.466');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (115, 31, 3, N'2026-06-22 08:24:31.508');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (116, 31, 4, N'2026-06-22 08:24:31.537');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (117, 31, 5, N'2026-06-22 08:24:31.570');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (118, 31, 6, N'2026-06-22 08:24:31.612');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (119, 31, 7, N'2026-06-22 08:24:31.658');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (120, 31, 8, N'2026-06-22 08:24:31.716');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (121, 31, 9, N'2026-06-22 08:24:31.764');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (122, 31, 10, N'2026-06-22 08:24:31.811');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (123, 31, 13, N'2026-06-22 08:24:31.844');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (124, 31, 14, N'2026-06-22 08:24:31.891');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (125, 32, 1, N'2026-06-22 08:43:42.907');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (126, 32, 2, N'2026-06-22 08:43:42.951');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (127, 32, 3, N'2026-06-22 08:43:42.983');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (128, 32, 4, N'2026-06-22 08:43:43.007');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (129, 32, 5, N'2026-06-22 08:43:43.030');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (130, 32, 6, N'2026-06-22 08:43:43.054');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (131, 32, 7, N'2026-06-22 08:43:43.079');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (132, 32, 8, N'2026-06-22 08:43:43.099');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (133, 32, 9, N'2026-06-22 08:43:43.118');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (134, 32, 10, N'2026-06-22 08:43:43.143');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (135, 32, 11, N'2026-06-22 08:43:43.166');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (136, 32, 13, N'2026-06-22 08:43:43.187');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (137, 32, 14, N'2026-06-22 08:43:43.208');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (138, 33, 1, N'2026-06-23 07:44:45.983');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (139, 33, 2, N'2026-06-23 07:44:46.044');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (140, 33, 3, N'2026-06-23 07:44:46.087');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (141, 33, 4, N'2026-06-23 07:44:46.131');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (142, 33, 5, N'2026-06-23 07:44:46.168');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (143, 33, 6, N'2026-06-23 07:44:46.213');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (144, 33, 7, N'2026-06-23 07:44:46.264');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (145, 33, 8, N'2026-06-23 07:44:46.307');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (146, 33, 9, N'2026-06-23 07:44:46.342');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (147, 33, 11, N'2026-06-23 07:44:46.384');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (148, 33, 14, N'2026-06-23 07:44:46.414');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (149, 34, 1, N'2026-06-23 14:55:39.796');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (150, 34, 2, N'2026-06-23 14:55:39.872');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (151, 34, 3, N'2026-06-23 14:55:39.949');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (152, 34, 4, N'2026-06-23 14:55:40.070');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (153, 34, 5, N'2026-06-23 14:55:40.125');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (154, 34, 6, N'2026-06-23 14:55:40.173');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (155, 34, 7, N'2026-06-23 14:55:40.220');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (156, 34, 8, N'2026-06-23 14:55:40.303');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (157, 34, 9, N'2026-06-23 14:55:40.374');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (158, 34, 11, N'2026-06-23 14:55:40.424');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (159, 34, 13, N'2026-06-23 14:55:40.472');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (160, 34, 14, N'2026-06-23 14:55:40.570');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (161, 35, 1, N'2026-06-24 04:10:42.843');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (162, 35, 2, N'2026-06-24 04:10:42.890');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (163, 35, 3, N'2026-06-24 04:10:42.925');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (164, 35, 4, N'2026-06-24 04:10:42.958');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (165, 35, 5, N'2026-06-24 04:10:43.001');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (166, 35, 6, N'2026-06-24 04:10:43.035');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (167, 35, 7, N'2026-06-24 04:10:43.067');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (168, 35, 8, N'2026-06-24 04:10:43.101');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (169, 35, 9, N'2026-06-24 04:10:43.133');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (170, 35, 11, N'2026-06-24 04:10:43.166');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (171, 35, 13, N'2026-06-24 04:10:43.200');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (172, 35, 14, N'2026-06-24 04:10:43.234');
INSERT INTO [room_facilities] ([id], [room_id], [facility_id], [created_at]) VALUES (173, 35, 16, N'2026-06-24 04:10:43.266');
SET IDENTITY_INSERT [room_facilities] OFF;
GO

-- Data for conversations
SET IDENTITY_INSERT [conversations] ON;
INSERT INTO [conversations] ([conversation_id], [room_id], [participant_1_id], [participant_2_id], [last_message], [last_message_at], [is_active], [created_at], [updated_at]) VALUES (1, 28, 1004, 2, N'Hello', N'2026-06-22 07:19:49.518', 1, N'2026-06-22 13:53:32.518', N'2026-06-22 13:53:32.518');
INSERT INTO [conversations] ([conversation_id], [room_id], [participant_1_id], [participant_2_id], [last_message], [last_message_at], [is_active], [created_at], [updated_at]) VALUES (2, 29, 1005, 2, N'Hello', N'2026-06-22 08:48:19.504', 1, N'2026-06-22 08:48:04.095', N'2026-06-22 08:48:04.095');
SET IDENTITY_INSERT [conversations] OFF;
GO

-- Data for messages
SET IDENTITY_INSERT [messages] ON;
INSERT INTO [messages] ([message_id], [conversation_id], [sender_id], [content], [is_read], [read_at], [created_at]) VALUES (1, 1, 1004, N'Hello', 0, NULL, N'2026-06-22 13:53:35.703');
INSERT INTO [messages] ([message_id], [conversation_id], [sender_id], [content], [is_read], [read_at], [created_at]) VALUES (2, 1, 2, N'Hello', 0, NULL, N'2026-06-22 07:19:49.493');
INSERT INTO [messages] ([message_id], [conversation_id], [sender_id], [content], [is_read], [read_at], [created_at]) VALUES (3, 2, 1005, N'Hello', 0, NULL, N'2026-06-22 08:48:09.504');
INSERT INTO [messages] ([message_id], [conversation_id], [sender_id], [content], [is_read], [read_at], [created_at]) VALUES (4, 2, 2, N'Hello', 0, NULL, N'2026-06-22 08:48:19.494');
SET IDENTITY_INSERT [messages] OFF;
GO

-- Data for rental_requests
SET IDENTITY_INSERT [rental_requests] ON;
INSERT INTO [rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (1, 23, 1, 1003, N'completed', N'2026-06-25 00:00:00.000', 6, NULL, NULL, N'2026-06-23 15:19:42.742', N'2026-06-23 09:27:39.000');
INSERT INTO [rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (2, 28, 1004, 2, N'completed', N'2026-07-01 00:00:00.000', 6, NULL, NULL, N'2026-06-24 03:36:33.898', N'2026-06-24 03:44:14.281');
INSERT INTO [rental_requests] ([request_id], [room_id], [tenant_id], [landlord_id], [status], [requested_move_in_date], [lease_duration_months], [message], [rejection_reason], [created_at], [updated_at]) VALUES (3, 35, 1005, 2, N'completed', N'2026-06-25 00:00:00.000', 6, NULL, NULL, N'2026-06-24 06:48:17.183', N'2026-06-24 06:52:15.175');
SET IDENTITY_INSERT [rental_requests] OFF;
GO

-- Data for contracts
SET IDENTITY_INSERT [contracts] ON;
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (1, 28, 1004, 2, N'CT-275501-502', N'2026-06-23 00:00:00.000', N'2026-12-23 00:00:00.000', 6000000, 6000000, N'active', 1, N'', NULL, 0, NULL, N'2026-06-22 07:11:15.519', N'2026-06-22 07:11:32.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (2, 29, 1005, 2, N'CT-225835-036', N'2026-06-25 00:00:00.000', N'2026-12-25 00:00:00.000', 3450000, 3450000, N'active', 1, N'adsfsad', NULL, 0, NULL, N'2026-06-22 08:50:25.849', N'2026-06-22 08:50:55.887', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (3, 33, 1, 2, N'CT-584218-122', N'2026-06-24 00:00:00.000', N'2026-12-24 00:00:00.000', 4500000, 4500000, N'active', 1, N'Good', NULL, 0, NULL, N'2026-06-23 08:49:44.231', N'2026-06-23 08:50:01.206', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (4, 26, 1, 1003, N'CT-878736-616', N'2026-06-24 00:00:00.000', N'2026-12-24 00:00:00.000', 4560000, 4560000, N'active', 1, N'Oke', NULL, 0, NULL, N'2026-06-23 09:44:38.755', N'2026-06-23 11:39:25.835', N'049206014690', N'2021-06-23', N'Cục cảnh sát', N'20 Trần Cao Vân', N'data:image/png;base64,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', N'049206012345', N'2021-05-23', N'Cục cảnh sát quản lý hành chính và trật tự xã hội', N'123 Nguyễn Duy Hiệu, Hội An', N'data:image/png;base64,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');
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (5, 23, 1, 1003, N'CT-961386-800', N'2026-06-25 00:00:00.000', N'2026-12-25 00:00:00.000', 1800000, 1800000, N'active', 1, N'', NULL, 0, NULL, N'2026-06-23 15:36:01.386', N'2026-06-23 16:28:17.223', N'049206014620', N'2026-06-19', N'Cục cảnh sát', N'30 Trần Phú, Hội An', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782232059/signatures/m3alyw0z98ekaspaopya.png', N'049206014648', N'2022-02-08', N'Cục cảnh sát ', N'20 Tống Văn Sương, Hội An, Quảng Nam', N'data:image/png;base64,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');
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (6, 27, 1, 1003, N'CT-356516-855', N'2026-06-24 00:00:00.000', N'2026-12-24 00:00:00.000', 10500000, 10500000, N'active', 1, N'', NULL, 0, NULL, N'2026-06-23 16:15:56.528', N'2026-06-23 16:42:33.719', N'049206014648', N'2022-02-02', N'Cục cảnh sát ', N'30 Nguyễn Trãi', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782232932/signatures/zgm6xbb0ntjoobphgfqa.png', N'049206014648', N'2022-06-14', N'Cục cảnh sát', N'30, Nguyễn Trãi', N'data:image/png;base64,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');
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (7, 28, 1004, 2, N'CT-308827-373', N'2026-07-01 00:00:00.000', N'2027-01-01 00:00:00.000', 6000000, 6000000, N'active', 1, N'', NULL, 0, NULL, N'2026-06-24 03:38:28.828', N'2026-06-24 03:44:14.242', N'049206014634', N'2021-02-10', N'Cục cảnh sát', N'20 Trần Cao Vân, quận Ngũ Hành Sơn, thành phố Đà nẵng', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782272578/signatures/dvbc5tliyg6szxumvkqk.png', N'049206012345', N'2021-06-16', N'Cục cảnh sát', N'20 Lê Lợi, quận Ngũ Hành Sơn, Đà Nẵng', N'data:image/png;base64,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');
INSERT INTO [contracts] ([contract_id], [room_id], [tenant_id], [landlord_id], [contract_number], [start_date], [end_date], [monthly_rent], [deposit_amount], [status], [tenant_agreed], [terms_and_conditions], [document_url], [is_renewed], [renewal_contract_id], [created_at], [updated_at], [landlord_ic], [landlord_ic_issue_date], [landlord_ic_issue_place], [landlord_permanent_address], [landlord_signature], [tenant_ic], [tenant_ic_issue_date], [tenant_ic_issue_place], [tenant_permanent_address], [tenant_signature]) VALUES (8, 35, 1005, 2, N'CT-815360-119', N'2026-06-25 00:00:00.000', N'2026-12-25 00:00:00.000', 2000000, 2000000, N'active', 1, N'', NULL, 0, NULL, N'2026-06-24 06:50:15.361', N'2026-06-24 06:52:15.146', N'012345678999', N'2022-10-24', N'Cục cảnh sát', N'30 Trần Hưng Đạo', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1782283886/signatures/pwgzb1m7ssq7vmf1qunl.png', N'012345678900', N'2022-02-01', N'Cục cảnh sát', N'20 Trần Cao Vân', N'data:image/png;base64,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');
SET IDENTITY_INSERT [contracts] OFF;
GO

-- Data for viewing_schedules
SET IDENTITY_INSERT [viewing_schedules] ON;
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (1, 28, 1004, 2, N'2026-06-23 10:05:00.000', N'completed', 600000, N'rented', N'2026-06-22 14:08:28.630', NULL, N'Viewing request for 2026-06-23 at 10:05. Requested from room detail page.
[TENANT]: Good', N'2026-06-22 13:53:28.631', N'2026-06-22 07:11:32.019');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (2, 29, 1004, 2, N'2026-06-23 03:18:00.000', N'cancelled', 345000, N'pending', N'2026-06-22 07:58:08.219', NULL, N'Viewing request for 2026-06-23 at 10:18. Requested from room detail page.', N'2026-06-22 07:43:08.220', N'2026-06-22 07:50:20.936');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (3, 29, 1004, 2, N'2026-06-23 03:00:00.000', N'completed', 0, N'rejected', N'2026-06-22 08:05:58.834', NULL, N'Viewing request for 2026-06-23 at 10:00. Requested from room detail page.', N'2026-06-22 07:50:58.834', N'2026-06-22 07:55:48.682');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (4, 29, 1004, 2, N'2026-06-23 02:53:00.000', N'no_show', 0, N'pending', NULL, NULL, N'Viewing request for 2026-06-23 at 09:53. Requested from room detail page.', N'2026-06-22 08:15:24.941', N'2026-06-22 08:17:41.114');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (5, 29, 1005, 2, N'2026-06-23 03:10:00.000', N'completed', 0, N'rented', NULL, NULL, N'Viewing request for 2026-06-23 at 10:10. Requested from room detail page.
[TENANT]: I want to rent', N'2026-06-22 08:48:59.554', N'2026-06-22 08:50:55.902');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (6, 33, 1, 2, N'2026-06-24 03:00:00.000', N'completed', 0, N'rented', NULL, NULL, N'Viewing request for 2026-06-24 at 10:00. Requested from room detail page.
[TENANT]: Oke', N'2026-06-23 08:49:11.372', N'2026-06-23 08:50:01.219');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (7, 26, 1, 1003, N'2026-06-24 04:52:00.000', N'completed', 0, N'rented', NULL, NULL, N'Viewing request for 2026-06-24 at 11:52. Requested from room detail page.', N'2026-06-23 09:30:15.400', N'2026-06-23 11:39:25.864');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (8, 27, 1, 1003, N'2026-06-23 21:19:00.000', N'completed', 0, N'rented', NULL, NULL, N'Viewing request for 2026-06-24 at 04:19. Requested from room detail page.', N'2026-06-23 16:14:46.364', N'2026-06-23 16:42:33.746');
INSERT INTO [viewing_schedules] ([schedule_id], [room_id], [tenant_id], [landlord_id], [scheduled_date], [status], [deposit_amount], [tenant_decision], [payment_deadline], [dispute_reason], [notes], [created_at], [updated_at]) VALUES (9, 35, 1004, 2, N'2026-06-25 04:15:00.000', N'dispute_resolved', 0, N'disputed', NULL, N'The room is not good ', N'Viewing request for 2026-06-25 at 11:15. Requested from room detail page.', N'2026-06-24 04:12:17.438', N'2026-06-24 04:13:00.521');
SET IDENTITY_INSERT [viewing_schedules] OFF;
GO

-- Data for payments
SET IDENTITY_INSERT [payments] ON;
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (2, 1, 1004, 2, 28, NULL, 12000000, N'deposit', N'completed', N'vnpay', N'15593277', NULL, N'2026-06-22 07:13:12.527', NULL, 600000, 0, 11400000, N'completed', N'2026-06-22 07:19:25.073', N'2026-06-22 07:12:04.431', N'2026-06-22 07:13:12.527');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (5, 2, 1005, 2, 29, NULL, 6900000, N'deposit', N'completed', N'vnpay', N'15593491', NULL, N'2026-06-22 08:51:44.335', NULL, 345000, 0, 6555000, N'completed', N'2026-06-22 08:52:49.171', N'2026-06-22 08:51:20.368', N'2026-06-22 08:51:44.335');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (6, 3, 1, 2, 33, NULL, 9000000, N'deposit', N'completed', N'vnpay', N'15595284', NULL, N'2026-06-23 08:53:49.637', NULL, 450000, 0, 8550000, N'completed', N'2026-06-23 12:36:55.970', N'2026-06-23 08:51:46.998', N'2026-06-23 08:53:49.637');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (7, 4, 1, 1003, 26, NULL, 9120000, N'deposit', N'completed', N'vnpay', N'15595632', NULL, N'2026-06-23 11:40:38.174', NULL, 456000, 0, 8664000, N'completed', N'2026-06-23 12:36:53.003', N'2026-06-23 11:39:29.300', N'2026-06-23 11:40:38.174');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (8, 5, 1, 1003, 23, NULL, 3600000, N'deposit', N'completed', N'vnpay', N'15595887', NULL, N'2026-06-23 16:35:46.141', NULL, 180000, 0, 3420000, N'completed', N'2026-06-24 03:59:25.173', N'2026-06-23 16:34:50.512', N'2026-06-23 16:35:46.141');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (9, 6, 1, 1003, 27, NULL, 21000000, N'deposit', N'completed', N'vnpay', N'15595893', NULL, N'2026-06-23 16:43:45.660', NULL, 1050000, 0, 19950000, N'completed', N'2026-06-24 03:59:27.124', N'2026-06-23 16:42:35.471', N'2026-06-23 16:43:45.660');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (10, 7, 1004, 2, 28, NULL, 12000000, N'deposit', N'completed', N'vnpay', N'15596484', NULL, N'2026-06-24 03:57:35.761', NULL, 600000, 0, 11400000, N'completed', N'2026-06-24 03:59:28.986', N'2026-06-24 03:56:46.423', N'2026-06-24 03:57:35.761');
INSERT INTO [payments] ([payment_id], [contract_id], [tenant_id], [landlord_id], [room_id], [viewing_schedule_id], [amount], [payment_type], [status], [payment_method], [transaction_id], [due_date], [paid_date], [notes], [platform_fee], [refund_amount], [net_amount], [payout_status], [payout_date], [created_at], [updated_at]) VALUES (11, 8, 1005, 2, 35, NULL, 4000000, N'deposit', N'completed', N'vnpay', N'15596727', NULL, N'2026-06-24 06:53:13.316', NULL, 200000, 0, 3800000, N'pending', NULL, N'2026-06-24 06:52:23.306', N'2026-06-24 06:53:13.316');
SET IDENTITY_INSERT [payments] OFF;
GO

-- Data for notifications
SET IDENTITY_INSERT [notifications] ON;
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (1, 2, N'New Message', N'Long sent you a message', N'message', 1, 0, NULL, N'2026-06-22 13:53:35.731');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (2, 1004, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 1, 0, NULL, N'2026-06-22 07:10:26.370');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (3, 2, N'Contract Request', N'Tenant wants to rent "Phòng trọ giá rẻ". Please review the draft contract and add terms.', N'contract', 1, 0, NULL, N'2026-06-22 07:11:15.562');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (4, 1004, N'Contract Created', N'Landlord has created a rental contract for "Phòng trọ giá rẻ". Please review and sign.', N'contract', 1, 0, NULL, N'2026-06-22 07:11:32.035');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (5, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 1, 0, NULL, N'2026-06-22 07:13:12.493');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (6, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 1, 0, NULL, N'2026-06-22 07:13:12.591');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (7, 1004, N'New Message', N'Duc sent you a message', N'message', 2, 0, NULL, N'2026-06-22 07:19:49.531');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (8, 2, N'Viewing Schedule Cancelled', N'Tenant has cancelled the viewing for "Nhà cho thuê giá rẻ".', N'viewing_schedule', 2, 0, NULL, N'2026-06-22 07:50:20.982');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (9, 1004, N'Viewing Confirmed', N'Your room viewing for "Nhà cho thuê giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 3, 0, NULL, N'2026-06-22 07:54:00.971');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (10, 2, N'Tenant Declined to Rent', N'Tenant has decided not to rent "Nhà cho thuê giá rẻ" after viewing.', N'viewing_schedule', 3, 0, NULL, N'2026-06-22 07:55:48.711');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (11, 1004, N'No-Show Recorded', N'You did not attend the viewing for "Nhà cho thuê giá rẻ".', N'viewing_schedule', 4, 0, NULL, N'2026-06-22 08:17:41.149');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (12, 2, N'Listing Approved', N'Good news! Your listing "Nhà cho thuê" has been approved and is now live.', N'system', 31, 0, NULL, N'2026-06-22 08:25:25.719');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (13, 2, N'Listing Approved', N'Good news! Your listing "Phòng trọ Đà Nẵng" has been approved and is now live.', N'system', 30, 0, NULL, N'2026-06-22 08:35:19.624');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (14, 2, N'Listing Approved', N'Good news! Your listing "Phòng trọ gần đại học FPT" has been approved and is now live.', N'system', 32, 0, NULL, N'2026-06-22 08:43:52.186');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (15, 2, N'New Message', N'Nguyen Kha sent you a message', N'message', 3, 0, NULL, N'2026-06-22 08:48:09.528');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (16, 1005, N'New Message', N'Duc sent you a message', N'message', 4, 0, NULL, N'2026-06-22 08:48:19.516');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (17, 1005, N'Viewing Confirmed', N'Your room viewing for "Nhà cho thuê giá rẻ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 5, 0, NULL, N'2026-06-22 08:49:43.730');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (18, 2, N'Contract Request', N'Tenant wants to rent "Nhà cho thuê giá rẻ". Please review the draft contract and add terms.', N'contract', 2, 0, NULL, N'2026-06-22 08:50:25.888');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (19, 1005, N'Contract Created', N'Landlord has created a rental contract for "Nhà cho thuê giá rẻ". Please review and sign.', N'contract', 2, 0, NULL, N'2026-06-22 08:50:55.916');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (20, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà cho thuê giá rẻ". The rental is now active.', N'contract', 2, 0, NULL, N'2026-06-22 08:51:44.315');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (21, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà cho thuê giá rẻ". The rental is now active.', N'contract', 2, 0, NULL, N'2026-06-22 08:51:44.364');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (22, 2, N'Listing Approved', N'Good news! Your listing "Good" has been approved and is now live.', N'system', 33, 0, NULL, N'2026-06-23 08:09:57.076');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (23, 1, N'Viewing Confirmed', N'Your room viewing for "Good" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 6, 0, NULL, N'2026-06-23 08:49:28.578');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (24, 2, N'Contract Request', N'Tenant wants to rent "Good". Please review the draft contract and add terms.', N'contract', 3, 0, NULL, N'2026-06-23 08:49:44.259');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (25, 1, N'Contract Created', N'Landlord has created a rental contract for "Good". Please review and sign.', N'contract', 3, 0, NULL, N'2026-06-23 08:50:01.229');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (26, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Good". The rental is now active.', N'contract', 3, 0, NULL, N'2026-06-23 08:53:49.607');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (27, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Good". The rental is now active.', N'contract', 3, 0, NULL, N'2026-06-23 08:53:49.706');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (28, 1, N'Viewing Confirmed', N'Your room viewing for "Nhà trọ " has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 7, 0, NULL, N'2026-06-23 09:30:55.609');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (29, 1003, N'Contract Request', N'Tenant wants to rent "Nhà trọ ". Please review the draft contract and add terms.', N'contract', 4, 0, NULL, N'2026-06-23 09:44:38.818');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (30, 1, N'Contract Created', N'Landlord has created a rental contract for "Nhà trọ ". Please review and sign.', N'contract', 4, 0, NULL, N'2026-06-23 10:50:16.775');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (31, 1003, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "Nhà trọ ". Waiting for deposit payment.', N'contract', 4, 0, NULL, N'2026-06-23 11:39:25.889');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (32, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà trọ ". The rental is now active.', N'contract', 4, 0, NULL, N'2026-06-23 11:40:38.133');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (33, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Nhà trọ ". The rental is now active.', N'contract', 4, 0, NULL, N'2026-06-23 11:40:38.221');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (34, 1003, N'Listing Approved', N'Good news! Your listing "Good" has been approved and is now live.', N'system', 34, 0, NULL, N'2026-06-23 14:56:31.413');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (35, 1003, N'New Rental Request', N'You have a new rental request for Phòng trọ giá rẻ.', N'rental_request', 1, 0, NULL, N'2026-06-23 15:19:42.793');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (36, 1, N'Rental Request Approved', N'Your rental request for Phòng trọ giá rẻ has been approved!', N'rental_request', 1, 0, NULL, N'2026-06-23 15:34:29.409');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (37, 1, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 8, 0, NULL, N'2026-06-23 16:15:05.086');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (38, 1003, N'Contract Request', N'Tenant wants to rent "Phòng trọ". Please review the draft contract and add terms.', N'contract', 6, 0, NULL, N'2026-06-23 16:15:56.565');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (39, 1, N'Contract Ready to Sign', N'The landlord has created the contract for Phòng trọ giá rẻ. Please review, sign, and pay the deposit.', N'contract', 5, 0, NULL, N'2026-06-23 16:27:39.767');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (40, 1003, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "Phòng trọ giá rẻ". Waiting for deposit payment.', N'contract', 5, 0, NULL, N'2026-06-23 16:28:17.286');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (41, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 5, 0, NULL, N'2026-06-23 16:35:46.076');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (42, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 5, 0, NULL, N'2026-06-23 16:35:46.222');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (43, 1, N'Contract Created', N'Landlord has created a rental contract for "Phòng trọ". Please review and sign.', N'contract', 6, 0, NULL, N'2026-06-23 16:42:12.735');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (44, 1003, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "Phòng trọ". Waiting for deposit payment.', N'contract', 6, 0, NULL, N'2026-06-23 16:42:33.775');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (45, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ". The rental is now active.', N'contract', 6, 0, NULL, N'2026-06-23 16:43:45.580');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (46, 1003, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ". The rental is now active.', N'contract', 6, 0, NULL, N'2026-06-23 16:43:45.740');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (47, 2, N'New Rental Request', N'You have a new rental request for Phòng trọ giá rẻ.', N'rental_request', 2, 0, NULL, N'2026-06-24 03:36:33.930');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (48, 1004, N'Rental Request Approved', N'Your rental request for Phòng trọ giá rẻ has been approved!', N'rental_request', 2, 0, NULL, N'2026-06-24 03:36:52.649');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (49, 2, N'Contract Requested', N'Tenant has requested a contract for "Phòng trọ giá rẻ".', N'contract', 7, 0, NULL, N'2026-06-24 03:38:28.857');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (50, 1004, N'Contract Ready to Sign', N'The landlord has created the contract for Phòng trọ giá rẻ. Please review, sign, and pay the deposit.', N'contract', 7, 0, NULL, N'2026-06-24 03:42:57.319');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (51, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "Phòng trọ giá rẻ". Waiting for deposit payment.', N'contract', 7, 0, NULL, N'2026-06-24 03:44:14.290');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (52, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 7, 0, NULL, N'2026-06-24 03:57:35.734');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (53, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ giá rẻ". The rental is now active.', N'contract', 7, 0, NULL, N'2026-06-24 03:57:35.792');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (54, 2, N'Listing Approved', N'Good news! Your listing "Phòng trọ gần đại học kinh tế" has been approved and is now live.', N'system', 35, 0, NULL, N'2026-06-24 04:11:32.596');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (55, 1004, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ gần đại học kinh tế" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 9, 0, NULL, N'2026-06-24 04:12:29.962');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (56, 2, N'Viewing Dispute', N'Tenant has disputed the viewing. Reason: The room is not good . Admin will review.', N'viewing_schedule', 9, 0, NULL, N'2026-06-24 04:13:00.532');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (57, 2, N'New Rental Request', N'You have a new rental request for Phòng trọ gần đại học kinh tế.', N'rental_request', 3, 0, NULL, N'2026-06-24 06:48:17.201');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (58, 1005, N'Rental Request Approved', N'Your rental request for Phòng trọ gần đại học kinh tế has been approved!', N'rental_request', 3, 0, NULL, N'2026-06-24 06:48:57.590');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (59, 2, N'Contract Requested', N'Tenant has requested a contract for "Phòng trọ gần đại học kinh tế".', N'contract', 8, 0, NULL, N'2026-06-24 06:50:15.411');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (60, 1005, N'Contract Ready to Sign', N'The landlord has created the contract for Phòng trọ gần đại học kinh tế. Please review, sign, and pay the deposit.', N'contract', 8, 0, NULL, N'2026-06-24 06:51:25.352');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (61, 2, N'Contract Signed (Pending Payment)', N'Tenant has signed the rental contract for "Phòng trọ gần đại học kinh tế". Waiting for deposit payment.', N'contract', 8, 0, NULL, N'2026-06-24 06:52:15.183');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (62, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ gần đại học kinh tế". The rental is now active.', N'contract', 8, 0, NULL, N'2026-06-24 06:53:13.294');
INSERT INTO [notifications] ([notification_id], [user_id], [title], [message], [notification_type], [related_id], [is_read], [read_at], [created_at]) VALUES (63, 2, N'Contract Signed & Paid', N'Tenant has signed the rental contract and paid the deposit + 1st month rent for "Phòng trọ gần đại học kinh tế". The rental is now active.', N'contract', 8, 0, NULL, N'2026-06-24 06:53:13.348');
SET IDENTITY_INSERT [notifications] OFF;
GO

-- Data for favorites
SET IDENTITY_INSERT [favorites] ON;
INSERT INTO [favorites] ([favorite_id], [tenant_id], [room_id], [created_at]) VALUES (1, 1004, 27, N'2026-06-22 13:50:01.065');
INSERT INTO [favorites] ([favorite_id], [tenant_id], [room_id], [created_at]) VALUES (2, 1, 33, N'2026-06-23 08:48:37.659');
SET IDENTITY_INSERT [favorites] OFF;
GO

