import express from "express";
import { createSale, getSales } from "../controllers/saleController.js";

const router = express.Router();

router.post("/", createSale); // POST /api/sales
router.get("/", getSales); // GET  /api/sales

export default router;
