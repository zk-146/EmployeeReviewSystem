// middleware/goalValidation.js
const { body } = require("express-validator");

exports.goalValidation = [
  body("employeeId").isMongoId().withMessage("Valid employee ID is required"),
  body("reviewCycleId")
    .isMongoId()
    .withMessage("Valid review cycle ID is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("description").optional(),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid due date is required"),
];

exports.goalProgressValidation = [
  body("progress")
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100"),
];
