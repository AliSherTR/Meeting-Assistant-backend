// import nodemailer from "nodemailer";
// import { config } from "../config";
// import { logger } from "../config/logger";

// // Create reusable transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: Number(process.env.EMAIL_PORT) === 465, // true if 465
//   auth: {
//     user: config.emailUser,
//     pass: config.emailPass,
//   },
// });

// export async function sendAccountConfirmationEmail(to: string, token: string) {
//   try {
//     const confirmUrl = `${config.appUrl}/auth/confirm/${token}`;

//     const mailOptions = {
//       from: config.emailFrom,
//       to,
//       subject: "Confirm your account",
//       html: `
//         <h1>Welcome!</h1>
//         <p>Please confirm your account by clicking below:</p>
//         <a href="${confirmUrl}">Activate Account</a>
//         <p>If you didn’t request this, ignore this email.</p>
//       `,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     logger.info({ messageId: info.messageId }, "Confirmation email sent");
//     return info;
//   } catch (err) {
//     logger.error({ err }, "Email sending failed");
//     throw err;
//   }
// }

// src/utils/mail.ts
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
