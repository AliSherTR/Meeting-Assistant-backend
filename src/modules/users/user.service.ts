import { logger } from "../../config/logger";
import { AppError } from "../../utils/appError";
import { User } from "./user.model";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { CreateUserInput, LoginUserInput } from "./user.schema";
import { config } from "../../config";
import { sendAccountConfirmationEmail } from "../../services/email.service";

async function registerUser(input: CreateUserInput) {
  const exists = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (exists) {
    throw new AppError("User with this email or username already exists", 409);
  }

  const user = new User(input);
  logger.info(`A new User has registered ${user.email}`);
  const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: "1d",
  });
  sendAccountConfirmationEmail(user.email, user.username, token)
    .then(() => {
      logger.info(`Account Confirmation email sent to ${user.email}`);
    })
    .catch((error) => {
      logger.error({ error, email: user.email }, "Failed to send confirmation email");
      // Consider implementing a retry mechanism or dead letter queue here
    });
  logger.info(`Account Confirmation email sent to ${user.email}`);
  await user.save();
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

export default { registerUser, loginUser };
