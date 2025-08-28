import { Request, Response, Router } from "express";
import { validate } from "../../middleware/validate";
import { CreateUserSchema } from "./user.schema";
import { logger } from "../../config/logger";
import userController from "./user.controller";

const router = Router();

router.post("/", validate({ body: CreateUserSchema }), userController.registerUser);

export default router;
