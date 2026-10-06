# Online Bookstore

A peer-to-peer (C2C) secondhand bookstore where students list books for sale, buyers and sellers connect directly, and trust between strangers is established through phone verification and a Bayesian-weighted rating system rather than a payment gateway holding funds.

---

## Table of Contents
- [User Requirements](#user-requirements)
- [System Requirements](#system-requirements)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Feature Documentation](#feature-documentation)
- [Auth Flow](#auth-flow)
- [Security Measures](#security-measures)
- [API Response Shape](#api-response-shape)
- [Notes & Gotchas](#notes--gotchas)

---

## User Requirements

### For Buyers
- Account registration, login, Google Sign-In, logout, profile management
- Browse all available books
- View book details, seller rating/reviews, and condition photos
- Filter and search books by keyword, without requiring authentication
- Leave feedback/rating for a seller after a completed transaction
- Cancel an order

### For Sellers
- List books for sale (price, condition, book info)
- Manage active listings
- View incoming orders, pending sales, and transaction history
- Review a buyer after a completed transaction

---

## System Requirements

- **Authentication** — Google Sign-In with automated phone verification layered on top
- **Trust system** — peer-to-peer trust built through a Bayesian-weighted average seller and buyer rating; only parties with a completed transaction against other party can leave feedback, preventing fake/unverified reviews
- **Rate limiting**
  - Buyers: max **10 orders per hour**
  - Sellers: max **10 listings sold per hour**

### Non-Functional Requirements
- **Authentication** — JWT-based manual auth, combined with OAuth (Google)
- **Password security** — hashed, never stored in plaintext
- **Concurrency control** — row-level locking to prevent race conditions (e.g. two buyers reserving the same listing simultaneously)
- **Decoupled, lightweight catalog** — book metadata sourced from the Google Books API (with Open Library as a potential alternate/fallback source) rather than maintained manually, keeping the in-app database lean
- **Indexing** — for fast retrieval on search and lookup paths
- **Modular, decoupled architecture** — built for scalability
- **Bayesian average** — statistically sound seller ratings that account for how much evidence (review count) backs them, rather than a naive average
- **Offset-based pagination** — prevents large, unbounded result sets
- **Mobile responsive** — frontend adapts across screen sizes
- **OTP lockout** — if a user fails OTP verification more than 3 times within 15 minutes, the OTP is invalidated and verification is locked out
- **OTP request limit** — a user cannot request OTP verification more than 5 times for the same phone number (within the enforced window)
- **Login lockout** — a user is blocked for 15 minutes after 3 failed login attempts, enforced atomically via a Redis Lua script

---

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript, Express 5
- **Database:** MySQL, via Drizzle ORM
- **Validation:** Zod
- **Auth:** JWT (access + refresh tokens) + Google OAuth (`google-auth-library`)
- **Password hashing:** bcrypt
- **Rate limiting / lockouts:** Redis (`ioredis`) with Lua scripting for atomic attempt-tracking
- **Image storage:** Cloudinary, uploads handled via Multer
- **Scheduled jobs:** node-cron (order timeout/expiry sweeps)
- **External API:** Google Books API (ISBN-based listing autofill)
- **Search:** MySQL native `FULLTEXT` index (no external search engine)

### Frontend
- **Framework:** Next.js 16, React 19
- **Styling:** Tailwind CSS 4
- **Forms & validation:** React Hook Form + Zod resolvers
- **Data fetching:** TanStack Query, Axios
- **UI utilities:** `class-variance-authority`, `clsx`, `tailwind-merge`, Lucide icons

---

## Project Structure

```
/server      → backend (Express + TypeScript)
/frontend    → frontend (Next.js)
```

---

## Backend Setup

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in real values (DB credentials, JWT secrets, Google OAuth + Books API keys, Cloudinary credentials, Redis connection URL).

### 3. Database setup
```bash
npm run db:generate   # generate Drizzle migrations
npm run db:push        # apply schema to your local MySQL database
```

Then **run this manually — it is not currently part of the migration files:**
```sql
CREATE FULLTEXT INDEX search_idx ON books_catalogue(title, author, description);
```
⚠️ If you rebuild the database from scratch, this index needs to be re-created manually, or search will silently degrade.

### 4. Redis
Rate limiting and login/OTP lockouts depend on Redis being reachable at the URL set in `.env`. Make sure your Redis instance (Docker/WSL or otherwise) is running before starting the server.

### 5. Run the dev server
```bash
npm run dev
```
Server runs at `http://localhost:{PORT}` (see `.env`).

### Other scripts
| Command | Purpose |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:push` | Push schema changes directly to the database |

---

## Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Environment variables
Set the backend API base URL (e.g. `NEXT_PUBLIC_API_URL=http://localhost:3000`) and any frontend-specific Google OAuth client ID needed for the Sign-In button.

### 3. Run the dev server
```bash
npm run dev
```
Runs at `http://localhost:3001` (configured via `-p 3001` in the `dev` script, since the backend typically runs on 3000).

### Other scripts
| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Feature Documentation

### Authentication
- **Google OAuth Sign-In** — frontend obtains a Google ID token client-side, backend verifies it server-side (`verifyWithGoogle`) and issues the app's own JWT pair.
- **JWT access + refresh token pair** — short-lived access token for API authorization; longer-lived refresh token for silently renewing it.
- **Phone OTP verification** — separate from login. A user can be authenticated via Google but still `isVerified: false` until phone verification completes. Enforced via `requirePhoneVerified` middleware on routes that need it (e.g. listing creation, placing orders).

### Token Rotation
- **Register** — new Google sign-in creates a `users` row (`isVerified: false`), issues an access token (15 min expiry) and a refresh token (7 days), the refresh token hashed and stored server-side so it can be revoked.
- **Login** — any previous refresh token for the user is invalidated before a new one is issued, preventing multiple simultaneously-valid refresh tokens from accumulating.
- **Refresh** (`POST /auth/refresh`) — verifies the refresh token's signature *and* confirms it matches the stored hash, then issues a new access token **and rotates the refresh token** (old one invalidated immediately — single-use, not reusable).
- **Phone verification** does not issue or rotate tokens — `POST /auth/request-verification` triggers OTP send, `POST /auth/verify-phoneno` flips `isVerified` to `true` on success.

### Book Listings
- **ISBN-based creation** — seller submits an ISBN, backend queries the Google Books API and autofills title/author/cover/description.
- **Canonical book deduplication** — one `books_catalogue` row per unique edition (matched by ISBN-13), with multiple `listings` rows referencing it, so many sellers listing the same title don't duplicate metadata.
- **ISBN-10 / ISBN-13 handling** — ISBN-13 is canonical; ISBN-10 is converted or retried as a fallback when the primary `isbn:` search misses (a known Google Books indexing inconsistency).
- **Manual entry fallback** — if no ISBN match, seller enters title/author manually and uploads their own cover photo (`source: 'manual'`, `isbn: null`).
- **Cover images** — extracted from Google's `imageLinks` with a fallback chain, `null` if unavailable.
- **Image storage** — Cloudinary, uploads via Multer.

### Search
- MySQL native `FULLTEXT` index on `books_catalogue(title, author, description)`.
- ISBN-aware routing — the same search bar detects ISBN-shaped input and routes to an exact lookup instead of relevance-ranked text search.
- No authentication required to browse or search.

### Orders & Transactions
- **Row-level locking** (`SELECT ... FOR UPDATE`) on listing reservation — prevents two buyers concurrently reserving the same listing.
- **Dual confirmation model** — no payment gateway by default. Buyer confirms receipt, seller confirms payment, independently; order completes once both are in.
- **Cancellation** — either party can cancel while the order is still `pending` (no confirmations yet).
- **Automatic timeout (cron)** — fully-pending orders past a timeout window auto-fail and release the listing.
- **Role-based order views** — the same order returns different `counterparty` info depending on whether the requester is the buyer or seller.

### Ratings & Trust
- **Bayesian weighted average** — `(C·m + Σx) / (C + n)`, preventing a seller from being unfairly ranked on very few reviews by pulling toward the platform-wide average until enough evidence accumulates.
- **Transaction-gated reviews** — only a buyer/seller with a completed order against the other party can leave a review, preventing fake reviews.
- **Two-sided reviews** — buyers rate sellers, sellers rate buyers; one review per participant per completed order.
- **Incremental aggregates** — `rating_count`/`rating_sum` maintained as running totals rather than recomputed from the full reviews table on every read.
- **Zero-review state handled explicitly** — `bayesian_rating` is `NULL`, not `0`, until a user's first review.

### Delivery
Handled off-platform by design — buyer and seller coordinate pickup/shipping privately using verified phone numbers revealed once an order is placed. No courier API integration in current scope.

---

## Auth Flow

### A. Google Sign-In
1. Frontend runs the Google Sign-In flow client-side, receives a Google **ID token**.
2. Frontend sends it to the backend's Google auth endpoint.
3. Backend verifies it server-side and returns the app's own JWT access + refresh tokens.

### B. Phone OTP Verification (required before certain actions)
1. `POST /auth/request-verification` — body: `{ "phoneNo": "98XXXXXXXX" }` (Nepali format, must start with `97` or `98`, 10 digits).
   - **Locally, no real SMS is sent** — the OTP is logged to the backend terminal (`sendOtp` is currently a console-log stub).
2. `POST /auth/verify-phoneno` — body includes the submitted code. On success, `isVerified` flips to `true`.

### JWT Usage
Send the access token as `Authorization: Bearer <token>` on all authenticated requests. On a `401`, use the refresh flow to silently obtain a new access token before retrying.

---

## Security Measures

| Mechanism | Rule |
|---|---|
| Password storage | Hashed with bcrypt, never stored in plaintext |
| OTP failed attempts | 3 failed verifications within 15 minutes → OTP deleted, verification locked |
| OTP request limit | Max 5 OTP requests for the same phone number (within the enforced window) |
| Login failed attempts | 3 failed login attempts → account blocked for 15 minutes, enforced atomically via a Redis Lua script (`INCR` + conditional `EXPIRE` in one atomic operation, avoiding race conditions between concurrent login attempts) |
| Order placement rate limit | Max 10 orders per buyer per hour |
| Listing sale rate limit | Max 10 sales per seller per hour |
| Race condition prevention | `SELECT ... FOR UPDATE` row locking on listing reservation during order placement |

All rate limiting and lockout counters are backed by Redis, using TTL-based expiry so windows reset automatically without needing manual cleanup jobs.

---

## API Response Shape

Consistent across all endpoints:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { },
  "message": "Human-readable message"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Human-readable error message",
  "errors": []
}
```

Always check `success`/`statusCode` rather than relying on HTTP status alone — validation details may be in `errors`.
