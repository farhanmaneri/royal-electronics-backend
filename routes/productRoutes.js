import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productController.js";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ CREATE PRODUCT
router.post("/", createProduct);

// ✅ GET ALL PRODUCTS (IMPORTANT)
router.get("/", getProducts);


router.put("/:id", updateProduct); // ✅ stock & price
router.delete("/:id", deleteProduct);


export default router;
