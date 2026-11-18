import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.SESSION_SECRET || "fixflow_super_secret_jwt_key_ethiopia_2026",
  jwtExpiresIn: "7d",
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:3000",
  apiOrigin: process.env.API_ORIGIN || "http://localhost:4000",
  databaseUrl: process.env.DATABASE_URL || "",
  smsProvider: process.env.SMS_PROVIDER || "mock",
  smsApiKey: process.env.SMS_API_KEY || "",
  smsSenderId: process.env.SMS_SENDER_ID || "FIXFLOW",
};
