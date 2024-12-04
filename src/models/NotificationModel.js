// const mongoose = require("mongoose");
import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  targetId: String,
  type: {
    type: String,
    enum: ["message", "booking"]
  },
  text: String,
  isReading: {
    type: Boolean,
    default: false
  },
  state: {
    type: Boolean,
    default: true
  }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
