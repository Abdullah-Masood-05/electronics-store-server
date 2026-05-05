# Electronics Store API

Backend API for my electronics store app.

I built this to handle auth, catalog data (categories/subcategories/products), and a couple of admin endpoints without mixing that logic into the frontend.

It uses Firebase tokens for auth and stores app data in MongoDB.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Firebase Admin SDK (token verification)
- Stripe (payment processing)
- Rate limiting & security (helmet, express-rate-limit)
- dotenv, cookie-parser, uuid, cors

## What it does

- Verifies Firebase ID tokens on all protected routes
- Auto-creates user records in MongoDB on first login
- Full CRUD for categories, subcategories, and products
- Shopping cart management
- Wishlist management (add, remove, retrieve)
- Order processing with Stripe payment integration
- Order retrieval with role-based authorization (users view their own, admins view all)
- Coupon and discount code validation
- Role-based access control (user/admin)
- Admin dashboard with stats (total orders, pending/processing counts, total revenue)
- Rate limiting on API endpoints for DDoS protection
- Simple health check: `/api/health`

## Security

- **Firebase Authentication** — All protected endpoints verify ID tokens and check for revoked credentials
- **Rate Limiting** — API endpoints are rate-limited to prevent abuse
- **Security Headers** — Helmet enforces security best practices (HSTS, XSS protection, etc.)
- **CORS** — Restricted to your frontend URL via environment variable
- **Environment Variables** — All sensitive data (Firebase keys, MongoDB URI, Stripe keys) is kept out of code

## Run locally

### 1) Install

```bash
bun install
```

### 2) Add env vars

Create `.env` in the root:

```env
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 3) Start

```bash
bun run dev
```

The dev script uses Bun with hot reload for fast development.

If everything is wired correctly, health check should work at `http://localhost:8000/api/health`.

## Notes

- This repo is API-only (no frontend here).
- Product image upload/storage is not handled in this server yet (currently expects image URL).
- Make sure the Firebase service account values are copied exactly, especially multiline private key formatting.

## License

MIT, see [LICENSE](LICENSE).
