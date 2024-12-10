// controllers/reviewCycleController.js
const ReviewCycle = require("../models/ReviewCycle");
const Employee = require("../models/Employee");
const logger = require("../utils/logger");

const reviewCycleController = {
  createReviewCycle: async (req, res, next) => {
    try {
      const { name, startDate, endDate, description } = req.body;

      const newCycle = new ReviewCycle({
        name,
        startDate,
        endDate,
        description,
      });

      await newCycle.save();
      logger.info("New review cycle created", { cycleId: newCycle._id });
      res.status(201).json(newCycle);
    } catch (error) {
      logger.error("Error creating review cycle", { error: error.message });
      next(error);
    }
  },

  getAllReviewCycles: async (req, res, next) => {
    try {
      const cycles = await ReviewCycle.find().sort({ startDate: -1 });
      res.json(cycles);
    } catch (error) {
      logger.error("Error retrieving review cycles", { error: error.message });
      next(error);
    }
  },

  getReviewCycleById: async (req, res, next) => {
    try {
      const cycle = await ReviewCycle.findById(req.params.id).populate(
        "assignedEmployees",
        "firstName lastName"
      );
      if (!cycle) {
        return res.status(404).json({ message: "Review cycle not found" });
      }
      res.json(cycle);
    } catch (error) {
      logger.error("Error retrieving review cycle", {
        error: error.message,
        cycleId: req.params.id,
      });
      next(error);
    }
  },

  updateReviewCycle: async (req, res, next) => {
    try {
      const { name, startDate, endDate, status, description } = req.body;
      const updatedCycle = await ReviewCycle.findByIdAndUpdate(
        req.params.id,
        { name, startDate, endDate, status, description },
        { new: true, runValidators: true }
      );
      if (!updatedCycle) {
        return res.status(404).json({ message: "Review cycle not found" });
      }
      logger.info("Review cycle updated", { cycleId: updatedCycle._id });
      res.json(updatedCycle);
    } catch (error) {
      logger.error("Error updating review cycle", {
        error: error.message,
        cycleId: req.params.id,
      });
      next(error);
    }
  },

  deleteReviewCycle: async (req, res, next) => {
    try {
      const deletedCycle = await ReviewCycle.findByIdAndDelete(req.params.id);
      if (!deletedCycle) {
        return res.status(404).json({ message: "Review cycle not found" });
      }
      logger.info("Review cycle deleted", { cycleId: req.params.id });
      res.json({ message: "Review cycle deleted successfully" });
    } catch (error) {
      logger.error("Error deleting review cycle", {
        error: error.message,
        cycleId: req.params.id,
      });
      next(error);
    }
  },

  assignEmployeesToCycle: async (req, res, next) => {
    try {
      const { employeeIds } = req.body;
      const cycle = await ReviewCycle.findById(req.params.id);
      if (!cycle) {
        return res.status(404).json({ message: "Review cycle not found" });
      }

      const employees = await Employee.find({ _id: { $in: employeeIds } });
      cycle.assignedEmployees = employees.map((emp) => emp._id);
      await cycle.save();

      logger.info("Employees assigned to review cycle", {
        cycleId: cycle._id,
        employeeCount: employees.length,
      });
      res.json(cycle);
    } catch (error) {
      logger.error("Error assigning employees to review cycle", {
        error: error.message,
        cycleId: req.params.id,
      });
      next(error);
    }
  },
};

module.exports = reviewCycleController;
