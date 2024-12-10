// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/employee", protect, dashboardController.getEmployeeDashboard);
router.get(
  "/manager",
  protect,
  authorize("manager", "admin"),
  dashboardController.getManagerDashboard
);
router.get(
  "/manager/team-member/:employeeId",
  protect,
  authorize("manager", "admin"),
  dashboardController.getTeamMemberDetails
);
router.get(
  "/admin",
  protect,
  authorize("admin"),
  dashboardController.getAdminDashboard
);

module.exports = router;
