-- Pesz Database Schema
-- PostgreSQL Database Schema for Pesz Mobile Payment Application
-- Version: 1.0
-- Created: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE transaction_type AS ENUM ('send', 'receive', 'topup', 'payment', 'withdrawal');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE card_type AS ENUM ('visa', 'mastercard', 'amex', 'discover', 'other');
CREATE TYPE notification_type AS ENUM ('transaction', 'security', 'promotion', 'system', 'chat');
CREATE TYPE message_type AS ENUM ('text', 'image', 'payment', 'system');
CREATE TYPE qr_type AS ENUM ('payment_request', 'receive_money', 'merchant_payment');

-- Users table - Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture TEXT,
    pin_hash VARCHAR(255),
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table - User payment cards
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number VARCHAR(19) NOT NULL, -- Masked card number
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL CHECK (expiry_year >= EXTRACT(YEAR FROM CURRENT_DATE)),
    card_type card_type NOT NULL,
    bank_name VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table - All financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(15,2) DEFAULT 0.00 CHECK (fee >= 0),
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount + fee) STORED,
    transaction_type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    description TEXT,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    external_reference VARCHAR(100), -- For payment gateway references
    payment_method VARCHAR(50), -- mpesa, card, bank_transfer, etc.
    metadata JSONB, -- Additional transaction data
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table - User contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_favorite BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, contact_user_id)
);

-- Chat rooms table - Chat room information
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    description TEXT,
    is_group BOOLEAN DEFAULT false,
    group_picture TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants table - Users in chat rooms
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, member
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Messages table - Chat messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table - User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR codes table - Generated QR codes
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_data TEXT NOT NULL,
    qr_type qr_type NOT NULL,
    amount DECIMAL(15,2),
    description TEXT,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction logs table - Audit trail for transactions
CREATE TABLE transaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    old_status transaction_status,
    new_status transaction_status NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table - Track user sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account limits table - User transaction limits
CREATE TABLE account_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_send_limit DECIMAL(15,2) DEFAULT 50000.00,
    daily_receive_limit DECIMAL(15,2) DEFAULT 100000.00,
    monthly_send_limit DECIMAL(15,2) DEFAULT 1000000.00,
    monthly_receive_limit DECIMAL(15,2) DEFAULT 2000000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 10000.00,
    daily_sent_amount DECIMAL(15,2) DEFAULT 0.00,
    daily_received_amount DECIMAL(15,2) DEFAULT 0.00,
    monthly_sent_amount DECIMAL(15,2) DEFAULT 0.00,
    monthly_received_amount DECIMAL(15,2) DEFAULT 0.00,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_default ON cards(user_id, is_default) WHERE is_default = true;

CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_user_id ON contacts(contact_user_id);
CREATE INDEX idx_contacts_favorite ON contacts(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_unread ON messages(room_id, is_read) WHERE is_read = false;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_active ON qr_codes(is_active, expires_at);

CREATE INDEX idx_transaction_logs_transaction_id ON transaction_logs(transaction_id);
CREATE INDEX idx_transaction_logs_created_at ON transaction_logs(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_limits_updated_at BEFORE UPDATE ON account_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to ensure only one default card per user
CREATE OR REPLACE FUNCTION ensure_single_default_card()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE cards 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_card
    BEFORE INSERT OR UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_card();

-- Create function to update chat room last message timestamp
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_message();

-- Create function to log transaction status changes
CREATE OR REPLACE FUNCTION log_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO transaction_logs (transaction_id, old_status, new_status, reason)
        VALUES (NEW.id, OLD.status, NEW.status, 'Status changed');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_transaction_status_change
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_transaction_status_change();

-- Create views for common queries
CREATE VIEW user_profile_view AS
SELECT 
    u.id,
    u.email,
    u.phone,
    u.first_name,
    u.last_name,
    u.profile_picture,
    u.balance,
    u.is_verified,
    u.is_active,
    u.created_at,
    (u.pin_hash IS NOT NULL) as has_pin,
    COUNT(c.id) as card_count,
    COUNT(CASE WHEN c.is_default THEN 1 END) as has_default_card
FROM users u
LEFT JOIN cards c ON u.id = c.user_id AND c.is_active = true
GROUP BY u.id;

CREATE VIEW transaction_summary_view AS
SELECT 
    t.id,
    t.amount,
    t.fee,
    t.total_amount,
    t.transaction_type,
    t.status,
    t.description,
    t.reference_number,
    t.created_at,
    sender.first_name || ' ' || sender.last_name as sender_name,
    sender.email as sender_email,
    receiver.first_name || ' ' || receiver.last_name as receiver_name,
    receiver.email as receiver_email
FROM transactions t
LEFT JOIN users sender ON t.sender_id = sender.id
LEFT JOIN users receiver ON t.receiver_id = receiver.id;

-- Insert default account limits for new users
CREATE OR REPLACE FUNCTION create_default_account_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO account_limits (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_account_limits
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_account_limits();

-- Create function to clean up expired QR codes
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS void AS $$
BEGIN
    UPDATE qr_codes 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired user sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pesz_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pesz_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO pesz_app_user;

-- Insert sample data (optional - remove in production)
-- Sample users
INSERT INTO users (email, phone, password_hash, first_name, last_name, balance, is_verified) VALUES
('john.doe@example.com', '+254712345678', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'John', 'Doe', 5000.00, true),
('jane.smith@example.com', '+254723456789', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Jane', 'Smith', 3000.00, true),
('mike.wilson@example.com', '+254734567890', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Mike', 'Wilson', 7500.00, true);

-- Sample transactions
INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type, status, description, reference_number) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com'), 
 (SELECT id FROM users WHERE email = 'jane.smith@example.com'), 
 500.00, 'send', 'completed', 'Lunch payment', 'TXN001234567890'),
((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 
 (SELECT id FROM users WHERE email = 'mike.wilson@example.com'), 
 1000.00, 'send', 'completed', 'Rent contribution', 'TXN001234567891');

-- Comments for documentation
COMMENT ON TABLE users IS 'Core user accounts and profile information';
COMMENT ON TABLE cards IS 'User payment cards and banking information';
COMMENT ON TABLE transactions IS 'All financial transactions in the system';
COMMENT ON TABLE contacts IS 'User contact lists and relationships';
COMMENT ON TABLE chat_rooms IS 'Chat room information for messaging';
COMMENT ON TABLE chat_participants IS 'Users participating in chat rooms';
COMMENT ON TABLE messages IS 'Chat messages between users';
COMMENT ON TABLE notifications IS 'System and user notifications';
COMMENT ON TABLE qr_codes IS 'Generated QR codes for payments';
COMMENT ON TABLE transaction_logs IS 'Audit trail for transaction changes';
COMMENT ON TABLE user_sessions IS 'Active user sessions and tokens';
COMMENT ON TABLE account_limits IS 'User transaction limits and restrictions';

COMMENT ON COLUMN users.balance IS 'Current account balance in base currency';
COMMENT ON COLUMN users.pin_hash IS 'Hashed transaction PIN for security';
COMMENT ON COLUMN transactions.reference_number IS 'Unique transaction reference for tracking';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction data in JSON format';
COMMENT ON COLUMN cards.card_number IS 'Masked card number for security (last 4 digits visible)';

-- Create database info table
CREATE TABLE database_info (
    version VARCHAR(10) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT DEFAULT 'Pesz Mobile Payment Application Database Schema'
);

INSERT INTO database_info DEFAULT VALUES;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Pesz database schema created successfully!';
    RAISE NOTICE 'Database version: 1.0';
    RAISE NOTICE 'Total tables created: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE 'Total indexes created: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;