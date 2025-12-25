// controllers/goalController.js
const Goal = require("../models/Goal");
const Employee = require("../models/Employee");
const ReviewCycle = require("../models/ReviewCycle");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const goalController = {
  createGoal: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { employeeId, reviewCycleId, title, description, dueDate } =
        req.body;

      // Check if employeeId is a User ID (from auth) or direct Employee ID
      // We assume it's a User ID first, as that's what frontend sends
      let employee = await Employee.findOne({ user: employeeId });
      
      // If not found, try finding by direct ID
      if (!employee) {
        employee = await Employee.findById(employeeId);
      }

      const reviewCycle = await ReviewCycle.findById(reviewCycleId);

      if (!employee || !reviewCycle) {
        return res
          .status(400)
          .json({ message: "Invalid employee or review cycle" });
      }

      // Use the actual Employee ID for the goal
      const newGoal = new Goal({
        employee: employee._id,
        reviewCycle: reviewCycleId,
        title,
        description,
        dueDate,
      });

      const goal = await newGoal.save();
      logger.info("New goal created", { goalId: goal._id });
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  },

  getGoalById: async (req, res, next) => {
    try {
      const goal = await Goal.findById(req.params.id)
        .populate("employee", "firstName lastName")
        .populate("reviewCycle", "year");

      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      logger.info("Retrieved goal by ID", { goalId: req.params.id });
      res.json(goal);
    } catch (error) {
      next(error);
    }
  },

  updateGoal: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      Object.assign(goal, req.body);
      await goal.save();
      logger.info("Goal updated", { goalId: req.params.id });
      res.json(goal);
    } catch (error) {
      next(error);
    }
  },

  deleteGoal: async (req, res, next) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      await goal.remove();
      logger.info("Goal deleted", { goalId: req.params.id });
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  getGoalsByEmployee: async (req, res, next) => {
    try {
      const { employeeId, cycleId } = req.params;
      const goals = await Goal.find({
        employee: employeeId,
        reviewCycle: cycleId,
      });

      logger.info("Retrieved goals for employee", { employeeId, cycleId });
      res.json(goals);
    } catch (error) {
      next(error);
    }
  },

  updateGoalProgress: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { progress } = req.body;
      const goal = await Goal.findById(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      goal.progress = progress;
      if (progress === 100) {
        goal.status = "Completed";
      } else if (progress > 0) {
        goal.status = "In Progress";
      }

      await goal.save();
      logger.info("Goal progress updated", { goalId: req.params.id, progress });
      res.json(goal);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;
