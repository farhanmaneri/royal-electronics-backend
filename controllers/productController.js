import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  console.log(req.body);
};
// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: Prevent deleting if stock exists
    if (product.stock > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete product with remaining stock" });
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update product (price, stock, name, etc.)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // { price: 200, stock: 10, ... }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true, // return updated doc
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};