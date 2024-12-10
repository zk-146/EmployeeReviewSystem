// middleware/reviewCycleValidation.js
const { body, param } = require("express-validator");

exports.createReviewCycleValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("startDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid start date is required"),
  body("endDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

exports.updateReviewCycleValidation = [
  param("id").isMongoId().withMessage("Invalid review cycle ID"),
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid start date is required"),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),
  body("status")
    .optional()
    .isIn(["Planned", "Active", "Completed"])
    .withMessage("Invalid status"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

exports.assignEmployeesValidation = [
  param("id").isMongoId().withMessage("Invalid review cycle ID"),
  body("employeeIds").isArray().withMessage("Employee IDs must be an array"),
  body("employeeIds.*").isMongoId().withMessage("Invalid employee ID"),
];
