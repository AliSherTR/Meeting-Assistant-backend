import { EventEmitter } from "events";
import { logger } from "../config/logger";

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  async publishEvent(eventName: string, data: any) {
    try {
      logger.info({ eventName, data }, "Publishing event");

      process.nextTick(() => {
        this.emit(eventName, data);
      });

      return true;
    } catch (error) {
      logger.error({ error, eventName }, "Failed to publish event");
      return false;
    }
  }

  onEvent(eventName: string, handler: (data: any) => Promise<void>) {
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error({ error, eventName, data }, "Event handler failed");
      }
    });
  }
}

export const eventBus = new AppEventEmitter();

export interface UserRegisteredEvent {
  token: string;
  userId: string;
  email: string;
  username: string;
  registeredAt: Date;
}

export interface PasswordResetRequestEvent {
  token: string;
  email: string;
  username: string;
}

export const publishUserRegistered = (data: UserRegisteredEvent) => {
  return eventBus.publishEvent("user.registered", data);
};

export const publishResetPasswordRequest = (data: PasswordResetRequestEvent) => {
  return eventBus.publishEvent("user.forgot-password", data);
};
