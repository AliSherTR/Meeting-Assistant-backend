import { config } from "./config";
import { logger } from "./config/logger";
import { connectDB, disconnectDB } from "./config/db";
import app from "./app";

async function bootstrap() {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`Server on ${config.env} port ${config.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.warn(`${signal} received. Closing...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("unhandledRejection", (err) => {
      logger.error({ err }, "Unhandled rejection");
      shutdown("unhandledRejection");
    });
    process.on("uncaughtException", (err) => {
      logger.error({ err }, "Uncaught exception");
      shutdown("uncaughtException");
    });
  } catch (err) {
    logger.error({ err }, "Startup failed");
    process.exit(1);
  }
}

bootstrap();
