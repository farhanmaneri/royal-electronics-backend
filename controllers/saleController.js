import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// ✅ CREATE SALE
export const createSale = async (req, res) => {
  try {
    const { customer, items, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // ✅ Calculate subtotal from backend (SAFE)
    let subtotal = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      // ✅ Add to subtotal
      subtotal += item.quantity * item.price;

      // ✅ Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Final amount after discount
    const finalAmount = subtotal - discount;

    // ✅ Invoice Number
    const lastSale = await Sale.findOne().sort({ createdAt: -1 });
    let invoiceNumber = "INV-001";

    if (lastSale && lastSale.invoiceNumber) {
      const lastNumber = parseInt(lastSale.invoiceNumber.split("-")[1]);
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // ✅ Save Sale
    const sale = await Sale.create({
      customer: customer || "Walk-in Customer",
      items,
      totalAmount: subtotal,
      discount,
      finalAmount,
      invoiceNumber,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error("SALE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SALES
export const getSales = async (req, res) => {
  try {
    const { invoice, startDate, endDate } = req.query;

    let filter = {};

    // 🔍 Invoice search
    if (invoice) {
      filter.invoiceNumber = { $regex: invoice, $options: "i" };
    }

    // 📅 Date filter
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(filter)
      .populate("items.product", "name price unitType")
      .sort({ createdAt: -1 });

    res.status(200).json(sales);
  } catch (error) {
    console.error("GET SALES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
  
};
// ✅ UPDATE SALE
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, items, discount = 0 } = req.body;

    const existingSale = await Sale.findById(id);
    if (!existingSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // ✅ Restore old stock first
    for (let oldItem of existingSale.items) {
      const product = await Product.findById(oldItem.product);
      if (product) {
        product.stock += oldItem.quantity; // give back old stock
        await product.save();
      }
    }

    // ✅ Deduct new stock
    let subtotal = 0;
    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      subtotal += item.quantity * item.price;
      product.stock -= item.quantity;
      await product.save();
    }

    const finalAmount = subtotal - discount;

    // ✅ Update sale — keep same invoice number
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      {
        customer: customer || "Walk-in Customer",
        items,
        totalAmount: subtotal,
        discount,
        finalAmount,
      },
      { new: true } // return updated document
    );

    res.status(200).json(updatedSale);
  } catch (error) {
    console.error("UPDATE SALE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};