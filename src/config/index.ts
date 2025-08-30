import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  MONGODB_URI: z.string().url().or(z.string().startsWith("mongodb://")),
  MONGO_PASSWORD: z.string().min(8).max(100),
  EMAIL_HOST: z.string().min(3).max(100),
  EMAIL_PORT: z.coerce.number().min(1).max(65535),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(8).max(100),
  EMAIL_FROM: z.string(),
  APP_URL: z.string().url(),
  JWT_SECRET: z.string().min(8).max(100),
  JWT_EXPIRES_IN: z.string().default("1d"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid env:", parsed.error.format());
  process.exit(1);
}

export type AppConfig = {
  env: "development" | "production" | "test";
  isDev: boolean;
  isProd: boolean;
  port: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  mongoUri: string;
  mongoPassword: string;
  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPass: string;
  emailFrom: string;
  appUrl: string;
  jwtSecret: string; // plain string
  jwtExpiresIn: number | string | undefined; // string like "1d" or a number
};

export const config: AppConfig = {
  env: parsed.data.NODE_ENV,
  isDev: parsed.data.NODE_ENV === "development",
  isProd: parsed.data.NODE_ENV === "production",
  port: parsed.data.PORT,
  logLevel: parsed.data.LOG_LEVEL,
  mongoUri: parsed.data.MONGODB_URI,
  mongoPassword: parsed.data.MONGO_PASSWORD,
  emailHost: parsed.data.EMAIL_HOST,
  emailPort: parsed.data.EMAIL_PORT,
  emailUser: parsed.data.EMAIL_USER,
  emailPass: parsed.data.EMAIL_PASS,
  emailFrom: parsed.data.EMAIL_FROM,
  appUrl: parsed.data.APP_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
} as const;
