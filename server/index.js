
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from 'dns';
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import goalRoutes from "./routes/goalsRoute.js";
import scheduleRoutes from "./routes/scheduleRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
dotenv.config();
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZidioTask API is running",
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
