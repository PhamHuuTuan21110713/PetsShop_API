// const mongoose = require("mongoose");
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
    password: { type: String, required: true },
    role: { type: String, required: false, default: "user", enum: ["user", "admin"] },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    address: { type: String, required: true },
    shippingAddress: [
      {
        recipientName: {type: String, required: true},
        recipientPhone: {type: String, required: true},
        address: { type: String, required: true },
        isDefault: { type: Boolean, required: true },
        note: { type: String, required: false, default: '' }
      }
    ],
    phone: { type: String, required: true, unique: true, maxlength: 10, minlength: 10 },
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
