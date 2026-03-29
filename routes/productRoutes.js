import express from "express";
import { createProduct, deleteProduct, updateProduct } from "../controllers/productController.js";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ CREATE PRODUCT
router.post("/", createProduct);

// ✅ GET ALL PRODUCTS (IMPORTANT)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }


router.put("/:id", updateProduct); // ✅ stock & price
router.delete("/:id", deleteProduct);

});

export default router;
