-- Pesz Database Seed Data
-- Sample data for development and testing
-- WARNING: Do not use in production!

-- Clear existing data
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE qr_codes CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chat_participants CASCADE;
TRUNCATE TABLE chat_rooms CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE transaction_logs CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE cards CASCADE;
TRUNCATE TABLE account_limits CASCADE;
TRUNCATE TABLE user_sessions CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- Sample Users (password is 'password123' for all)
INSERT INTO users (id, email, phone, password_hash, first_name, last_name, balance, is_verified, pin_hash) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '+254712345678', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'John', 'Doe', 15000.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '+254723456789', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Jane', 'Smith', 8500.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@example.com', '+254734567890', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Mike', 'Wilson', 12750.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.johnson@example.com', '+254745678901', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Sarah', 'Johnson', 6200.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440005', 'david.brown@example.com', '+254756789012', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'David', 'Brown', 9800.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440006', 'lisa.davis@example.com', '+254767890123', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Lisa', 'Davis', 4300.00, false, NULL),
('550e8400-e29b-41d4-a716-446655440007', 'robert.miller@example.com', '+254778901234', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Robert', 'Miller', 11500.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K'),
('550e8400-e29b-41d4-a716-446655440008', 'emily.garcia@example.com', '+254789012345', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K', 'Emily', 'Garcia', 7650.00, true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/K/K');

-- Sample Cards
INSERT INTO cards (user_id, card_number, card_holder_name, expiry_month, expiry_year, card_type, bank_name, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440001', '**** **** **** 1234', 'JOHN DOE', 12, 2026, 'visa', 'KCB Bank', true),
('550e8400-e29b-41d4-a716-446655440001', '**** **** **** 5678', 'JOHN DOE', 8, 2027, 'mastercard', 'Equity Bank', false),
('550e8400-e29b-41d4-a716-446655440002', '**** **** **** 9012', 'JANE SMITH', 6, 2025, 'visa', 'Cooperative Bank', true),
('550e8400-e29b-41d4-a716-446655440003', '**** **** **** 3456', 'MIKE WILSON', 10, 2026, 'mastercard', 'NCBA Bank', true),
('550e8400-e29b-41d4-a716-446655440004', '**** **** **** 7890', 'SARAH JOHNSON', 4, 2027, 'visa', 'Standard Chartered', true);

-- Sample Transactions
INSERT INTO transactions (sender_id, receiver_id, amount, fee, transaction_type, status, description, reference_number, payment_method, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 500.00, 0.00, 'send', 'completed', 'Lunch payment', 'TXN202401001', 'wallet', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 1000.00, 0.00, 'send', 'completed', 'Rent contribution', 'TXN202401002', 'wallet', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 250.00, 0.00, 'send', 'completed', 'Coffee money', 'TXN202401003', 'wallet', NOW() - INTERVAL '12 hours'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 750.00, 0.00, 'send', 'completed', 'Book purchase', 'TXN202401004', 'wallet', NOW() - INTERVAL '6 hours'),
(NULL, '550e8400-e29b-41d4-a716-446655440001', 2000.00, 25.00, 'topup', 'completed', 'M-Pesa top-up', 'TXN202401005', 'mpesa', NOW() - INTERVAL '3 hours'),
(NULL, '550e8400-e29b-41d4-a716-446655440002', 1500.00, 20.00, 'topup', 'completed', 'Card top-up', 'TXN202401006', 'card', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 300.00, 0.00, 'send', 'pending', 'Pending payment', 'TXN202401007', 'wallet', NOW() - INTERVAL '1 hour');

-- Sample Contacts
INSERT INTO contacts (user_id, contact_user_id, contact_name, is_favorite) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', true),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Mike Wilson', false),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Sarah Johnson', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Mike Wilson', false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', true);

-- Sample Chat Rooms
INSERT INTO chat_rooms (id, name, is_group, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001', NULL, false, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', NULL, false, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440003', 'Family Group', true, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440004', 'Work Team', true, '550e8400-e29b-41d4-a716-446655440003');

-- Sample Chat Participants
INSERT INTO chat_participants (room_id, user_id, role) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'member'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'member'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'admin'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'member'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'member');

-- Sample Messages
INSERT INTO messages (room_id, sender_id, message_text, message_type, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hey Jane! How are you?', 'text', NOW() - INTERVAL '2 hours'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hi John! I''m doing great, thanks for asking!', 'text', NOW() - INTERVAL '1 hour 50 minutes'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'I just sent you the lunch money', 'text', NOW() - INTERVAL '1 hour 45 minutes'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Thanks! Got it 👍', 'text', NOW() - INTERVAL '1 hour 40 minutes'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Mike, can you help with the rent?', 'text', NOW() - INTERVAL '1 hour'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Sure! Sending it now', 'text', NOW() - INTERVAL '55 minutes'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to the family group!', 'text', NOW() - INTERVAL '30 minutes'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Thanks for adding me!', 'text', NOW() - INTERVAL '25 minutes'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Team meeting at 3 PM today', 'text', NOW() - INTERVAL '15 minutes'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Got it, I''ll be there', 'text', NOW() - INTERVAL '10 minutes');

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Payment Sent', 'You sent KES 500 to Jane Smith', 'transaction', true, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Payment Received', 'You received KES 500 from John Doe', 'transaction', true, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440001', 'Account Topped Up', 'Your account has been topped up with KES 2000', 'transaction', false, NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440002', 'New Message', 'You have a new message from John Doe', 'chat', false, NOW() - INTERVAL '1 hour 40 minutes'),
('550e8400-e29b-41d4-a716-446655440003', 'Welcome!', 'Welcome to PesaSoft! Your account is ready to use.', 'system', true, NOW() - INTERVAL '1 week'),
('550e8400-e29b-41d4-a716-446655440004', 'Security Alert', 'New device login detected', 'security', false, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440005', 'Special Offer', 'Get 5% cashback on your next top-up!', 'promotion', false, NOW() - INTERVAL '6 hours');

-- Sample QR Codes
INSERT INTO qr_codes (user_id, qr_data, qr_type, amount, description, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '{"type":"payment_request","userId":"550e8400-e29b-41d4-a716-446655440001","amount":1000,"description":"Payment for services"}', 'payment_request', 1000.00, 'Payment for services', NOW() + INTERVAL '24 hours'),
('550e8400-e29b-41d4-a716-446655440002', '{"type":"receive_money","userId":"550e8400-e29b-41d4-a716-446655440002"}', 'receive_money', NULL, 'General payment QR', NOW() + INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440003', '{"type":"payment_request","userId":"550e8400-e29b-41d4-a716-446655440003","amount":500,"description":"Lunch split"}', 'payment_request', 500.00, 'Lunch split', NOW() + INTERVAL '12 hours');

-- Update chat room last message timestamps
UPDATE chat_rooms SET last_message_at = (
    SELECT MAX(created_at) FROM messages WHERE room_id = chat_rooms.id
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE 'Users created: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Transactions created: %', (SELECT COUNT(*) FROM transactions);
    RAISE NOTICE 'Cards created: %', (SELECT COUNT(*) FROM cards);
    RAISE NOTICE 'Chat rooms created: %', (SELECT COUNT(*) FROM chat_rooms);
    RAISE NOTICE 'Messages created: %', (SELECT COUNT(*) FROM messages);
    RAISE NOTICE 'Notifications created: %', (SELECT COUNT(*) FROM notifications);
END $$;