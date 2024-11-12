import mongoose from 'mongoose';
const PromotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ["percent", "price"] },
    value: { type: Number, required: true },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId }
    ],
    state: { type: Boolean, required: false, default: true }
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Promotion', PromotionSchema);

export default Promotion;