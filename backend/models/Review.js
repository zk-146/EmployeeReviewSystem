// models/Review.js
const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReviewTemplate.questions",
    required: true,
  },
  answer: mongoose.Schema.Types.Mixed,
  score: Number,
});

const GoalEvaluationSchema = new mongoose.Schema({
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true,
  },
  achievementLevel: {
    type: Number,
    min: 0,
    max: 100,
  },
  comments: String,
});

const ReviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewCycle",
      required: true,
    },
    reviewTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewTemplate",
      required: true,
    },
    type: {
      type: String,
      enum: ["Self", "Manager", "Peer"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "ManagerApproved",
        "FinalApproved",
        "Rejected",
      ],
      default: "Draft",
    },
    responses: [ResponseSchema],
    goals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
      },
    ],
    goalEvaluations: [GoalEvaluationSchema],
    overallScore: Number,
    comments: String,
    submittedAt: Date,
    managerApprovedAt: Date,
    requiresFinalApproval: {
      type: Boolean,
      default: true,
    },
    finalApprovedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
