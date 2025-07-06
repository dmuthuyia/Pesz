const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pesz_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const initializeDatabase = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();

    // Run migrations
    await runMigrations();
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const runMigrations = async () => {
  const migrations = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      profile_picture TEXT,
      pin_hash VARCHAR(255),
      balance DECIMAL(15,2) DEFAULT 0.00,
      is_verified BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Cards table
    `CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      card_number VARCHAR(19) NOT NULL,
      card_holder_name VARCHAR(100) NOT NULL,
      expiry_month INTEGER NOT NULL,
      expiry_year INTEGER NOT NULL,
      card_type VARCHAR(20) NOT NULL,
      is_default BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Transactions table
    `CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sender_id UUID REFERENCES users(id),
      receiver_id UUID REFERENCES users(id),
      amount DECIMAL(15,2) NOT NULL,
      transaction_type VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      description TEXT,
      reference_number VARCHAR(50) UNIQUE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Contacts table
    `CREATE TABLE IF NOT EXISTS contacts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      contact_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      contact_name VARCHAR(100),
      contact_phone VARCHAR(20),
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, contact_user_id)
    );`,

    // Chat rooms table
    `CREATE TABLE IF NOT EXISTS chat_rooms (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100),
      is_group BOOLEAN DEFAULT false,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Chat participants table
    `CREATE TABLE IF NOT EXISTS chat_participants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(room_id, user_id)
    );`,

    // Messages table
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message_text TEXT,
      message_type VARCHAR(20) DEFAULT 'text',
      metadata JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      is_read BOOLEAN DEFAULT false,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // QR codes table
    `CREATE TABLE IF NOT EXISTS qr_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      qr_data TEXT NOT NULL,
      qr_type VARCHAR(20) NOT NULL,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Indexes for better performance
    `CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);`
  ];

  for (const migration of migrations) {
    try {
      await pool.query(migration);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

module.exports = { pool, initializeDatabase };