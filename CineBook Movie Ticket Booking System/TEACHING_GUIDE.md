# 🎓 CineBook Teaching Guide for Instructors

A comprehensive guide to teach backend development using the Movie Ticket Booking System.

---

## 📚 Course Overview

| Session | Topic | Duration |
|---------|-------|----------|
| 1 | Introduction & Real-World Problem | 45 min |
| 2 | Database Design & Relationships | 60 min |
| 3 | API Design & REST Principles | 45 min |
| 4 | Authentication & Security | 60 min |
| 5 | The Booking Problem (Transactions) | 90 min |
| 6 | Hands-On: Build & Test | 60 min |

---

# Session 1: Introduction & Real-World Problem

## 🎯 Learning Objective
Students understand WHY we build systems like this and the problems they solve.

## 📖 Teaching Script

### Start with a Story (5 min)

> *"Imagine it's Friday night. You and your friends want to watch Avengers at PVR. You open BookMyShow, select 4 seats in Row H, and click 'Pay Now'. At the EXACT same moment, someone else in another part of the city selects the SAME seats. What happens?"*

**Ask students:** What should happen?

**Answer:** Only ONE person should get those seats. The other should see "Seats no longer available."

### The Core Problem (10 min)

Draw this on the board:

```
                    ┌─────────────────┐
                    │   SAME 4 SEATS  │
                    │   Row H: 5,6,7,8 │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
       ┌─────────┐      ┌─────────┐      ┌─────────┐
       │  User A │      │  User B │      │  User C │
       │ Mumbai  │      │  Delhi  │      │ Bangalore│
       └─────────┘      └─────────┘      └─────────┘
            │                │                │
            │   All click    │                │
            │   "Book Now"   │                │
            │   at 7:00:00   │                │
            ▼                ▼                ▼
        ┌─────────────────────────────────────┐
        │           WHO GETS THE SEATS?        │
        │                                      │
        │   ❌ All three? (DOUBLE BOOKING!)    │
        │   ✅ Only one? (HOW?)                │
        └─────────────────────────────────────┘
```

**Key Question:** How does BookMyShow ensure only ONE person books those seats?

### Real-World Scale (5 min)

Share these numbers:
- BookMyShow handles **10 million+ bookings/month**
- Avengers Endgame: **1 million tickets in 1 hour**
- That's **277 bookings per SECOND**

> *"Our system must handle thousands of simultaneous users trying to book the same seats without EVER allowing double bookings."*

### What We're Building (10 min)

Show the system overview:

```
┌─────────────────────────────────────────────────────────────┐
│                    CINEBOOK SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 USERS                                                   │
│  ├── Register/Login                                         │
│  ├── Browse Movies                                          │
│  ├── Select Theater & Show                                  │
│  ├── Choose Seats                                           │
│  ├── Make Payment                                           │
│  └── Get Ticket                                             │
│                                                             │
│  👨‍💼 ADMIN                                                   │
│  ├── Add Movies                                             │
│  ├── Add Theaters & Screens                                 │
│  ├── Schedule Shows                                         │
│  └── View Bookings                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Interactive Demo (15 min)

1. Open BookMyShow on projector
2. Walk through the booking flow
3. Point out each step that corresponds to an API endpoint:
   - Movie listing → `GET /movies`
   - Theater selection → `GET /theaters?city=Mumbai`
   - Show times → `GET /movies/:id/shows`
   - Seat selection → `GET /shows/:id` (seat layout)
   - Booking → `POST /bookings`
   - Confirmation → `POST /bookings/:id/confirm`

### Homework
- Download and explore the CineBook codebase
- Identify 5 features in BookMyShow that we'll implement

---

# Session 2: Database Design & Relationships

## 🎯 Learning Objective
Students understand how to model real-world entities in a database.

## 📖 Teaching Script

### Start with Objects (10 min)

> *"Before writing code, let's think about what THINGS exist in our system."*

**Ask students:** What are the main "objects" in a movie booking system?

Write on board as they answer:
- Movies
- Theaters
- Screens
- Seats
- Shows
- Users
- Bookings

### Real-World to Database (20 min)

#### Example 1: Theater has Screens

**Real World:**
> "PVR Phoenix has Screen 1, Screen 2, and an IMAX screen."

**Database:**
```
THEATER                         SCREEN
┌─────────────────┐            ┌─────────────────────┐
│ id: 1           │            │ id: 1               │
│ name: PVR       │◄───────────│ theater_id: 1       │
│ city: Mumbai    │     has    │ name: Screen 1      │
└─────────────────┘    many    │ type: STANDARD      │
                               ├─────────────────────┤
                               │ id: 2               │
                               │ theater_id: 1       │
                               │ name: IMAX          │
                               │ type: IMAX          │
                               └─────────────────────┘
```

**Key Concept:** One-to-Many relationship (One theater has many screens)

#### Example 2: Screen has Seats

**Real World:**
> "Screen 1 has 100 seats arranged in 10 rows (A-J) with 10 seats each."

```
SCREEN                          SEAT
┌─────────────────┐            ┌─────────────────────┐
│ id: 1           │            │ id: 1               │
│ name: Screen 1  │◄───────────│ screen_id: 1        │
│ rows: 10        │    has     │ row: A              │
│ columns: 10     │   many     │ number: 1           │
└─────────────────┘            │ type: REGULAR       │
                               ├─────────────────────┤
                               │ id: 2               │
                               │ screen_id: 1        │
                               │ row: A              │
                               │ number: 2           │
                               │ type: REGULAR       │
                               └─────────────────────┘
                               ... (100 seats total)
```

#### Example 3: The Tricky Part - Shows & Seat Availability

**Real World:**
> "Inception is showing at 3:00 PM and 6:00 PM on Screen 1. Each show has its own seat availability."

**Problem:** Seat A1 might be booked for the 3:00 PM show but available for 6:00 PM show.

**Solution:** Create a SHOW_SEAT table!

```
SHOW                           SHOW_SEAT
┌─────────────────┐            ┌─────────────────────┐
│ id: 1           │            │ show_id: 1          │
│ movie: Inception│◄───────────│ seat_id: 1 (A1)     │
│ time: 3:00 PM   │            │ status: BOOKED      │
│ screen_id: 1    │            │ price: 250          │
├─────────────────┤            ├─────────────────────┤
│ id: 2           │            │ show_id: 1          │
│ movie: Inception│◄───────────│ seat_id: 2 (A2)     │
│ time: 6:00 PM   │            │ status: AVAILABLE   │
│ screen_id: 1    │            │ price: 250          │
└─────────────────┘            ├─────────────────────┤
                               │ show_id: 2          │
                               │ seat_id: 1 (A1)     │
                               │ status: AVAILABLE   │◄── Same seat, different show!
                               └─────────────────────┘
```

### Complete ER Diagram (15 min)

Draw on board:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  MOVIE   │────<│   SHOW   │>────│  SCREEN  │>────┌──────────┐
└──────────┘     └────┬─────┘     └──────────┘     │ THEATER  │
                      │                            └──────────┘
                      │
                ┌─────┴─────┐
                │ SHOW_SEAT │>────┌──────────┐
                └─────┬─────┘     │   SEAT   │
                      │           └──────────┘
                      │
                ┌─────┴─────┐
                │  BOOKING  │>────┌──────────┐
                └───────────┘     │   USER   │
                                  └──────────┘
```

### Hands-On Exercise (15 min)

Give students this scenario:
> "Design a database for a food delivery app (like Swiggy). What tables would you need?"

Expected answer:
- Users
- Restaurants
- Menu Items
- Orders
- Order Items
- Delivery Addresses

### Code Walkthrough (10 min)

Show `prisma/schema.prisma`:

```prisma
model Theater {
  id        String   @id @default(uuid())
  name      String
  city      String
  screens   Screen[] // One-to-Many relationship
}

model Screen {
  id         String   @id
  theaterId  String
  theater    Theater  @relation(fields: [theaterId], references: [id])
  seats      Seat[]
  shows      Show[]
}
```

**Key Point:** Prisma makes relationships easy to define!

---

# Session 3: API Design & REST Principles

## 🎯 Learning Objective
Students understand REST API design and can design APIs for any system.

## 📖 Teaching Script

### What is an API? (10 min)

**Analogy: Restaurant**

```
┌─────────────────────────────────────────────────────────────┐
│                      RESTAURANT                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   CUSTOMER          WAITER           KITCHEN                │
│   (Frontend)        (API)            (Backend)              │
│                                                              │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐            │
│   │  "I     │ ───> │ Takes   │ ───> │ Cooks   │            │
│   │  want   │      │ order   │      │ food    │            │
│   │  pizza" │      │         │      │         │            │
│   └─────────┘      └─────────┘      └─────────┘            │
│        │                │                │                  │
│        │                │                │                  │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐            │
│   │ Eats    │ <─── │ Serves  │ <─── │ Plates  │            │
│   │ pizza   │      │ food    │      │ food    │            │
│   └─────────┘      └─────────┘      └─────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

> "The waiter doesn't cook. The customer doesn't go to the kitchen. The API is the intermediary that takes requests and returns responses."

### REST Principles (15 min)

**1. Resources = Nouns**

```
✅ Good:
   /movies
   /theaters
   /bookings

❌ Bad:
   /getMovies
   /createBooking
   /deleteUser
```

**2. HTTP Methods = Verbs**

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read | GET /movies |
| POST | Create | POST /movies |
| PUT | Update (full) | PUT /movies/123 |
| PATCH | Update (partial) | PATCH /movies/123 |
| DELETE | Delete | DELETE /movies/123 |

**3. URLs = Hierarchy**

```
/theaters                    → All theaters
/theaters/123                → Specific theater
/theaters/123/screens        → Screens in theater 123
/theaters/123/screens/1      → Screen 1 in theater 123
```

### Design Exercise (20 min)

**Challenge:** Design APIs for CineBook

Give students this table to fill:

| Action | Method | URL |
|--------|--------|-----|
| Get all movies | ? | ? |
| Get movie by ID | ? | ? |
| Get shows for a movie | ? | ? |
| Get theaters in a city | ? | ? |
| Book seats | ? | ? |
| Cancel booking | ? | ? |

**Answer:**

| Action | Method | URL |
|--------|--------|-----|
| Get all movies | GET | /movies |
| Get movie by ID | GET | /movies/:id |
| Get shows for a movie | GET | /movies/:id/shows |
| Get theaters in a city | GET | /theaters?city=Mumbai |
| Book seats | POST | /bookings |
| Cancel booking | POST | /bookings/:id/cancel |

### Code Walkthrough (15 min)

Show `src/routes/movie.routes.js`:

```javascript
// RESTful routes
router.get('/', movieController.getMovies);           // GET /movies
router.get('/:id', movieController.getMovie);         // GET /movies/:id
router.get('/:id/shows', showController.getShows);    // GET /movies/:id/shows

router.post('/', adminOnly, movieController.create);  // POST /movies
router.put('/:id', adminOnly, movieController.update);// PUT /movies/:id
```

---

# Session 4: Authentication & Security

## 🎯 Learning Objective
Students understand JWT authentication and why security matters.

## 📖 Teaching Script

### Why Authentication? (5 min)

**Scenario:**
> "What if anyone could cancel YOUR movie ticket without logging in?"

**We need to:**
1. Know WHO is making the request (Authentication)
2. Check if they're ALLOWED to do it (Authorization)

### JWT Explained (20 min)

**Analogy: Concert Wristband**

```
┌─────────────────────────────────────────────────────────────┐
│                    CONCERT WRISTBAND                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Buy ticket (Login)                                     │
│      └── Get wristband (JWT Token)                          │
│                                                              │
│   2. Enter venue (API Request)                              │
│      └── Show wristband (Include token in header)           │
│                                                              │
│   3. Security checks (Server verifies)                      │
│      └── Is wristband valid? Not fake? Not expired?         │
│                                                              │
│   4. Access granted (Response)                              │
│      └── Enjoy the show!                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**JWT Structure:**

```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOiIxMjM.SflKxwRJSMeKKF2QT4
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
      HEADER              PAYLOAD            SIGNATURE
   (Algorithm)         (User Data)        (Verification)
```

**Show jwt.io:** Decode a real token live!

### Password Security (15 min)

**Never store plain passwords!**

```
❌ WRONG:
Database: { email: "john@test.com", password: "secret123" }
         If database is hacked, all passwords exposed!

✅ CORRECT:
Database: { email: "john@test.com", password: "$2b$12$xyz..." }
         Even if hacked, passwords are unreadable!
```

**How hashing works:**

```
"secret123"  ──┬──  Hash Function  ──>  "$2b$12$LQv3c1..."
               │
               └──  CANNOT BE REVERSED!

"secret123"  ──>  bcrypt.hash()  ──>  "$2b$12$LQv3c1..."
"secret123"  ──>  bcrypt.compare("$2b$12$LQv3c1...")  ──>  TRUE ✓
"wrong"      ──>  bcrypt.compare("$2b$12$LQv3c1...")  ──>  FALSE ✗
```

### Code Walkthrough (15 min)

Show `src/services/auth.service.js`:

```javascript
// Registration - Hash password
const hashedPassword = await bcrypt.hash(password, 12);
await prisma.user.create({
  data: { email, password: hashedPassword }
});

// Login - Compare password
const isValid = await bcrypt.compare(inputPassword, user.password);
if (!isValid) throw new Error('Invalid credentials');

// Generate JWT
const token = jwt.sign(
  { userId: user.id, email: user.email },
  SECRET_KEY,
  { expiresIn: '15m' }
);
```

### Live Demo (10 min)

1. Register a user
2. Show the hashed password in database
3. Login and get token
4. Decode token at jwt.io
5. Use token to access protected route

---

# Session 5: The Booking Problem (CRITICAL!)

## 🎯 Learning Objective
Students understand race conditions and how to prevent double bookings.

## 📖 Teaching Script

### The Race Condition Problem (20 min)

**Scenario: Two users book the same seat simultaneously**

```
TIME        USER A (Mumbai)              SERVER                USER B (Delhi)
─────────────────────────────────────────────────────────────────────────────
10:00:00    Click "Book Seat A1"  ───>                   <───  Click "Book Seat A1"
            
10:00:01                               Check: Is A1 available?
                                       Result: YES ✓
                                       
10:00:01                               Check: Is A1 available?
                                       Result: YES ✓
                                       
10:00:02                               Book A1 for User A
                                       
10:00:02                               Book A1 for User B
                                       
10:00:03    "Booking Confirmed!" <───                   ───>  "Booking Confirmed!"

─────────────────────────────────────────────────────────────────────────────
                           😱 BOTH GOT THE SAME SEAT!
```

**Ask students:** What went wrong?

**Answer:** The "check" and "book" happened separately. Between check and book, the state changed!

### The Solution: Transactions with Locking (30 min)

**Analogy: Bathroom Lock**

```
Without Lock (Race Condition):
┌──────────────────────────────────────────────────────────┐
│  Person A checks: "Is bathroom free?" → YES              │
│  Person B checks: "Is bathroom free?" → YES              │
│  Both enter at the same time! 😱                         │
└──────────────────────────────────────────────────────────┘

With Lock (Transaction):
┌──────────────────────────────────────────────────────────┐
│  Person A: Lock door → Check → Use → Unlock              │
│  Person B: Tries door → LOCKED → Wait...                 │
│  Person A finishes, unlocks                              │
│  Person B: Lock door → Check → Use → Unlock              │
│  ✅ No collision!                                        │
└──────────────────────────────────────────────────────────┘
```

**Database Transaction:**

```javascript
// ❌ WITHOUT TRANSACTION (DANGEROUS!)
const seat = await db.seat.findOne({ id: 'A1' });
if (seat.status === 'AVAILABLE') {
  // 💥 Another request could change this RIGHT HERE!
  await db.seat.update({ status: 'BOOKED' });
}

// ✅ WITH TRANSACTION (SAFE!)
await prisma.$transaction(async (tx) => {
  // Lock the row - no one else can read/write until we're done
  const seat = await tx.$queryRaw`
    SELECT * FROM seats WHERE id = 'A1' FOR UPDATE NOWAIT
  `;
  
  if (seat.status !== 'AVAILABLE') {
    throw new Error('Seat not available');
  }
  
  await tx.seat.update({ status: 'BOOKED' });
  // Transaction commits - lock released
});
```

### Visual Explanation (15 min)

```
WITH TRANSACTION + LOCKING:

TIME        USER A (Mumbai)              DATABASE               USER B (Delhi)
─────────────────────────────────────────────────────────────────────────────
10:00:00    Start Transaction     ───>
            Lock Row A1           ───>   🔒 LOCKED
            
10:00:01                                                  <───  Start Transaction
                                                         <───  Try Lock Row A1
                                         🔒 BLOCKED!      ───>  ⏳ WAITING...
                                         
10:00:02    Check: Available? YES
            Update: BOOKED
            Commit Transaction    ───>   🔓 UNLOCKED
            
10:00:03    "Booking Confirmed!" <───
                                                         <───  Lock Row A1 (now available)
                                                         <───  Check: Available? NO!
                                                         ───>  "Seat not available"
                                                         
─────────────────────────────────────────────────────────────────────────────
                           ✅ ONLY USER A GOT THE SEAT!
```

### Code Walkthrough (20 min)

Show `src/services/booking.service.js`:

```javascript
const lockSeatsForBooking = async (userId, showId, seatIds) => {
  // Use Serializable isolation - highest safety level
  return prisma.$transaction(async (tx) => {
    
    // 1. Lock seats with FOR UPDATE NOWAIT
    //    - FOR UPDATE: Lock these rows
    //    - NOWAIT: Don't wait, fail immediately if locked
    const seats = await tx.$queryRaw`
      SELECT * FROM show_seats 
      WHERE show_id = ${showId} 
      AND seat_id = ANY(${seatIds})
      FOR UPDATE NOWAIT
    `;
    
    // 2. Check all seats are available
    const unavailable = seats.filter(s => s.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      throw new Error('Some seats are no longer available');
    }
    
    // 3. Lock the seats (temporary, during payment)
    await tx.showSeat.updateMany({
      where: { id: { in: seats.map(s => s.id) } },
      data: { status: 'LOCKED', lockedBy: userId }
    });
    
    // 4. Create pending booking
    const booking = await tx.booking.create({
      data: {
        userId,
        showId,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
      }
    });
    
    return booking;
    
  }, { isolationLevel: 'Serializable' });
};
```

### Live Demo: Prove It Works (10 min)

1. Open two terminal windows
2. Simulate simultaneous bookings using curl
3. Show that only ONE succeeds
4. Show the other gets "Seats not available"

---

# Session 6: Hands-On Lab

## 🎯 Learning Objective
Students set up and run the project themselves.

## Lab Instructions

### Part 1: Setup (15 min)

```bash
# Clone the project
git clone https://github.com/q225/cinebook.git
cd cinebook

# Run setup
./setup.sh   # or .\setup.ps1 on Windows

# Start server
npm run dev
```

### Part 2: Explore the API (20 min)

**Task 1:** Get all movies
```bash
curl http://localhost:3002/api/v1/movies
```

**Task 2:** Register a user
```bash
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"Test@123","firstName":"Test","lastName":"User"}'
```

**Task 3:** Login and save token
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"Test@123"}'
```

**Task 4:** Get show with seats
```bash
curl http://localhost:3002/api/v1/shows/SHOW_ID
```

**Task 5:** Book seats (use your token!)
```bash
curl -X POST http://localhost:3002/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"showId":"SHOW_ID","seatIds":["SEAT_ID_1","SEAT_ID_2"]}'
```

### Part 3: Break It! (15 min)

**Challenge:** Try to double-book!

1. Open two terminals
2. Get seat IDs for the same show
3. Run booking commands simultaneously
4. Observe: Only ONE succeeds!

### Part 4: Code Challenge (10 min)

**Add a new feature:** Add an endpoint to get booking by booking number.

Hint: 
- Add route in `src/routes/booking.routes.js`
- Booking numbers look like: `CB-20240120-ABC123`

---

## 📝 Assessment Questions

### Multiple Choice

1. What prevents double booking in CineBook?
   - a) Fast server
   - b) Database transactions with row locking
   - c) Multiple servers
   - d) Caching

2. Why do we hash passwords?
   - a) To make them shorter
   - b) To make them unreadable even if database is hacked
   - c) To make login faster
   - d) To save storage space

3. What does `FOR UPDATE NOWAIT` do?
   - a) Updates the row immediately
   - b) Locks the row and fails if already locked
   - c) Waits forever for the lock
   - d) Skips the row if locked

### Coding Questions

1. Write a REST API endpoint to get all bookings for a specific user.

2. Explain what would happen without the transaction in the booking flow.

3. Design a database schema for a parking lot management system.

---

## 🎯 Key Takeaways

By the end of this course, students should understand:

1. **Database Design** - How to model real-world entities and relationships
2. **REST APIs** - How to design clean, intuitive APIs
3. **Authentication** - JWT tokens and password security
4. **Transactions** - How to prevent race conditions in concurrent systems
5. **Real-World Thinking** - How production systems handle scale

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io) - Decode and learn about JWTs
- [REST API Design Best Practices](https://restfulapi.net/)
- [Database Transaction Isolation Levels](https://www.postgresql.org/docs/current/transaction-iso.html)

---

*Happy Teaching! 🎓*
