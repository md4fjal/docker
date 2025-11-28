import User from "../models/user.model.js";
import { env } from "../config/env.config.js";
import jwt from "jsonwebtoken";
import { createTokens } from "../controllers/auth.controller.js";

export const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, env.accessToken);
      req.user = decoded;
      return next();
    } catch (err) {
      // Access token expired → try refresh
    }
  }

  // 🔄 Try refresh token
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(refreshToken, env.refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken: newAT, refreshToken: newRT } = createTokens(user);

    res.cookie("accessToken", newAT, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRT, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
