import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        count: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      required: true,
    },
    paymentIntent: {
      type: Object,
      default: {},
    },
    orderStatus: {
      type: String,
      enum: [
        "Not Processed",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Completed",
      ],
      default: "Not Processed",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, strict: true }
);

export default mongoose.model("Order", orderSchema);
