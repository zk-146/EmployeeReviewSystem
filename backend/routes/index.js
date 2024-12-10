const express = require("express");
const router = express.Router();

// const reviewRoutes = require("./reviewRoutes");
const authRoutes = require("./authRoutes");
const employeeRoutes = require("./employeeRoutes");
const reviewCycleRoutes = require("./reviewCycleRoutes");
const reviewTemplateRoutes = require("./reviewTemplateRoutes");
const reviewRoutes = require("./reviewRoutes");
const goalRoutes = require("./goalRoutes");
const dashboardRoutes = require("./dashboardRoutes");
// const departmentRoutes = require("./departmentRoutes");
// const performanceMetricRoutes = require("./performanceMetricRoutes");

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/review-cycles", reviewCycleRoutes);
router.use("/review-templates", reviewTemplateRoutes);
router.use("/reviews", reviewRoutes);
router.use("/goals", goalRoutes);
router.use("/dashboard", dashboardRoutes);
// router.use("/departments", departmentRoutes);
// router.use("/performance-metrics", performanceMetricRoutes);

module.exports = router;
