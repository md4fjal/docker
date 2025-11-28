import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectDB from "./config/db.js";
import { env } from "./config/env.config.js";
import redis from "./config/redis.js";

import { Server } from "socket.io";
import notificationSocket from "./sockets/notification.socket.js";
import { createAdapter } from "@socket.io/redis-adapter";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "server is running" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notification", notificationRoutes);

server.listen(env.port, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${env.port}`);
});
