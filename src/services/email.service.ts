import nodemailer from "nodemailer";
import { config } from "../config";
import { logger } from "../config/logger";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true if 465
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export async function sendAccountConfirmationEmail(to: string, token: string) {
  try {
    const confirmUrl = `${config.appUrl}/api/v1/auth/confirm/${token}`;

    const mailOptions = {
      from: config.emailFrom,
      to,
      subject: "Confirm your account",
      html: `
        <h1>Welcome!</h1>
        <p>Please confirm your account by clicking below:</p>
        <a href="${confirmUrl}">Activate Account</a>
        <p>If you didn’t request this, ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info({ messageId: info.messageId }, "Confirmation email sent");
    return info;
  } catch (err) {
    logger.error({ err }, "Email sending failed");
    throw err;
  }
}
