const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");
const {
  loginLimiter,
  isStrongPassword,
  sanitizeInput,
  isPasswordInHistory,
} = require("../utils/securityUtils");

const TOKEN_EXPIRY = "2w"; // 2 weeks
const REFRESH_TOKEN_EXPIRY = "4w"; // 4 weeks

const generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { token, refreshToken };
};

const authController = {
  login: [
    loginLimiter,
    async (req, res) => {
      try {
        const { email, password } = req.body;
        const sanitizedEmail = sanitizeInput(email);
        const user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        if (user.lockUntil !== undefined && user.lockUntil > Date.now()) {
          return res
            .status(403)
            .json({ message: "Account is locked. Try again later." });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          user.loginAttempts += 1;
          await user.save();

          if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
            await user.save();
            return res
              .status(403)
              .json({ message: "Account locked. Try again later." });
          }

          return res.status(400).json({ message: "Invalid credentials" });
        }

        user.loginAttempts = 0;
        user.lockUntil = null;

        const { token, refreshToken } = generateTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`User logged in: ${user.email}`);
        res.json({
          token,
          refreshToken,
          user: { id: user._id, name: user.name, email: user.email },
        });
      } catch (error) {
        logger.error(`Login error: ${error.message}`);
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ],

  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);

      if (!isStrongPassword(password)) {
        return res
          .status(400)
          .json({ message: "Password is not strong enough" });
      }

      let user = await User.findOne({ email: sanitizedEmail });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        name: sanitizedName,
        email: sanitizedEmail,
        password,
      });
      await user.save();

      const { token, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      logger.info(`New user registered: ${sanitizedEmail}`);
      res.status(201).json({
        token,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findOne({
        _id: decoded.id,
        refreshToken: refreshToken,
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const { token, refreshToken: newRefreshToken } = generateTokens(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({ token, refreshToken: newRefreshToken });
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  },

  logout: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.refreshToken = null;
      await user.save();
      logger.info(`User logged out: ${user.email}`);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const sanitizedEmail = sanitizeInput(email);
      const user = await User.findOne({ email: sanitizedEmail });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${resetToken}`;
      //   await sendEmail({
      //     email: user.email,
      //     subject: "Password Reset",
      //     message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`,
      //   });

      logger.info(`Password reset requested for: ${sanitizedEmail}`);
      res.json({ message: "Email sent" });
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!isStrongPassword(newPassword)) {
        return res
          .status(400)
          .json({ message: "New password is not strong enough" });
      }

      const user = await User.findById(req.user.id).select("+password");

      console.log({ currentPassword, newPassword });
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      if (await isPasswordInHistory(user, newPassword)) {
        return res.status(400).json({
          message: "New password must be different from your last 5 passwords",
        });
      }

      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${req.user.email}`);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid token" });
      }

      if (!isStrongPassword(req.body.password)) {
        return res
          .status(400)
          .json({ message: "Password is not strong enough" });
      }

      if (await isPasswordInHistory(user, req.body.password)) {
        return res.status(400).json({
          message: "New password must be different from your last 5 passwords",
        });
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      logger.info(`Password reset successful for: ${user.email}`);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);

      const existingUser = await User.findOne({ email: sanitizedEmail });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name: sanitizedName, email: sanitizedEmail },
        { new: true, runValidators: true }
      ).select("-password");

      logger.info(`Profile updated for user: ${user.email}`);
      res.json(user);
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = authController;
