import { sendAccountConfirmationEmail, sendPasswordResetEmail } from "../../services/email.service";
import { logger } from "../../config/logger";
import { eventBus, UserRegisteredEvent, PasswordResetRequestEvent } from "../event-emitter";

class EmailRetryManager {
  private retryAttempts = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;

  async sendUserRegisteredWithRetry(
    email: string,
    username: string,
    token: string,
    attempt = 1,
  ): Promise<void> {
    try {
      await sendAccountConfirmationEmail(email, username, token);
      this.retryAttempts.delete(email);
      logger.info({ email, attempt }, "Confirmation email sent successfully");
    } catch (error) {
      logger.error({ error, email, attempt }, "Email sending failed");

      if (attempt < this.maxRetries) {
        setTimeout(() => {
          this.sendUserRegisteredWithRetry(email, username, token, attempt + 1);
        }, this.retryDelay * attempt); // Exponential backoff

        this.retryAttempts.set(email, attempt);
      } else {
        logger.error({ email, totalAttempts: attempt }, "Email sending failed permanently");
      }
    }
  }

  async sendResetPasswordWithRetry(
    email: string,
    username: string,
    token: string,
    attempt = 1,
  ): Promise<void> {
    try {
      await sendPasswordResetEmail(email, username, token);
      this.retryAttempts.delete(email);
      logger.info({ email, attempt }, "Password Reset email sent successfully");
    } catch (error) {
      logger.error({ error, email, attempt }, "Email sending failed");

      if (attempt < this.maxRetries) {
        setTimeout(() => {
          this.sendResetPasswordWithRetry(email, username, token, attempt + 1);
        }, this.retryDelay * attempt); // Exponential backoff

        this.retryAttempts.set(email, attempt);
      } else {
        logger.error({ email, totalAttempts: attempt }, "Email sending failed permanently");
      }
    }
  }
}

const emailRetryManager = new EmailRetryManager();

async function handleUserRegistered(data: UserRegisteredEvent) {
  logger.info({ userId: data.userId }, "Processing user registration event");

  const token = data.token;

  await emailRetryManager.sendUserRegisteredWithRetry(data.email, data.username, token);
}

async function handlePasswordResetEmail(data: PasswordResetRequestEvent) {
  logger.info({ email: data.email }, "Processing password reset request event");

  const token = data.token;

  await emailRetryManager.sendResetPasswordWithRetry(data.email, data.username, token);
}

// Subscribe to events
eventBus.onEvent("user.registered", handleUserRegistered);
eventBus.onEvent("user.forgot-password", handlePasswordResetEmail);

export { handleUserRegistered, handlePasswordResetEmail };
