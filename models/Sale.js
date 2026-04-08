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
        name: String,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        unitType: String,
        price: Number,
      },
    ],

    // ✅ Subtotal (before discount)
    totalAmount: {
      type: Number,
      required: true,
    },

    // ✅ NEW: Discount
    discount: {
      type: Number,
      default: 0,
    },

    // ✅ NEW: Final Total
    finalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;