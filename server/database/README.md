# Pesz Database Schema

This directory contains the PostgreSQL database schema and related files for the Pesz mobile payment application.

## Files

- `schema.sql` - Complete database schema with tables, indexes, triggers, and functions
- `seed.sql` - Sample data for development and testing
- `migrate.js` - Node.js script to run migrations
- `README.md` - This documentation file

## Database Structure

### Core Tables

1. **users** - User accounts and profiles
   - Stores user authentication, profile information, and account balance
   - Includes security features like failed login tracking and account locking

2. **cards** - Payment cards
   - User payment cards with masked card numbers
   - Supports multiple cards per user with default card selection

3. **transactions** - Financial transactions
   - All money transfers, top-ups, and payments
   - Includes transaction status tracking and audit trail

4. **contacts** - User contacts
   - User contact lists with favorites and blocking
   - Links to other users in the system

5. **chat_rooms** - Chat functionality
   - Support for both direct messages and group chats
   - Tracks room metadata and participant information

6. **chat_participants** - Chat room membership
   - Links users to chat rooms with roles (admin/member)
   - Tracks join/leave timestamps

7. **messages** - Chat messages
   - Text messages, file attachments, and payment messages
   - Support for message replies and editing

8. **notifications** - System notifications
   - Transaction alerts, security notifications, and system messages
   - Read/unread status tracking

9. **qr_codes** - QR code management
   - Generated QR codes for payments and money requests
   - Expiration and usage tracking

### Supporting Tables

- **transaction_logs** - Audit trail for transaction changes
- **user_sessions** - Active user sessions and tokens
- **account_limits** - User transaction limits and restrictions

### Views

- **user_profile_view** - Complete user profile with card information
- **transaction_summary_view** - Transaction details with participant names

## Features

### Security
- Password hashing with bcrypt
- PIN encryption for transactions
- Session management with expiration
- Account locking after failed login attempts
- Audit trails for sensitive operations

### Performance
- Comprehensive indexing strategy
- Optimized queries for common operations
- Efficient pagination support
- Database-level constraints and validations

### Data Integrity
- Foreign key constraints
- Check constraints for data validation
- Triggers for automatic updates
- ENUM types for controlled values

### Scalability
- UUID primary keys for distributed systems
- JSONB fields for flexible metadata
- Partitioning-ready design
- Efficient indexing for large datasets

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE pesz_db;
CREATE USER pesz_app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pesz_db TO pesz_app_user;
```

### 2. Run Migrations
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run schema migrations
node database/migrate.js

# Run with seed data (optional)
node database/migrate.js --seed
```

### 3. Verify Setup
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check sample data (if seeded)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;
```

## Environment Variables

Required environment variables for database connection:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pesz_db
DB_USER=pesz_app_user
DB_PASSWORD=your_secure_password
```

## Sample Data

The seed file includes:
- 8 sample users with different verification statuses
- Sample payment cards for testing
- Transaction history with various types and statuses
- Contact relationships between users
- Chat rooms and message history
- Notifications and QR codes

**Note**: Sample data is for development only. Do not use in production!

## Maintenance

### Regular Tasks

1. **Clean up expired data**:
```sql
-- Clean expired QR codes
SELECT cleanup_expired_qr_codes();

-- Clean expired sessions
SELECT cleanup_expired_sessions();
```

2. **Monitor performance**:
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';
```

3. **Backup database**:
```bash
pg_dump -h localhost -U pesz_app_user pesz_db > backup_$(date +%Y%m%d).sql
```

### Schema Updates

When updating the schema:
1. Create migration scripts for changes
2. Test on development environment first
3. Backup production database before applying
4. Use transactions for complex migrations
5. Update this documentation

## Troubleshooting

### Common Issues

1. **Connection errors**:
   - Check database credentials in .env
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Permission errors**:
   - Ensure user has proper database privileges
   - Check table ownership

3. **Migration failures**:
   - Check PostgreSQL version compatibility
   - Verify all dependencies are installed
   - Review error logs for specific issues

### Performance Issues

1. **Slow queries**:
   - Check if indexes are being used
   - Analyze query execution plans
   - Consider adding specific indexes

2. **High memory usage**:
   - Review connection pool settings
   - Check for memory leaks in application
   - Monitor PostgreSQL configuration

## Contributing

When contributing to the database schema:
1. Follow naming conventions (snake_case)
2. Add appropriate indexes for new queries
3. Include proper constraints and validations
4. Update documentation
5. Test with sample data
6. Consider migration path for existing data

## License

This database schema is part of the Pesz application and follows the same license terms.