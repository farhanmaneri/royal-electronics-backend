import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// ✅ CREATE SALE
export const createSale = async (req, res) => {
  try {
    const { customer, items, totalAmount } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🔥 Update stock
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

      product.stock -= item.quantity;
      await product.save();
    }

    const lastSale = await Sale.findOne().sort({ createdAt: -1 });
    let invoiceNumber = "INV-001";

    if (lastSale && lastSale.invoiceNumber) {
      const lastNumber = parseInt(lastSale.invoiceNumber.split("-")[1]);
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(3, "0")}`;
    }

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

// ✅ GET SALES (with search by date or invoice number)
export const getSales = async (req, res) => {
  try {
    const { invoice, startDate, endDate } = req.query;

    // Build filter object
    let filter = {};

    // 🔍 Search by invoice number
    if (invoice) {
      filter.invoiceNumber = { $regex: invoice, $options: "i" };
    }

    // 📅 Search by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate); // from this date
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full end day
        filter.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(filter)
      .populate("items.product", "name price unitType") // get product details
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
