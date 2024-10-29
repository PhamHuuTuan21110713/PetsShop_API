const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: false, default: false },
    address: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
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
    avatar: {
      type: String,
      required: false,
      default: "",
    },
    avatarPath: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
