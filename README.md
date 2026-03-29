# Electronics Store — REST API Server

A production-ready RESTful API backend for an electronics e-commerce platform. Built with **Node.js**, **Express 5**, **MongoDB**, and **Firebase Authentication**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Authentication](#authentication--apiauth)
  - [Categories](#categories--apicategories)
  - [SubCategories](#subcategories--apisubcategories)
  - [Products](#products--apiproducts)
  - [Admin](#admin--apiadmin)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [License](#license)

---

## Overview

This server acts as the backend layer for an electronics store application. It handles user identity via Firebase Authentication tokens, persists user data in MongoDB, and exposes a clean REST API for the frontend client. The architecture is modular and scalable — designed to grow as new features (products, orders, payments, etc.) are added.

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Runtime        | Node.js (ES Modules)                |
| Framework      | Express 5                           |
| Database       | MongoDB via Mongoose 9              |
| Authentication | Firebase Admin SDK 13               |
| Security       | Helmet, CORS                        |
| Config         | dotenv                              |
| Dev Tooling    | Nodemon                             |

---

## Project Structure

```
electronics-store-server/
├── config/
│   ├── db.js                      # MongoDB connection
│   └── firebase.js                # Firebase Admin SDK initialization
├── controllers/
│   ├── auth.controller.js         # Auth handlers (user login, profile)
│   ├── category.controller.js     # Category CRUD handlers
│   ├── subcategory.controller.js  # SubCategory CRUD handlers
│   ├── product.controller.js      # Product CRUD handlers
│   └── admin.controller.js        # Admin handlers (stats, analytics)
├── middlewares/
│   ├── auth.middleware.js         # Firebase token verification + user lookup
│   ├── authorize.middleware.js    # Role-based access control
│   └── error.middleware.js        # Centralized error handler
├── models/
│   ├── User.js                    # Mongoose User schema
│   ├── Category.js                # Mongoose Category schema
│   ├── SubCategory.js             # Mongoose SubCategory schema
│   └── Product.js                 # Mongoose Product schema
├── routes/
│   ├── auth.routes.js             # Auth route definitions
│   ├── category.routes.js         # Category route definitions
│   ├── subcategory.routes.js      # SubCategory route definitions
│   ├── product.routes.js          # Product route definitions
│   └── admin.routes.js            # Admin route definitions
├── utils/
│   ├── AppError.js                # Custom operational error class
│   └── slugify.js                 # Utility for slug generation
├── app.js                         # Express app setup
└── server.js                      # Entry point
```

---

## Features

- **Firebase Authentication** — Verifies Firebase ID tokens on every protected request, including token revocation checks.
- **Auto User Provisioning** — Automatically creates a MongoDB user document on first login; no separate registration step needed.
- **Role-Based Access Control** — Flexible `authorizeRoles(...roles)` middleware supports `user` and `admin` roles.
- **User Profile Management** — Stores name, email, role, cart, wishlist, and address per user.
- **Category Management** — Full CRUD operations for product categories with slug-based URLs.
- **SubCategory Management** — Nested subcategories under parent categories with slug-based URLs.
- **Product Management** — Complete product catalog with CRUD operations, filtering, and product count endpoints.
- **Admin Dashboard Data** — Stats endpoint for monitoring store analytics (admin-only).
- **Security Headers** — [Helmet](https://helmetjs.github.io/) applied globally.
- **CORS** — Configurable allowed origins via environment variable.
- **Centralized Error Handling** — Catches Mongoose `CastError`, duplicate key errors, validation errors, and Firebase auth errors — all formatted consistently.
- **Environment Validation** — Server refuses to start if any required environment variable is missing.
- **Health Check Endpoint** — `GET /api/health` for uptime monitoring and deployment probes.
- **Slug-Based URLs** — All resources use URL-friendly slugs for cleaner API design.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Firebase project](https://console.firebase.google.com/) with Authentication enabled

### Installation

```bash
git clone https://github.com/your-username/electronics-store-server.git
cd electronics-store-server
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=8000
NODE_ENV=development

# Client (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

> **Tip:** `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are found in your Firebase project settings under **Service Accounts → Generate new private key**.

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
node server.js
```

The server will start and output:

```
MongoDB Connected: <host>
🚀 Server running on port 8000
📡 Health check: http://localhost:8000/api/health
```

---

## API Reference

All routes are prefixed with `/api`.

### Health

| Method | Endpoint       | Auth | Description        |
|--------|----------------|------|--------------------|
| GET    | `/api/health`  | No   | Server health check|

**Response:**
```json
{ "status": "OK", "message": "API running" }
```

---

### Authentication — `/api/auth`

All auth routes require a valid Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

| Method | Endpoint                    | Auth | Description                                      |
|--------|-----------------------------|------|--------------------------------------------------|
| GET    | `/api/auth/me`              | Yes  | Get the current authenticated user's profile     |
| POST   | `/api/auth/create-or-update`| Yes  | Create or update user profile (call after signup)|

**`GET /api/auth/me`**

Returns the authenticated user's profile from MongoDB.

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "cart": [],
    "wishlist": [],
    "address": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**`POST /api/auth/create-or-update`**

Creates a new user record or updates an existing one. Typically called by the client after a successful Firebase sign-up to sync the display name.

**Request Body (optional):**
```json
{ "name": "Jane Doe" }
```

**Response `200`:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### Categories — `/api/categories`

| Method | Endpoint              | Auth | Role     | Description                         |
|--------|------------------------|------|----------|-------------------------------------|
| GET    | `/api/categories/`    | No   | —        | List all categories                 |
| GET    | `/api/categories/:slug`| No   | —        | Get a specific category by slug     |
| POST   | `/api/categories/`    | Yes  | admin    | Create a new category               |
| PUT    | `/api/categories/:slug`| Yes  | admin    | Update a category                   |
| DELETE | `/api/categories/:slug`| Yes  | admin    | Delete a category                   |

**`GET /api/categories/`**

Retrieve all categories.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**`POST /api/categories/` (Admin)**

Create a new category. Requires admin role.

**Request Body:**
```json
{
  "name": "Smartphones",
  "description": "Mobile phone devices"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Smartphones",
    "slug": "smartphones",
    "description": "Mobile phone devices",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### SubCategories — `/api/subcategories`

| Method | Endpoint                  | Auth | Role     | Description                           |
|--------|---------------------------|------|----------|---------------------------------------|
| GET    | `/api/subcategories/`    | No   | —        | List all subcategories                |
| GET    | `/api/subcategories/:slug`| No   | —        | Get a specific subcategory by slug    |
| POST   | `/api/subcategories/`    | Yes  | admin    | Create a new subcategory              |
| PUT    | `/api/subcategories/:slug`| Yes  | admin    | Update a subcategory                  |
| DELETE | `/api/subcategories/:slug`| Yes  | admin    | Delete a subcategory                  |

**`GET /api/subcategories/`**

Retrieve all subcategories.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Android Phones",
      "slug": "android-phones",
      "category": "64f1a2b3c4d5e6f7a8b9c0d1",
      "description": "Android-based smartphones",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**`POST /api/subcategories/` (Admin)**

Create a new subcategory. Requires admin role.

**Request Body:**
```json
{
  "name": "Android Phones",
  "category": "64f1a2b3c4d5e6f7a8b9c0d1",
  "description": "Android-based smartphones"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Products — `/api/products`

| Method | Endpoint              | Auth | Role     | Description                         |
|--------|------------------------|------|----------|-------------------------------------|
| GET    | `/api/products/count` | No   | —        | Get total product count             |
| GET    | `/api/products/`      | No   | —        | List all products                   |
| GET    | `/api/products/:slug` | No   | —        | Get a specific product by slug      |
| POST   | `/api/products/`      | Yes  | admin    | Create a new product                |
| PUT    | `/api/products/:slug` | Yes  | admin    | Update a product                    |
| DELETE | `/api/products/:slug` | Yes  | admin    | Delete a product                    |

**`GET /api/products/count`**

Get the total number of products available.

**Response `200`:**
```json
{
  "success": true,
  "count": 245
}
```

**`GET /api/products/`**

Retrieve all products with optional filtering.

**Response `200`:**
```json
{
  "success": true,
  "total": 245,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest iPhone model",
      "price": 999,
      "category": "64f1a2b3c4d5e6f7a8b9c0d1",
      "subcategory": "64f1a2b3c4d5e6f7a8b9c0d2",
      "stock": 50,
      "rating": 4.5,
      "image": "https://...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**`POST /api/products/` (Admin)**

Create a new product. Requires admin role.

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "description": "Premium Android smartphone",
  "price": 899,
  "category": "64f1a2b3c4d5e6f7a8b9c0d1",
  "subcategory": "64f1a2b3c4d5e6f7a8b9c0d2",
  "stock": 100,
  "image": "https://..."
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Admin — `/api/admin`

| Method | Endpoint         | Auth | Role     | Description              |
|--------|------------------|------|----------|--------------------------|
| GET    | `/api/admin/stats` | Yes  | admin    | Get store analytics data |

**`GET /api/admin/stats` (Admin)**

Retrieve store statistics and analytics data. Requires admin role.

**Response `200`:**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 245,
    "totalCategories": 8,
    "totalUsers": 1250,
    "totalRevenue": 125000,
    "recentOrders": [ ... ]
  }
}
```

## Authentication Flow

```
Client                         Server                        Firebase
  |                               |                              |
  |-- Firebase sign-in ---------> |                              |
  |<--------- ID Token -----------|<--- verifyIdToken -----------|
  |                               |                              |
  |-- API Request                 |                              |
  |   Authorization: Bearer <token>                              |
  |-----------------------------→ |                              |
  |                               |-- verifyIdToken(token) ----> |
  |                               |<--------- decoded UID -------|
  |                               |                              |
  |                               |-- Find or Create User (MongoDB)
  |                               |-- Attach user to req.user    |
  |                               |-- Execute route handler      |
  |<---------- Response ----------|                              |
```

1. The client authenticates with Firebase (email/password, Google, etc.) and receives an **ID token**.
2. Every API request attaches the ID token as a `Bearer` token in the `Authorization` header.
3. The `authCheck` middleware verifies the token via Firebase Admin SDK (including revocation check).
4. The corresponding MongoDB user is fetched — or auto-created on first login.
5. The user object is attached to `req.user` for all downstream handlers.

---

## Error Handling

All errors follow a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "stack": "..." // Only in development (NODE_ENV !== 'production')
}
```

| Scenario                    | Status |
|-----------------------------|--------|
| Missing / invalid token     | 401    |
| Expired token               | 401    |
| Revoked token               | 401    |
| Insufficient role           | 403    |
| Resource not found          | 404    |
| Mongoose validation error   | 400    |
| Duplicate key (email, etc.) | 400    |
| Unhandled server error      | 500    |

---

## License

Distributed under the [MIT License](LICENSE).
