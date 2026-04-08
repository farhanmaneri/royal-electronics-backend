import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://royal-electronics-frontend.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// ========================================
// ✅ DB CONNECTION (cached for Vercel)
// ========================================

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection ♻️");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // ✅ prevents buffering timeout error
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Mongo Error ❌", error.message);
    throw error; // ✅ let the route return 500 instead of hanging
  }
};

// ========================================
// ✅ MIDDLEWARE — connect DB before routes
// ========================================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed ❌" });
  }
});

// ========================================
// ✅ ROUTES
// ========================================
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong 🏓" });
});
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);

// ========================================
// ✅ CONDITION FOR LOCAL vs VERCEL
// ========================================

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  // ✅ Connect DB first, then start server
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.log("Failed to connect DB, server not started ❌", error.message);
    });
} else {
  // Vercel — DB connects on first request via middleware
  connectDB();
}

// ✅ Warm up DB connection immediately on Vercel cold start
if (process.env.VERCEL) {
  connectDB();
}
export default app;
