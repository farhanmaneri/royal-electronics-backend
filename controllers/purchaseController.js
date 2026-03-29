import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";

export const createPurchase = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // Loop items to update stock / create new product
    for (let item of items) {
      if (item.product === "new") {
        // New product: create first
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

        item.product = newProduct._id; // update product ID
      } else {
        // Existing product: update stock
        const product = await Product.findById(item.product);
        if (!product)
          return res.status(404).json({ message: "Product not found" });

        product.stock += item.quantity; // increment stock
        if (item.costPrice) product.price = item.costPrice; // optional: update price
        await product.save();
      }
    }

    // Save purchase record
    const purchase = await Purchase.create({ items, totalAmount });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("PURCHASE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
