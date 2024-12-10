const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Rating", "Text"],
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const ReviewTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    questions: [QuestionSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

ReviewTemplateSchema.statics.paginate = async function (query, page, limit) {
  const skip = (page - 1) * limit;
  const totalDocs = await this.countDocuments(query);
  const docs = await this.find(query).skip(skip).limit(limit);

  return {
    docs,
    totalDocs,
    page,
    totalPages: Math.ceil(totalDocs / limit),
  };
};

module.exports = mongoose.model("ReviewTemplate", ReviewTemplateSchema);
