import { NextFunction, Request, Response } from "express";
import userService from "./user.service";
import { catchAsync } from "../../middleware/catchAsync";

export default {
  registerUser: catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await userService.registerUser(req.body);
    res.status(201).json({
      message: "Please check your email for verification.",
      data: null,
    });
  }),
};
