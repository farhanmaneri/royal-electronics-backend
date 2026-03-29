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

// Routes
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);

// DB Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Mongo Error ❌", error.message);
  }
};

connectDB();

/*
========================================
✅ CONDITION FOR LOCAL vs VERCEL
========================================
*/

// 👉 If NOT running on Vercel → start server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// 👉 Always export for Vercel
export default app;
