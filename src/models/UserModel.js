// const mongoose = require("mongoose");
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: {type: String, required: false, unique: true},
    avatar: {
      preview: {
        type: String,
        required: false,
        default: ""
      },
      imageId: {
        type: String,
        required: false,
        default: ""
      }
    },
    // username: {type: String, required: true},
    password: { type: String, required: false },
    role: { type: String, required: false, default: "user", enum: ["user", "admin"] },
    gender: { type: String, required: false, enum: ["male", "female", "other"] },
    address: { type: String, required: false },
    shippingAddress: [
      {
        recipientName: {type: String, required: false},
        recipientPhone: {type: String, required: false},
        address: { type: String, required: false },
        isDefault: { type: Boolean, required: false },
        note: { type: String, required: false, default: '' }
      }
    ],
    phone: { type: String, required: false, unique: true, maxlength: 10, minlength: 10 },
    cart: [
      {
        productId: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: false,
        },
        img: {
          type: String,
          required: false,
        },
        size: {
          type: String,
          required: false,
        },
        quantity: {
          type: Number,
          required: false,
        },
        price: {
          type: Number,
          required: false,
        },
      },
    ],
    state: { type: Number, required: false, enum: [0, 1], default: 1 }
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

// module.exports = User;
export default User;
