const { body, query, param } = require("express-validator");

exports.createEmployeeValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("employeeId").notEmpty().withMessage("Employee ID is required"),
  body("department").notEmpty().withMessage("Department is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("hireDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid hire date is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("contactNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Valid contact number is required"),
];

exports.updateEmployeeValidation = [
  param("id").isMongoId().withMessage("Valid employee ID is required"),
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("department")
    .optional()
    .notEmpty()
    .withMessage("Department cannot be empty"),
  body("position")
    .optional()
    .notEmpty()
    .withMessage("Position cannot be empty"),
  body("hireDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid hire date is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("contactNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Valid contact number is required"),
];

exports.searchEmployeeValidation = [
  query("department")
    .optional()
    .isString()
    .withMessage("Department must be a string"),
  query("position")
    .optional()
    .isString()
    .withMessage("Position must be a string"),
  query("name").optional().isString().withMessage("Name must be a string"),
];
