// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const reviewController = require("../controllers/reviewController");
const {
  reviewValidation,
  reviewResponseValidation,
  goalEvaluationValidation,
} = require("../middlewares/reviewValidation");

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  reviewValidation,
  reviewController.createReview
);
router.get("/:id", protect, reviewController.getReviewById);
router.put(
  "/:id",
  protect,
  reviewResponseValidation,
  reviewController.updateReview
);
router.post("/:id/submit", protect, reviewController.submitReview);
router.post(
  "/:id/approve",
  protect,
  authorize("manager", "admin"),
  reviewController.approveReview
);
router.get(
  "/employee/:employeeId/cycle/:cycleId",
  protect,
  reviewController.getReviewsByEmployee
);
router.get("/to-complete", protect, reviewController.getReviewsToComplete);
router.put(
  "/:id/goal-evaluations",
  protect,
  goalEvaluationValidation,
  reviewController.updateGoalEvaluations
);
router.get(
  "/statistics/:cycleId",
  protect,
  authorize("admin", "manager"),
  reviewController.getReviewStatistics
);

router.get(
  "/export/:cycleId",
  protect,
  authorize("admin", "manager"),
  reviewController.exportReviewData
);

module.exports = router;
