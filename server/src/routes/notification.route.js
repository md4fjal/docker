import express from "express";
import {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", createNotification);

router.get("/user", authMiddleware, getUserNotifications);

router.get("/:id", getNotificationById);

router.patch("/read/:id", markAsRead);

router.patch("/read-all/:userId", markAllAsRead);

router.delete("/:id", deleteNotification);

router.delete("/user/:userId", deleteAllNotifications);

export default router;
