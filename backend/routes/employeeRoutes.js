const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const employeeController = require("../controllers/employeeController");
const {
  createEmployeeValidation,
  updateEmployeeValidation,
  searchEmployeeValidation,
} = require("../middlewares/employeeValidation");

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createEmployeeValidation,
  employeeController.createEmployee
);
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  employeeController.getAllEmployees
);
router.get(
  "/search",
  protect,
  authorize("admin", "manager"),
  searchEmployeeValidation,
  employeeController.searchEmployees
);
router.get("/:id", protect, employeeController.getEmployeeById);
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  updateEmployeeValidation,
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  employeeController.deleteEmployee
);
router.get("/me", protect, employeeController.getCurrentEmployeeProfile);
router.get(
  "/statistics",
  protect,
  authorize("admin", "manager"),
  employeeController.getEmployeeStatistics
);

module.exports = router;
