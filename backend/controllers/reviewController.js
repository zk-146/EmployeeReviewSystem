// controllers/reviewController.js
const Review = require("../models/Review");
const Employee = require("../models/Employee");
const ReviewCycle = require("../models/ReviewCycle");
const ReviewTemplate = require("../models/ReviewTemplate");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const reviewController = {
  createReview: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { employeeId, reviewerId, reviewCycleId, reviewTemplateId, type } =
        req.body;

      // Validate that all referenced documents exist
      const [employee, reviewer, reviewCycle, reviewTemplate] =
        await Promise.all([
          Employee.findById(employeeId),
          Employee.findById(reviewerId),
          ReviewCycle.findById(reviewCycleId),
          ReviewTemplate.findById(reviewTemplateId),
        ]);

      if (!employee || !reviewer || !reviewCycle || !reviewTemplate) {
        return res.status(400).json({
          message:
            "Invalid reference: employee, reviewer, review cycle, or review template not found",
        });
      }

      // Fetch goals for the employee in this review cycle
      const goals = await Goal.find({
        employee: employeeId,
        reviewCycle: reviewCycleId,
      });

      // Check if the employee being reviewed is a top-level manager
      const requiresFinalApproval = !employee.isTopLevel;

      const newReview = new Review({
        employee: employeeId,
        reviewer: reviewerId,
        reviewCycle: reviewCycleId,
        reviewTemplate: reviewTemplateId,
        type,
        status: "Draft",
        requiresFinalApproval,
        responses: reviewTemplate.questions.map((q) => ({
          question: q._id,
          answer: null,
          score: null,
        })),
        goals: goals.map((goal) => goal._id),
        goalEvaluations: goals.map((goal) => ({
          goal: goal._id,
          achievementLevel: null,
          comments: "",
        })),
      });

      const review = await newReview.save();
      await notificationController.createNotification(
        review.employee,
        "A new review has been assigned to you",
        "review",
        review._id,
        "Review"
      );
      logger.info("New review created", {
        reviewId: review._id,
        requiresFinalApproval,
      });
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  getReviewById: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate("employee", "firstName lastName")
        .populate("reviewer", "firstName lastName")
        .populate("reviewCycle", "year")
        .populate("reviewTemplate", "name")
        .populate("goals")
        .populate("goalEvaluations.goal");

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      logger.info("Retrieved review by ID", { reviewId: req.params.id });
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  updateReview: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Only allow updates if the review is in Draft status
      if (review.status !== "Draft") {
        return res
          .status(400)
          .json({ message: "Cannot update a submitted review" });
      }

      // Update responses
      if (req.body.responses) {
        review.responses = req.body.responses;
      }

      // Calculate overall score if all questions are answered
      if (review.responses.every((r) => r.score !== null)) {
        const reviewTemplate = await ReviewTemplate.findById(
          review.reviewTemplate
        );
        const totalScore = review.responses.reduce((sum, r, index) => {
          return sum + (r.score * reviewTemplate.questions[index].weight) / 100;
        }, 0);
        review.overallScore = totalScore;
      }

      await review.save();
      if (review.status === "Submitted") {
        await notificationController.createNotification(
          review.reviewer,
          "A review is ready for your approval",
          "review",
          review._id,
          "Review"
        );
      }
      logger.info("Review updated", { reviewId: req.params.id });
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  submitReview: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.status !== "Draft") {
        return res
          .status(400)
          .json({ message: "Review has already been submitted" });
      }

      // Check if all questions are answered
      if (!review.responses.every((r) => r.answer !== null)) {
        return res.status(400).json({
          message: "All questions must be answered before submission",
        });
      }

      // Check if all goals have been evaluated
      if (!review.goalEvaluations.every((ge) => ge.achievementLevel !== null)) {
        return res
          .status(400)
          .json({ message: "All goals must be evaluated before submission" });
      }

      // Calculate overall score including goal achievement
      const reviewTemplate = await ReviewTemplate.findById(
        review.reviewTemplate
      );
      const questionScore = review.responses.reduce((sum, r, index) => {
        return sum + (r.score * reviewTemplate.questions[index].weight) / 100;
      }, 0);

      const goalScore =
        review.goalEvaluations.reduce(
          (sum, ge) => sum + ge.achievementLevel,
          0
        ) / review.goalEvaluations.length;

      // Assuming goals contribute 30% to the overall score
      review.overallScore = questionScore * 0.7 + goalScore * 0.3;

      review.status = "Submitted";
      review.submittedAt = new Date();
      await review.save();

      logger.info("Review submitted", { reviewId: review._id });
      res.json({ message: "Review submitted successfully", review });
    } catch (error) {
      next(error);
    }
  },

  approveReview: async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id).populate(
        "goalEvaluations.goal"
      );
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.status === "Draft") {
        return res
          .status(400)
          .json({ message: "Review has not been submitted yet" });
      }

      if (review.status === "FinalApproved") {
        return res
          .status(400)
          .json({ message: "Review has already been finally approved" });
      }

      if (review.status === "Submitted") {
        review.status = "ManagerApproved";
        review.managerApprovedAt = new Date();

        // If final approval is not required, mark as final approved
        if (!review.requiresFinalApproval) {
          review.status = "FinalApproved";
          review.finalApprovedAt = new Date();

          // Update goal statuses based on achievement levels
          for (let ge of review.goalEvaluations) {
            const goal = ge.goal;
            goal.status =
              ge.achievementLevel === 100 ? "Completed" : "In Progress";
            goal.progress = ge.achievementLevel;
            await goal.save();
          }
        }
      } else if (
        review.status === "ManagerApproved" &&
        review.requiresFinalApproval
      ) {
        review.status = "FinalApproved";
        review.finalApprovedAt = new Date();

        // Update goal statuses based on achievement levels
        for (let ge of review.goalEvaluations) {
          const goal = ge.goal;
          goal.status =
            ge.achievementLevel === 100 ? "Completed" : "In Progress";
          goal.progress = ge.achievementLevel;
          await goal.save();
        }
      }

      await review.save();
      logger.info(`Review ${review.status}`, { reviewId: review._id });
      res.json({ message: `Review ${review.status} successfully`, review });
    } catch (error) {
      next(error);
    }
  },
  getReviewsByEmployee: async (req, res, next) => {
    try {
      const { employeeId, cycleId } = req.params;
      const reviews = await Review.find({
        employee: employeeId,
        reviewCycle: cycleId,
      })
        .populate("reviewer", "firstName lastName")
        .populate("reviewTemplate", "name");

      logger.info("Retrieved reviews for employee", { employeeId, cycleId });
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  },

  getReviewsToComplete: async (req, res, next) => {
    try {
      const reviews = await Review.find({
        $or: [
          { reviewer: req.user.id, status: "Draft" },
          {
            employee: { $ne: req.user.id }, // Not the employee's own review
            status: "ManagerApproved",
            requiresFinalApproval: true,
          },
        ],
      })
        .populate("employee", "firstName lastName")
        .populate("reviewCycle", "year")
        .populate("reviewTemplate", "name");

      logger.info("Retrieved reviews to complete", { reviewerId: req.user.id });
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  },

  updateGoalEvaluations: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.status !== "Draft") {
        return res.status(400).json({
          message: "Cannot update goal evaluations for a submitted review",
        });
      }

      const { goalEvaluations } = req.body;

      // Update goal evaluations
      goalEvaluations.forEach((evaluation) => {
        const existingEvaluation = review.goalEvaluations.find(
          (e) => e.goal.toString() === evaluation.goal
        );
        if (existingEvaluation) {
          existingEvaluation.achievementLevel = evaluation.achievementLevel;
          existingEvaluation.comments = evaluation.comments;
        }
      });

      await review.save();
      logger.info("Goal evaluations updated", { reviewId: req.params.id });
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  getReviewStatistics: async (req, res, next) => {
    try {
      const { cycleId } = req.params;
      const stats = await Review.aggregate([
        { $match: { reviewCycle: mongoose.Types.ObjectId(cycleId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgScore: { $avg: "$overallScore" },
            avgGoalAchievement: {
              $avg: { $avg: "$goalEvaluations.achievementLevel" },
            },
          },
        },
      ]);

      const goalStats = await Goal.aggregate([
        { $match: { reviewCycle: mongoose.Types.ObjectId(cycleId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgProgress: { $avg: "$progress" },
          },
        },
      ]);

      logger.info("Retrieved review and goal statistics", { cycleId });
      res.json({ reviewStats: stats, goalStats });
    } catch (error) {
      next(error);
    }
  },
  exportReviewData: async (req, res) => {
    try {
      const { cycleId } = req.params;
      const reviews = await Review.find({ reviewCycle: cycleId })
        .populate("employee", "firstName lastName")
        .populate("reviewer", "firstName lastName")
        .populate("reviewTemplate", "name");

      const data = reviews.map((review) => ({
        "Employee Name": `${review.employee.firstName} ${review.employee.lastName}`,
        "Reviewer Name": `${review.reviewer.firstName} ${review.reviewer.lastName}`,
        "Review Template": review.reviewTemplate.name,
        "Overall Score": review.overallScore,
        Status: review.status,
        "Submitted At": review.submittedAt,
        "Final Approved At": review.finalApprovedAt,
      }));

      csv.stringify(data, { header: true }, (err, output) => {
        if (err) throw err;

        const fileName = `review_data_cycle_${cycleId}_${Date.now()}.csv`;
        const filePath = path.join(__dirname, "..", "exports", fileName);

        fs.writeFile(filePath, output, (err) => {
          if (err) throw err;
          res.download(filePath, fileName, (err) => {
            if (err) throw err;
            // Delete the file after sending
            fs.unlink(filePath, (err) => {
              if (err)
                logger.error("Error deleting exported file", {
                  error: err.message,
                });
            });
          });
        });
      });
    } catch (error) {
      logger.error("Error exporting review data", { error: error.message });
      res.status(500).json({ message: "Error exporting review data" });
    }
  },
};

module.exports = reviewController;
