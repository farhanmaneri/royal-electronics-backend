import express from "express";
import { createSale } from "../controllers/saleController.js";

const router = express.Router();

router.post("/", createSale);
// routes/saleRoutes.js
router.get("/report", async (req, res) => {
  const { start, end } = req.query;
  try {
    const sales = await Sale.find({
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
