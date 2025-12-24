// routes/reviewCycleRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const reviewCycleController = require("../controllers/reviewCycleController");
const {
  createReviewCycleValidation,
  updateReviewCycleValidation,
  assignEmployeesValidation,
} = require("../middlewares/reviewCycleValidation");
const { validateRequest } = require("../middlewares/validateRequest");

router.post(
  "/",
  protect,
  authorize("admin"),
  createReviewCycleValidation,
  validateRequest,
  reviewCycleController.createReviewCycle
);
router.get(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  reviewCycleController.getAllReviewCycles
);
router.get(
  "/:id",
  protect,
  authorize("admin", "manager"),
  reviewCycleController.getReviewCycleById
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateReviewCycleValidation,
  validateRequest,
  reviewCycleController.updateReviewCycle
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  reviewCycleController.deleteReviewCycle
);
router.post(
  "/:id/assign-employees",
  protect,
  authorize("admin"),
  assignEmployeesValidation,
  validateRequest,
  reviewCycleController.assignEmployeesToCycle
);

module.exports = router;
