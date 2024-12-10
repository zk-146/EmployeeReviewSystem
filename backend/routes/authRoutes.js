const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const roleAuth = require("../middlewares/roleAuth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", protect, authController.logout);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.put("/change-password", protect, authController.changePassword);

router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);

router.get("/refresh-token", authController.refreshToken);

// router.post(
//   "/create-review",
//   protect,
//   roleAuth(["manager", "admin"]),
//   reviewController.createReview
// );
// router.get("/roles", authController.getRoles);
// router.post("/roles", authController.assignRole);

// router.put("/email-preferences", authController.updateEmailPreferences);

module.exports = router;
