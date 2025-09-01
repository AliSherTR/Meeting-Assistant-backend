import express from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger } from "./middleware/requestLogger";
import { notFoundHandler } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import "./events/email/email-handler";

const app = express();

// Security & body parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use(requestLogger);

// Mount routes
app.use("/api/v1", routes);

// 404 + error handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
