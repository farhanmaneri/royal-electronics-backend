import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      default: "Local Supplier",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        quantity: Number,
        costPrice: Number,
        unitType: String, // ✅ ADD THIS
      },
    ],
    totalAmount: Number,
    invoiceNumber: String,
  },
  { timestamps: true },
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
