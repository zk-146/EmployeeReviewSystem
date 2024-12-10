// middleware/reviewTemplateValidation.js
const { body } = require("express-validator");

exports.reviewTemplateValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").optional(),
  body("questions").isArray().withMessage("Questions must be an array"),
  body("questions.*.text").notEmpty().withMessage("Question text is required"),
  body("questions.*.type")
    .isIn(["Rating", "Text"])
    .withMessage("Invalid question type"),
  body("questions.*.weight")
    .isInt({ min: 0, max: 100 })
    .withMessage("Weight must be between 0 and 100"),
];
