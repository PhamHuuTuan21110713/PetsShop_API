// const mongoose = require("mongoose");
import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: {type: String, required: true},
    parentCategoryId: {type: String, required: false, default: "none"},
    tag: {type: String, required: true},
    state: { type: Number, required: false, enum: [0, 1], default: 1 }
  },
  { timestamps: true }
);


const Category = mongoose.model("Category", categorySchema); 

// module.exports = User;
export default Category;
