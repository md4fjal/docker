import { Router } from "express";
import {
  signup,
  signin,
  logout,
  refreshToken,
  changePassword,
  getProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);
router.post("/refresh", refreshToken);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getProfile);
router.get("/check", checkAuth);

export default router;
