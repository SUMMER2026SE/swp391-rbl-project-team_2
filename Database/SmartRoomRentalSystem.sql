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

-- Default Admin account (password: admin123 - bcrypt hashed)
INSERT INTO users (full_name, email, password_hash, phone, role_id, is_active, is_banned, is_deleted) VALUES
(N'System Admin', 'admin@smartroom.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkFP.dR1rG6L3cfKpTOUvauKz6W/y', '0900000000', 1, 1, 0, 0);

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