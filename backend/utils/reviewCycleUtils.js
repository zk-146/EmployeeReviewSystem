// utils/reviewCycleUtils.js
const ReviewCycle = require("../models/ReviewCycle");
const logger = require("./logger");

const updateReviewCycleStatuses = async () => {
  const currentDate = new Date();

  try {
    // Update 'Planned' cycles to 'Active' if the start date has passed
    await ReviewCycle.updateMany(
      {
        status: "Planned",
        startDate: { $lte: currentDate },
      },
      { $set: { status: "Active" } }
    );

    // Update 'Active' cycles to 'Completed' if the end date has passed
    await ReviewCycle.updateMany(
      {
        status: "Active",
        endDate: { $lt: currentDate },
      },
      { $set: { status: "Completed" } }
    );

    logger.info("Review cycle statuses updated successfully");
  } catch (error) {
    logger.error("Error updating review cycle statuses", {
      error: error.message,
    });
  }
};

module.exports = { updateReviewCycleStatuses };
