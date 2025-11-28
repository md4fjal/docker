import Notification from "../models/notification.model.js";
import { getIO } from "../config/socket.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    const io = req.io || getIO();
    io.to(userId).emit("notification", notification);

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany({ userId }, { read: true });

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.deleteMany({ userId });

    return res.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
