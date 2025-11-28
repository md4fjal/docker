import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV,
  accessToken: process.env.ACCESS_TOKEN_SECRET,
  refreshToken: process.env.REFRESH_TOKEN_SECRET,
  clientUrl: process.env.CLIENT_URL,
  redisUrl: process.env.REDIS_URL,
};
