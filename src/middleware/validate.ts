import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

type Parts = {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
};

export const validate = (schema: Parts) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) throw result.error;
      req.body = result.data;
    }
    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) throw result.error;
      req.params = result.data as any;
    }
    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) throw result.error;
      req.query = result.data;
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return next(new AppError(`Validation failed: ${details.join(", ")}`, 422));
    }
    next(err);
  }
};
