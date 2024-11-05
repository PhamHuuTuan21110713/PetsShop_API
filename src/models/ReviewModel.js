import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  type: { type: String, required: true, enum: ['product', 'service'] }, 
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Thêm trường userId
  user: { type: String, required: true }, // Thêm trường username nếu cần
  rating: { type: Number, required: true, min: 1, max: 5 }, 
  comment: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
},
{ timestamps: true }
);

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
