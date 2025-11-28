import mongoose from "mongoose";
import { env } from "./env.config.js";

const connectDB = async () => {
  try {
    const ins = await mongoose.connect(env.mongoUri);
    console.log("database connected", ins.connection.host);
  } catch (error) {
    console.log("database connection error", error);
    process.exit(1);
  }
};

export default connectDB;
