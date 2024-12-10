// controllers/notificationController.js
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const notificationController = {
  createNotification: async (
    userId,
    message,
    type,
    relatedItem = null,
    itemModel = null
  ) => {
    try {
      const notification = new Notification({
        user: userId,
        message,
        type,
        relatedItem,
        itemModel,
      });
      await notification.save();
      logger.info("Notification created", { userId, type });
      return notification;
    } catch (error) {
      logger.error("Error creating notification", { error: error.message });
      throw error;
    }
  },

  getUserNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(notifications);
    } catch (error) {
      logger.error("Error fetching user notifications", {
        error: error.message,
      });
      res.status(500).json({ message: "Error fetching notifications" });
    }
  },

  markNotificationAsRead: async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { read: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      logger.error("Error marking notification as read", {
        error: error.message,
      });
      res.status(500).json({ message: "Error updating notification" });
    }
  },
};

module.exports = notificationController;
