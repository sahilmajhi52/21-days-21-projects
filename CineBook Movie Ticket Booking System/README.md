# 🎬 CineBook - Movie Ticket Booking System

A production-grade backend service for movie ticket booking with real-time seat availability, transactional booking to prevent double-bookings, and complete show management.

## 🚀 Quick Start

### macOS / Linux
```bash
git clone https://github.com/q225/cinebook.git
cd cinebook
chmod +x setup.sh
./setup.sh
npm run dev
```

### Windows
```powershell
git clone https://github.com/q225/cinebook.git
cd cinebook
.\setup.ps1
# Follow the instructions, then:
npm run db:push
npm run db:seed
npm run dev
```

**Server:** `http://localhost:3002`

**Admin Login:** `admin@cinebook.com` / `Admin@123`

---

## ✨ Features

### Core Features
- 🎬 **Movie Management** - CRUD operations for movies with genres, ratings, certificates
- 🏢 **Theater Management** - Multi-screen theaters with different screen types (IMAX, Dolby, etc.)
- 📅 **Show Scheduling** - Schedule shows with automatic seat pricing
- 💺 **Seat Selection** - Real-time seat availability with visual seat map
- 🎫 **Booking System** - Transactional booking with seat locking to prevent double-bookings
- 💳 **Payment Integration** - Payment status handling (mock/real gateway ready)
- ❌ **Cancellation** - Booking cancellation with refund status

### Technical Features
- 🔐 **JWT Authentication** - Access & refresh token system
- 🔒 **Transaction Safety** - Pessimistic locking prevents race conditions
- ⏱️ **Seat Locking** - 10-minute lock during payment (configurable)
- 💰 **Dynamic Pricing** - Price varies by seat type, screen type, and day
- 📊 **Show Status** - Auto-updates (Available → Almost Full → Sold Out)

---

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/profile` | Get profile |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/movies` | List all movies |
| GET | `/api/v1/movies/:id` | Get movie details |
| GET | `/api/v1/movies/city/:city` | Movies in a city |
| GET | `/api/v1/movies/:id/shows` | Shows for a movie |
| POST | `/api/v1/movies` | Create movie (Admin) |

### Theaters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/theaters` | List theaters |
| GET | `/api/v1/theaters/cities` | Get cities with theaters |
| GET | `/api/v1/theaters/:id` | Theater details |
| POST | `/api/v1/theaters/:id/screens` | Add screen (Admin) |

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/shows/:showId` | Show with seat layout |
| POST | `/api/v1/shows` | Create show (Admin) |
| POST | `/api/v1/shows/:id/cancel` | Cancel show (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/bookings` | Initiate booking (lock seats) |
| POST | `/api/v1/bookings/:id/confirm` | Confirm after payment |
| POST | `/api/v1/bookings/:id/cancel` | Cancel booking |
| GET | `/api/v1/bookings/my-bookings` | User's bookings |
| GET | `/api/v1/bookings/:id` | Booking details |

---

## 🎯 Booking Flow

```
1. User selects seats
        ↓
2. POST /bookings (locks seats for 10 min)
        ↓
   Returns: bookingId, pricing, expiresAt
        ↓
3. User completes payment
        ↓
4. POST /bookings/:id/confirm
        ↓
   Seats marked as BOOKED ✓
```

### Preventing Double Booking
- Uses **database transactions** with `Serializable` isolation
- **Row-level locking** with `FOR UPDATE NOWAIT`
- Seats are **LOCKED** during payment window
- Auto-releases if payment not completed in time

---

## 🗃️ Database Schema

```
Users ──< Bookings >── Shows ──< ShowSeats >── Seats
                         │                       │
                       Movies                  Screens ──< Theaters
```

### Key Tables
- **movies** - Movie information
- **theaters** - Theater locations
- **screens** - Screens in theaters (IMAX, Dolby, etc.)
- **seats** - Seat layout per screen
- **shows** - Movie showtimes
- **show_seats** - Seat availability & pricing per show
- **bookings** - User bookings
- **booking_seats** - Seats in each booking

---

## 💰 Pricing Logic

```javascript
Final Price = Base Price × Seat Multiplier × Screen Multiplier × Weekend Surcharge

Seat Types:    REGULAR(1.0), PREMIUM(1.5), RECLINER(2.0), VIP(2.5)
Screen Types:  STANDARD(1.0), IMAX(1.8), DOLBY(1.6), 4DX(2.0)
Weekend:       +20%
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (access + refresh tokens)
- **Security:** Helmet, CORS, Rate Limiting

---

## 📁 Project Structure

```
cinebook/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Sample data
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, errors
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helpers
│   ├── validators/      # Input validation
│   ├── app.js           # Express app
│   └── server.js        # Entry point
└── package.json
```

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:3002/api/v1/health

# Login
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cinebook.com","password":"Admin@123"}'

# Get movies
curl http://localhost:3002/api/v1/movies

# Book seats (requires auth token)
curl -X POST http://localhost:3002/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"showId":"SHOW_ID","seatIds":["SEAT_ID_1","SEAT_ID_2"]}'
```

---

## 📄 License

MIT License

---

Built with ❤️ for movie lovers
