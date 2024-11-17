// const mongoose = require("mongoose");
import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  orderDate: { type: Date, required: true },
  deliveryDate: {
    type: Date,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      img: {
        type: String,
        required: true,
      },
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: false,
  },
  note: {
    type: String,
    required: false,
  },
  paymentMethod: {
    type: String,
    required: false,
    default: "COD",
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
