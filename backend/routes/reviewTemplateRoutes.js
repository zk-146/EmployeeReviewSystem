// routes/reviewTemplateRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const reviewTemplateController = require("../controllers/reviewTemplateController");
const {
  reviewTemplateValidation,
} = require("../middlewares/reviewTemplateValidation");

router.post(
  "/",
  protect,
  authorize("admin"),
  reviewTemplateValidation,
  reviewTemplateController.createReviewTemplate
);
router.get("/", protect, reviewTemplateController.getAllReviewTemplates);
router.get("/:id", protect, reviewTemplateController.getReviewTemplateById);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  reviewTemplateValidation,
  reviewTemplateController.updateReviewTemplate
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  reviewTemplateController.deleteReviewTemplate
);

module.exports = router;
