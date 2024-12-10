// controllers/dashboardController.js
const Review = require("../models/Review");
const Goal = require("../models/Goal");
const ReviewCycle = require("../models/ReviewCycle");
const logger = require("../utils/logger");

const dashboardController = {
  getEmployeeDashboard: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const currentDate = new Date();

      // Get current review cycle
      const currentCycle = await ReviewCycle.findOne({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      });

      // Get upcoming review
      const upcomingReview = await Review.findOne({
        employee: employeeId,
        reviewCycle: currentCycle ? currentCycle._id : null,
        status: { $in: ["Draft", "SelfAssessment", "Submitted"] },
      }).populate("reviewTemplate", "name");

      // Get goals for current cycle
      const goals = await Goal.find({
        employee: employeeId,
        reviewCycle: currentCycle ? currentCycle._id : null,
      });

      // Get latest completed review
      const latestReview = await Review.findOne({
        employee: employeeId,
        status: "FinalApproved",
      })
        .sort({ finalApprovedAt: -1 })
        .limit(1);

      logger.info("Retrieved employee dashboard data", { employeeId });
      res.json({
        currentCycle: currentCycle
          ? {
              startDate: currentCycle.startDate,
              endDate: currentCycle.endDate,
            }
          : null,
        upcomingReview: upcomingReview
          ? {
              status: upcomingReview.status,
              dueDate: upcomingReview.dueDate,
              templateName: upcomingReview.reviewTemplate.name,
            }
          : null,
        goals: goals.map((goal) => ({
          id: goal._id,
          title: goal.title,
          progress: goal.progress,
          dueDate: goal.dueDate,
        })),
        latestReview: latestReview
          ? {
              overallScore: latestReview.overallScore,
              completedAt: latestReview.finalApprovedAt,
            }
          : null,
      });
    } catch (error) {
      logger.error("Error retrieving employee dashboard data", {
        error: error.message,
        employeeId: req.user.id,
      });
      next(error);
    }
  },
  getManagerDashboard: async (req, res, next) => {
    try {
      const managerId = req.user.id;
      const currentDate = new Date();

      // Get current review cycle
      const currentCycle = await ReviewCycle.findOne({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      });

      // Get team members assigned to the current cycle
      const teamMembers = await Employee.find({
        manager: managerId,
        _id: { $in: currentCycle ? currentCycle.assignedEmployees : [] },
      });
      const teamMemberIds = teamMembers.map((member) => member._id);

      // Get pending reviews to complete
      const pendingReviews = await Review.find({
        reviewer: managerId,
        reviewCycle: currentCycle ? currentCycle._id : null,
        status: { $in: ["Draft", "SelfAssessment"] },
      }).populate("employee", "firstName lastName");

      // Get reviews pending approval
      const pendingApprovals = await Review.find({
        reviewer: managerId,
        reviewCycle: currentCycle ? currentCycle._id : null,
        status: "Submitted",
      }).populate("employee", "firstName lastName");

      // Get team goals progress
      const teamGoals = await Goal.aggregate([
        {
          $match: {
            employee: { $in: teamMemberIds },
            reviewCycle: currentCycle ? currentCycle._id : null,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get team performance summary
      const teamPerformance = await Review.aggregate([
        {
          $match: {
            employee: { $in: teamMemberIds },
            status: "FinalApproved",
            reviewCycle: currentCycle ? currentCycle._id : null,
          },
        },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$overallScore" },
            highestScore: { $max: "$overallScore" },
            lowestScore: { $min: "$overallScore" },
          },
        },
      ]);

      logger.info("Retrieved manager dashboard data", { managerId });
      res.json({
        currentCycle: currentCycle
          ? {
              startDate: currentCycle.startDate,
              endDate: currentCycle.endDate,
            }
          : null,
        teamSize: teamMembers.length,
        pendingReviews: pendingReviews.map((review) => ({
          id: review._id,
          employeeName: `${review.employee.firstName} ${review.employee.lastName}`,
          status: review.status,
          dueDate: review.dueDate,
        })),
        pendingApprovals: pendingApprovals.map((review) => ({
          id: review._id,
          employeeName: `${review.employee.firstName} ${review.employee.lastName}`,
          submittedDate: review.submittedAt,
        })),
        teamGoals: teamGoals.reduce((acc, goal) => {
          acc[goal._id] = goal.count;
          return acc;
        }, {}),
        teamPerformance: teamPerformance.length > 0 ? teamPerformance[0] : null,
      });
    } catch (error) {
      logger.error("Error retrieving manager dashboard data", {
        error: error.message,
        managerId: req.user.id,
      });
      next(error);
    }
  },
  getTeamMemberDetails: async (req, res, next) => {
    try {
      const managerId = req.user.id;
      const employeeId = req.params.employeeId;
      const currentDate = new Date();

      // Verify that the employee is part of the manager's team
      const employee = await Employee.findOne({
        _id: employeeId,
        manager: managerId,
      });
      if (!employee) {
        return res
          .status(404)
          .json({ message: "Employee not found or not in your team" });
      }

      // Get current review cycle
      const currentCycle = await ReviewCycle.findOne({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      });

      // Get employee's current goals
      const currentGoals = await Goal.find({
        employee: employeeId,
        reviewCycle: currentCycle ? currentCycle._id : null,
      });

      // Get employee's latest review
      const latestReview = await Review.findOne({
        employee: employeeId,
        status: "FinalApproved",
      })
        .sort({ finalApprovedAt: -1 })
        .limit(1)
        .populate("reviewTemplate", "name");

      // Get employee's performance trend (last 3 reviews)
      const performanceTrend = await Review.find({
        employee: employeeId,
        status: "FinalApproved",
      })
        .sort({ finalApprovedAt: -1 })
        .limit(3)
        .select("overallScore finalApprovedAt")
        .populate("reviewCycle", "year");

      // Get employee's upcoming review
      const upcomingReview = await Review.findOne({
        employee: employeeId,
        reviewCycle: currentCycle ? currentCycle._id : null,
        status: { $in: ["Draft", "SelfAssessment", "Submitted"] },
      }).populate("reviewTemplate", "name");

      logger.info("Retrieved team member details", { managerId, employeeId });
      res.json({
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          position: employee.position,
          department: employee.department,
        },
        currentGoals: currentGoals.map((goal) => ({
          id: goal._id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress,
          status: goal.status,
          dueDate: goal.dueDate,
        })),
        latestReview: latestReview
          ? {
              id: latestReview._id,
              overallScore: latestReview.overallScore,
              completedAt: latestReview.finalApprovedAt,
              templateName: latestReview.reviewTemplate.name,
            }
          : null,
        performanceTrend: performanceTrend.map((review) => ({
          score: review.overallScore,
          completedAt: review.finalApprovedAt,
          year: review.reviewCycle.year,
        })),
        upcomingReview: upcomingReview
          ? {
              id: upcomingReview._id,
              status: upcomingReview.status,
              dueDate: upcomingReview.dueDate,
              templateName: upcomingReview.reviewTemplate.name,
            }
          : null,
      });
    } catch (error) {
      logger.error("Error retrieving team member details", {
        error: error.message,
        managerId: req.user.id,
        employeeId: req.params.employeeId,
      });
      next(error);
    }
  },
  getAdminDashboard: async (req, res, next) => {
    try {
      const currentDate = new Date();

      // Get current and upcoming review cycles
      const reviewCycles = await ReviewCycle.find({
        endDate: { $gte: currentDate },
      })
        .sort({ startDate: 1 })
        .limit(2);

      const currentCycle = reviewCycles.find(
        (cycle) =>
          cycle.startDate <= currentDate && cycle.endDate >= currentDate
      );

      // Get overall review completion rate for assigned employees
      const totalReviews = await Review.countDocuments({
        reviewCycle: currentCycle ? currentCycle._id : null,
        employee: { $in: currentCycle ? currentCycle.assignedEmployees : [] },
      });
      const completedReviews = await Review.countDocuments({
        reviewCycle: currentCycle ? currentCycle._id : null,
        employee: { $in: currentCycle ? currentCycle.assignedEmployees : [] },
        status: "FinalApproved",
      });
      const reviewCompletionRate =
        totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0;

      // Get average performance scores
      const performanceScores = await Review.aggregate([
        {
          $match: {
            reviewCycle: currentCycle ? currentCycle._id : null,
            status: "FinalApproved",
          },
        },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$overallScore" },
            highestScore: { $max: "$overallScore" },
            lowestScore: { $min: "$overallScore" },
          },
        },
      ]);

      // Get goal completion rates
      const goalStats = await Goal.aggregate([
        {
          $match: {
            reviewCycle: currentCycle ? currentCycle._id : null,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get user counts by role
      const userCounts = await Employee.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      logger.info("Retrieved admin dashboard data");
      res.json({
        reviewCycles: reviewCycles.map((cycle) => ({
          id: cycle._id,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          isCurrent: cycle === currentCycle,
        })),
        reviewCompletionRate,
        performanceScores: performanceScores[0] || {
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
        },
        goalStats: goalStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        userCounts: userCounts.reduce((acc, count) => {
          acc[count._id] = count.count;
          return acc;
        }, {}),
      });
    } catch (error) {
      logger.error("Error retrieving admin dashboard data", {
        error: error.message,
      });
      next(error);
    }
  },
};

module.exports = dashboardController;
