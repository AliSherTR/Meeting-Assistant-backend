import { Request, Response, Router } from "express";
import { validate } from "../../middleware/validate";
import { CreateUserSchema, LoginUserInput } from "./user.schema";
import { logger } from "../../config/logger";
import userController from "./user.controller";

const router = Router();

router.post("/register", validate({ body: CreateUserSchema }), userController.registerUser);
router.post("/login", validate({ body: LoginUserInput }), userController.loginUser);

export default router;
