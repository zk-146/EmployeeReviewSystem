// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["review", "goal", "system"],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "itemModel",
  },
  itemModel: {
    type: String,
    enum: ["Review", "Goal", "ReviewCycle"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
