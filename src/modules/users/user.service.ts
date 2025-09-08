import { logger } from "../../config/logger";
import { AppError } from "../../utils/appError";
import { User } from "./user.model";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import {
  ActivateUserInput,
  CreateUserInput,
  LoginUserInput,
  ResendtActivationTokenInput,
  ResetPasswordInput,
  ResetPasswordRequestInput,
} from "./user.schema";
import { config } from "../../config";
import crypto, { randomBytes } from "crypto";
import { publishResetPasswordRequest, publishUserRegistered } from "../../events/event-emitter";

export const ACTIVATION_EXPIRY_HOURS = 2;

export function newActivationToken() {
  const token = randomBytes(16).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const expiry = new Date(Date.now() + ACTIVATION_EXPIRY_HOURS * 60 * 60 * 1000);
  return { token, hashed, expiry };
}

async function registerUser(input: CreateUserInput) {
  const startTime = Date.now();

  const exists = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (exists) {
    throw new AppError("User with this email or username already exists", 409);
  }

  const user = new User(input);
  const { token, hashed, expiry } = newActivationToken();
  user.accountActivationToken = hashed;
  user.accountActivationExpiry = expiry;
  await user.save();

  logger.info(`New user registered: ${user.email} in ${Date.now() - startTime}ms`);

  await publishUserRegistered({
    token: token,
    userId: user._id as unknown as string,
    email: user.email,
    username: user.username,
    registeredAt: new Date(),
  });

  return {
    message: "Registration successful! Please check your email to confirm your account.",
  };
}

async function activateAccount(data: ActivateUserInput) {
  const hashedToken = crypto.createHash("sha256").update(data.id).digest("hex");
  const user = await User.findOne({ accountActivationToken: hashedToken }).select(
    "+email +isAccountActivated",
  );
  if (!user) {
    throw new AppError("Your account is already activated", 400);
  }

  if (user?.isAccountActivated === true) {
    throw new AppError("Your Account is already activated", 400);
  }
  if (!user.accountActivationExpiry || user.accountActivationExpiry < new Date()) {
    throw new AppError("This account activation email has expired.", 400);
  }

  user.isAccountActivated = !user?.isAccountActivated;
  user.accountActivationToken = null;
  user.accountActivationExpiry = null;
  await user.save();

  return {
    message: "Account Activation Successfull. Please login to continue",
  };
}

async function resendActivationToken(input: ResendtActivationTokenInput) {
  if (!input.email) {
    throw new AppError("Provide email or username", 400);
  }

  const user = await User.findOne({
    email: input.email,
  }).select("+isAccountActivated");

  if (!user) {
    return {
      message: "If your email address is registered, you will receive a link to activate account",
    };
  }

  if (user.isAccountActivated) {
    throw new AppError("Account already verified", 400);
  }

  if (user.emailRetryAttempts >= 3) {
    throw new AppError(
      "You have reached maximum email attempts for the day. Continue after 24 hours",
      400,
    );
  }

  const now = new Date();

  const hasUnexpired = user.accountActivationExpiry && user.accountActivationExpiry > now;

  if (hasUnexpired) {
    const msLeft = +user.accountActivationExpiry! - +now;
    const minutesLeft = Math.ceil(msLeft / 60000);
    throw new AppError(
      `If your email address is registered, you will receive a link to activate account`,
      400,
    );
  }

  const { token, hashed, expiry } = newActivationToken();
  user.accountActivationToken = hashed;
  user.accountActivationExpiry = expiry;
  user.emailRetryAttempts += 1;

  await user.save();

  await publishUserRegistered({
    token,
    userId: String(user._id),
    email: user.email,
    username: user.username,
    registeredAt: new Date(),
  });

  return {
    message: "If your email address is registered, you will receive a link to activate account",
  };
}

async function loginUser(input: LoginUserInput) {
  const user = await User.findOne({
    email: input.email,
  }).select("+password +isAccountActivated");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const isPasswordValid = await user.comparePassword(input.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isAccountActivated) {
    throw new AppError("Email verification pending", 403);
  }

  const payload = { sub: String(user._id) };
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] };

  const token = jwt.sign(payload, secret, options);
  return token;
}

async function resetPasswordRequest(input: ResetPasswordRequestInput) {
  const user = await User.findOne({
    email: input.email,
  });

  if (!user) {
    return {
      message: "Password Reset Email Sent Successfully",
    };
  }

  if (user.resetPasswordAttempts >= 1) {
    throw new AppError("You have already requested to reset the password", 401);
  }

  user.resetPasswordAttempts += 1;
  const { token, hashed, expiry } = newActivationToken();
  user.resetPasswordToken = hashed;
  user.resetPasswordExpiry = expiry;
  await user.save();

  await publishResetPasswordRequest({
    token,
    email: user.email,
    username: user.username,
  });

  return {
    message: "Please check your email for instructions to reset your password",
  };
}

async function resetPassword(input: ResetPasswordInput) {
  const hashed = crypto.createHash("sha256").update(input.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashed });

  if (!user) {
    throw new AppError("Invalid request", 400);
  }
  const now = new Date();
  if (user.resetPasswordExpiry && user.resetPasswordExpiry < now) {
    throw new AppError(
      "Password Reset Email has expired. Please request password reset again",
      401,
    );
  }

  user.password = input.password;
  user.resetPasswordAttempts = 0;
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;
  await user.save();

  return {
    message: "Password Reset Successfull. Return to login screen",
  };
}

export default {
  registerUser,
  loginUser,
  activateAccount,
  resendActivationToken,
  resetPasswordRequest,
  resetPassword,
};
