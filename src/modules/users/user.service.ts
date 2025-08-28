import { logger } from "../../config/logger";
import { AppError } from "../../utils/appError";
import { User } from "./user.model";
import { CreateUserInput } from "./user.schema";

async function registerUser(input: CreateUserInput) {
  const exists = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (exists) {
    throw new AppError("User with this email or username already exists", 409);
  }

  const user = new User(input);
  logger.info(`A new User has registered ${user.email}`);
  await user.save();
}

export default { registerUser };
