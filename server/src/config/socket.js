import { Server } from "socket.io";
import redis from "./redis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import notificationSocket from "../sockets/notification.socket.js";
import { env } from "./env.config.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  const pub = redis.duplicate();
  const sub = redis.duplicate();
  io.adapter(createAdapter(pub, sub));

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    notificationSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
