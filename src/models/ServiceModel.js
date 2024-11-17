
import mongoose from "mongoose";
const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: [
        {
            heading: {type: String, required: true},
            content:[
                {type: String}
            ],
            image: {type: String}
        }
    ],
    price: [
        {
            maxWeight: {type: Number, required: true},
            value: {type: Number, required: true},
            billingUnit: {type: String, required: true}
        }
    ],
    procedures: [
        {
            serial: {type: Number, required: true},
            summary: {type: String, required: true},
            detail: {type: String, required: true}
        }
    ],
    applicableBranches: [
        { type: mongoose.Schema.Types.ObjectId }
    ],
   
    state: { type: Boolean, required: false, default: true }
  },
  { timestamps: true }
);


const Service = mongoose.model("Service", ServiceSchema); 

// module.exports = User;
export default Service;
