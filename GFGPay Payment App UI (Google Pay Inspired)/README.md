# GFGPay - Payment App Backend (UPI-Style)

A secure backend system simulating a UPI-style payment application with wallet management, peer-to-peer transfers, and transaction history.

## Features

- **User Management**: Registration, authentication, PIN management
- **Wallet Operations**: Balance check, add money, withdraw
- **P2P Transfers**: Transfer by UPI ID, phone number, or user ID
- **Transaction Safety**: Idempotent APIs, database transactions, optimistic locking
- **Transaction History**: Full history with filters and summaries
- **Bank Account Management**: Add, remove, set primary accounts
- **Security**: JWT auth, rate limiting, input validation

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### 1. Install Dependencies

```bash
cd gfgpay
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your MongoDB URI
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update the connection string.

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## Test Accounts

After running `npm run seed`:

| User | Phone | Password | PIN | UPI ID | Balance |
|------|-------|----------|-----|--------|---------|
| Rahul | 9876543210 | Test@123 | 1234 | 9876543210@gfgpay | ₹10,000 |
| Priya | 9876543211 | Test@123 | 1234 | 9876543211@gfgpay | ₹5,000 |
| Amit | 9876543212 | Test@123 | - | 9876543212@gfgpay | ₹1,000 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login with phone |
| POST | /api/v1/auth/login/email | Login with email |
| POST | /api/v1/auth/refresh-tokens | Refresh tokens |
| POST | /api/v1/auth/logout | Logout |
| GET | /api/v1/auth/profile | Get profile |
| POST | /api/v1/auth/pin/set | Set transaction PIN |
| POST | /api/v1/auth/pin/change | Change PIN |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/wallet/balance | Get wallet balance |
| POST | /api/v1/wallet/add-money | Add money (deposit) |
| POST | /api/v1/wallet/withdraw | Withdraw to bank |
| POST | /api/v1/wallet/check-balance | Check transfer eligibility |

### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/transfer/verify | Verify receiver |
| POST | /api/v1/transfer/upi | Transfer by UPI ID |
| POST | /api/v1/transfer/phone | Transfer by phone |
| POST | /api/v1/transfer/user | Transfer by user ID |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/transactions | Get transaction history |
| GET | /api/v1/transactions/summary | Get summary |
| GET | /api/v1/transactions/contacts | Recent contacts |
| GET | /api/v1/transactions/:id | Get by ID |
| GET | /api/v1/transactions/reference/:ref | Get by reference |

### Bank Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/bank-accounts | Get all accounts |
| POST | /api/v1/bank-accounts | Add account |
| DELETE | /api/v1/bank-accounts/:id | Remove account |
| POST | /api/v1/bank-accounts/:id/primary | Set as primary |

## Idempotency

For payment operations, include an `Idempotency-Key` header (UUID v4):

```bash
curl -X POST http://localhost:5000/api/v1/transfer/upi \
  -H "Authorization: Bearer TOKEN" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"receiverUpiId":"9876543211@gfgpay","amount":100,"pin":"1234"}'
```

## Example: Make a Transfer

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","password":"Test@123"}'

# 2. Check Balance
curl http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Verify Receiver
curl "http://localhost:5000/api/v1/transfer/verify?upiId=9876543211@gfgpay" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Transfer Money
curl -X POST http://localhost:5000/api/v1/transfer/upi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"receiverUpiId":"9876543211@gfgpay","amount":500,"pin":"1234","note":"Dinner split"}'
```

## Security Features

- **JWT Authentication**: Access + Refresh token pattern
- **PIN Verification**: Required for all payment operations
- **Rate Limiting**: Prevents abuse
  - General: 100 requests/15 min
  - Auth: 10 attempts/15 min
  - Payments: 10 requests/min
  - Transfers: 5 requests/min
- **Idempotency**: Prevents duplicate transactions
- **Database Transactions**: ACID compliance for transfers
- **Optimistic Locking**: Prevents race conditions
- **Input Validation**: Joi schemas for all inputs
- **Data Sanitization**: NoSQL injection prevention

## Project Structure

```
gfgpay/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── validations/     # Joi schemas
│   ├── utils/           # Helpers
│   ├── seeds/           # Database seeding
│   ├── app.js           # Express app
│   └── server.js        # Entry point
├── env.example          # Environment template
├── package.json
└── README.md
```

## Transaction Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sender    │────▶│   GFGPay    │────▶│  Receiver   │
│   Wallet    │     │   Server    │     │   Wallet    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │  1. Verify PIN    │                   │
      │  2. Check Balance │                   │
      │  3. Start DB Txn  │                   │
      │──────────────────▶│                   │
      │                   │  4. Debit Sender  │
      │                   │  5. Credit Recv   │
      │                   │──────────────────▶│
      │                   │  6. Commit Txn    │
      │◀──────────────────│◀──────────────────│
      │  7. Return Result │                   │
```

## License

MIT
