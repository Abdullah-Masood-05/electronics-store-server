# Electronics Store API

Backend API for my electronics store app.

I built this to handle auth, catalog data (categories/subcategories/products), and a couple of admin endpoints without mixing that logic into the frontend.

It uses Firebase tokens for auth and stores app data in MongoDB.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Firebase Admin SDK (token verification)
- dotenv, helmet, cors

## What it does

- verifies Firebase ID tokens on protected routes
- creates/updates user records in MongoDB
- CRUD for categories, subcategories, and products
- role checks for admin-only actions
- simple health route: `/api/health`

## Run locally

### 1) Install

```bash
npm install
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
```

### 3) Start

```bash
npm run dev
```

or:

```bash
node server.js
```

If everything is wired correctly, health check should work at `http://localhost:8000/api/health`.

## Notes

- This repo is API-only (no frontend here).
- Product image upload/storage is not handled in this server yet (currently expects image URL).
- Make sure the Firebase service account values are copied exactly, especially multiline private key formatting.

## License

MIT, see [LICENSE](LICENSE).
