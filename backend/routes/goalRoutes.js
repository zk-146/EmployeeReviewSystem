// routes/goalRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const goalController = require("../controllers/goalController");
const {
  goalValidation,
  goalProgressValidation,
} = require("../middlewares/goalValidation");

router.post(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  goalValidation,
  goalController.createGoal
);
router.get("/:id", protect, goalController.getGoalById);
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  goalValidation,
  goalController.updateGoal
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager"),
  goalController.deleteGoal
);
router.get(
  "/employee/:employeeId/cycle/:cycleId",
  protect,
  goalController.getGoalsByEmployee
);
router.put(
  "/:id/progress",
  protect,
  goalProgressValidation,
  goalController.updateGoalProgress
);

module.exports = router;
