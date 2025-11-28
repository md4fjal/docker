import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.config.js";

export const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    env.accessToken,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    env.refreshToken,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.tokenVersion += 1;
    await user.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, env.refreshToken);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check token version
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ message: "Token expired" });
    }

    const { accessToken, refreshToken: newRT } = createTokens(user);

    // Send new cookies
    res.cookie("accessToken", accessToken, {
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

    return res.json({ success: true });
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({ success: true, user });
};

export const checkAuth = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const decoded = jwt.verify(accessToken, env.accessToken);
      const user = await User.findById(decoded.id).select("-password");

      return res.status(200).json({ success: true, user });
    } catch (err) {}

    try {
      const decoded = jwt.verify(refreshToken, env.refreshToken);

      const { accessToken: newAT, refreshToken: newRT } = createTokens({
        _id: decoded.id,
        email: decoded.email,
      });

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

      const user = await User.findById(decoded.id).select("-password");

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(401).json({ message: "Not authenticated" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
