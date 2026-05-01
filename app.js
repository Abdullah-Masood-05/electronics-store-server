import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subcategoryRoutes from "./routes/subcategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import orderRoutes from "./routes/order.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { csrfGuard } from "./middlewares/csrf.middleware.js";
import AppError from "./utils/AppError.js";

const app = express();

// Trust proxy for rate limiting behind load balancers/reverse proxies
app.set("trust proxy", 1);

// --- SECURITY ARCHITECTURE DOCUMENTATION ---
/**
 * 🛡️ AUTHENTICATION & CSRF STRATEGY
 * 
 * 1. Bearer Token Foundation:
 *    The core authentication originally relied purely on Firebase `Bearer` tokens.
 *    Because browsers do not automatically attach `Authorization` headers cross-origin,
 *    traditional CSRF attacks were largely mitigated.
 * 
 * 2. The httpOnly Cookie Transition:
 *    We have recently introduced `httpOnly` cookies to track server-side sessions 
 *    (preventing token theft and enabling per-device revocation). Because browsers 
 *    *do* automatically attach cookies to cross-origin requests, this re-introduced 
 *    CSRF vulnerability surface area.
 * 
 * 3. Defense-in-Depth Strategy:
 *    To protect against CSRF without using the deprecated `csurf` package, we use a 
 *    multi-layered defense:
 *      - `SameSite=Strict` on the session cookie.
 *      - `csrfGuard` middleware (Origin/Referer header validation).
 *      - `helmet` Strict Origin and Cross-Origin Resource policies.
 * 
 * IF adding new webhooks (e.g., Stripe, GitHub) that send POST requests from outside origins:
 * You MUST add their paths to the `EXEMPT_PATHS` array in `middlewares/csrf.middleware.js`.
 */

// Security headers
app.use(helmet.crossOriginResourcePolicy({ policy: "same-site" }));
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(helmet());

// CORS configuration (MUST be before Rate Limiting)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global Rate Limiting
app.use("/api", globalLimiter);

// Body parsing & Cookies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// CSRF Protection (MUST be after body parsing and CORS)
app.use(csrfGuard);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);

// 404 handler — unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
