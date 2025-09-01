import { Router } from "express";
import { validate } from "../../middleware/validate";
import {
  AcitvateUserInput,
  CreateUserSchema,
  LoginUserInput,
  ResendtActivationTokenInput,
  ResetPasswordInput,
} from "./user.schema";

import userController from "./user.controller";

const router = Router();

router.post("/register", validate({ body: CreateUserSchema }), userController.registerUser);
router.post("/login", validate({ body: LoginUserInput }), userController.loginUser);
router.post("/activate/:id", validate({ params: AcitvateUserInput }), userController.activateUser);
router.post(
  "/resend-account-activation",
  validate({ body: ResendtActivationTokenInput }),
  userController.resendActivationToken,
);

router.post(
  "/reset-password-request",
  validate({ body: ResendtActivationTokenInput }),
  userController.resetPasswordRequest,
);

router.post(
  "/reset-password",
  validate({ body: ResetPasswordInput }),
  userController.resetPassword,
);

export default router;
