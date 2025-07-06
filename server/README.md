# Pesz Backend API

A comprehensive Node.js and PostgreSQL backend for the Pesz mobile payment application.

## Features

- **Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - PIN setup and verification
  - Profile management with image upload

- **Financial Operations**
  - Send and receive money
  - Transaction history and details
  - Account balance management
  - Top-up functionality
  - Card management

- **Social Features**
  - Contact management
  - Real-time chat with Socket.IO
  - Direct messaging
  - Group chat support

- **Additional Features**
  - QR code generation and scanning
  - Push notifications
  - Real-time updates
  - File upload support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Joi
- **File Upload**: Multer
- **QR Codes**: qrcode library

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up PostgreSQL database and update connection details in `.env`

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/setup-pin` - Setup transaction PIN
- `POST /api/auth/verify-pin` - Verify transaction PIN
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/picture` - Upload profile picture
- `GET /api/users/search` - Search users
- `GET /api/users/balance` - Get user balance

### Transactions
- `POST /api/transactions/send` - Send money
- `GET /api/transactions/history` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/topup` - Top up account

### Cards
- `POST /api/cards` - Add new card
- `GET /api/cards` - Get user's cards
- `PUT /api/cards/:id/default` - Set default card
- `DELETE /api/cards/:id` - Delete card

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id/favorite` - Toggle favorite contact
- `DELETE /api/contacts/:id` - Delete contact

### Chat
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms/direct` - Create direct message room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message

### QR Codes
- `POST /api/qr/generate` - Generate QR code
- `POST /api/qr/scan` - Scan QR code
- `GET /api/qr/history` - Get QR code history

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `DELETE /api/notifications/:id` - Delete notification

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `transactions` - Financial transactions
- `cards` - User payment cards
- `contacts` - User contacts
- `chat_rooms` - Chat room information
- `chat_participants` - Chat room participants
- `messages` - Chat messages
- `notifications` - User notifications
- `qr_codes` - Generated QR codes

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- PIN encryption for transactions
- Input validation with Joi
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## Real-time Features

Socket.IO is used for:
- Real-time chat messaging
- Typing indicators
- Live notifications
- Transaction updates

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## Environment Variables

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License