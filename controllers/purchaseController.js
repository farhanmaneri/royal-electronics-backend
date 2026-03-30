import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";

// ✅ CREATE PURCHASE
export const createPurchase = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    for (let item of items) {
      if (item.product === "new") {
        if (!item.name || !item.unitType) {
          return res
            .status(400)
            .json({ message: "New product missing name or unitType" });
        }

        const newProduct = await Product.create({
          name: item.name,
          unitType: item.unitType,
          price: item.costPrice || 0,
          stock: item.quantity,
        });

        item.product = newProduct._id;
      } else {
        const product = await Product.findById(item.product);
        if (!product)
          return res.status(404).json({ message: "Product not found" });

        product.stock += item.quantity;
        if (item.costPrice) product.price = item.costPrice;
        await product.save();
      }
    }

    const purchase = await Purchase.create({ items, totalAmount });
    res.status(201).json(purchase);
  } catch (error) {
    console.error("PURCHASE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET PURCHASES (with search by date range or supplier)
export const getPurchases = async (req, res) => {
  try {
    const { supplier, startDate, endDate } = req.query;

    let filter = {};

    // 🔍 Search by supplier name
    if (supplier) {
      filter.supplier = { $regex: supplier, $options: "i" };
    }

    // 📅 Search by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full end day
        filter.createdAt.$lte = end;
      }
    }

    const purchases = await Purchase.find(filter)
      .populate("items.product", "name price unitType") // get product details
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
