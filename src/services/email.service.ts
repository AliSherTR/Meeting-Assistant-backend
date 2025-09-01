import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "node:path";
import { config } from "../config";
import { logger } from "../config/logger";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: { user: config.emailUser, pass: config.emailPass },
});

export async function sendAccountConfirmationEmail(to: string, userName: string, token: string) {
  try {
    const activationUrl = `${config.appUrl}/auth/confirm/${token}`;
    const supportEmail = config.emailFrom;

    // Point to your EJS file. Keep it outside dist or copy on build.
    const templatePath = path.resolve(
      process.cwd(),
      "src/templates",
      "account-activation-email.ejs",
    );

    // Render HTML with variables. Enable cache for speed.
    const html = await ejs.renderFile(
      templatePath,
      { userName, activationUrl, supportEmail },
      { cache: true, filename: templatePath },
    );

    // Optional plain text fallback.
    const text = `Hi, ${userName}:\n\nActivate your account:\n${activationUrl}\n\nNeed help: ${supportEmail}`;

    const info = await transporter.sendMail({
      from: `"Meeting Assistant" <${config.emailFrom}>`,
      to,
      subject: "Confirm your account",
      html,
      text,
    });

    logger.info({ messageId: info.messageId }, "Confirmation email sent");
    return info;
  } catch (err) {
    logger.error({ err }, "Email sending failed");
    throw err;
  }
}

export async function sendPasswordResetEmail(to: string, userName: string, token: string) {
  try {
    const activationUrl = `${config.appUrl}/auth/reset-password/${token}`;
    const supportEmail = config.emailFrom;

    // Point to your EJS file. Keep it outside dist or copy on build.
    const templatePath = path.resolve(process.cwd(), "src/templates", "reset-password-email.ejs");

    // Render HTML with variables. Enable cache for speed.
    const html = await ejs.renderFile(
      templatePath,
      { userName, activationUrl, supportEmail },
      { cache: true, filename: templatePath },
    );

    // Optional plain text fallback.
    const text = `Hi, ${userName}:\n\nActivate your account:\n${activationUrl}\n\nNeed help: ${supportEmail}`;

    const info = await transporter.sendMail({
      from: `"Meeting Assistant" <${config.emailFrom}>`,
      to,
      subject: "Reset Your password",
      html,
      text,
    });

    logger.info({ messageId: info.messageId }, "Reset password email sent");
    return info;
  } catch (err) {
    logger.error({ err }, "Email sending failed");
    throw err;
  }
}
