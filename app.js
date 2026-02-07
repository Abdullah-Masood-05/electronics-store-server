// import express from "express";
// import cors from "cors";

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "OK", message: "API running" });
// });

// export default app;

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API running" });
});

// Routes
app.use("/api/auth", authRoutes);

export default app;
