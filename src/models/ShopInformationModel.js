
import mongoose from "mongoose";
const ShopInformationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brandName: {type: String},
    logoUrl: {type: String},
    branches: [
        {
            nameBranch: {type: String},
            address: {type: String}
        }
    ],
    state: { type: Boolean, required: false, default: true }
  },
  { timestamps: true }
);


const ShopInformation = mongoose.model("ShopInformation", ShopInformationSchema); 

// module.exports = User;
export default ShopInformation;
