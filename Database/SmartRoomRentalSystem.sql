-- =========================================================
-- RENTAL ROOM SYSTEM 
-- =========================================================

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
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    role_id INT NOT NULL,
    is_active BIT DEFAULT 1,
    is_banned BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- =========================================================
-- 3. GOOGLE LOGIN
-- =========================================================
CREATE TABLE user_google_accounts (
    id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 4. OTP
-- =========================================================
CREATE TABLE otp_verifications (
    otp_id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50),
    expired_at DATETIME NOT NULL,
    is_used BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 5. USER PROFILE
-- =========================================================
CREATE TABLE user_profiles (
    profile_id INT IDENTITY PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    avatar_url NVARCHAR(255),
    address NVARCHAR(255),
    bio NVARCHAR(500),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 6. ROOMS
-- =========================================================
CREATE TABLE rooms (
    room_id INT IDENTITY PRIMARY KEY,
    landlord_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(12,2) NOT NULL,
    deposit_amount DECIMAL(12,2),
    area FLOAT,
    address NVARCHAR(255),
    city NVARCHAR(100),
    room_type NVARCHAR(100),
    max_people INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'available',
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (landlord_id) REFERENCES users(user_id)
);

-- =========================================================
-- 7. ROOM IMAGES
-- =========================================================
CREATE TABLE room_images (
    image_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    image_url NVARCHAR(255) NOT NULL,

    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- =========================================================
-- 8. ROOM FACILITIES
-- =========================================================
CREATE TABLE room_facilities (
    facility_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    facility_name NVARCHAR(100) NOT NULL,

    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT uq_room_facility UNIQUE(room_id, facility_name)
);

-- =========================================================
-- 9. SEARCH HISTORY
-- =========================================================
CREATE TABLE search_history (
    search_id INT IDENTITY PRIMARY KEY,
    user_id INT NULL,
    keyword NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 10. ROOM VIEWS
-- =========================================================
CREATE TABLE room_views (
    view_id INT IDENTITY PRIMARY KEY,
    user_id INT NULL,
    room_id INT NOT NULL,
    viewed_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 11. VIEWING SCHEDULE
-- =========================================================
CREATE TABLE room_viewing_schedule (
    schedule_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    schedule_time DATETIME NOT NULL,
    note NVARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 12. RENTAL REQUEST
-- =========================================================
CREATE TABLE rental_requests (
    request_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    message NVARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 13. PAYMENTS
-- =========================================================
CREATE TABLE payments (
    payment_id INT IDENTITY PRIMARY KEY,
    request_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (request_id) REFERENCES rental_requests(request_id)
);

-- =========================================================
-- 14. CONTRACTS
-- =========================================================
CREATE TABLE contracts (
    contract_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NOT NULL,
    landlord_id INT NOT NULL,
    room_id INT NOT NULL,
    payment_id INT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12,2) NOT NULL,
    contract_file NVARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
);

-- =========================================================
-- 15. CONTRACT RENEWALS
-- =========================================================
CREATE TABLE contract_renewals (
    renewal_id INT IDENTITY PRIMARY KEY,
    contract_id INT NOT NULL,
    requested_by INT NOT NULL,
    new_end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
    FOREIGN KEY (requested_by) REFERENCES users(user_id)
);

-- =========================================================
-- 16. COMPLAINTS
-- =========================================================
CREATE TABLE complaints (
    complaint_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NULL,
    title NVARCHAR(255),
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- =========================================================
-- 17. CONVERSATIONS
-- =========================================================
CREATE TABLE conversations (
    conversation_id INT IDENTITY PRIMARY KEY,
    tenant_id INT NULL,
    landlord_id INT NULL,
    user_id INT NULL,
    type VARCHAR(50) DEFAULT 'tenant_landlord',
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (tenant_id) REFERENCES users(user_id),
    FOREIGN KEY (landlord_id) REFERENCES users(user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 18. MESSAGES
-- =========================================================
CREATE TABLE messages (
    message_id INT IDENTITY PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NULL,
    message_text NVARCHAR(MAX) NOT NULL,
    is_ai BIT DEFAULT 0,
    sent_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

-- =========================================================
-- 19. POST MODERATION
-- =========================================================
CREATE TABLE post_moderations (
    moderation_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    admin_id INT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reason NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    reviewed_at DATETIME NULL,

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);

-- =========================================================
-- 20. POST REPORTS
-- =========================================================
CREATE TABLE post_reports (
    report_id INT IDENTITY PRIMARY KEY,
    room_id INT NOT NULL,
    reported_by INT NULL,
    reason NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id)
);

-- =========================================================
-- 21. ADMIN LOGS
-- =========================================================
CREATE TABLE admin_logs (
    log_id INT IDENTITY PRIMARY KEY,
    admin_id INT NOT NULL,
    action NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);

-- =========================================================
-- 22. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    notification_id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- 23. INDEX (PERFORMANCE)
-- =========================================================
CREATE INDEX idx_rooms_city ON rooms(city);
CREATE INDEX idx_rooms_price ON rooms(price);
CREATE INDEX idx_requests_status ON rental_requests(status);
CREATE INDEX idx_payments_status ON payments(status);

-- =========================================================
-- 24. SEED DATA
-- =========================================================
INSERT INTO roles (role_name, description) VALUES
('Admin', N'Quản trị hệ thống'),
('Landlord', N'Chủ trọ'),
('Tenant', N'Người thuê phòng');