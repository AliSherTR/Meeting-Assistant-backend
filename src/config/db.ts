import mongoose from "mongoose";
import { logger } from "./logger";
import { config } from "./index";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    autoIndex: !config.isProd,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  isConnected = true;
  logger.info("MongoDB connected");
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info("MongoDB disconnected");
}

// Optional: events for visibility
mongoose.connection.on("error", (err) => logger.error({ err }, "Mongo error"));
mongoose.connection.on("reconnected", () => logger.warn("Mongo reconnected"));
mongoose.connection.on("disconnected", () => logger.warn("Mongo disconnected"));
