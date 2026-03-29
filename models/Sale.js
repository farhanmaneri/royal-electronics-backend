import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `INV-${Date.now()}`,
    },

    customer: {
      type: String,
      default: "Walk-in Customer",
    },

    items: [
      {
        name: String, // Product name (easy for printing)
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        unitType: {
          type: String, // "Nos" or "Meter"
        },
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
