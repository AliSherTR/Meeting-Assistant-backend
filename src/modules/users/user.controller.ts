import { NextFunction, Request, Response } from "express";
import userService from "./user.service";
import { catchAsync } from "../../middleware/catchAsync";
import { CreateUserSchema, LoginUserInput } from "./user.schema";
import { AppError } from "../../utils/appError";

export default {
  registerUser: catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Invalid user data", 400);
    }
    await userService.registerUser(parsed.data);
    res.status(201).json({
      message: "Please check your email for verification.",
      data: null,
    });
  }),

  loginUser: catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const parsed = LoginUserInput.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Invalid user data", 400);
    }
    const token = await userService.loginUser(parsed.data);
    res.status(200).json({
      message: "Login successful",
      data: { token },
    });
  }),
};
