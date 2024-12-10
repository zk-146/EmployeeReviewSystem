// models/Goal.js
const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewCycle",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    dueDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", GoalSchema);
