const rateLimit = require("express-rate-limit");
const xss = require("xss");
const bcrypt = require("bcryptjs");

// Rate limiting
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

// Password strength check
exports.isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonAlphas = /\W/.test(password);
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasNonAlphas
  );
};

exports.isPasswordInHistory = async (user, newPassword) => {
  for (let historicalPassword of user.passwordHistory) {
    if (await bcrypt.compare(newPassword, historicalPassword.password)) {
      return true;
    }
  }
  return false;
};

// Input sanitization
exports.sanitizeInput = (input) => xss(input);
