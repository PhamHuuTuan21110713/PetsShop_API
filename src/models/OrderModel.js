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
  
  products: [
    {
      productId: {
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
      }
    },
  ],
  status: {
    type: String, required: true, enum: ["dxl", "dg", "tc", "hbs", "hbb"], 
    default: "dxl"
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  totalPrice: {
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
    default: "cod",
  },
  state: { type: Boolean, required: false, default: true }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
