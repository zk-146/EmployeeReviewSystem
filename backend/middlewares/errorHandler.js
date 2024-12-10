const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { error: err, stack: err.stack });

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  res.status(500).json({ message: "An unexpected error occurred" });
};

module.exports = errorHandler;
