
import mongoose from "mongoose";
const BookingSchema = new mongoose.Schema(
  {

    userId: { type: mongoose.Schema.Types.ObjectId },
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    status: {type: String, enum: ["dang-xac-nhan", "da-xac-nhan", "hoan-thanh", "da-huy"], default:"dang-xac-nhan"},
    totalPrice: {type: Number, required: true},
    petWeight: {type:Number, required: true},
    detailPet: {type: String, required: false, default: ""},
    note: {type: String, required: false, default: ""},
    address: {type: String, required: true},
    state: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);


const Booking = mongoose.model("Booking", BookingSchema); 

// module.exports = User;
export default Booking;
