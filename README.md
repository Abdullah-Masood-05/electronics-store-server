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
│   ├── db.js                  # MongoDB connection
│   └── firebase.js            # Firebase Admin SDK initialization
├── controllers/
│   └── auth.controller.js     # Auth route handlers
├── middlewares/
│   ├── auth.middleware.js     # Firebase token verification + user lookup
│   ├── authorize.middleware.js# Role-based access control
│   └── error.middleware.js    # Centralized error handler
├── models/
│   └── User.js                # Mongoose User schema
├── routes/
│   └── auth.routes.js         # Auth route definitions
├── utils/
│   └── AppError.js            # Custom operational error class
├── app.js                     # Express app setup
└── server.js                  # Entry point
```

---

## Features

- **Firebase Authentication** — Verifies Firebase ID tokens on every protected request, including token revocation checks.
- **Auto User Provisioning** — Automatically creates a MongoDB user document on first login; no separate registration step needed.
- **Role-Based Access Control** — Flexible `authorizeRoles(...roles)` middleware supports `user` and `admin` roles.
- **User Profile** — Stores name, email, role, cart, wishlist, and address per user.
- **Security Headers** — [Helmet](https://helmetjs.github.io/) applied globally.
- **CORS** — Configurable allowed origins via environment variable.
- **Centralized Error Handling** — Catches Mongoose `CastError`, duplicate key errors, validation errors, and Firebase auth errors — all formatted consistently.
- **Environment Validation** — Server refuses to start if any required environment variable is missing.
- **Health Check Endpoint** — `GET /api/health` for uptime monitoring and deployment probes.

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

---

#### `GET /api/auth/me`

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

---

#### `POST /api/auth/create-or-update`

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
