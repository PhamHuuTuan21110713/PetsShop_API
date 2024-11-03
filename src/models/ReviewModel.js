import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  type: { type: String, required: true, enum: ['product', 'service'] }, 
  user: { type: String, required: true }, 
  rating: { type: Number, required: true, min: 1, max: 5 }, 
  comment: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
});


const Review = mongoose.model('Review', ReviewSchema);

export default Review;
