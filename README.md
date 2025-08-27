# 🛍️ Dukanify Backend

"Powering a real‑time marketplace — authenticate, manage stores, and fulfill orders at scale."

Dukanify Backend is a production‑ready Node.js/Express API with MongoDB and Socket.IO. It provides authentication (OTP + Google), role‑based access (Buyer/Seller/Admin), product & inventory management, order lifecycle, real‑time chat, notifications, cron jobs, and queue support. Admin functionalities are maintained in a **separate Admin Backend repository** for better modularity and security.

---

## 🚀 Core Features

### 🔐 Authentication & Users

* **2‑Step Verification (OTP):** Email OTP for signup/login with resend & expiry.
* **Google Sign‑In:** OAuth 2.0 sign‑in, first‑time users auto‑provisioned.
* **JWT + Refresh Tokens:** Access/refresh token rotation with revocation on logout.
* **Profile:** Update name, avatar; get current user via `/me`.

### 🏬 Sellers & Stores

* **Seller Onboarding:** Apply to become a seller; **Admin approval** workflow (handled in Admin repo).
* **Store Profile:** Name, description, location (Leaflet coords), logo, banners.
* **Inventory:** Add stock, adjust quantities, track availability.

### 🛒 Products & Catalog

* CRUD with images (Multer), tags (unit/brand), price, active/featured flags.
* Public product search & filters; list by store/category; pagination & sorting.

### 📦 Orders & Payments

* **Order States:** `pending → in_progress → ready → fulfilled` (+ `rejected`).
* Multi‑store cart supported (validated per item/store).
* Order history for buyers; order board for sellers.

### 💬 Real‑Time Chat & Notifications

* **Socket.IO:** Buyer↔Seller chat per order; image messages supported.
* **Tabs/Multi‑chat:** Rooms per order; persistent message history (Mongo).
* **Notifications:** New order, status update, new message; in‑app via sockets.

### ⏰ Cron Jobs & Background Tasks

* **Order Cleanup:** Auto‑cancel pending orders after expiry window.
* **OTP Expiry:** Auto‑invalidate unused OTPs.
* **Inventory Alerts:** Notify sellers when stock drops below threshold.
* **Reports/Analytics:** Daily/weekly cron jobs to aggregate sales & store performance.
* **Queues (Optional):** Ready for Bull/Redis integration for heavy jobs.

### 🛡️ Security & Stability

* CORS (allowlist), Helmet, rate limiting, input validation, sanitized queries.
* RBAC middleware (Buyer, Seller, Admin).
* Centralized error handling & structured logs (Winston‑like).

---

## 🧱 Tech Stack

* **Runtime:** Node.js (LTS)
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose
* **Auth:** JWT (access/refresh), Email OTP, Google OAuth 2.0
* **Realtime:** Socket.IO
* **Uploads:** Multer (local) — ready for S3/GCS adapters
* **Validation:** Zod/Joi (choose one; example shows Zod)
* **Cron/Queue:** Node‑cron or Agenda.js; Bull/Redis (optional)
* **Utilities:** Bcrypt, Nodemailer, Day.js

---

## 📂 Folder Structure

```
backend/
├─ src/
│  ├─ config/           # env, db, cors, passport/google
│  ├─ models/           # mongoose schemas (User, Store, Product, Order, Message, Notification, Inventory)
│  ├─ controllers/      # request handlers
│  ├─ routes/           # express routers (auth, users, stores, products, orders, chat, uploads)
│  ├─ services/         # business logic (auth, otp, order, chat, notification)
│  ├─ middleware/       # auth, rbac, error, rateLimit, validate
│  ├─ sockets/          # socket.io namespace & event handlers
│  ├─ cron/             # scheduled jobs (order cleanup, reports, otp expiry)
│  ├─ utils/            # helpers (email, file, pagination, logger)
│  ├─ jobs/             # queues/workers (if Bull/Redis is used)
│  └─ app.ts            # express app
├─ tests/               # e2e/unit tests (optional)
├─ .env.example
├─ package.json
└─ server.ts            # server bootstrap (http + socket)
```

---

## 🔌 API Overview (Selected)

> Base URL: `http://localhost:5000/api`

### Auth

* `POST /auth/otp/request` → request OTP (email)
* `POST /auth/otp/verify` → verify OTP → returns access & refresh tokens
* `POST /auth/google` → Google OAuth callback (token or one‑tap)
* `POST /auth/refresh` → refresh access token
* `POST /auth/logout` → revoke refresh token

### Users

* `GET /users/me` → current user profile
* `PATCH /users/me` → update name/avatar

### Seller/Store

* `POST /stores/apply` → apply as seller (requires Admin approval in admin repo)
* `GET /stores/me` → my store (after approval)
* `PATCH /stores/me` → update store info (logo, banner, location)
* `GET /stores` → public list (filters: verified, top, latest)
* `GET /stores/:id` → store details (+ option include top products)

### Products

* `POST /products` → create (seller)
* `GET /products` → public list (search, brand, unit, price, inStock, storeId)
* `GET /products/:id` → details
* `PATCH /products/:id` → update
* `DELETE /products/:id` → soft delete
* `POST /products/:id/inventory` → add/adjust stock

### Orders

* `POST /orders` → create order (cart items from one or multiple stores)
* `GET /orders` → list my orders (buyer) / store orders (seller)
* `GET /orders/:id` → details
* `PATCH /orders/:id/status` → update status (`in_progress|ready|fulfilled|rejected`)

### Chat

* `GET /chat/:orderId/messages` → history
* `POST /chat/:orderId/messages` → send text/image (REST fallback)

### Notifications

* `GET /notifications` → list my notifications
* `PATCH /notifications/:id/read` → mark as read

> All write endpoints require auth; seller/admin scopes enforced via RBAC.

---

## 🧵 Socket.IO Events

**Namespace:** `/realtime`

Rooms use: `order:<orderId>` and `user:<userId>`

**Client → Server**

* `join:order` `{ orderId }`
* `message:send` `{ orderId, type: 'text'|'image', content }`
* `typing:start` `{ orderId }`
* `typing:stop` `{ orderId }`

**Server → Client**

* `message:new` `{ message }`
* `order:status` `{ orderId, status }`
* `notification:new` `{ notification }`
* `cron:report` `{ type, payload }` (optional notifications from scheduled jobs)

---

## 🔒 Security Measures

* **Helmet** headers, **CORS allowlist** (env‑driven), **Rate limit** sensitive routes.
* **Sanitization:** Mongo injection & XSS guards, safe regex, file‑type checks.
* **Auth:** Access token (short‑lived), Refresh token (httpOnly), rotation & blacklist.
* **RBAC:** Roles: `buyer`, `seller`, `admin`. Route‑level enforcement.
* **Validation:** Zod schemas per route; centralized `validate()` middleware.

---

## ⚙️ Environment Variables

Create `.env` (copy from `.env.example`).

```env
# App
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:4200

# Mongo
MONGO_URI=mongodb://127.0.0.1:27017/dukanify

# JWT
JWT_ACCESS_SECRET=supersecretaccess
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=supersecretrefresh
JWT_REFRESH_TTL=7d

# OTP / Email
EMAIL_FROM="Dukanify <noreply@dukanify.local>"
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
OTP_TTL_MIN=10

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp

# CORS
CORS_ORIGINS=http://localhost:4200
```

---

## 📦 Installation & Setup

1️⃣ **Clone Repository**

```bash
git clone https://github.com/your-org/DukanifyBackend.git
cd DukanifyBackend
```

2️⃣ **Install Dependencies**

```bash
npm install
```

3️⃣ **Configure Environment**

* Copy `.env.example` → `.env` and fill values.

4️⃣ **Run Dev Server**

```bash
npm run dev
```

App: `http://localhost:5000` (REST) — Socket namespace: `/realtime`.

5️⃣ **Build & Start (Prod)**

```bash
npm run build
npm start
```

6️⃣ **Seed (Optional)**

```bash
npm run seed   # creates initial admin and sample data
```

---

## 🧪 NPM Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --pretty src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "test": "jest",
    "seed": "ts-node scripts/seed.ts",
    "cron:run": "ts-node src/cron/index.ts"
  }
}
```

---

## 🗄️ Data Models (Simplified)

### User

```ts
{
  _id, name, email, role: 'buyer'|'seller'|'admin',
  avatarUrl?, googleId?, isSellerApproved?: boolean,
  refreshTokenHash?, createdAt, updatedAt
}
```

### Store

```ts
{ _id, owner: userId, name, description, logo, banner,
  location: { lat, lng, address }, isVerified: boolean,
  ratingsAvg?, createdAt }
```

### Product

```ts
{ _id, storeId, name, sku, brand, unit, price, stock,
  description, isActive, isFeatured, images: [url], createdAt }
```

### Order

```ts
{ _id, buyerId, items: [{ productId, storeId, qty, price }],
  status: 'pending'|'in_progress'|'ready'|'fulfilled'|'rejected',
  totals: { items, amount }, createdAt }
```

### Message

```ts
{ _id, orderId, senderId, type: 'text'|'image', content, createdAt }
```

### Notification

```ts
{ _id, userId, type, title, body, data?, read: boolean, createdAt }
```

---

## 🧭 Admin Backend (Separate Repo)

The **Admin Backend** is maintained separately for better security and modularity.

* Handles seller approvals, store verification, user management, and reporting.
* Exposes APIs for admin dashboard consumption.
* Shares auth/roles with this backend.

Repo: `https://github.com/your-org/DukanifyAdminBackend`

---

## ✅ Health & Readiness

* `GET /health` → `{ status: 'ok', uptime, version }`

---

## 📝 Notes

* Designed to pair with **Dukanify Frontend (Angular 16)**.
* Uses real‑time sockets for orders & chat; REST remains source of truth.
* Replace local uploads with S3/GCS for production.
* Cron jobs and admin tasks are modular and configurable.

---

## ✍️ Author

Developed by **Rehman Tayyab Khan , Arman ali , Asad Noor , Ali abdul Gafar , Taimoor **

> Need a tailored version for your deployment (Docker, CI/CD, S3, Redis queue)? Open an issue or adapt the templates in `src/config/`.
