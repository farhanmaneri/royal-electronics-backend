import express from "express";
import {
  createPurchase,
  getPurchases,
} from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", createPurchase); // POST /api/purchases
router.get("/", getPurchases); // GET  /api/purchases

export default router;
