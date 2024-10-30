// const mongoose = require("mongoose");
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: {
      path: {
        type: String,
        required: true,
        default: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg"
      },
      name: {type: String, require: false}
    },
    username: {type: String, required: true},
    password: { type: String, required: true },
    role: { type: Boolean, required: false, default: "user", enum: ["user", "admin"] },
    address: { type: String, required: true },
    shippingAddress: [
      {
        address: {type: String, required: false, default: function() {return this.address}},
        isDefault: {type: Boolean, required:true},
        note: {type: String, required:false}
      }
    ],
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
    state: {type:Number, required: false ,enum: [0 , 1], default:1}
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// module.exports = User;
export default User;
