import Notification from "../models/notification.model.js";

export default function notificationSocket(io, socket) {
  socket.on("joinUser", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("sendNotification", async ({ userId, title, message }) => {
    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    io.to(userId).emit("notification", notification);
  });
}
