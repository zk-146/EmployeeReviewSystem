// middleware/reviewValidation.js
const { body } = require("express-validator");

exports.reviewValidation = [
  body("employeeId").isMongoId().withMessage("Valid employee ID is required"),
  body("reviewerId").isMongoId().withMessage("Valid reviewer ID is required"),
  body("reviewCycleId")
    .isMongoId()
    .withMessage("Valid review cycle ID is required"),
  body("reviewTemplateId")
    .isMongoId()
    .withMessage("Valid review template ID is required"),
  body("type")
    .isIn(["Self", "Manager", "Peer"])
    .withMessage("Invalid review type"),
];

exports.reviewResponseValidation = [
  body("responses").isArray().withMessage("Responses must be an array"),
  body("responses.*.question")
    .isMongoId()
    .withMessage("Valid question ID is required"),
  body("responses.*.answer").notEmpty().withMessage("Answer is required"),
  body("responses.*.score")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Score must be between 0 and 5"),
];

exports.goalEvaluationValidation = [
  body("goalEvaluations")
    .isArray()
    .withMessage("Goal evaluations must be an array"),
  body("goalEvaluations.*.goal")
    .isMongoId()
    .withMessage("Valid goal ID is required"),
  body("goalEvaluations.*.achievementLevel")
    .isInt({ min: 0, max: 100 })
    .withMessage("Achievement level must be between 0 and 100"),
  body("goalEvaluations.*.comments")
    .optional()
    .isString()
    .withMessage("Comments must be a string"),
];
