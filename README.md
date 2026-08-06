# Online Bookstore — Backend

A C2C secondhand bookstore API. Students list books (auto-filled from the Google Books API or entered manually), buyers and sellers connect through the platform, and transactions are confirmed by both sides rather than processed through a payment gateway.

---

## Feature Documentation
## 1. Authentication
 
- **Google OAuth Sign-In** — frontend obtains a Google ID token client-side, backend verifies it server-side via `verifyWithGoogle` (using `google-auth-library`), and issues the app's own JWT pair on success.
- **JWT access + refresh token pair** — short-lived access token for API authorization, longer-lived refresh token for silently obtaining new access tokens without re-login.
- **Phone number OTP verification** — separate from login; a user can be authenticated (via Google) but still `isVerified: false` until they complete phone verification. Enforced via the `requirePhoneVerified` middleware on routes that require it (e.g. listing creation, placing orders).
---
 
## 2. Token Rotation — Detailed Flows
 
### Register (first-time Google Sign-In)
1. Frontend sends Google ID token to the register/login endpoint.
2. Backend verifies the token, creates a new `users` row (`isVerified: false` until phone is verified).
3. Backend issues:
   - **Access token** — signed with `ACCESS_TOKEN_SECRET`, short expiry (e.g. 15 min).
   - **Refresh token** — signed with `REFRESH_TOKEN_SECRET`, longer expiry (e.g. 7 days).
4. Refresh token is stored server-side (hashed, similar to OTP storage) against the user, so it can be invalidated later. Returned to the client — typically as an httpOnly cookie.
### Login (returning user)
1. Same as register from the token-issuance.
2. **Any previous refresh token for this user should be invalidated**, not left active — prevents multiple simultaneously "valid" refresh tokens accumulating per user across repeated logins on different devices.
### Refresh (obtaining a new access token)
1. Client sends the current refresh token (e.g. from httpOnly cookie) to `POST /auth/refresh`.
2. Backend verifies the refresh token signature **and** checks it matches the hashed value stored server-side for that user (guards against a refresh token being valid by signature alone after it should've been revoked).
3. On success:
   - Issue a **new** access token.
   - **Rotate the refresh token** — issue a new refresh token too, and invalidate the old one immediately (delete the stored hash). This is the "rotation" part: a refresh token is single-use, not reusable indefinitely.
### Verify Phone Number (OTP)
1. `POST /auth/request-verification` — requires a valid access token (user must already be logged in). Does **not** issue or rotate any tokens — it only triggers OTP generation/send.
2. `POST /auth/verify-phoneno` — on successful OTP match, updates `users.isVerified = true`. 

---
 
## 3. Book Listings
 
- **ISBN-based creation** — seller submits an ISBN, backend queries Google Books API, autofills title/author/cover/description.
- **Canonical book deduplication** — one `books_catalogue` row per unique edition (matched by ISBN-13), with multiple `listings` rows (one per seller) referencing it. Prevents duplicate book metadata across many sellers listing the same title.
- **ISBN-10 / ISBN-13 handling** — ISBN-13 stored as the canonical form; ISBN-10 converted or retried as a fallback query when the primary `isbn:` search misses (a known Google Books indexing inconsistency).
- **Manual entry fallback** — if no ISBN, or ISBN not found via Google Books, seller enters title/author manually and uploads their own cover photo. `source: 'manual'`, `isbn: null`.
- **Cover image handling** — extracted from Google's `imageLinks` object with a fallback chain (`thumbnail` → `smallThumbnail` → `small`), `null` if no image available at all.
- **Image storage** — seller-uploaded photos (condition photos, manual-entry covers) stored via Cloudinary.
## 4. Search
 
- **MySQL native `FULLTEXT` index** on `books_catalogue(title, author, description)` — no external search engine.
- **ISBN-aware routing** — the same search bar auto-detects ISBN-shaped input (10 or 13 digit pattern) and routes to an exact ISBN lookup instead of relevance-ranked text search.
## 5. Orders & Transactions
 
- **Row-level locking on listing reservation** (`SELECT ... FOR UPDATE`) — prevents two buyers from concurrently ordering the same physical listing (race condition).
- **Dual confirmation model** — no payment gateway required by default. Buyer confirms receipt of the book, seller confirms receipt of payment, independently. Order completes only once both confirmations are in.
- **Cancellation** — either buyer or seller can cancel while the order is still `pending` (no confirmations yet).
- **Automatic timeout (cron)** — fully-`pending` orders with zero confirmations past a short window (e.g. 15 days) auto-fail and release the listing.
- **Role-based order views** — the same order returns different `counterparty` info depending on whether the requester is the buyer or seller.
## 6. Ratings & Trust
 
- **Bayesian weighted average rating** — `(C*m + ∑x)/(C+n)`, guarding new users against being unfairly ranked on too little data, and pulling toward the platform-wide average until enough reviews accumulate.
- **Two-sided reviews** — buyers rate sellers, sellers rate buyers, one review per participant per completed order (`UNIQUE(order_id, reviewer_id)`).
- **Incremental aggregate updates** — `rating_count`/`rating_sum` maintained as running totals on the `users` table rather than recomputed from the full `reviews` table on every read.
- **Zero-review state handled explicitly** — `bayesian_rating` is `NULL` (not `0`) until a user's first review.

 
## 7. API Response Consistency
 
- All responses wrapped in a consistent `ApiResponse`/`ApiError` envelope (`success`, `statusCode`, `data`/`errors`, `message`).
## 8. Delivery
 
Handled entirely off-platform by design — buyer and seller coordinate pickup/shipping privately, using verified phone numbers revealed to each other once an order is placed. No courier API integration in the current scope.


---


## Tech stack

- **Runtime:** Node.js + TypeScript, Express
- **Database:** MySQL, via Drizzle ORM
- **Validation:** Zod
- **Auth:** JWT (access + refresh tokens) and Google OAuth
- **Image storage:** Cloudinary
- **External API:** Google Books API (for ISBN-based listing autofill)
- **Search:** MySQL native `FULLTEXT` index (no Elasticsearch)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd <repo-folder>
npm install
```

### 2. Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```


### 3. Database setup

Run migrations (however the project runs Drizzle migrations, e.g. `npm run db:push`), then **run this manually — it is not currently part of the migration files:**

```sql
CREATE FULLTEXT INDEX search_idx ON books_catalogue(title, author, description);
```

### 4. Run the dev server

```bash
npm run dev
```

Server should now be running at `http://localhost:{PORT}`.

---

## Auth flow

There are two ways into an account, and one additional verification step:

### A. Google Sign-In
1. Frontend runs the standard Google Sign-In flow client-side and receives a Google **ID token**.
2. Frontend sends that ID token to the backend's Google auth endpoint.
3. Backend verifies it server-side (`verifyWithGoogle`) and returns your own JWT access + refresh tokens.

### B. Phone OTP verification (required before certain actions)
Some routes require `isVerified = true` on the user (enforced by the `requirePhoneVerified` middleware) — a user can be logged in via Google but still need to verify a phone number before, e.g., listing a book or placing an order.

1. `POST /auth/request-verification` — body: `{ "phoneNo": "98XXXXXXXX" }` (Nepali format, must start with `97` or `98`, 10 digits). Triggers an OTP send.
   - **Locally, no real SMS is sent** — check the backend terminal output for the OTP code (`sendOtp` currently just logs it).
2. `POST /auth/verify-phoneno` — body includes the code the user received. On success, `isVerified` flips to `true`.

### JWT usage
- Send the access token as `Authorization: Bearer <token>` on all authenticated requests.

---

## API response shape — consistent across all endpoints

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { /* endpoint-specific payload */ },
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

---

## Note

- **Ratings can be `null`.** A user with zero reviews has `rating: null`, not `0`.
- **ISBN can be `null` too.** Manually-entered listings (no ISBN found via Google Books) have `isbn: null`.
- **Cover images can be missing.** `coverImageUrl` is nullable
- **Listing status matters for what actions are valid.** A listing can be `available`, `reserved`, or `sold`.
