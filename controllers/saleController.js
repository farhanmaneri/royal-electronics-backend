import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

export const createSale = async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🔥 Update stock
    for (let item of items) {
      const product = await Product.findById(item.product);
      console.log("ITEM:", item); // 🔥 ADD THIS

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
      console.log("FOUND PRODUCT:", product); // 🔥 ADD THIS
    }
    const lastSale = await Sale.findOne().sort({ createdAt: -1 });

    let invoiceNumber = "INV-001";

    if (lastSale && lastSale.invoiceNumber) {
      const lastNumber = parseInt(lastSale.invoiceNumber.split("-")[1]);
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(3, "0")}`;
    }
    // Save sale
    const sale = await Sale.create({
      customer,
      items,
      totalAmount,
      invoiceNumber,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
