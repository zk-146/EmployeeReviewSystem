// controllers/reviewTemplateController.js
const ReviewTemplate = require("../models/ReviewTemplate");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const reviewTemplateController = {
  createReviewTemplate: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, questions } = req.body;

      // Validate total weight
      const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
      if (totalWeight !== 100) {
        return res
          .status(400)
          .json({ message: "Total weight of questions must equal 100" });
      }

      const newReviewTemplate = new ReviewTemplate({
        name,
        description,
        questions,
      });

      const reviewTemplate = await newReviewTemplate.save();
      logger.info("New review template created", {
        reviewTemplateId: reviewTemplate._id,
      });
      res.status(201).json(reviewTemplate);
    } catch (error) {
      next(error);
    }
  },

  getAllReviewTemplates: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await ReviewTemplate.paginate(
        { isDeleted: false },
        page,
        limit
      );
      logger.info("Retrieved all review templates", { page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getReviewTemplateById: async (req, res, next) => {
    try {
      const reviewTemplate = await ReviewTemplate.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!reviewTemplate) {
        return res.status(404).json({ message: "Review template not found" });
      }
      logger.info("Retrieved review template by ID", {
        reviewTemplateId: req.params.id,
      });
      res.json(reviewTemplate);
    } catch (error) {
      next(error);
    }
  },

  updateReviewTemplate: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const reviewTemplate = await ReviewTemplate.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!reviewTemplate) {
        return res.status(404).json({ message: "Review template not found" });
      }

      // Validate total weight if questions are being updated
      if (req.body.questions) {
        const totalWeight = req.body.questions.reduce(
          (sum, q) => sum + q.weight,
          0
        );
        if (totalWeight !== 100) {
          return res
            .status(400)
            .json({ message: "Total weight of questions must equal 100" });
        }
      }

      Object.assign(reviewTemplate, req.body);
      await reviewTemplate.save();
      logger.info("Review template updated", {
        reviewTemplateId: req.params.id,
      });
      res.json(reviewTemplate);
    } catch (error) {
      next(error);
    }
  },

  deleteReviewTemplate: async (req, res, next) => {
    try {
      const reviewTemplate = await ReviewTemplate.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!reviewTemplate) {
        return res.status(404).json({ message: "Review template not found" });
      }

      reviewTemplate.isDeleted = true;
      reviewTemplate.deletedAt = new Date();
      await reviewTemplate.save();
      logger.info("Review template soft deleted", {
        reviewTemplateId: req.params.id,
      });
      res.json({ message: "Review template deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reviewTemplateController;
