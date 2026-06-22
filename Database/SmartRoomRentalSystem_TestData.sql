-- =========================================================
-- SMART ROOM RENTAL SYSTEM
-- Database schema synced with Sequelize models
-- Last updated: 2026-06-20
-- =========================================================

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'RentalRoomSystem_Test')
BEGIN
    ALTER DATABASE RentalRoomSystem_Test SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE RentalRoomSystem_Test;
END
GO

CREATE DATABASE RentalRoomSystem_Test;
GO
USE RentalRoomSystem_Test;
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
    status VARCHAR(15) DEFAULT 'available',   -- 'available', 'rented', 'maintenance', 'inactive', 'rejected', 'pending'
    thumbnail_url NVARCHAR(500) NULL,
    rejection_reason NVARCHAR(1000) NULL,
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

-- =========================================================
-- DATA EXPORT
-- =========================================================

SET IDENTITY_INSERT roles ON;
GO

-- =========================================================
-- DATA EXPORT
-- =========================================================

SET IDENTITY_INSERT roles ON;
GO

-- =========================================================
-- DATA EXPORT
-- =========================================================

SET IDENTITY_INSERT roles ON;
GO

-- =========================================================
-- DATA EXPORT
-- =========================================================

SET IDENTITY_INSERT roles ON;
GO
INSERT INTO roles (role_id, role_name, description) VALUES
(1, N'Admin', N'System Administrator with full access'),
(2, N'Landlord', N'Property Owner who manages boarding houses & listings'),
(3, N'Tenant', N'Renters who search rooms, sign contracts, and send requests');
SET IDENTITY_INSERT roles OFF;
GO

SET IDENTITY_INSERT users ON;
GO
INSERT INTO users (user_id, full_name, email, password_hash, phone, role_id, avatar_url, google_id, is_active, is_banned, is_deleted, created_at, updated_at) VALUES
(1, N'Đức Trần', N'ductran281206@gmail.com', N'$2b$12$.ZGsNZB7D3TUrj0HlUzz9ewAVDP2IfPsmxUtvoU45Whzu36f4qiFC', NULL, 3, N'https://lh3.googleusercontent.com/a/ACg8ocLEh19aZ_gZpyAvEEaezF40fpkJ5USMN8HU5oeEswc0Ed5vcXGM=s96-c', N'107547421603725758963', 1, 0, 0, '2026-06-11 19:25:34', '2026-06-21 00:54:49'),
(2, N'Duc', N'williamlata01@gmail.com', N'$2b$12$1NZ.anBIqI4QVFP9M6ot3O7zfCy7fR0LBMMjcxQ5NHDgWB9rRUzN2', N'09892301234', 2, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781941079/rental_rooms/ubxsid1ch4prpsymtyvj.png', NULL, 1, 0, 0, '2026-06-11 19:26:49', '2026-06-21 00:55:51'),
(1002, N'System Administrator', N'admin@smartroom.com', N'$2b$12$qnO3.m20cjJDkqY5uVUlneDfhtX1PuuKEQ8e1ZY1V4SMpsTF7hcEa', NULL, 1, NULL, NULL, 1, 0, 0, '2026-06-12 23:22:55', '2026-06-12 23:22:55'),
(1003, N'Hai', N'ductran28122k6@gmail.com', N'$2b$12$7C1V2UOpw30flZsRKDA5c.7U8h2AgW7TwssT9XOBpgTdHDVYi0K0S', N'0925134567', 2, NULL, NULL, 1, 0, 0, '2026-06-13 00:39:46', '2026-06-13 00:40:20'),
(1004, N'Long', N'ductran28122006@gmail.com', N'$2b$12$apexARYaycd1JbZd5OhiJeOLvQqpwTRc0kbaR5tCUalBDCYQpU4GG', N'0989230105', 3, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781958478/rental_rooms/bysd37o8oaf2lishapgs.jpg', NULL, 1, 0, 0, '2026-06-19 23:21:08', '2026-06-20 05:27:57');
SET IDENTITY_INSERT users OFF;
GO

SET IDENTITY_INSERT facilities ON;
GO
INSERT INTO facilities (facility_id, facility_name, category, facility_type, created_at) VALUES
(1, N'WiFi', N'room', N'utility', '2026-06-12 02:37:25'),
(2, N'Air Conditioner', N'room', N'appliance', '2026-06-12 02:37:25'),
(3, N'Parking', N'room', N'utility', '2026-06-12 02:37:25'),
(4, N'Private Bathroom', N'room', N'utility', '2026-06-12 02:37:25'),
(5, N'Balcony', N'room', N'utility', '2026-06-12 02:37:25'),
(6, N'Bed', N'room', N'furniture', '2026-06-12 02:37:25'),
(7, N'Wardrobe', N'room', N'furniture', '2026-06-12 02:37:25'),
(8, N'Kitchen', N'room', N'utility', '2026-06-12 02:37:25'),
(9, N'Security Camera', N'room', N'security', '2026-06-12 02:37:25'),
(10, N'Near University', N'nearby', N'education', '2026-06-12 02:37:25'),
(11, N'Near Hospital', N'nearby', N'hospital', '2026-06-12 02:37:25'),
(12, N'Near Supermarket', N'nearby', N'shopping', '2026-06-12 02:37:25'),
(13, N'Near Bus Station', N'nearby', N'transport', '2026-06-12 02:37:25'),
(14, N'Near Market', N'nearby', N'shopping', '2026-06-12 02:37:25'),
(15, N'Near Park', N'nearby', N'recreation', '2026-06-12 02:37:25'),
(16, N'Near Convenience Store', N'nearby', N'shopping', '2026-06-12 02:37:25');
SET IDENTITY_INSERT facilities OFF;
GO

SET IDENTITY_INSERT rooms ON;
GO
INSERT INTO rooms (room_id, landlord_id, title, description, address, city, district, ward, price_per_month, area_sqm, room_type, bedrooms, max_occupants, status, thumbnail_url, is_deleted, created_at, updated_at) VALUES
(1, 2, N'Phòng trọ giá rẻ gần trường đại học fpt', N'Good', N'10 Trần Phú', N'Thành phố Đà Nẵng', N'Huyện Hòa Vang', NULL, 2000000, 20, N'Room', 2, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781952968/rental_rooms/dhaioxnzj28jj9xo4afh.png', 0, '2026-06-11 19:42:06', '2026-06-20 03:56:07'),
(2, 2, N'Phòng trọ gần FPT software', N'Hòa đồng, mát mẻ, rộng rãi', N'Số 36, Nam Kì Khởi Nghĩa', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 4500000, 30, N'single', 1, 2, N'rented', NULL, 0, '2026-06-13 00:35:59', '2026-06-13 13:12:15'),
(3, 1003, N'Duc123', N'Hello', N'số 10, Phù Đổng Thiên Vương', N'Thành phố Hà Nội', N'Huyện Hoài Đức', NULL, 6999999, 60, N'single', 3, 4, N'rented', NULL, 0, '2026-06-13 00:42:05', '2026-06-13 20:23:17'),
(4, 2, N'Phòng trọ Hội An', N'Good, Beautiful', N'10 Tống văn sương', N'Thành phố Đà Nẵng', N'Huyện Hòa Vang', NULL, 2500000, 25, N'Room', 2, 5, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953817/rental_rooms/tpmvypckfgwiabxlwcro.png', 0, '2026-06-13 20:19:46', '2026-06-20 05:10:04'),
(5, 1003, N'Phòng trọ giá rẻ gần trường ngoại ngữ', N'Good', N'10 Nguyễn Huệ', N'Tỉnh Sóc Trăng', N'Huyện Thạnh Trị', NULL, 10000000, 40, N'house', 3, 4, N'unavailable', NULL, 0, '2026-06-13 21:40:26', '2026-06-13 21:40:26'),
(6, 1003, N'Hello', N'Good', N'36 Thanh Hóa', N'Tỉnh Bến Tre', N'Huyện Chợ Lách', NULL, 6700000, 56, N'shared', 3, 4, N'unavailable', NULL, 0, '2026-06-13 21:54:02', '2026-06-13 21:54:02'),
(7, 2, N'Goood', N'Beautiful and good', N'123 Nguyen Cong Tru', N'Thành phố Đà Nẵng', N'Quận Sơn Trà', NULL, 2000000, 29, N'double', 3, 2, N'available', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781532372/rental_rooms/kwk0mwjfchsibebgfc18.png', 0, '2026-06-15 00:06:11', '2026-06-20 04:18:14'),
(8, 2, N'Good', N'Good place', N'456 Hoan Kiem', N'Tỉnh Quảng Nam', N'Thành phố Hội An', NULL, 5678900, 97, N'shared', 3, 4, N'unavailable', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781534318/rental_rooms/fgby45mlninsvns5d34k.png', 0, '2026-06-15 00:38:38', '2026-06-15 00:38:38'),
(9, 2, N'Phong tro o dai hoc Bach Khoa', N'Good ', N'42 Tống Văn Sương', N'Tỉnh Quảng Nam', N'Thành phố Hội An', NULL, 3450000, 58, N'apartment', 3, 5, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781875822/rental_rooms/gwzi9gmnzguad46dnvbe.png', 0, '2026-06-18 23:30:20', '2026-06-20 00:18:50'),
(10, 2, N'Phòng trọ gần đại học Việt Hàn', N'Good, peaceful', N'45 Hello', N'Thành phố Đà Nẵng', N'Quận Ngũ Hành Sơn', NULL, 6700000, 29, N'shared', 2, 4, N'rented', N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781876988/rental_rooms/th5ieji36zdulegcxi8d.png', 0, '2026-06-18 23:49:47', '2026-06-20 05:00:37');
SET IDENTITY_INSERT rooms OFF;
GO

SET IDENTITY_INSERT room_images ON;
GO
INSERT INTO room_images (image_id, room_id, image_url, is_primary, display_order, created_at) VALUES
(1, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781532372/rental_rooms/kwk0mwjfchsibebgfc18.png', 1, 0, '2026-06-15 00:06:12'),
(2, 8, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781534318/rental_rooms/fgby45mlninsvns5d34k.png', 1, 0, '2026-06-15 00:38:38'),
(3, 8, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781534320/rental_rooms/sgpnn5uiymojoufzjqk9.png', 0, 1, '2026-06-15 00:38:40'),
(4, 9, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781875822/rental_rooms/gwzi9gmnzguad46dnvbe.png', 1, 0, '2026-06-18 23:30:22'),
(5, 10, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781876988/rental_rooms/th5ieji36zdulegcxi8d.png', 1, 0, '2026-06-18 23:49:47'),
(6, 10, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781876989/rental_rooms/g7c0gmbadzfik9qqn6on.png', 0, 1, '2026-06-18 23:49:48'),
(7, 10, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781876990/rental_rooms/krfyplzd6mhflfcjd1qa.png', 0, 2, '2026-06-18 23:49:49'),
(8, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951466/rental_rooms/ugpa9zmjntuyfvsjwvhd.png', 0, 1, '2026-06-20 03:31:04'),
(9, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951468/rental_rooms/bq8emkhqpbyfey93r6zr.png', 0, 2, '2026-06-20 03:31:06'),
(11, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951620/rental_rooms/kat13kmdydogsua20itj.png', 0, 3, '2026-06-20 03:33:38'),
(12, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951621/rental_rooms/zrwsentp2j7c75h56zcq.png', 0, 4, '2026-06-20 03:33:39'),
(13, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951621/rental_rooms/plxf7ijq1rdgmrqrydyq.png', 0, 5, '2026-06-20 03:33:40'),
(14, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781951622/rental_rooms/yyxe6d4sqmex3xfzugdh.png', 0, 6, '2026-06-20 03:33:41'),
(15, 1, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781952968/rental_rooms/dhaioxnzj28jj9xo4afh.png', 1, 0, '2026-06-20 03:56:07'),
(16, 1, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781952969/rental_rooms/zxbtjwxnb7tosjoys3qx.png', 0, 1, '2026-06-20 03:56:08'),
(17, 1, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781952971/rental_rooms/l0bxqpn7shdcqtgaxujw.png', 0, 2, '2026-06-20 03:56:09'),
(18, 1, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781952972/rental_rooms/fxhneuz1fx0lxlong9so.png', 0, 3, '2026-06-20 03:56:10'),
(19, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953185/rental_rooms/o9vqipjbr65hxgl5tjcu.png', 0, 7, '2026-06-20 03:59:43'),
(20, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953186/rental_rooms/jnmgrwk8gqbhfdbpqnwe.png', 0, 8, '2026-06-20 03:59:45'),
(21, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953187/rental_rooms/p0ovfxlujwdaqtrbb6ec.png', 0, 9, '2026-06-20 03:59:46'),
(22, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953294/rental_rooms/lnapfvueojfioou069bn.png', 0, 10, '2026-06-20 04:01:33'),
(23, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953296/rental_rooms/uzl45dzshpmmyugbgequ.png', 0, 11, '2026-06-20 04:01:34'),
(24, 7, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953297/rental_rooms/jrlv3eeuns03ly0obmtw.png', 0, 12, '2026-06-20 04:01:35'),
(31, 4, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953817/rental_rooms/tpmvypckfgwiabxlwcro.png', 1, 0, '2026-06-20 04:10:16'),
(32, 4, N'https://res.cloudinary.com/dpjyo14yf/image/upload/v1781953818/rental_rooms/z1i6pwmo1lnherakosco.png', 0, 1, '2026-06-20 04:10:17');
SET IDENTITY_INSERT room_images OFF;
GO

SET IDENTITY_INSERT room_facilities ON;
GO
INSERT INTO room_facilities (id, room_id, facility_id, created_at) VALUES
(1, 1, 2, '2026-06-11 19:42:06'),
(2, 1, 3, '2026-06-11 19:42:06'),
(3, 1, 5, '2026-06-11 19:42:06'),
(4, 1, 9, '2026-06-11 19:42:06'),
(5, 1, 10, '2026-06-11 19:42:07'),
(6, 1, 14, '2026-06-11 19:42:07'),
(1002, 2, 1, '2026-06-13 00:35:59'),
(1003, 2, 2, '2026-06-13 00:35:59'),
(1004, 2, 3, '2026-06-13 00:35:59'),
(1005, 2, 4, '2026-06-13 00:35:59'),
(1006, 2, 5, '2026-06-13 00:35:59'),
(1007, 2, 6, '2026-06-13 00:35:59'),
(1008, 2, 7, '2026-06-13 00:35:59'),
(1009, 2, 8, '2026-06-13 00:35:59'),
(1010, 2, 9, '2026-06-13 00:36:00'),
(1011, 2, 10, '2026-06-13 00:36:00'),
(1012, 2, 16, '2026-06-13 00:36:00'),
(1013, 3, 1, '2026-06-13 00:42:05'),
(1014, 3, 2, '2026-06-13 00:42:05'),
(1015, 3, 3, '2026-06-13 00:42:05'),
(1016, 3, 4, '2026-06-13 00:42:05'),
(1017, 3, 5, '2026-06-13 00:42:05'),
(1018, 3, 6, '2026-06-13 00:42:05'),
(1019, 3, 7, '2026-06-13 00:42:05'),
(1020, 3, 8, '2026-06-13 00:42:05'),
(1021, 3, 9, '2026-06-13 00:42:05'),
(1022, 3, 14, '2026-06-13 00:42:05'),
(1023, 3, 15, '2026-06-13 00:42:05'),
(1024, 3, 16, '2026-06-13 00:42:05'),
(1025, 4, 1, '2026-06-13 20:19:46'),
(1026, 4, 2, '2026-06-13 20:19:46'),
(1027, 4, 3, '2026-06-13 20:19:46'),
(1028, 4, 4, '2026-06-13 20:19:46'),
(1029, 4, 5, '2026-06-13 20:19:46'),
(1030, 4, 6, '2026-06-13 20:19:46'),
(1031, 4, 7, '2026-06-13 20:19:46'),
(1032, 4, 8, '2026-06-13 20:19:46'),
(1033, 4, 9, '2026-06-13 20:19:46'),
(1034, 4, 14, '2026-06-13 20:19:46'),
(1035, 5, 1, '2026-06-13 21:40:27'),
(1036, 5, 2, '2026-06-13 21:40:27'),
(1037, 5, 3, '2026-06-13 21:40:27'),
(1038, 5, 4, '2026-06-13 21:40:27'),
(1039, 5, 5, '2026-06-13 21:40:27'),
(1040, 5, 6, '2026-06-13 21:40:27'),
(1041, 5, 7, '2026-06-13 21:40:27'),
(1042, 5, 8, '2026-06-13 21:40:27'),
(1043, 5, 9, '2026-06-13 21:40:27'),
(1044, 5, 16, '2026-06-13 21:40:27'),
(1045, 6, 1, '2026-06-13 21:54:02'),
(1046, 6, 2, '2026-06-13 21:54:02'),
(1047, 6, 4, '2026-06-13 21:54:02'),
(1048, 6, 7, '2026-06-13 21:54:02'),
(1049, 6, 8, '2026-06-13 21:54:02'),
(1050, 6, 11, '2026-06-13 21:54:02'),
(1051, 7, 1, '2026-06-15 00:06:12'),
(1052, 7, 2, '2026-06-15 00:06:12'),
(1053, 7, 3, '2026-06-15 00:06:12'),
(1054, 7, 4, '2026-06-15 00:06:13'),
(1055, 7, 5, '2026-06-15 00:06:13'),
(1056, 7, 6, '2026-06-15 00:06:13'),
(1057, 7, 7, '2026-06-15 00:06:13'),
(1058, 7, 8, '2026-06-15 00:06:13'),
(1059, 7, 9, '2026-06-15 00:06:13'),
(1060, 7, 13, '2026-06-15 00:06:13'),
(1061, 8, 1, '2026-06-15 00:38:40'),
(1062, 8, 2, '2026-06-15 00:38:40'),
(1063, 8, 3, '2026-06-15 00:38:40'),
(1064, 8, 4, '2026-06-15 00:38:40'),
(1065, 8, 5, '2026-06-15 00:38:40'),
(1066, 8, 6, '2026-06-15 00:38:40'),
(1067, 8, 7, '2026-06-15 00:38:40'),
(1068, 8, 8, '2026-06-15 00:38:40'),
(1069, 8, 9, '2026-06-15 00:38:40'),
(1070, 8, 13, '2026-06-15 00:38:40'),
(1071, 8, 14, '2026-06-15 00:38:40'),
(1072, 9, 1, '2026-06-18 23:30:22'),
(1073, 9, 2, '2026-06-18 23:30:22'),
(1074, 9, 3, '2026-06-18 23:30:22'),
(1075, 9, 4, '2026-06-18 23:30:22'),
(1076, 9, 5, '2026-06-18 23:30:22'),
(1077, 9, 6, '2026-06-18 23:30:22'),
(1078, 9, 7, '2026-06-18 23:30:22'),
(1079, 9, 8, '2026-06-18 23:30:22'),
(1080, 9, 9, '2026-06-18 23:30:22'),
(1081, 9, 12, '2026-06-18 23:30:22'),
(1082, 9, 13, '2026-06-18 23:30:22'),
(1083, 9, 14, '2026-06-18 23:30:22'),
(1084, 9, 15, '2026-06-18 23:30:22'),
(1085, 10, 1, '2026-06-18 23:49:49'),
(1086, 10, 2, '2026-06-18 23:49:49'),
(1087, 10, 3, '2026-06-18 23:49:49'),
(1088, 10, 4, '2026-06-18 23:49:49'),
(1089, 10, 5, '2026-06-18 23:49:49'),
(1090, 10, 6, '2026-06-18 23:49:49'),
(1091, 10, 7, '2026-06-18 23:49:49'),
(1092, 10, 8, '2026-06-18 23:49:49'),
(1093, 10, 9, '2026-06-18 23:49:49'),
(1094, 10, 11, '2026-06-18 23:49:49'),
(1095, 10, 14, '2026-06-18 23:49:49');
SET IDENTITY_INSERT room_facilities OFF;
GO

SET IDENTITY_INSERT viewing_schedules ON;
GO
INSERT INTO viewing_schedules (schedule_id, room_id, tenant_id, landlord_id, scheduled_date, status, deposit_amount, tenant_decision, payment_deadline, dispute_reason, notes, created_at, updated_at) VALUES
(1, 4, 1, 2, '2026-06-15 10:00:00', N'pending', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 20:20:41', '2026-06-13 20:20:41'),
(2, 4, 1, 2, '2026-06-14 10:00:00', N'expired', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 20:33:05', '2026-06-13 20:33:45'),
(3, 4, 1, 2, '2026-06-15 10:00:00', N'pending', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 20:54:13', '2026-06-13 20:54:13'),
(4, 4, 1, 2, '2026-06-14 10:00:00', N'pending', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 20:58:28', '2026-06-13 20:58:28'),
(5, 5, 1, 1003, '2026-06-14 10:00:00', N'cancelled', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 21:45:12', '2026-06-13 21:51:34'),
(6, 5, 1, 1003, '2026-06-15 10:00:00', N'expired', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 21:51:18', '2026-06-13 21:51:40'),
(7, 6, 1, 1003, '2026-06-17 10:00:00', N'expired', NULL, NULL, NULL, NULL, N'Requested from room detail page.', '2026-06-13 21:54:22', '2026-06-13 21:54:40'),
(8, 8, 1, 2, '2026-06-19 10:00:00', N'pending_payment', 100000, N'pending', NULL, NULL, N'Viewing request for 2026-06-20 at 10:00. Requested from room detail page.', '2026-06-18 18:33:29', '2026-06-18 18:33:29'),
(9, 7, 1, 2, '2026-06-18 10:00:00', N'no_show', 100000, N'pending', NULL, NULL, N'Viewing request for 2026-06-19 at 10:00. Requested from room detail page.', '2026-06-18 18:39:17', '2026-06-20 00:36:24'),
(10, 6, 1, 1003, '2026-06-19 10:00:00', N'scheduled', 100000, N'pending', NULL, NULL, N'Viewing request for 2026-06-20 at 10:00. Requested from room detail page.', '2026-06-18 18:45:49', '2026-06-18 18:45:49'),
(11, 5, 1, 1003, '2026-06-19 10:00:00', N'scheduled', 100000, N'pending', NULL, NULL, N'Viewing request for 2026-06-20 at 10:00. Requested from room detail page.', '2026-06-18 18:53:38', '2026-06-18 18:53:38'),
(12, 8, 1, 2, '2026-06-19 10:00:00', N'cancelled', 100000, N'pending', NULL, NULL, N'Viewing request for 2026-06-20. Requested from room detail page.', '2026-06-18 20:04:03', '2026-06-18 20:04:03'),
(13, 9, 1, 2, '2026-06-19 10:00:00', N'cancelled', 345000, N'pending', '2026-06-19 16:24:42', NULL, N'Viewing request for 2026-06-20. Requested from room detail page.', '2026-06-19 16:09:42', '2026-06-19 23:16:00'),
(14, 9, 1, 2, '2026-06-19 17:00:00', N'completed', 345000, N'rented', '2026-06-19 23:32:02', NULL, N'Viewing request for 2026-06-20. Requested from room detail page.
[TENANT]: Tôi muốn ký hơp đồng', '2026-06-19 23:17:02', '2026-06-20 00:18:50'),
(15, 10, 1004, 2, '2026-06-19 17:00:00', N'completed', 670000, N'rented', '2026-06-19 23:46:42', NULL, N'Viewing request for 2026-06-20. Requested from room detail page.
[TENANT]: Tôi muốn ký hợp đồng thuê ', '2026-06-19 23:31:42', '2026-06-20 05:00:37'),
(16, 4, 1, 2, '2026-06-20 17:00:00', N'cancelled', 250000, N'pending', '2026-06-20 06:54:02', NULL, N'Viewing request for 2026-06-21. Requested from room detail page.', '2026-06-20 06:39:02', '2026-06-20 06:41:04'),
(17, 4, 1, 2, '2026-06-20 17:00:00', N'no_show', 250000, N'pending', '2026-06-20 07:23:27', NULL, N'Viewing request for 2026-06-21. Requested from room detail page.', '2026-06-20 07:08:27', '2026-06-20 07:09:31'),
(18, 4, 1, 2, '2026-06-20 17:00:00', N'dispute_resolved', 250000, N'disputed', '2026-06-20 07:31:53', N'Phòng không dúng v?i mô t?', N'Viewing request for 2026-06-21. Requested from room detail page.', '2026-06-20 07:16:53', '2026-06-20 07:19:02');
SET IDENTITY_INSERT viewing_schedules OFF;
GO

SET IDENTITY_INSERT contracts ON;
GO
INSERT INTO contracts (contract_id, room_id, tenant_id, landlord_id, contract_number, start_date, end_date, monthly_rent, deposit_amount, status, tenant_agreed, terms_and_conditions, document_url, is_renewed, renewal_contract_id, created_at, updated_at) VALUES
(1, 9, 1, 2, N'CT-881116-406', '2026-06-20 17:00:00', '2026-08-20 17:00:00', 3450000, 3450000, N'active', 1, N'Oke', NULL, 0, NULL, '2026-06-20 00:01:21', '2026-06-20 00:18:50'),
(2, 10, 1004, 2, N'CT-794163-953', '2026-06-20 04:59:54', '2026-12-20 04:59:54', 6700000, 670000, N'active', 1, N'Good', NULL, 0, NULL, '2026-06-20 04:59:54', '2026-06-20 05:00:37');
SET IDENTITY_INSERT contracts OFF;
GO

SET IDENTITY_INSERT payments ON;
GO
INSERT INTO payments (payment_id, contract_id, tenant_id, landlord_id, room_id, viewing_schedule_id, amount, payment_type, status, payment_method, transaction_id, due_date, paid_date, notes, platform_fee, refund_amount, net_amount, payout_status, payout_date, created_at, updated_at) VALUES
(9, NULL, 1, 1003, 3, NULL, 7000057, N'deposit', N'completed', N'vnpay', N'15582563', NULL, NULL, NULL, 350002.85, NULL, 6650054.15, N'completed', '2026-06-13 19:58:38', '2026-06-13 19:27:24', '2026-06-13 19:31:32'),
(10, NULL, 1, 1003, 3, NULL, 7000057, N'deposit', N'pending', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-13 19:33:39', '2026-06-13 19:33:39'),
(11, NULL, 1, 1003, 3, NULL, 6999999, N'deposit', N'completed', N'vnpay', N'15582574', NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-13 19:41:00', '2026-06-13 19:43:39'),
(12, NULL, 1, 2, 2, NULL, 4500000, N'deposit', N'cancelled', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-14 00:25:43', '2026-06-14 00:25:43'),
(13, NULL, 1, 2, 2, NULL, 4500000, N'deposit', N'pending', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-14 15:40:18', '2026-06-14 15:40:18'),
(14, NULL, 1, 2, 2, NULL, 4500000, N'deposit', N'pending', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-14 15:40:29', '2026-06-14 15:40:29'),
(15, NULL, 1, 2, 2, NULL, 4500000, N'deposit', N'pending', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-14 15:41:46', '2026-06-14 15:41:46'),
(16, NULL, 1, 2, 8, 8, 100000, N'viewing_deposit', N'refunded', N'vnpay', NULL, NULL, NULL, NULL, 0, NULL, 0, N'pending', NULL, '2026-06-18 18:33:29', '2026-06-18 18:33:29'),
(17, NULL, 1, 2, 7, 9, 100000, N'viewing_deposit', N'completed', N'vnpay', N'15589986', NULL, '2026-06-18 18:43:15', NULL, 5000, 0, 95000, N'completed', '2026-06-20 04:35:46', '2026-06-18 18:39:17', '2026-06-18 18:43:15'),
(18, NULL, 1, 1003, 6, 10, 100000, N'viewing_deposit', N'completed', N'vnpay', N'15590006', NULL, '2026-06-18 18:47:53', NULL, 0, NULL, 0, N'pending', NULL, '2026-06-18 18:45:49', '2026-06-18 18:47:53'),
(19, NULL, 1, 1003, 5, 11, 100000, N'viewing_deposit', N'completed', N'vnpay', N'15590031', NULL, '2026-06-18 18:55:23', NULL, 0, NULL, 0, N'pending', NULL, '2026-06-18 18:53:38', '2026-06-18 18:55:23'),
(20, NULL, 1, 2, 2, NULL, 4500000, N'deposit', N'pending', N'vnpay', NULL, NULL, NULL, NULL, 0, 0, 0, N'pending', NULL, '2026-06-18 19:37:12', '2026-06-18 19:37:12'),
(21, NULL, 1, 2, 8, 12, 100000, N'viewing_deposit', N'failed', N'vnpay', NULL, NULL, NULL, NULL, 0, 0, 0, N'pending', NULL, '2026-06-18 20:04:03', '2026-06-18 20:04:03'),
(22, NULL, 1, 2, 9, 13, 345000, N'viewing_deposit', N'failed', N'vnpay', NULL, '2026-06-19 16:24:42', NULL, NULL, 0, 0, 0, N'pending', NULL, '2026-06-19 16:09:42', '2026-06-19 23:16:00'),
(23, NULL, 1, 2, 9, 14, 345000, N'viewing_deposit', N'completed', N'vnpay', N'15591147', '2026-06-19 23:32:02', '2026-06-19 23:18:49', NULL, 17250, 0, 327750, N'completed', '2026-06-20 04:46:04', '2026-06-19 23:17:02', '2026-06-19 23:18:49'),
(24, NULL, 1004, 2, 10, 15, 670000, N'viewing_deposit', N'completed', N'vnpay', N'15591163', '2026-06-19 23:46:42', '2026-06-19 23:32:07', NULL, 33500, 0, 636500, N'completed', '2026-06-20 05:07:59', '2026-06-19 23:31:42', '2026-06-19 23:32:07'),
(25, NULL, 1, 2, 4, 16, 250000, N'viewing_deposit', N'refunded', N'vnpay', N'15591464', '2026-06-20 06:54:02', '2026-06-20 06:40:30', NULL, 0, 250000, 0, N'pending', NULL, '2026-06-20 06:39:02', '2026-06-20 06:40:30'),
(26, NULL, 1, 2, 4, 17, 250000, N'viewing_deposit', N'completed', N'vnpay', N'15591487', '2026-06-20 07:23:27', '2026-06-20 07:08:56', NULL, 12500, 0, 237500, N'completed', '2026-06-20 07:50:27', '2026-06-20 07:08:27', '2026-06-20 07:08:56'),
(27, NULL, 1, 2, 4, 18, 250000, N'viewing_deposit', N'refunded', N'vnpay', N'15591495', '2026-06-20 07:31:53', '2026-06-20 07:17:47', NULL, 0, 250000, 0, N'pending', NULL, '2026-06-20 07:16:53', '2026-06-20 07:17:47');
SET IDENTITY_INSERT payments OFF;
GO

SET IDENTITY_INSERT notifications ON;
GO
INSERT INTO notifications (notification_id, user_id, title, message, notification_type, related_id, is_read, read_at, created_at) VALUES
(1, 2, N'New Message', N'Đức Trần sent you a message', N'message', 1, 0, NULL, '2026-06-12 23:31:56'),
(2, 2, N'New Message', N'Đức Trần sent you a message', N'message', 2, 0, NULL, '2026-06-12 23:32:05'),
(3, 1, N'New Message', N'Duc sent you a message', N'message', 3, 0, NULL, '2026-06-12 23:34:02'),
(4, 2, N'New Message', N'Đức Trần sent you a message', N'message', 4, 0, NULL, '2026-06-12 23:35:13'),
(5, 1, N'New Message', N'Duc sent you a message', N'message', 5, 0, NULL, '2026-06-12 23:37:28'),
(6, 1003, N'New Rental Request', N'You have a new rental request for Duc123.', N'rental_request', 1, 0, NULL, '2026-06-13 00:46:14'),
(7, 1, N'Rental Request Approved', N'Your rental request for Duc123 has been approved!', N'rental_request', 1, 0, NULL, '2026-06-13 00:46:48'),
(8, 2, N'New Message', N'Đức Trần sent you a message', N'message', 6, 0, NULL, '2026-06-13 20:04:07'),
(9, 1003, N'New Message', N'Đức Trần sent you a message', N'message', 7, 0, NULL, '2026-06-13 20:04:28'),
(10, 2, N'New Rental Request', N'You have a new rental request for Phòng trọ gần FPT software.', N'rental_request', 2, 0, NULL, '2026-06-13 20:11:03'),
(11, 1, N'Rental Request Approved', N'Your rental request for Phòng trọ gần FPT software has been approved!', N'rental_request', 2, 0, NULL, '2026-06-13 20:12:15'),
(12, 2, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ on 6/16/2026', N'viewing_schedule', 1, 0, NULL, '2026-06-13 20:20:41'),
(13, 2, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ on 6/15/2026', N'viewing_schedule', 2, 0, NULL, '2026-06-13 20:33:05'),
(14, 2, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ on 6/16/2026', N'viewing_schedule', 3, 0, NULL, '2026-06-13 20:54:13'),
(15, 2, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ on 6/15/2026', N'viewing_schedule', 4, 0, NULL, '2026-06-13 20:58:28'),
(16, 1003, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ gần trường ngoại ngữ on 6/15/2026', N'viewing_schedule', 5, 0, NULL, '2026-06-13 21:45:12'),
(17, 1003, N'New Viewing Request', N'A tenant has requested a viewing for Phòng trọ giá rẻ gần trường ngoại ngữ on 6/16/2026', N'viewing_schedule', 6, 0, NULL, '2026-06-13 21:51:18'),
(18, 1003, N'New Viewing Request', N'A tenant has requested a viewing for Hello on 6/18/2026', N'viewing_schedule', 7, 0, NULL, '2026-06-13 21:54:22'),
(19, 1, N'New Message', N'Duc sent you a message', N'message', 8, 0, NULL, '2026-06-14 19:02:41'),
(20, 2, N'New Rental Request', N'You have a new rental request for Goood.', N'rental_request', 3, 0, NULL, '2026-06-15 01:37:53'),
(21, 2, N'Rental Request Cancelled', N'A tenant has cancelled their rental request for Goood.', N'rental_request', 3, 0, NULL, '2026-06-18 19:37:03'),
(22, 1004, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ gần đại học Việt Hàn" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 15, 0, NULL, '2026-06-19 23:40:17'),
(23, 2, N'Contract Request', N'Tenant wants to rent "Phòng trọ gần đại học Việt Hàn". Please create a rental contract.', N'contract', 15, 0, NULL, '2026-06-19 23:41:19'),
(24, 1, N'Viewing Confirmed', N'Your room viewing for "Phong tro o dai hoc Bach Khoa" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 14, 0, NULL, '2026-06-19 23:58:39'),
(25, 2, N'Contract Request', N'Tenant wants to rent "Phong tro o dai hoc Bach Khoa". Please review the draft contract and add terms.', N'contract', 1, 0, NULL, '2026-06-20 00:01:21'),
(26, 1, N'Contract Created', N'Landlord has created a rental contract for "Phong tro o dai hoc Bach Khoa". Please review and sign.', N'contract', 1, 0, NULL, '2026-06-20 00:03:14'),
(27, 2, N'Contract Signed', N'Tenant has signed the rental contract for "Phong tro o dai hoc Bach Khoa". The rental is now active.', N'contract', 1, 0, NULL, '2026-06-20 00:18:50'),
(28, 1, N'No-Show Recorded', N'You did not attend the viewing for "Goood". Your deposit has been forfeited.', N'viewing_schedule', 9, 0, NULL, '2026-06-20 00:36:24'),
(29, 1003, N'New Message', N'Đức Trần sent you a message', N'message', 9, 0, NULL, '2026-06-20 00:42:02'),
(30, 1003, N'New Message', N'Đức Trần sent you a message', N'message', 10, 0, NULL, '2026-06-20 00:44:47'),
(31, 1003, N'New Message', N'Đức Trần sent you a message', N'message', 11, 0, NULL, '2026-06-20 00:44:54'),
(32, 1, N'New Message', N'Duc sent you a message', N'message', 12, 0, NULL, '2026-06-20 01:54:59'),
(33, 1004, N'Contract Created', N'Landlord has created a rental contract for "Phòng trọ gần đại học Việt Hàn". Please review and sign.', N'contract', 2, 0, NULL, '2026-06-20 04:59:54'),
(34, 2, N'Contract Signed', N'Tenant has signed the rental contract for "Phòng trọ gần đại học Việt Hàn". The rental is now active.', N'contract', 2, 0, NULL, '2026-06-20 05:00:37'),
(35, 2, N'New Message', N'Long sent you a message', N'message', 13, 0, NULL, '2026-06-20 05:23:25'),
(36, 1, N'No-Show Recorded', N'You did not attend the viewing for "Phòng trọ Hội An". Your deposit has been forfeited.', N'viewing_schedule', 17, 0, NULL, '2026-06-20 07:09:31'),
(37, 1, N'Viewing Confirmed', N'Your room viewing for "Phòng trọ Hội An" has been confirmed by the landlord. You can now decide to rent or report an issue.', N'viewing_schedule', 18, 0, NULL, '2026-06-20 07:18:25'),
(38, 2, N'Viewing Dispute', N'Tenant has disputed the viewing. Reason: Phòng không đúng với mô tả. Admin will review.', N'viewing_schedule', 18, 0, NULL, '2026-06-20 07:19:02'),
(39, 1004, N'New Message', N'Duc sent you a message', N'message', 14, 0, NULL, '2026-06-20 07:45:36');
SET IDENTITY_INSERT notifications OFF;
GO

SET IDENTITY_INSERT conversations ON;
GO
INSERT INTO conversations (conversation_id, room_id, participant_1_id, participant_2_id, last_message, last_message_at, is_active, created_at, updated_at) VALUES
(1, 1, 1, 2, N'Abcdefg', '2026-06-14 19:02:41', 1, '2026-06-12 23:31:51', '2026-06-12 23:31:51'),
(2, 3, 1, 1003, N'Tôi muốn xem phòng', '2026-06-20 00:44:54', 1, '2026-06-13 20:04:24', '2026-06-13 20:04:24'),
(3, 7, 1, 2, N'Hi', '2026-06-20 01:54:59', 1, '2026-06-18 19:32:15', '2026-06-18 19:32:15'),
(4, 8, 1, 2, NULL, NULL, 1, '2026-06-18 20:02:54', '2026-06-18 20:02:54'),
(5, 6, 1, 1003, NULL, NULL, 1, '2026-06-18 20:16:36', '2026-06-18 20:16:36'),
(6, 10, 2, 2, NULL, NULL, 1, '2026-06-20 03:08:47', '2026-06-20 03:08:47'),
(7, 7, 1004, 2, N'Hello', '2026-06-20 07:45:36', 1, '2026-06-20 05:23:22', '2026-06-20 05:23:22');
SET IDENTITY_INSERT conversations OFF;
GO

SET IDENTITY_INSERT messages ON;
GO
INSERT INTO messages (message_id, conversation_id, sender_id, content, is_read, read_at, created_at) VALUES
(1, 1, 1, N'Hello', 0, NULL, '2026-06-12 23:31:56'),
(2, 1, 1, N'i want to rent room', 0, NULL, '2026-06-12 23:32:05'),
(3, 1, 2, N'When', 0, NULL, '2026-06-12 23:34:02'),
(4, 1, 1, N'Tomorrow', 0, NULL, '2026-06-12 23:35:13'),
(5, 1, 2, N'Hello', 0, NULL, '2026-06-12 23:37:28'),
(6, 1, 1, N'Hi', 0, NULL, '2026-06-13 20:04:07'),
(7, 2, 1, N'Hi friend', 0, NULL, '2026-06-13 20:04:28'),
(8, 1, 2, N'Abcdefg', 0, NULL, '2026-06-14 19:02:41'),
(9, 2, 1, N'Hello', 0, NULL, '2026-06-20 00:42:02'),
(10, 2, 1, N'Hello', 0, NULL, '2026-06-20 00:44:47'),
(11, 2, 1, N'Tôi muốn xem phòng', 0, NULL, '2026-06-20 00:44:54'),
(12, 3, 2, N'Hi', 0, NULL, '2026-06-20 01:54:59'),
(13, 7, 1004, N'Hello', 0, NULL, '2026-06-20 05:23:25'),
(14, 7, 2, N'Hello', 0, NULL, '2026-06-20 07:45:36');
SET IDENTITY_INSERT messages OFF;
GO

