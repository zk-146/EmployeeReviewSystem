const Employee = require("../models/Employee");
const User = require("../models/User");
const logger = require("../utils/logger");

const employeeController = {
  createEmployee: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Invalid input for create employee", {
        errors: errors.array(),
      });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        logger.error("User not found when creating employee", {
          userId: req.user.id,
        });
        return res.status(404).json({ message: "User not found" });
      }

      const newEmployee = new Employee({
        user: user._id,
        ...req.body,
      });

      const employee = await newEmployee.save();
      logger.info("New employee created", {
        employeeId: employee._id,
        userId: user._id,
      });
      res.status(201).json(employee);
    } catch (error) {
      logger.error("Error creating employee", { error: error.message });
      res.status(400).json({ message: error.message });
    }
  },

  getAllEmployees: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;

      const total = await Employee.countDocuments({ isDeleted: false });
      const employees = await Employee.find({ isDeleted: false })
        .populate("user", "name email")
        .skip(startIndex)
        .limit(limit);

      logger.info("Retrieved all employees", { page, limit, total });
      res.json({
        employees,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
      });
    } catch (error) {
      logger.error("Error retrieving all employees", { error: error.message });
      res.status(500).json({ message: error.message });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      const employee = await Employee.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("user", "name email");
      if (!employee) {
        logger.warn("Employee not found", { employeeId: req.params.id });
        return res.status(404).json({ message: "Employee not found" });
      }
      logger.info("Retrieved employee by ID", { employeeId: req.params.id });
      res.json(employee);
    } catch (error) {
      logger.error("Error retrieving employee by ID", {
        error: error.message,
        employeeId: req.params.id,
      });
      res.status(500).json({ message: error.message });
    }
  },

  updateEmployee: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Invalid input for update employee", {
        errors: errors.array(),
      });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const employee = await Employee.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!employee) {
        logger.warn("Employee not found for update", {
          employeeId: req.params.id,
        });
        return res.status(404).json({ message: "Employee not found" });
      }

      Object.assign(employee, req.body);
      await employee.save();
      logger.info("Employee updated", { employeeId: req.params.id });
      res.json(employee);
    } catch (error) {
      logger.error("Error updating employee", {
        error: error.message,
        employeeId: req.params.id,
      });
      res.status(400).json({ message: error.message });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      const employee = await Employee.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!employee) {
        logger.warn("Employee not found for deletion", {
          employeeId: req.params.id,
        });
        return res.status(404).json({ message: "Employee not found" });
      }

      await employee.softDelete();
      logger.info("Employee soft deleted", { employeeId: req.params.id });
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      logger.error("Error deleting employee", {
        error: error.message,
        employeeId: req.params.id,
      });
      res.status(500).json({ message: error.message });
    }
  },

  getCurrentEmployeeProfile: async (req, res) => {
    try {
      const employee = await Employee.findOne({ user: req.user.id }).populate(
        "user",
        "name email"
      );
      if (!employee) {
        logger.warn("Employee profile not found", { userId: req.user.id });
        return res.status(404).json({ message: "Employee profile not found" });
      }
      logger.info("Retrieved current employee profile", {
        employeeId: employee._id,
        userId: req.user.id,
      });
      res.json(employee);
    } catch (error) {
      logger.error("Error retrieving current employee profile", {
        error: error.message,
        userId: req.user.id,
      });
      res.status(500).json({ message: error.message });
    }
  },

  searchEmployees: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Invalid input for search employees", {
        errors: errors.array(),
      });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { department, position, name } = req.query;
      let query = { isDeleted: false };

      if (department) query.department = department;
      if (position) query.position = position;
      if (name) {
        query.$or = [
          { firstName: { $regex: name, $options: "i" } },
          { lastName: { $regex: name, $options: "i" } },
        ];
      }

      const employees = await Employee.find(query).populate(
        "user",
        "name email"
      );
      logger.info("Searched employees", {
        query: req.query,
        resultCount: employees.length,
      });
      res.json(employees);
    } catch (error) {
      logger.error("Error searching employees", {
        error: error.message,
        query: req.query,
      });
      res.status(500).json({ message: error.message });
    }
  },

  getEmployeeStatistics: async (req, res) => {
    try {
      const stats = await Employee.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            avgTenure: {
              $avg: {
                $divide: [
                  { $subtract: [new Date(), "$hireDate"] },
                  1000 * 60 * 60 * 24 * 365,
                ],
              },
            },
          },
        },
      ]);
      logger.info("Retrieved employee statistics");
      res.json(stats);
    } catch (error) {
      logger.error("Error retrieving employee statistics", {
        error: error.message,
      });
      res.status(500).json({ message: error.message });
    }
  },
  updateCurrentEmployeeProfile: async (req, res) => {
    try {
      const { skills, awards } = req.body;
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      if (skills) employee.skills = skills;
      if (awards) employee.awards = awards;

      await employee.save();
      logger.info("Updated current employee profile skills/awards", { userId: req.user.id });
      res.json(employee);
    } catch (error) {
      logger.error("Error updating current employee profile", { error: error.message });
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = employeeController;
