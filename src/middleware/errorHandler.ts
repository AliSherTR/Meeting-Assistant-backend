import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { logger } from "../config/logger";

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error({ err, url: req.originalUrl }, "Error occurred");

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Something went wrong",
  });
};
